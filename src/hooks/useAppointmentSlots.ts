
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Slot {
  time: string;
  available: boolean;
  maxAppointments: number;
  currentAppointments: number;
}

interface UnavailableDay {
  date: string;
}

export const useAppointmentSlots = (professionalId: string, selectedDate: Date | undefined) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unavailableDays, setUnavailableDays] = useState<UnavailableDay[]>([]);

  const fetchAvailableSlots = useCallback(async () => {
    if (!professionalId || !selectedDate) {
      setSlots([]);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('[useAppointmentSlots] Iniciando busca de slots', { professionalId, selectedDate });
      
      // Primeiro, verificamos se o dia está disponível
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const { data: unavailableDay, error: dayError } = await supabase
        .from('professional_unavailable_days')
        .select('*')
        .eq('professional_id', professionalId)
        .eq('date', formattedDate)
        .maybeSingle();
        
      if (dayError) {
        console.error('[useAppointmentSlots] Erro ao verificar dia:', dayError);
        throw dayError;
      }
      
      if (unavailableDay) {
        console.log('[useAppointmentSlots] Dia indisponível:', formattedDate);
        setSlots([]);
        return;
      }

      // Busca os horários disponíveis
      const { data: availableSlots, error: slotsError } = await supabase
        .from('professional_available_slots')
        .select('*')
        .eq('professional_id', professionalId)
        .order('time_slot');
        
      if (slotsError) {
        console.error('[useAppointmentSlots] Erro ao buscar slots:', slotsError);
        throw slotsError;
      }

      if (!availableSlots || availableSlots.length === 0) {
        console.log('[useAppointmentSlots] Nenhum slot disponível para este profissional');
        setSlots([]);
        setIsLoading(false);
        return;
      }

      // Busca todos os agendamentos para a data selecionada em uma única consulta
      const { data: existingAppointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('professional_id', professionalId)
        .eq('appointment_date', formattedDate)
        .is('deleted_at', null);
        
      if (appointmentsError) {
        console.error('[useAppointmentSlots] Erro ao buscar agendamentos:', appointmentsError);
        throw appointmentsError;
      }

      // Contagem de agendamentos por horário
      const appointmentCounts: Record<string, number> = {};
      (existingAppointments || []).forEach(appointment => {
        const time = appointment.appointment_time;
        appointmentCounts[time] = (appointmentCounts[time] || 0) + 1;
      });

      // Formato dos slots
      const formattedSlots: Slot[] = availableSlots.map(slot => {
        const count = appointmentCounts[slot.time_slot] || 0;
        return {
          time: slot.time_slot,
          available: count < slot.max_appointments,
          maxAppointments: slot.max_appointments,
          currentAppointments: count
        };
      });
      
      console.log('[useAppointmentSlots] Slots formatados:', formattedSlots);
      setSlots(formattedSlots);
    } catch (error) {
      console.error('[useAppointmentSlots] Erro ao buscar slots:', error);
      setSlots([]);
    } finally {
      setIsLoading(false);
    }
  }, [professionalId, selectedDate]);

  const fetchUnavailableDays = useCallback(async () => {
    if (!professionalId) {
      return [];
    }
    
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
      setUnavailableDays(data || []);
      return data || [];
    } catch (error) {
      console.error('[useAppointmentSlots] Erro ao buscar dias indisponíveis:', error);
      return [];
    }
  }, [professionalId]);

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (mounted) await fetchAvailableSlots();
    };
    
    loadData();
    
    // Configura canal para updates
    const channelName = `slots-${professionalId}-${selectedDate?.toISOString().split('T')[0] || 'no-date'}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'professional_available_slots',
          filter: `professional_id=eq.${professionalId}`
        },
        () => { if (mounted) fetchAvailableSlots(); }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'professional_unavailable_days',
          filter: `professional_id=eq.${professionalId}`
        },
        () => { 
          if (mounted) {
            fetchUnavailableDays();
            fetchAvailableSlots();
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
        () => { if (mounted) fetchAvailableSlots(); }
      )
      .subscribe((status) => {
        console.log('[useAppointmentSlots] Status da subscription:', status);
      });
      
    console.log('[useAppointmentSlots] Subscription configurada:', channelName);
    
    return () => {
      console.log('[useAppointmentSlots] Limpando subscription');
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [professionalId, selectedDate, fetchAvailableSlots, fetchUnavailableDays]);

  return { 
    slots, 
    isLoading,
    fetchUnavailableDays,
    unavailableDays
  };
};
