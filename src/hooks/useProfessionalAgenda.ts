
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Appointment } from "@/types/appointment";

interface AgendaAppointment extends Omit<Appointment, 'professionals'> {
  professional_name: string;
}

export const useProfessionalAgenda = (professionalId: string, selectedDate: Date) => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<AgendaAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAgendaData = useCallback(async () => {
    if (!professionalId || !selectedDate) {
      setAppointments([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          professionals (
            name
          )
        `)
        .eq('appointment_date', formattedDate)
        .eq('professional_id', professionalId)
        .is('deleted_at', null)
        .order('priority', { ascending: false })
        .order('appointment_time', { ascending: true });

      if (error) {
        throw error;
      }

      const formattedAppointments: AgendaAppointment[] = (data || []).map(appointment => ({
        ...appointment,
        professional_name: appointment.professionals?.name || ''
      }));

      setAppointments(formattedAppointments);
      
    } catch (err) {
      console.error('[Agenda] Erro ao carregar agendamentos:', err);
      setError(err instanceof Error ? err : new Error('Erro ao carregar agendamentos'));
      
      toast({
        title: "Erro ao carregar agenda",
        description: "Não foi possível carregar os agendamentos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [professionalId, selectedDate, toast]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (!mounted) return;
      await fetchAgendaData();
    };

    loadData();

    const channelName = `professional-agenda-${professionalId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `professional_id=eq.${professionalId}`
        },
        () => {
          if (mounted) {
            fetchAgendaData();
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          toast({
            title: "Erro de sincronização",
            description: "Houve um problema com a atualização em tempo real. Atualizando dados...",
            variant: "destructive",
          });
          fetchAgendaData();
        }
      });

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [professionalId, selectedDate, fetchAgendaData, toast]);

  return {
    appointments,
    isLoading,
    error,
    refetch: fetchAgendaData
  };
};
