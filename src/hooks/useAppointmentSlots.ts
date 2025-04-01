
import { useState, useEffect, useCallback } from "react";
import { supabase, retryOperation } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { getDefaultMaxAppointments } from "@/utils/appointmentUtils";
import { useToast } from "@/hooks/use-toast";

interface Slot {
  time: string;
  available: boolean;
  currentAppointments: number;
  maxAppointments: number;
}

interface UnavailableDay {
  date: string;
}

export const useAppointmentSlots = (
  professionalId: string,
  selectedDate?: Date
) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (selectedDate) fetchSlots();
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

  const fetchUnavailableDays = useCallback(async (): Promise<UnavailableDay[]> => {
    if (isOffline) {
      return [];
    }
    
    try {
      const { data, error } = await retryOperation(async () => {
        return supabase
          .from('professional_unavailable_days')
          .select('date')
          .eq('professional_id', professionalId);
      });

      if (error) {
        console.error('[useAppointmentSlots] Erro ao buscar dias indisponíveis:', error);
        return [];
      }

      console.log('[useAppointmentSlots] Dias indisponíveis:', data);
      return data || [];
    } catch (error) {
      console.error('[useAppointmentSlots] Erro inesperado ao buscar dias indisponíveis:', error);
      return [];
    }
  }, [professionalId, isOffline]);

  const fetchSlots = useCallback(async () => {
    console.log('[useAppointmentSlots] Iniciando busca de slots', {
      professionalId,
      selectedDate
    });

    if (!selectedDate || isOffline) {
      setSlots([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setHasError(false);
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      // Verificar se o dia está indisponível
      const { data: unavailableDay, error: unavailableError } = await retryOperation(async () => {
        return supabase
          .from('professional_unavailable_days')
          .select('id')
          .eq('professional_id', professionalId)
          .eq('date', formattedDate)
          .maybeSingle();
      });

      if (unavailableError) {
        console.error('[useAppointmentSlots] Erro ao verificar disponibilidade:', unavailableError);
        throw unavailableError;
      }

      if (unavailableDay) {
        console.log('[useAppointmentSlots] Dia indisponível:', formattedDate);
        setSlots([]);
        setIsLoading(false);
        return;
      }

      // Buscar slots disponíveis
      const { data: availableSlots, error: slotsError } = await retryOperation(async () => {
        return supabase
          .from('professional_available_slots')
          .select('time_slot, max_appointments')
          .eq('professional_id', professionalId)
          .order('time_slot');
      });

      if (slotsError) {
        console.error('[useAppointmentSlots] Erro ao buscar slots:', slotsError);
        throw slotsError;
      }

      console.log('[useAppointmentSlots] Slots disponíveis:', availableSlots);

      // Buscar agendamentos existentes
      const { data: appointments, error: appointmentsError } = await retryOperation(async () => {
        return supabase
          .from('appointments')
          .select('appointment_time')
          .eq('professional_id', professionalId)
          .eq('appointment_date', formattedDate)
          .is('deleted_at', null);
      });

      if (appointmentsError) {
        console.error('[useAppointmentSlots] Erro ao buscar agendamentos:', appointmentsError);
        throw appointmentsError;
      }

      console.log('[useAppointmentSlots] Agendamentos existentes:', appointments);

      // Definir o máximo padrão de agendamentos
      const defaultMaxAppointments = getDefaultMaxAppointments();

      // Processar os slots
      const processedSlots = (availableSlots || []).map(slot => {
        const timeStr = slot.time_slot.slice(0, 5);
        const appointmentsAtTime = appointments?.filter(
          app => app.appointment_time.slice(0, 5) === timeStr
        ).length || 0;
        
        // Use o máximo definido no slot ou o padrão de 10
        const maxAppointments = slot.max_appointments || defaultMaxAppointments;

        return {
          time: timeStr,
          available: appointmentsAtTime < maxAppointments,
          currentAppointments: appointmentsAtTime,
          maxAppointments: maxAppointments
        };
      });

      console.log('[useAppointmentSlots] Slots processados:', processedSlots);
      setSlots(processedSlots);
    } catch (error) {
      console.error('[useAppointmentSlots] Erro inesperado:', error);
      setHasError(true);
      setSlots([]);
      
      if (navigator.onLine) {
        toast({
          title: "Erro ao carregar horários",
          description: "Não foi possível carregar os horários disponíveis. Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [professionalId, selectedDate, isOffline]);

  useEffect(() => {
    fetchSlots();

    // Configurar listeners para mudanças em tempo real
    if (!isOffline) {
      const channel = supabase
        .channel(`slots-${professionalId}-${selectedDate?.toISOString() || 'no-date'}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'professional_available_slots',
            filter: `professional_id=eq.${professionalId}`
          },
          (payload) => {
            console.log('[useAppointmentSlots] Mudança em slots:', payload);
            fetchSlots();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'professional_unavailable_days',
            filter: `professional_id=eq.${professionalId}`
          },
          (payload) => {
            console.log('[useAppointmentSlots] Mudança em dias indisponíveis:', payload);
            fetchSlots();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments',
            filter: `professional_id=eq.${professionalId}`
          },
          (payload) => {
            console.log('[useAppointmentSlots] Mudança em agendamentos:', payload);
            fetchSlots();
          }
        )
        .subscribe((status) => {
          console.log('[useAppointmentSlots] Status da subscription:', status);
        });

      return () => {
        console.log('[useAppointmentSlots] Limpando subscription');
        supabase.removeChannel(channel);
      };
    }
  }, [professionalId, selectedDate, fetchSlots, isOffline]);

  return { 
    slots, 
    isLoading, 
    isOffline,
    hasError, 
    fetchSlots,
    fetchUnavailableDays 
  };
};
