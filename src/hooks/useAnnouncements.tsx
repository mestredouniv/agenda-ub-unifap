
import { useState, useEffect, useCallback } from "react";
import { supabase, retryOperation } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNetwork } from "@/contexts/NetworkContext";
import { useOfflineCache } from "@/hooks/useOfflineCache";

export interface Announcement {
  id: string;
  content: string;
  created_at: string;
  expires_at: string;
  active: boolean;
}

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const { toast } = useToast();
  const { isOnline, serverReachable } = useNetwork();
  const { fetchWithOfflineSupport, saveToCache, loadFromCache } = useOfflineCache<Announcement[]>();
  
  const CACHE_KEY = 'announcements_list';
  
  const fetchAnnouncements = useCallback(async () => {
    if (!isOnline || serverReachable === false) {
      console.log('Dispositivo offline ou servidor inacessível, usando cache');
      const cached = loadFromCache<Announcement[]>(CACHE_KEY);
      if (cached) {
        setAnnouncements(cached);
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
      
      const now = new Date().toISOString();
      
      const result = await fetchWithOfflineSupport<Announcement[]>(
        CACHE_KEY,
        async () => {
          const { data, error } = await retryOperation(async () => {
            return supabase
              .from('announcements')
              .select('*')
              .eq('active', true)
              .gte('expires_at', now)
              .order('created_at', { ascending: false });
          });
          
          if (error) throw error;
          
          return data as Announcement[];
        }
      );
      
      setAnnouncements(result || []);
    } catch (error) {
      console.error('Erro ao buscar avisos:', error);
      setHasError(true);
      
      // Tenta usar cache como fallback
      const cached = loadFromCache<Announcement[]>(CACHE_KEY);
      if (cached) {
        setAnnouncements(cached);
        toast({
          title: "Usando dados em cache",
          description: "Não foi possível atualizar os avisos do servidor.",
        });
      } else if (isOnline && serverReachable !== false) {
        toast({
          title: "Erro ao carregar avisos",
          description: "Não foi possível carregar os avisos.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, serverReachable, toast, fetchWithOfflineSupport, saveToCache, loadFromCache]);
  
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements, isOnline, serverReachable]);
  
  // Adicionar aviso
  const addAnnouncement = async (content: string) => {
    if (!isOnline || serverReachable === false) {
      toast({
        title: "Sem conexão",
        description: "Você está offline. Não é possível adicionar avisos.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsRetrying(true);
      
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 12);
      
      const { data, error } = await retryOperation(async () => {
        return supabase
          .from('announcements')
          .insert([{
            content,
            expires_at: expiresAt.toISOString(),
            active: true
          }])
          .select()
          .single();
      });
      
      if (error) throw error;
      
      setAnnouncements(prev => [data as Announcement, ...prev]);
      saveToCache(CACHE_KEY, [data as Announcement, ...announcements]);
      
      toast({
        title: "Aviso adicionado",
        description: "O aviso foi adicionado com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao adicionar aviso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o aviso.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsRetrying(false);
    }
  };
  
  // Remover aviso
  const removeAnnouncement = async (id: string) => {
    if (!isOnline || serverReachable === false) {
      toast({
        title: "Sem conexão",
        description: "Você está offline. Não é possível remover avisos.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsRetrying(true);
      
      const { error } = await retryOperation(async () => {
        return supabase
          .from('announcements')
          .update({ active: false })
          .eq('id', id);
      });
      
      if (error) throw error;
      
      const updatedAnnouncements = announcements.filter(a => a.id !== id);
      setAnnouncements(updatedAnnouncements);
      saveToCache(CACHE_KEY, updatedAnnouncements);
      
      toast({
        title: "Aviso removido",
        description: "O aviso foi removido com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao remover aviso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o aviso.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsRetrying(false);
    }
  };

  return {
    announcements,
    isLoading,
    hasError,
    isOffline: !isOnline || serverReachable === false,
    isRetrying,
    addAnnouncement,
    removeAnnouncement,
    refetch: fetchAnnouncements,
  };
};
