
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Appointment } from "@/types/appointment";

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
      
      const { data, error: fetchError } = await supabase
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

      if (fetchError) throw fetchError;
      
      setAppointments(data || []);
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
