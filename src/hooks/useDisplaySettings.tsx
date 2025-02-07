
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DisplaySettings } from "@/types/display";

export const useDisplaySettings = () => {
  const [settings, setSettings] = useState<DisplaySettings | null>(null);
  const { toast } = useToast();

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

  return {
    settings,
    fetchSettings,
    updateSettings,
  };
};
