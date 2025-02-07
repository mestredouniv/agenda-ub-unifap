
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DisplayContent {
  id: string;
  type: 'text' | 'image' | 'youtube' | 'last_calls';
  content: string;
  display_order: number | null;
  display_time: number;
  active: boolean;
}

export interface DisplaySettings {
  id: string;
  rotation_mode: 'sequential' | 'random';
  is_edit_mode: boolean;
}

export const useDisplayContent = () => {
  const [contents, setContents] = useState<DisplayContent[]>([]);
  const [settings, setSettings] = useState<DisplaySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchContents = async () => {
    try {
      const { data, error } = await supabase
        .from('display_content')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true, nullsFirst: true });

      if (error) throw error;
      
      // Type assertion to ensure the data matches our DisplayContent interface
      const typedData = data?.map(item => ({
        ...item,
        type: item.type as DisplayContent['type']
      })) || [];
      
      setContents(typedData);
    } catch (error) {
      console.error('Error fetching display contents:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os conteúdos.",
        variant: "destructive",
      });
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('display_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Type assertion to ensure the data matches our DisplaySettings interface
        setSettings({
          ...data,
          rotation_mode: data.rotation_mode as DisplaySettings['rotation_mode']
        });
      } else {
        // Create default settings if none exist
        const { data: newSettings, error: createError } = await supabase
          .from('display_settings')
          .insert([{
            rotation_mode: 'sequential' as const,
            is_edit_mode: false,
          }])
          .select()
          .single();

        if (createError) throw createError;
        if (newSettings) {
          setSettings({
            ...newSettings,
            rotation_mode: newSettings.rotation_mode as DisplaySettings['rotation_mode']
          });
        }
      }
    } catch (error) {
      console.error('Error fetching display settings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive",
      });
    }
  };

  const addContent = async (content: Omit<DisplayContent, 'id' | 'active'>) => {
    try {
      const { data, error } = await supabase
        .from('display_content')
        .insert([{ ...content, active: true }])
        .select()
        .single();

      if (error) throw error;
      
      // Type assertion for the new content
      const typedData = {
        ...data,
        type: data.type as DisplayContent['type']
      };
      
      setContents(prev => [...prev, typedData]);
      toast({
        title: "Sucesso",
        description: "Conteúdo adicionado com sucesso.",
      });
      return true;
    } catch (error) {
      console.error('Error adding content:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o conteúdo.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateSettings = async (newSettings: Partial<DisplaySettings>) => {
    if (!settings?.id) return false;
    
    try {
      const { data, error } = await supabase
        .from('display_settings')
        .update(newSettings)
        .eq('id', settings.id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setSettings({
          ...data,
          rotation_mode: data.rotation_mode as DisplaySettings['rotation_mode']
        });
      }
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as configurações.",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('display_content')
        .update({ active: false })
        .eq('id', id);

      if (error) throw error;
      setContents(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Sucesso",
        description: "Conteúdo removido com sucesso.",
      });
      return true;
    } catch (error) {
      console.error('Error removing content:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o conteúdo.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchContents(), fetchSettings()]);
      setLoading(false);
    };

    loadData();

    // Subscribe to realtime changes
    const contentSubscription = supabase
      .channel('display_content_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'display_content' }, 
        () => {
          fetchContents();
        }
      )
      .subscribe();

    const settingsSubscription = supabase
      .channel('display_settings_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'display_settings' }, 
        () => {
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      contentSubscription.unsubscribe();
      settingsSubscription.unsubscribe();
    };
  }, []);

  return {
    contents,
    settings,
    loading,
    addContent,
    removeContent,
    updateSettings,
    refetch: fetchContents,
  };
};
