
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const { toast } = useToast();

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      fetchAnnouncements(); // Refetch when we come back online
    };
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set initial state
    setIsOffline(!navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchAnnouncements = async () => {
    if (isOffline) {
      setHasError(true);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setHasError(false);
      
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('active', true)
        .gte('expires_at', now)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

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
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 12);

      const { data, error } = await supabase
        .from('announcements')
        .insert([{
          content,
          expires_at: expiresAt.toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      setAnnouncements(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Aviso adicionado com sucesso.",
      });
      return true;
    } catch (error) {
      console.error('Error adding announcement:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o aviso. Verifique sua conexão com a internet.",
        variant: "destructive",
      });
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
      const { error } = await supabase
        .from('announcements')
        .update({ active: false })
        .eq('id', id);

      if (error) throw error;
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      toast({
        title: "Sucesso",
        description: "Aviso removido com sucesso.",
      });
      return true;
    } catch (error) {
      console.error('Error removing announcement:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o aviso. Verifique sua conexão com a internet.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    
    // Only set up interval if we're online
    if (!isOffline) {
      const interval = setInterval(fetchAnnouncements, 60000);
      return () => clearInterval(interval);
    }
  }, [isOffline]);

  return {
    announcements,
    isLoading,
    hasError,
    isOffline,
    addAnnouncement,
    removeAnnouncement,
    refetch: fetchAnnouncements,
  };
};
