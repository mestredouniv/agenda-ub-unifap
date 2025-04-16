
import { useState, useEffect } from "react";
import { Professional } from "@/types/professional";
import { supabase } from "@/integrations/supabase/client";
import { useNetworkStatus } from "@/contexts/NetworkStatusContext";

export const useListProfessionals = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { status } = useNetworkStatus();

  const fetchProfessionals = async () => {
    if (!status.isOnline || status.serverReachable === false) {
      setHasError(true);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setHasError(false);
      
      console.log("Fetching professionals...");
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error details:', error);
        throw error;
      }
      
      console.log("Fetched professionals:", data);
      setProfessionals(data || []);
    } catch (error) {
      console.error('Error fetching professionals:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch professionals when component mounts or network status changes
  useEffect(() => {
    fetchProfessionals();
  }, [status.isOnline, status.serverReachable]); 

  return {
    professionals,
    isLoading,
    hasError,
    isOffline: !status.isOnline || status.serverReachable === false,
    refetch: fetchProfessionals
  };
};
