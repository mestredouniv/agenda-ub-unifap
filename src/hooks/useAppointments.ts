
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
      
      const { data: appointmentsData, error: fetchError } = await supabase
        .from('appointments')
        .select(`
          *,
          professionals!appointments_professional_id_fkey (
            name
          )
        `)
        .eq('professional_id', professionalId)
        .eq('appointment_date', formattedDate)
        .is('deleted_at', null)
        .order('priority', { ascending: false })
        .order('appointment_time', { ascending: true });

      if (fetchError) throw fetchError;
      
      console.log('[Agenda] Dados recebidos:', appointmentsData);

      const transformedData: Appointment[] = (appointmentsData || []).map((rawItem: any) => {
        console.log('[Agenda] Transformando item:', rawItem);
        
        const displayStatus: ValidDisplayStatus = isValidDisplayStatus(rawItem.display_status || 'waiting')
          ? rawItem.display_status as ValidDisplayStatus
          : 'waiting';

        const item: Appointment = {
          id: rawItem.id,
          patient_name: rawItem.patient_name,
          birth_date: rawItem.birth_date,
          professional_id: rawItem.professional_id,
          appointment_date: rawItem.appointment_date,
          appointment_time: rawItem.appointment_time,
          display_status: displayStatus,
          priority: rawItem.priority === 'priority' ? 'priority' : 'normal',
          professionals: { 
            name: rawItem.professionals?.name || '' 
          },
          is_minor: Boolean(rawItem.is_minor),
          responsible_name: rawItem.responsible_name || null,
          has_record: rawItem.has_record || null,
          notes: rawItem.notes || null,
          actual_start_time: rawItem.actual_start_time || null,
          actual_end_time: rawItem.actual_end_time || null,
          updated_at: rawItem.updated_at || null,
          deleted_at: rawItem.deleted_at || null,
          phone: rawItem.phone || '',
          room: rawItem.room || null,
          block: rawItem.block || null,
          ticket_number: rawItem.ticket_number || null
        };

        return item;
      });
      
      console.log('[Agenda] Dados transformados:', transformedData);
      setAppointments(transformedData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro desconhecido');
      console.error('[Agenda] Erro ao buscar consultas:', error);
      setError(error);
      toast({
        title: "Erro ao carregar agenda",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [professionalId, selectedDate, toast]);

  useEffect(() => {
    let mounted = true;

    // Configurar subscription para mudanças em tempo real
    const channel = supabase
      .channel(`appointments-${professionalId}-${format(selectedDate, 'yyyy-MM-dd')}`)
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

    // Carregar dados iniciais
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
