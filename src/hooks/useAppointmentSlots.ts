
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { getDefaultMaxAppointments } from "@/utils/appointmentUtils";

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
  const [lastError, setLastError] = useState<Error | null>(null);

  const fetchUnavailableDays = useCallback(async (): Promise<UnavailableDay[]> => {
    try {
      if (!professionalId) {
        console.warn('[useAppointmentSlots] ID do profissional não fornecido');
        return [];
      }

      const { data, error } = await supabase
        .from('professional_unavailable_days')
        .select('date')
        .eq('professional_id', professionalId);

      if (error) {
        console.error('[useAppointmentSlots] Erro ao buscar dias indisponíveis:', error);
        setLastError(new Error(`Erro ao buscar dias indisponíveis: ${error.message}`));
        return [];
      }

      console.log('[useAppointmentSlots] Dias indisponíveis:', data);
      return data || [];
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[useAppointmentSlots] Erro inesperado ao buscar dias indisponíveis:', err);
      setLastError(err);
      return [];
    }
  }, [professionalId]);

  const fetchSlots = useCallback(async () => {
    console.log('[useAppointmentSlots] Iniciando busca de slots', {
      professionalId,
      selectedDate
    });

    if (!selectedDate) {
      setSlots([]);
      setIsLoading(false);
      return;
    }

    if (!professionalId) {
      console.warn('[useAppointmentSlots] ID do profissional não fornecido');
      setSlots([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLastError(null);
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      // Verificar se o dia está indisponível
      const { data: unavailableDay, error: unavailableError } = await supabase
        .from('professional_unavailable_days')
        .select('id')
        .eq('professional_id', professionalId)
        .eq('date', formattedDate)
        .maybeSingle();

      if (unavailableError) {
        console.error('[useAppointmentSlots] Erro ao verificar disponibilidade:', unavailableError);
        setLastError(new Error(`Erro ao verificar disponibilidade: ${unavailableError.message}`));
        setSlots([]);
        setIsLoading(false);
        return;
      }

      if (unavailableDay) {
        console.log('[useAppointmentSlots] Dia indisponível:', formattedDate);
        setSlots([]);
        setIsLoading(false);
        return;
      }

      // Buscar slots disponíveis
      const { data: availableSlots, error: slotsError } = await supabase
        .from('professional_available_slots')
        .select('time_slot, max_appointments')
        .eq('professional_id', professionalId)
        .order('time_slot');

      if (slotsError) {
        console.error('[useAppointmentSlots] Erro ao buscar slots:', slotsError);
        setLastError(new Error(`Erro ao buscar slots: ${slotsError.message}`));
        setSlots([]);
        setIsLoading(false);
        return;
      }

      // Se não houver slots configurados, usar slots padrão
      let slotsToProcess = availableSlots;
      if (!slotsToProcess || slotsToProcess.length === 0) {
        console.log('[useAppointmentSlots] Nenhum slot configurado, usando padrões');
        const defaultSlots = [
          { time_slot: '08:00:00', max_appointments: getDefaultMaxAppointments() },
          { time_slot: '09:00:00', max_appointments: getDefaultMaxAppointments() },
          { time_slot: '10:00:00', max_appointments: getDefaultMaxAppointments() },
          { time_slot: '11:00:00', max_appointments: getDefaultMaxAppointments() },
          { time_slot: '14:00:00', max_appointments: getDefaultMaxAppointments() },
          { time_slot: '15:00:00', max_appointments: getDefaultMaxAppointments() },
          { time_slot: '16:00:00', max_appointments: getDefaultMaxAppointments() },
          { time_slot: '17:00:00', max_appointments: getDefaultMaxAppointments() },
        ];
        slotsToProcess = defaultSlots;
      }

      console.log('[useAppointmentSlots] Slots disponíveis:', slotsToProcess);

      // Buscar agendamentos existentes
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('professional_id', professionalId)
        .eq('appointment_date', formattedDate)
        .is('deleted_at', null);

      if (appointmentsError) {
        console.error('[useAppointmentSlots] Erro ao buscar agendamentos:', appointmentsError);
        setLastError(new Error(`Erro ao buscar agendamentos: ${appointmentsError.message}`));
        // Continuar mesmo com erro, apenas sem considerar agendamentos existentes
      }

      console.log('[useAppointmentSlots] Agendamentos existentes:', appointments);

      // Definir o máximo padrão de agendamentos
      const defaultMaxAppointments = getDefaultMaxAppointments();

      // Processar os slots
      const processedSlots = slotsToProcess.map(slot => {
        const timeStr = slot.time_slot.slice(0, 5);
        const appointmentsAtTime = appointments?.filter(
          app => app.appointment_time.slice(0, 5) === timeStr
        ).length || 0;
        
        // Use o máximo definido no slot ou o padrão
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
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[useAppointmentSlots] Erro inesperado:', err);
      setLastError(err);
      setSlots([]);
    } finally {
      setIsLoading(false);
    }
  }, [professionalId, selectedDate]);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) {
        await fetchSlots();
      }
    };
    
    loadData();

    // Configurar listeners para mudanças em tempo real
    const channelKey = `slots-${professionalId}-${selectedDate?.toISOString() || 'no-date'}`;
    const channel = supabase
      .channel(channelKey)
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
          if (isMounted) {
            fetchSlots();
          }
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
          if (isMounted) {
            fetchSlots();
          }
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
          if (isMounted) {
            fetchSlots();
          }
        }
      )
      .subscribe((status) => {
        console.log('[useAppointmentSlots] Status da subscription:', status);
      });

    return () => {
      isMounted = false;
      console.log('[useAppointmentSlots] Limpando subscription');
      supabase.removeChannel(channel);
    };
  }, [professionalId, selectedDate, fetchSlots]);

  return { 
    slots, 
    isLoading, 
    fetchUnavailableDays,
    error: lastError
  };
};