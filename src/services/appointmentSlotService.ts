
import { supabase } from "@/integrations/supabase/client";

export interface Slot {
  time: string;
  available: boolean;
  maxAppointments: number;
  currentAppointments: number;
}

export interface UnavailableDay {
  date: string;
}

export const fetchAvailableSlots = async (professionalId: string, date: string) => {
  console.log('[appointmentSlotService] Iniciando busca de slots', { professionalId, date });
  
  // Primeiro, verificamos se o dia está disponível
  const { data: unavailableDay, error: dayError } = await supabase
    .from('professional_unavailable_days')
    .select('*')
    .eq('professional_id', professionalId)
    .eq('date', date)
    .maybeSingle();
    
  if (dayError) {
    console.error('[appointmentSlotService] Erro ao verificar dia:', dayError);
    throw dayError;
  }
  
  if (unavailableDay) {
    console.log('[appointmentSlotService] Dia indisponível:', date);
    return [];
  }

  // Busca os horários disponíveis
  const { data: availableSlots, error: slotsError } = await supabase
    .from('professional_available_slots')
    .select('*')
    .eq('professional_id', professionalId)
    .order('time_slot');
    
  if (slotsError) {
    console.error('[appointmentSlotService] Erro ao buscar slots:', slotsError);
    throw slotsError;
  }

  if (!availableSlots || availableSlots.length === 0) {
    console.log('[appointmentSlotService] Nenhum slot disponível para este profissional');
    return [];
  }

  // Busca todos os agendamentos para a data selecionada em uma única consulta
  const { data: existingAppointments, error: appointmentsError } = await supabase
    .from('appointments')
    .select('appointment_time')
    .eq('professional_id', professionalId)
    .eq('appointment_date', date)
    .is('deleted_at', null);
    
  if (appointmentsError) {
    console.error('[appointmentSlotService] Erro ao buscar agendamentos:', appointmentsError);
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
  
  console.log('[appointmentSlotService] Slots formatados:', formattedSlots);
  return formattedSlots;
};

export const fetchUnavailableDays = async (professionalId: string) => {
  if (!professionalId) {
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('professional_unavailable_days')
      .select('date')
      .eq('professional_id', professionalId);
      
    if (error) {
      console.error('[appointmentSlotService] Erro ao buscar dias indisponíveis:', error);
      return [];
    }
    
    console.log('[appointmentSlotService] Dias indisponíveis:', data);
    return data || [];
  } catch (error) {
    console.error('[appointmentSlotService] Erro ao buscar dias indisponíveis:', error);
    return [];
  }
};
