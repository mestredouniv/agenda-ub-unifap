
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Appointment } from "@/types/appointment";
import { 
  fetchDailyAppointments, 
  createNewAppointment, 
  updateExistingAppointment 
} from "@/services/appointmentService";
import { formatAppointmentData } from "@/utils/appointmentUtils";

export const useAppointments = (professionalId: string) => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await fetchDailyAppointments(professionalId);
      const formattedAppointments = formatAppointmentData(data || []);
      
      setAppointments(formattedAppointments);
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
  }, [professionalId, toast]);

  const createAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id' | 'professional'>) => {
    try {
      const data = await createNewAppointment(appointmentData);
      
      toast({
        title: "Sucesso",
        description: "Consulta agendada com sucesso!",
      });

      await fetchAppointments();
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao criar agendamento');
      console.error('[Agenda] Erro ao criar consulta:', error);
      toast({
        title: "Erro no agendamento",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  }, [fetchAppointments, toast]);

  const updateAppointment = useCallback(async (id: string, updateData: Partial<Appointment>) => {
    try {
      await updateExistingAppointment(id, updateData);
      
      toast({
        title: "Sucesso",
        description: "Alterações salvas com sucesso.",
      });

      await fetchAppointments();
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao atualizar agendamento');
      console.error('[Agenda] Erro ao atualizar consulta:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  }, [fetchAppointments, toast]);

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
          filter: professionalId !== "all" ? `professional_id=eq.${professionalId}` : undefined
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
    fetchAppointments,
    createAppointment,
    updateAppointment
  };
};
