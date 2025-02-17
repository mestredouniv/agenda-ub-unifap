
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TimeSlot {
  time: string;
  available: boolean;
  maxAppointments?: number;
  currentAppointments?: number;
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

const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { time: "08:00", available: true, maxAppointments: 10, currentAppointments: 0 },
  { time: "09:00", available: true, maxAppointments: 10, currentAppointments: 0 },
  { time: "10:00", available: true, maxAppointments: 10, currentAppointments: 0 },
  { time: "11:00", available: true, maxAppointments: 10, currentAppointments: 0 },
  { time: "14:00", available: true, maxAppointments: 10, currentAppointments: 0 },
  { time: "15:00", available: true, maxAppointments: 10, currentAppointments: 0 },
];

const fetchUnavailableDays = async (professionalId: string) => {
  const { data, error } = await supabase
    .from('professional_unavailable_days')
    .select('date')
    .eq('professional_id', professionalId);

  if (error) {
    console.error('Erro ao buscar dias indisponíveis:', error);
    throw error;
  }

  return data || [];
};

const fetchAvailableSlots = async (professionalId: string) => {
  const { data, error } = await supabase
    .from('professional_available_slots')
    .select('*')
    .eq('professional_id', professionalId);

  if (error) {
    console.error('Erro ao buscar slots disponíveis:', error);
    throw error;
  }

  return data || [];
};

const fetchAppointments = async (professionalId: string, dateStr: string) => {
  const { data, error } = await supabase
    .from('appointments')
    .select('appointment_time')
    .eq('professional_id', professionalId)
    .eq('appointment_date', dateStr)
    .is('deleted_at', null);

  if (error) {
    console.error('Erro ao buscar agendamentos:', error);
    throw error;
  }

  return data || [];
};

const isDateUnavailable = (date: Date, unavailableDays: UnavailableDay[]) => {
  return unavailableDays.some(day => 
    new Date(day.date).toISOString().split('T')[0] === date.toISOString().split('T')[0]
  );
};

const mapSlotsWithAppointments = (
  defaultSlots: TimeSlot[],
  availableSlots: AvailableSlot[],
  appointments: Appointment[]
): TimeSlot[] => {
  return defaultSlots.map(slot => {
    const slotConfig = availableSlots.find(as => as.time_slot === slot.time);
    const slotAppointments = appointments.filter(app => app.appointment_time === slot.time).length;
    
    return {
      ...slot,
      maxAppointments: slotConfig?.max_appointments || slot.maxAppointments,
      currentAppointments: slotAppointments,
      available: slotConfig ? slotAppointments < slotConfig.max_appointments : slot.available
    };
  });
};

export const useAvailableSlots = (professionalId: string, date: Date | undefined) => {
  const slotsQuery = useQuery({
    queryKey: ['availableSlots', professionalId, date?.toISOString()],
    queryFn: async () => {
      if (!professionalId) return DEFAULT_TIME_SLOTS;

      try {
        const unavailableDays = await fetchUnavailableDays(professionalId);

        if (date && isDateUnavailable(date, unavailableDays)) {
          return DEFAULT_TIME_SLOTS.map(slot => ({ ...slot, available: false }));
        }

        if (date) {
          const dateStr = date.toISOString().split('T')[0];
          const [availableSlots, appointments] = await Promise.all([
            fetchAvailableSlots(professionalId),
            fetchAppointments(professionalId, dateStr)
          ]);

          return mapSlotsWithAppointments(DEFAULT_TIME_SLOTS, availableSlots, appointments);
        }

        return DEFAULT_TIME_SLOTS;
      } catch (error) {
        console.error('Erro ao processar slots disponíveis:', error);
        return DEFAULT_TIME_SLOTS;
      }
    },
    enabled: !!professionalId,
  });

  return {
    slots: slotsQuery.data || DEFAULT_TIME_SLOTS,
    isLoading: slotsQuery.isLoading,
    error: slotsQuery.error,
  };
};
