
import { useState, useEffect, useCallback } from "react";
import { 
  fetchAvailableSlots, 
  fetchUnavailableDays as fetchUnavailableDaysService,
  Slot,
  UnavailableDay 
} from "@/services/appointmentSlotService";
import { setupSlotSubscriptions } from "@/utils/slotSubscription";

export const useAppointmentSlots = (professionalId: string, selectedDate: Date | undefined) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unavailableDays, setUnavailableDays] = useState<UnavailableDay[]>([]);

  const fetchAvailableSlotsData = useCallback(async () => {
    if (!professionalId || !selectedDate) {
      setSlots([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const slotsData = await fetchAvailableSlots(professionalId, formattedDate);
      setSlots(slotsData);
    } catch (error) {
      console.error('[useAppointmentSlots] Erro ao buscar slots:', error);
      setSlots([]);
    } finally {
      setIsLoading(false);
    }
  }, [professionalId, selectedDate]);

  const fetchUnavailableDays = useCallback(async () => {
    const data = await fetchUnavailableDaysService(professionalId);
    setUnavailableDays(data);
    return data;
  }, [professionalId]);

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (mounted) await fetchAvailableSlotsData();
    };
    
    loadData();
    
    // Configure real-time updates
    const formattedDate = selectedDate?.toISOString().split('T')[0];
    const { removeSubscription } = setupSlotSubscriptions(
      professionalId, 
      formattedDate, 
      () => { if (mounted) { 
        fetchAvailableSlotsData();
        fetchUnavailableDays();
      }}
    );
    
    return () => {
      mounted = false;
      removeSubscription();
    };
  }, [professionalId, selectedDate, fetchAvailableSlotsData, fetchUnavailableDays]);

  return { 
    slots, 
    isLoading,
    fetchUnavailableDays,
    unavailableDays
  };
};
