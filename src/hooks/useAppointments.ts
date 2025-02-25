
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Appointment } from "@/types/appointment";

type ValidDisplayStatus = Appointment['display_status'];
const isValidDisplayStatus = (status: string): status is ValidDisplayStatus => {
  return ['waiting', 'triage', 'in_progress', 'completed', 'missed', 'rescheduled'].includes(status);
};

interface ProfessionalData {
  name: string;
}

interface AppointmentData {
  id: string;
  patient_name: string;
  birth_date: string;
  professional_id: string;
  appointment_date: string;
  appointment_time: string;
  display_status: string | null;
  priority: string;
  notes: string | null;
  actual_start_time: string | null;
  actual_end_time: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  is_minor: boolean;
  responsible_name: string | null;
  has_record: string | null;
  phone: string;
  room: string | null;
  block: string | null;
  ticket_number: string | null;
  professionals: ProfessionalData | null;
}

export const useAppointments = (professionalId: string, selectedDate: Date) => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      console.log('[Agenda] Buscando agendamentos para:', { professionalId, formattedDate });
      
      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select(`
          id,
          patient_name,
          birth_date,
          professional_id,
          appointment_date,
          appointment_time,
          display_status,
          priority,
          notes,
          actual_start_time,
          actual_end_time,
          updated_at,
          deleted_at,
          is_minor,
          responsible_name,
          has_record,
          phone,
          room,
          block,
          ticket_number,
          professionals (
            name
          )
        `)
        .eq('professional_id', professionalId)
        .eq('appointment_date', formattedDate)
        .is('deleted_at', null)
        .order('priority', { ascending: false })
        .order('appointment_time', { ascending: true });

      if (fetchError) throw fetchError;
      
      console.log('[Agenda] Dados recebidos:', data);

      // Transform and validate the data to match the Appointment type
      const transformedData: Appointment[] = (data || []).map((item: AppointmentData) => {
        console.log('[Agenda] Transformando item:', item);
        
        // Validar display_status e garantir que é um dos valores permitidos
        const displayStatus: ValidDisplayStatus = isValidDisplayStatus(item.display_status || 'waiting')
          ? item.display_status as ValidDisplayStatus
          : 'waiting';

        // Validar priority
        const priority = item.priority === 'priority' ? 'priority' : 'normal';

        // Handle professionals data safely
        const professionalName = item.professionals?.name || '';
        
        return {
          id: item.id,
          patient_name: item.patient_name,
          birth_date: item.birth_date,
          professional_id: item.professional_id,
          appointment_date: item.appointment_date,
          appointment_time: item.appointment_time,
          display_status: displayStatus,
          priority: priority,
          professionals: { name: professionalName },
          is_minor: Boolean(item.is_minor),
          responsible_name: item.responsible_name || null,
          has_record: item.has_record || null,
          notes: item.notes || null,
          actual_start_time: item.actual_start_time || null,
          actual_end_time: item.actual_end_time || null,
          updated_at: item.updated_at || null,
          deleted_at: item.deleted_at || null,
          phone: item.phone || '',
          room: item.room || null,
          block: item.block || null,
          ticket_number: item.ticket_number || null
        };
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

    const channel = supabase
      .channel(`appointments-${professionalId}`)
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
  }, [professionalId, fetchAppointments]);

  return { 
    appointments,
    isLoading,
    error,
    fetchAppointments
  };
};
