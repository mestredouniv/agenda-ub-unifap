
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

  const fetchUnavailableDays = useCallback(async (): Promise<UnavailableDay[]> => {
    try {
      const { data, error } = await supabase
        .from('professional_unavailable_days')
        .select('date')
        .eq('professional_id', professionalId);

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

    try {
      setIsLoading(true);
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
        throw unavailableError;
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
        throw slotsError;
      }

      console.log('[useAppointmentSlots] Slots disponíveis:', availableSlots);

      // Buscar agendamentos existentes
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('professional_id', professionalId)
        .eq('appointment_date', formattedDate)
        .is('deleted_at', null);

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
      setSlots([]);
    } finally {
      setIsLoading(false);
    }
  }, [professionalId, selectedDate]);

  useEffect(() => {
    fetchSlots();

    // Configurar listeners para mudanças em tempo real
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
  }, [professionalId, selectedDate, fetchSlots]);

  return { slots, isLoading, fetchUnavailableDays };
};
