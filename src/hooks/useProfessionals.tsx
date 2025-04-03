
import { useState, useEffect, useCallback } from "react";
import { supabase, retryOperation, isOfflineError } from "@/integrations/supabase/client";
import { Professional } from "@/types/professional";
import { useToast } from "@/hooks/use-toast";
import { useNetwork } from "@/contexts/NetworkContext";
import { useOfflineCache } from "@/hooks/useOfflineCache";

export function useProfessionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const { toast } = useToast();
  const { isOnline, serverReachable } = useNetwork();
  const { fetchWithOfflineSupport, saveToCache, loadFromCache } = useOfflineCache<Professional[]>();
  
  const CACHE_KEY = 'professionals_list';
  
  const fetchProfessionals = useCallback(async () => {
    if (!isOnline || serverReachable === false) {
      console.log('Dispositivo offline ou servidor inacessível, usando cache');
      const cached = loadFromCache<Professional[]>(CACHE_KEY);
      if (cached) {
        setProfessionals(cached);
        setIsLoading(false);
        return;
      }
      setHasError(true);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setHasError(false);
      setIsRetrying(false);
      
      const result = await fetchWithOfflineSupport<Professional[]>(
        CACHE_KEY,
        async () => {
          const { data, error } = await retryOperation(async () => {
            return supabase
              .from('professionals')
              .select('*')
              .order('name');
          });
          
          if (error) throw error;
          
          return data as Professional[];
        }
      );
      
      setProfessionals(result || []);
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
      setHasError(true);
      
      // Tenta usar o cache como fallback
      const cached = loadFromCache<Professional[]>(CACHE_KEY);
      if (cached) {
        setProfessionals(cached);
        toast({
          title: "Usando dados em cache",
          description: "Não foi possível atualizar os dados do servidor.",
        });
      } else if (isOnline && serverReachable !== false) {
        toast({
          title: "Erro ao carregar profissionais",
          description: "Não foi possível carregar a lista de profissionais.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, serverReachable, toast, fetchWithOfflineSupport, saveToCache, loadFromCache]);
  
  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals, isOnline, serverReachable]);
  
  // Adicionar profissional
  const addProfessional = async (professionalData: Omit<Professional, "id">) => {
    if (!isOnline || serverReachable === false) {
      toast({
        title: "Sem conexão",
        description: "Você está offline. Não é possível adicionar profissionais.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsRetrying(true);
      
      const { data, error } = await retryOperation(async () => {
        return supabase
          .from('professionals')
          .insert([professionalData])
          .select()
          .single();
      });
      
      if (error) throw error;
      
      setProfessionals(prev => [...prev, data as Professional]);
      saveToCache(CACHE_KEY, [...professionals, data as Professional]);
      
      toast({
        title: "Profissional adicionado",
        description: "O profissional foi adicionado com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao adicionar profissional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o profissional.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsRetrying(false);
    }
  };
  
  // Atualizar profissional
  const updateProfessional = async (id: string, professionalData: Partial<Professional>) => {
    if (!isOnline || serverReachable === false) {
      toast({
        title: "Sem conexão",
        description: "Você está offline. Não é possível atualizar profissionais.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsRetrying(true);
      
      const { data, error } = await retryOperation(async () => {
        return supabase
          .from('professionals')
          .update(professionalData)
          .eq('id', id)
          .select()
          .single();
      });
      
      if (error) throw error;
      
      setProfessionals(prev => 
        prev.map(p => p.id === id ? { ...p, ...data } as Professional : p)
      );
      saveToCache(CACHE_KEY, professionals.map(p => p.id === id ? { ...p, ...data } as Professional : p));
      
      toast({
        title: "Profissional atualizado",
        description: "O profissional foi atualizado com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o profissional.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsRetrying(false);
    }
  };
  
  // Remover profissional
  const deleteProfessional = async (id: string) => {
    if (!isOnline || serverReachable === false) {
      toast({
        title: "Sem conexão",
        description: "Você está offline. Não é possível remover profissionais.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsRetrying(true);
      
      const { error } = await retryOperation(async () => {
        return supabase
          .from('professionals')
          .delete()
          .eq('id', id);
      });
      
      if (error) throw error;
      
      const updatedList = professionals.filter(p => p.id !== id);
      setProfessionals(updatedList);
      saveToCache(CACHE_KEY, updatedList);
      
      toast({
        title: "Profissional removido",
        description: "O profissional foi removido com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao remover profissional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o profissional.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsRetrying(false);
    }
  };

  return {
    professionals,
    isLoading,
    hasError,
    isOffline: !isOnline || serverReachable === false,
    addProfessional,
    updateProfessional,
    deleteProfessional,
    refetch: fetchProfessionals,
    isRetrying,
  };
}
