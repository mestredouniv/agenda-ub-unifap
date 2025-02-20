
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Slot {
  time: string;
  available: boolean;
  currentAppointments: number;
  maxAppointments: number;
}

export const useAppointmentSlots = (
  professionalId: string,
  selectedDate?: Date
) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate) {
        setSlots([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');

        // Buscar slots disponíveis
        const { data: availableSlots, error: slotsError } = await supabase
          .from('professional_available_slots')
          .select('time_slot, max_appointments')
          .eq('professional_id', professionalId)
          .order('time_slot');

        if (slotsError) throw slotsError;

        // Buscar agendamentos existentes
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select('appointment_time')
          .eq('professional_id', professionalId)
          .eq('appointment_date', formattedDate)
          .is('deleted_at', null);

        if (appointmentsError) throw appointmentsError;

        // Processar os slots
        const processedSlots = (availableSlots || []).map(slot => {
          const timeStr = slot.time_slot.slice(0, 5);
          const appointmentsAtTime = appointments?.filter(
            app => app.appointment_time.slice(0, 5) === timeStr
          ).length || 0;

          return {
            time: timeStr,
            available: appointmentsAtTime < slot.max_appointments,
            currentAppointments: appointmentsAtTime,
            maxAppointments: slot.max_appointments
          };
        });

        setSlots(processedSlots);
      } catch (error) {
        console.error('Erro ao buscar slots:', error);
        setSlots([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlots();

    // Configurar listener para mudanças em tempo real
    const channel = supabase
      .channel('slots-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'professional_available_slots',
          filter: `professional_id=eq.${professionalId}`
        },
        () => fetchSlots()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [professionalId, selectedDate]);

  return { slots, isLoading };
};
