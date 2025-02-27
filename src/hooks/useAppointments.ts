
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Appointment } from "@/types/appointment";
import { useToast } from "@/components/ui/use-toast";
import { fetchDailyAppointments } from "@/services/appointmentService";
import { supabase } from "@/integrations/supabase/client";

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
      
      const data = await fetchDailyAppointments(professionalId);
      console.log('[useAppointments] Dados recebidos:', data);
      
      // Transformar os dados para corresponder ao tipo Appointment
      const formattedData: Appointment[] = data.map(item => ({
        ...item,
        professional_name: item.professionals?.name || ''
      }));
      
      setAppointments(formattedData);
    } catch (err) {
      console.error('[useAppointments] Erro:', err);
      setError(err instanceof Error ? err : new Error('Erro ao carregar agendamentos'));
      
      toast({
        title: "Erro ao carregar agenda",
        description: err instanceof Error ? err.message : 'Erro ao carregar agendamentos',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [professionalId, selectedDate, toast]);

  useEffect(() => {
    let mounted = true;
    
    const loadAppointments = async () => {
      if (!mounted) return;
      await fetchAppointments();
    };

    loadAppointments();

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
          console.log('[useAppointments] Mudança detectada:', payload);
          if (mounted) {
            fetchAppointments();
          }
        }
      )
      .subscribe((status) => {
        console.log('[useAppointments] Status da subscription:', status);
      });

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [professionalId, selectedDate, fetchAppointments]);

  return { 
    appointments,
    isLoading,
    error,
    fetchAppointments // Retornando a função fetchAppointments explicitamente
  };
};
