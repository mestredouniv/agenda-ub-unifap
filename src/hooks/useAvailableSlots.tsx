
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TimeSlot {
  time: string;
  available: boolean;
  maxAppointments?: number;
  currentAppointments?: number;
}

const DEFAULT_TIME_SLOTS = [
  { time: "08:00", available: true, maxAppointments: 10, currentAppointments: 0 },
  { time: "09:00", available: true, maxAppointments: 10, currentAppointments: 0 },
  { time: "10:00", available: true, maxAppointments: 10, currentAppointments: 0 },
  { time: "11:00", available: true, maxAppointments: 10, currentAppointments: 0 },
  { time: "14:00", available: true, maxAppointments: 10, currentAppointments: 0 },
  { time: "15:00", available: true, maxAppointments: 10, currentAppointments: 0 },
];

interface UnavailableDay {
  date: string;
}

export const useAvailableSlots = (professionalId: string, date: Date | undefined) => {
  const slotsQuery = useQuery({
    queryKey: ['availableSlots', professionalId, date?.toISOString()],
    queryFn: async () => {
      if (!professionalId) return DEFAULT_TIME_SLOTS;

      // Buscar dias indisponíveis
      const { data: unavailableDays, error: unavailableDaysError } = await supabase
        .from('professional_unavailable_days')
        .select('date')
        .eq('professional_id', professionalId);

      if (unavailableDaysError) {
        console.error('Erro ao buscar dias indisponíveis:', unavailableDaysError);
        return DEFAULT_TIME_SLOTS;
      }

      // Se a data selecionada estiver nos dias indisponíveis, retornar todos os slots como indisponíveis
      if (date && unavailableDays && unavailableDays.some(day => 
        new Date(day.date).toISOString().split('T')[0] === date.toISOString().split('T')[0]
      )) {
        return DEFAULT_TIME_SLOTS.map(slot => ({ ...slot, available: false }));
      }

      // Se a data estiver disponível, buscar os agendamentos existentes
      if (date) {
        const dateStr = date.toISOString().split('T')[0];
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select('appointment_time')
          .eq('professional_id', professionalId)
          .eq('appointment_date', dateStr)
          .is('deleted_at', null);

        if (appointmentsError) {
          console.error('Erro ao buscar agendamentos:', appointmentsError);
          return DEFAULT_TIME_SLOTS;
        }

        // Atualizar a contagem de agendamentos para cada slot
        return DEFAULT_TIME_SLOTS.map(slot => {
          const slotAppointments = appointments ? appointments.filter(app => app.appointment_time === slot.time).length : 0;
          return {
            ...slot,
            currentAppointments: slotAppointments,
            available: slot.available && slotAppointments < (slot.maxAppointments || 10)
          };
        });
      }

      return DEFAULT_TIME_SLOTS;
    },
    enabled: !!professionalId,
  });

  return {
    slots: slotsQuery.data || DEFAULT_TIME_SLOTS,
    isLoading: slotsQuery.isLoading,
    error: slotsQuery.error,
  };
};
