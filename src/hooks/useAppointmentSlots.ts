
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

      // Formato dos slots
      const formattedSlots: Slot[] = [];
      
      // Para cada slot, verifica quantos agendamentos já existem
      for (const slot of (availableSlots || [])) {
        const { data: existingAppointments, error: countError } = await supabase
          .from('appointments')
          .select('id')
          .eq('professional_id', professionalId)
          .eq('appointment_date', formattedDate)
          .eq('appointment_time', slot.time_slot)
          .is('deleted_at', null);
          
        if (countError) {
          console.error('[useAppointmentSlots] Erro ao contar agendamentos:', countError);
          continue;
        }
        
        const count = existingAppointments?.length || 0;
        formattedSlots.push({
          time: slot.time_slot,
          available: count < slot.max_appointments,
          maxAppointments: slot.max_appointments,
          currentAppointments: count
        });
      }
      
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
    fetchAvailableSlots();
    
    // Configura canal para updates
    const channelName = `slots-${professionalId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'professional_available_slots'
        },
        () => fetchAvailableSlots()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'professional_unavailable_days'
        },
        () => {
          fetchUnavailableDays();
          fetchAvailableSlots();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        () => fetchAvailableSlots()
      )
      .subscribe((status) => {
        console.log('[useAppointmentSlots] Status da subscription:', status);
      });
      
    console.log('[useAppointmentSlots] Subscription configurada');
    
    return () => {
      console.log('[useAppointmentSlots] Limpando subscription');
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
