
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { offlineService, retryWithFallback } from "@/services/OfflineService";

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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Subscribe to offline status changes
  useEffect(() => {
    const unsubscribe = offlineService.addListener(setIsOnline);
    return unsubscribe;
  }, []);
  
  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    setIsRetrying(true);
    setHasError(false);
    
    try {
      const announcementsData = await retryWithFallback(
        // Online operation
        async () => {
          const now = new Date().toISOString();
          console.log('[useAnnouncements] Fetching announcements');
          
          const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .eq('active', true)
            .gte('expires_at', now)
            .order('created_at', { ascending: false });

          if (error) throw error;
          
          // Cache the successful result
          offlineService.cacheAnnouncements(data || []);
          
          return data || [];
        },
        // Offline fallback from cache
        () => {
          const cachedData = offlineService.getCachedAnnouncements();
          console.log('[useAnnouncements] Using cached announcements:', cachedData?.length || 0);
          return cachedData || [];
        }
      );
      
      console.log('[useAnnouncements] Announcements loaded:', announcementsData.length);
      setAnnouncements(announcementsData);
    } catch (error) {
      console.error('[useAnnouncements] Error fetching announcements:', error);
      setHasError(true);
      
      if (isOnline) {
        toast({
          title: "Erro ao carregar avisos",
          description: "Não foi possível carregar os avisos. Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, [isOnline, toast]);

  const addAnnouncement = async (content: string) => {
    if (!isOnline) {
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

      const { data, error } = await supabase
        .from('announcements')
        .insert([{
          content,
          expires_at: expiresAt.toISOString(),
          active: true
        }])
        .select()
        .single();

      if (error) throw error;
      
      const updatedAnnouncements = [data, ...announcements];
      setAnnouncements(updatedAnnouncements);
      
      // Update the cache
      offlineService.cacheAnnouncements(updatedAnnouncements);
      
      toast({
        title: "Sucesso",
        description: "Aviso adicionado com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error('[useAnnouncements] Error adding announcement:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o aviso. Verifique sua conexão com o servidor.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsRetrying(false);
    }
  };

  const removeAnnouncement = async (id: string) => {
    if (!isOnline) {
      toast({
        title: "Erro de conexão",
        description: "Você está offline. Não é possível remover avisos.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsRetrying(true);
      
      const { error } = await supabase
        .from('announcements')
        .update({ active: false })
        .eq('id', id);

      if (error) throw error;
      
      const updatedAnnouncements = announcements.filter(a => a.id !== id);
      setAnnouncements(updatedAnnouncements);
      
      // Update the cache
      offlineService.cacheAnnouncements(updatedAnnouncements);
      
      toast({
        title: "Sucesso",
        description: "Aviso removido com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error('[useAnnouncements] Error removing announcement:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o aviso. Verifique sua conexão com o servidor.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsRetrying(false);
    }
  };

  // Fetch announcements when online status changes or component mounts
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return {
    announcements,
    isLoading,
    hasError,
    isOffline: !isOnline,
    isRetrying,
    addAnnouncement,
    removeAnnouncement,
    refetch: fetchAnnouncements,
  };
};
