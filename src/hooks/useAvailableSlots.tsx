
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface TimeSlot {
  time: string;
  available: boolean;
  maxAppointments: number;
  currentAppointments: number;
}

interface UnavailableDay {
  date: string;
}

interface AvailableSlot {
  time_slot: string;
  max_appointments: number;
}

interface Appointment {
  appointment_time: string;
}

const fetchUnavailableDays = async (professionalId: string) => {
  console.log('[useAvailableSlots] Buscando dias indisponíveis para:', professionalId);
  const { data, error } = await supabase
    .from('professional_unavailable_days')
    .select('date')
    .eq('professional_id', professionalId);

  if (error) {
    console.error('[useAvailableSlots] Erro ao buscar dias indisponíveis:', error);
    throw error;
  }

  console.log('[useAvailableSlots] Dias indisponíveis encontrados:', data);
  return data || [];
};

const fetchAvailableSlots = async (professionalId: string) => {
  console.log('[useAvailableSlots] Buscando slots disponíveis para:', professionalId);
  const { data, error } = await supabase
    .from('professional_available_slots')
    .select('time_slot, max_appointments')
    .eq('professional_id', professionalId);

  if (error) {
    console.error('[useAvailableSlots] Erro ao buscar slots disponíveis:', error);
    throw error;
  }

  console.log('[useAvailableSlots] Slots disponíveis encontrados:', data);
  return data || [];
};

const fetchAppointments = async (professionalId: string, dateStr: string) => {
  console.log('[useAvailableSlots] Buscando agendamentos para:', professionalId, 'na data:', dateStr);
  const { data, error } = await supabase
    .from('appointments')
    .select('appointment_time')
    .eq('professional_id', professionalId)
    .eq('appointment_date', dateStr)
    .is('deleted_at', null);

  if (error) {
    console.error('[useAvailableSlots] Erro ao buscar agendamentos:', error);
    throw error;
  }

  console.log('[useAvailableSlots] Agendamentos encontrados:', data);
  return data || [];
};

const isDateUnavailable = (date: Date, unavailableDays: UnavailableDay[]) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  return unavailableDays.some(day => day.date === dateStr);
};

const mapSlotsWithAppointments = (
  availableSlots: AvailableSlot[],
  appointments: Appointment[]
): TimeSlot[] => {
  return availableSlots.map(slot => {
    const slotAppointments = appointments.filter(
      app => app.appointment_time === `${slot.time_slot}`
    ).length;
    
    return {
      time: slot.time_slot.slice(0, -3),
      maxAppointments: slot.max_appointments,
      currentAppointments: slotAppointments,
      available: slotAppointments < slot.max_appointments
    };
  }).sort((a, b) => a.time.localeCompare(b.time));
};

export const useAvailableSlots = (professionalId: string, date: Date | undefined) => {
  const slotsQuery = useQuery({
    queryKey: ['availableSlots', professionalId, date?.toISOString()],
    queryFn: async () => {
      if (!professionalId || !date) {
        console.log('[useAvailableSlots] Retornando array vazio - sem profissional ou data');
        return [];
      }

      try {
        const [unavailableDays, availableSlots] = await Promise.all([
          fetchUnavailableDays(professionalId),
          fetchAvailableSlots(professionalId)
        ]);

        if (isDateUnavailable(date, unavailableDays)) {
          console.log('[useAvailableSlots] Data selecionada está indisponível');
          return [];
        }

        const dateStr = format(date, 'yyyy-MM-dd');
        const appointments = await fetchAppointments(professionalId, dateStr);

        const mappedSlots = mapSlotsWithAppointments(availableSlots, appointments);
        console.log('[useAvailableSlots] Slots processados:', mappedSlots);
        
        return mappedSlots;
      } catch (error) {
        console.error('[useAvailableSlots] Erro ao processar slots:', error);
        throw error;
      }
    },
    enabled: !!professionalId && !!date,
  });

  return {
    slots: slotsQuery.data || [],
    isLoading: slotsQuery.isLoading,
    error: slotsQuery.error,
  };
};
