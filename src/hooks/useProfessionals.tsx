
import { useState, useEffect } from "react";
import { Professional } from "@/types/professional";
import { useListProfessionals } from "./useListProfessionals";
import { useCreateProfessional } from "./useCreateProfessional";
import { useUpdateProfessional } from "./useUpdateProfessional";
import { useDeleteProfessional } from "./useDeleteProfessional";
import { useNetworkStatus } from "@/contexts/NetworkStatusContext";

export const useProfessionals = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const { status } = useNetworkStatus();
  
  const { 
    professionals: fetchedProfessionals, 
    isLoading, 
    hasError, 
    refetch 
  } = useListProfessionals();

  const { addProfessional } = useCreateProfessional((newProfessional) => {
    setProfessionals(prev => [...prev, newProfessional]);
  });

  const { updateProfessional } = useUpdateProfessional((updatedProfessional) => {
    setProfessionals(prev => prev.map(p => 
      p.id === updatedProfessional.id ? updatedProfessional : p
    ));
  });

  const { deleteProfessional } = useDeleteProfessional((id) => {
    setProfessionals(prev => prev.filter(p => p.id !== id));
  });

  // Update local state when fetched professionals change
  useEffect(() => {
    if (fetchedProfessionals) {
      setProfessionals(fetchedProfessionals);
    }
  }, [fetchedProfessionals]);

  return {
    professionals,
    isLoading,
    hasError,
    isOffline: !status.isOnline || status.serverReachable === false,
    addProfessional,
    updateProfessional,
    deleteProfessional,
    refetch
  };
};
