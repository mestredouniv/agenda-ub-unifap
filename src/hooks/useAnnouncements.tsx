
import { useState, useEffect, useCallback } from "react";
import { supabase, retryOperation } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useNetworkStatus } from "@/contexts/NetworkStatusContext";

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
  const { status } = useNetworkStatus();
  
  const fetchAnnouncements = useCallback(async () => {
    if (!status.isOnline || !status.serverReachable) {
      console.log('[useAnnouncements] Skipping fetch - device is offline or server unreachable');
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
      
      // More aggressive retry strategy
      const { data, error } = await retryOperation(async () => {
        return supabase
          .from('announcements')
          .select('*')
          .eq('active', true)
          .gte('expires_at', now)
          .order('created_at', { ascending: false });
      }, 3, 1000); // 3 retries, starting with 1 second delay

      if (error) {
        console.error('[useAnnouncements] Error fetching announcements:', error);
        throw error;
      }

      console.log('[useAnnouncements] Announcements fetched successfully:', data?.length || 0);
      setAnnouncements(data || []);
    } catch (error) {
      console.error('[useAnnouncements] Error fetching announcements:', error);
      setHasError(true);
      
      // Only show toast if not already showing error UI and we're online
      if (status.isOnline && status.serverReachable && !isRetrying) {
        toast({
          title: "Erro ao carregar avisos",
          description: "Não foi possível carregar os avisos. Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [status.isOnline, status.serverReachable, isRetrying, toast]);

  const addAnnouncement = async (content: string) => {
    if (!status.isOnline || !status.serverReachable) {
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

      // Using the retry utility with more aggressive settings
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
      }, 3, 1000);

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
    if (!status.isOnline || !status.serverReachable) {
      toast({
        title: "Erro de conexão",
        description: "Você está offline. Não é possível remover avisos.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsRetrying(true);
      
      // Using the retry utility with more aggressive settings
      const { error } = await retryOperation(async () => {
        return supabase
          .from('announcements')
          .update({ active: false })
          .eq('id', id);
      }, 3, 1000);

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
    return fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Fetch announcements when network status changes or component mounts
  useEffect(() => {
    // Only fetch if we're online and server is reachable
    if (status.isOnline && status.serverReachable !== false) {
      fetchAnnouncements();
    }
  }, [status.isOnline, status.serverReachable, fetchAnnouncements]);

  return {
    announcements,
    isLoading,
    hasError,
    isOffline: !status.isOnline || !status.serverReachable,
    isRetrying,
    addAnnouncement,
    removeAnnouncement,
    refetch: manualRefetch,
  };
};
