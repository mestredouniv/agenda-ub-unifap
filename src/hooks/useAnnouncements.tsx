
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Announcement {
  id: string;
  content: string;
  created_at: string;
  expires_at: string;
  active: boolean;
}

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const { toast } = useToast();

  const fetchAnnouncements = async () => {
    try {
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
      toast({
        title: "Erro",
        description: "Não foi possível carregar os avisos.",
        variant: "destructive",
      });
    }
  };

  const addAnnouncement = async (content: string) => {
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
        description: "Não foi possível adicionar o aviso.",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeAnnouncement = async (id: string) => {
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
        description: "Não foi possível remover o aviso.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    // Set up interval to refresh announcements every minute
    const interval = setInterval(fetchAnnouncements, 60000);
    return () => clearInterval(interval);
  }, []);

  return {
    announcements,
    addAnnouncement,
    removeAnnouncement,
    refetch: fetchAnnouncements,
  };
};
