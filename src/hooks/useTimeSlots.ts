
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

export interface TimeSlot {
  time: string;
  available: boolean;
  currentAppointments: number;
  maxAppointments: number;
}

export const useTimeSlots = (
  professionalId: string,
  selectedDate: Date | undefined,
  isDateAvailable: boolean
) => {
  const { toast } = useToast();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedDate || !isDateAvailable) {
        setTimeSlots([]);
        return;
      }

      setIsLoading(true);
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');

        // Buscar horários configurados
        const { data: availableSlots, error: slotsError } = await supabase
          .from('professional_available_slots')
          .select('time_slot, max_appointments')
          .eq('professional_id', professionalId)
          .order('time_slot');

        if (slotsError) throw slotsError;

        // Buscar agendamentos existentes
        const { data: existingAppointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select('appointment_time')
          .eq('professional_id', professionalId)
          .eq('appointment_date', formattedDate)
          .is('deleted_at', null);

        if (appointmentsError) throw appointmentsError;

        const slots = (availableSlots || []).map(slot => {
          const timeStr = slot.time_slot.slice(0, 5);
          const appointmentsAtTime = existingAppointments?.filter(
            app => app.appointment_time.slice(0, 5) === timeStr
          ).length || 0;

          return {
            time: timeStr,
            available: appointmentsAtTime < slot.max_appointments,
            currentAppointments: appointmentsAtTime,
            maxAppointments: slot.max_appointments
          };
        });

        setTimeSlots(slots);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar horários:', err);
        setError('Erro ao carregar horários');
        toast({
          title: "Erro",
          description: "Não foi possível carregar os horários disponíveis.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeSlots();
  }, [professionalId, selectedDate, isDateAvailable, toast]);

  return {
    timeSlots,
    isLoading,
    error
  };
};
