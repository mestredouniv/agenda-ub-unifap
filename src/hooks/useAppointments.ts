
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Appointment } from "@/types/appointment";

type ValidDisplayStatus = Appointment['display_status'];
const isValidDisplayStatus = (status: string): status is ValidDisplayStatus => {
  return ['waiting', 'triage', 'in_progress', 'completed', 'missed', 'rescheduled'].includes(status);
};

export const useAppointments = (professionalId: string, selectedDate: Date) => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAppointments = useCallback(async () => {
    if (!professionalId || !selectedDate) {
      setAppointments([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      console.log('[Agenda] Buscando agendamentos para:', { professionalId, formattedDate });
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          professionals (
            name
          )
        `)
        .eq('professional_id', professionalId)
        .eq('appointment_date', formattedDate)
        .is('deleted_at', null)
        .order('priority', { ascending: false })
        .order('appointment_time', { ascending: true });

      if (error) {
        console.error('[Agenda] Erro na busca:', error);
        throw error;
      }

      if (!data) {
        console.log('[Agenda] Nenhum dado encontrado');
        setAppointments([]);
        return;
      }
      
      console.log('[Agenda] Dados recebidos:', data);
      
      const typedAppointments = data.map(appointment => ({
        ...appointment,
        display_status: isValidDisplayStatus(appointment.display_status) 
          ? appointment.display_status 
          : 'waiting'
      })) as Appointment[];

      setAppointments(typedAppointments);
    } catch (err) {
      console.error('[Agenda] Erro detalhado:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar os agendamentos';
      setError(new Error(errorMessage));
      toast({
        title: "Erro ao carregar agenda",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [professionalId, selectedDate, toast]);

  useEffect(() => {
    let mounted = true;
    
    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `professional_id=eq.${professionalId}`
        },
        (payload) => {
          console.log('[Agenda] Mudança detectada:', payload);
          if (mounted) {
            fetchAppointments();
          }
        }
      )
      .subscribe((status) => {
        console.log('[Agenda] Status da subscription:', status);
      });

    fetchAppointments();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [professionalId, selectedDate, fetchAppointments]);

  return { 
    appointments,
    isLoading,
    error,
    fetchAppointments,
  };
};
