
import { useState, useEffect, useCallback } from "react";
import { Appointment } from "@/types/appointment";
import { useToast } from "@/components/ui/use-toast";
import { fetchDailyAppointments } from "@/services/appointmentService";
import { supabase } from "@/integrations/supabase/client";

interface AppointmentWithProfessional extends Omit<Appointment, 'professional_name'> {
  professionals?: {
    name: string;
  };
}

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
      const formattedData: Appointment[] = (data as AppointmentWithProfessional[]).map(item => ({
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

    // Configurar channel específico para este profissional
    const channelName = `appointments-${professionalId}`;
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
          console.log(`[useAppointments] Mudança detectada no canal ${channelName}:`, payload);
          if (mounted) {
            fetchAppointments();
          }
        }
      )
      .subscribe((status) => {
        console.log(`[useAppointments] Status da subscription no canal ${channelName}:`, status);
        if (status === 'CHANNEL_ERROR') {
          console.error('[useAppointments] Erro no canal de realtime');
          toast({
            title: "Erro de sincronização",
            description: "Houve um problema na sincronização em tempo real. Atualizando dados...",
            variant: "destructive",
          });
          fetchAppointments();
        }
      });

    return () => {
      console.log(`[useAppointments] Limpando subscription do canal ${channelName}`);
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [professionalId, selectedDate, fetchAppointments, toast]);

  return { 
    appointments,
    isLoading,
    error,
    fetchAppointments
  };
};
