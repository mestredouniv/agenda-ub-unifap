
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Appointment } from "@/types/appointment";

export const useProfessionalAgenda = (professionalId: string, selectedDate: Date) => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
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
      console.log('[useProfessionalAgenda] Buscando agendamentos para:', { professionalId, date: formattedDate });

      // Primeiro, obtemos os dados do profissional
      const { data: professionalData, error: professionalError } = await supabase
        .from('professionals')
        .select('name')
        .eq('id', professionalId)
        .single();

      if (professionalError) {
        console.error('[useProfessionalAgenda] Erro ao buscar profissional:', professionalError);
        toast({
          title: "Erro ao carregar dados do profissional",
          description: "Não foi possível obter os dados do profissional selecionado.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Agora buscamos os agendamentos separadamente
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('appointment_date', formattedDate)
        .eq('professional_id', professionalId)
        .is('deleted_at', null)
        .order('priority', { ascending: false })
        .order('appointment_time', { ascending: true });

      if (appointmentsError) {
        console.error('[useProfessionalAgenda] Erro ao buscar agendamentos:', appointmentsError);
        throw appointmentsError;
      }

      console.log('[useProfessionalAgenda] Agendamentos encontrados:', appointmentsData?.length || 0);

      // Adicionamos o nome do profissional manualmente a cada agendamento
      const formattedAppointments: Appointment[] = (appointmentsData || []).map(appointment => ({
        ...appointment,
        professional_name: professionalData?.name || ''
      }));

      setAppointments(formattedAppointments);
      
    } catch (err) {
      console.error('[useProfessionalAgenda] Erro ao carregar agendamentos:', err);
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

    const channelName = `professional-agenda-${professionalId}-${format(selectedDate, 'yyyy-MM-dd')}`;
    console.log('[useProfessionalAgenda] Configurando canal realtime:', channelName);
    
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
        (payload) => {
          console.log('[useProfessionalAgenda] Mudança detectada:', payload);
          if (mounted) {
            fetchAgendaData();
          }
        }
      )
      .subscribe((status) => {
        console.log('[useProfessionalAgenda] Status da subscription:', status);
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
      console.log('[useProfessionalAgenda] Limpando subscription:', channelName);
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
