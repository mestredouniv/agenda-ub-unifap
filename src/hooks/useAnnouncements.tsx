
import { useState, useEffect, useCallback } from "react";
import { supabase, retryOperation } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
  const [isOffline, setIsOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const { toast } = useToast();

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      console.log('[useAnnouncements] Device came online, attempting to fetch data');
      if (connectionAttempts < 3) {
        fetchAnnouncements();
        setConnectionAttempts(prev => prev + 1);
      }
    };
    const handleOffline = () => {
      console.log('[useAnnouncements] Device went offline');
      setIsOffline(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set initial state
    setIsOffline(!navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [connectionAttempts]);

  const fetchAnnouncements = useCallback(async () => {
    if (isOffline) {
      console.log('[useAnnouncements] Skipping fetch - device is offline');
      setHasError(true);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setHasError(false);
      setIsRetrying(false);
      
      const now = new Date().toISOString();
      console.log('[useAnnouncements] Fetching announcements');
      
      // Using the retry utility with more attempts and shorter initial delay
      const { data, error } = await retryOperation(async () => {
        return supabase
          .from('announcements')
          .select('*')
          .eq('active', true)
          .gte('expires_at', now)
          .order('created_at', { ascending: false });
      }, 5, 800); // 5 retries, starting with 800ms delay

      if (error) {
        console.error('[useAnnouncements] Error fetching announcements:', error);
        throw error;
      }

      console.log('[useAnnouncements] Announcements fetched successfully:', data?.length || 0);
      setAnnouncements(data || []);
      setConnectionAttempts(0); // Reset connection attempts on success
    } catch (error) {
      console.error('[useAnnouncements] Error fetching announcements:', error);
      setHasError(true);
      
      // Only show toast if not already showing error UI and we're online
      if (navigator.onLine && !isRetrying) {
        toast({
          title: "Erro ao carregar avisos",
          description: "Não foi possível carregar os avisos. Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [isOffline, isRetrying, toast]);

  const addAnnouncement = async (content: string) => {
    if (isOffline) {
      toast({
        title: "Erro de conexão",
        description: "Você está offline. Não é possível adicionar avisos.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsRetrying(true);
      
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 12);

      // Using the retry utility
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
      }, 3, 800);

      if (error) throw error;
      setAnnouncements(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Aviso adicionado com sucesso.",
      });
      setIsRetrying(false);
      return true;
    } catch (error) {
      console.error('[useAnnouncements] Error adding announcement:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o aviso. Verifique sua conexão com o servidor.",
        variant: "destructive",
      });
      setIsRetrying(false);
      return false;
    }
  };

  const removeAnnouncement = async (id: string) => {
    if (isOffline) {
      toast({
        title: "Erro de conexão",
        description: "Você está offline. Não é possível remover avisos.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsRetrying(true);
      
      // Using the retry utility
      const { error } = await retryOperation(async () => {
        return supabase
          .from('announcements')
          .update({ active: false })
          .eq('id', id);
      });

      if (error) throw error;
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      toast({
        title: "Sucesso",
        description: "Aviso removido com sucesso.",
      });
      setIsRetrying(false);
      return true;
    } catch (error) {
      console.error('[useAnnouncements] Error removing announcement:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o aviso. Verifique sua conexão com o servidor.",
        variant: "destructive",
      });
      setIsRetrying(false);
      return false;
    }
  };

  const manualRefetch = useCallback(() => {
    console.log('[useAnnouncements] Manually refreshing announcements');
    setConnectionAttempts(0); // Reset connection attempts
    return fetchAnnouncements();
  }, [fetchAnnouncements]);

  useEffect(() => {
    fetchAnnouncements();
    
    // Only set up interval if we're online
    if (!isOffline) {
      const interval = setInterval(fetchAnnouncements, 60000);
      return () => clearInterval(interval);
    }
  }, [isOffline, fetchAnnouncements]);

  return {
    announcements,
    isLoading,
    hasError,
    isOffline,
    isRetrying,
    addAnnouncement,
    removeAnnouncement,
    refetch: manualRefetch,
  };
};
