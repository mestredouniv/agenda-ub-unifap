
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDisplaySettings } from "./useDisplaySettings";
import { useDisplayContentManager } from "./useDisplayContentManager";
import type { DisplayContent, DisplaySettings } from "@/types/display";

export type { DisplayContent, DisplaySettings };

export const useDisplayContent = () => {
  const [loading, setLoading] = useState(true);
  const { settings, fetchSettings, updateSettings } = useDisplaySettings();
  const { contents, fetchContents, addContent, removeContent } = useDisplayContentManager();

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
