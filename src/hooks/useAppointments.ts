
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Appointment } from "@/types/appointment";

type ValidDisplayStatus = Appointment['display_status'];
const isValidDisplayStatus = (status: string): status is ValidDisplayStatus => {
  return ['waiting', 'triage', 'triage_completed', 'in_progress', 'completed', 'missed', 'rescheduled'].includes(status);
};

interface DatabaseAppointment {
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
  professionals: { name: string } | null;
}

export const useAppointments = (professionalId: string, selectedDate: Date) => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAppointments = useCallback(async () => {
    if (!professionalId || !selectedDate) {
      console.log('[Agenda] Parâmetros inválidos:', { professionalId, selectedDate });
      return;
    }

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
          professionals:professional_id(name)
        `)
        .eq('professional_id', professionalId)
        .eq('appointment_date', formattedDate)
        .is('deleted_at', null)
        .order('priority', { ascending: false })
        .order('appointment_time', { ascending: true });

      if (fetchError) throw fetchError;
      
      console.log('[Agenda] Dados recebidos:', data);

      const transformedData: Appointment[] = (data || []).map((rawItem: any) => {
        console.log('[Agenda] Transformando item:', rawItem);
        
        // Handle display_status mapping
        let displayStatus: ValidDisplayStatus = 'waiting';
        
        if (rawItem.display_status) {
          // Try to map the database value to our expanded status set
          if (isValidDisplayStatus(rawItem.display_status)) {
            displayStatus = rawItem.display_status as ValidDisplayStatus;
          } else if (rawItem.display_status === 'triage_completed') {
            // Handle specific mapping for triage_completed if needed
            displayStatus = 'triage_completed';
          }
        }

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
