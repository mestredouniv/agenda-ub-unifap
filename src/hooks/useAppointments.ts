
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

  const fetchAppointments = useCallback(async () => {
    try {
      console.log('[Agenda] Iniciando busca de consultas para profissional:', professionalId);
      setIsLoading(true);
      
      const data = await fetchDailyAppointments(professionalId);
      console.log('[Agenda] Dados recebidos do banco:', data);

      const formattedAppointments = formatAppointmentData(data || []);
      console.log('[Agenda] Appointments formatados:', formattedAppointments);
      
      setAppointments(formattedAppointments);
    } catch (err) {
      console.error('[Agenda] Erro inesperado ao buscar consultas:', err);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [professionalId, toast]);

  const createAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id' | 'professional'>) => {
    console.log('[Agenda] Criando nova consulta:', appointmentData);
    
    try {
      const data = await createNewAppointment(appointmentData);
      console.log('[Agenda] Consulta criada com sucesso:', data);
      
      toast({
        title: "Consulta agendada",
        description: "A consulta foi agendada com sucesso!",
      });

      await fetchAppointments();
      return data;
    } catch (error) {
      console.error('[Agenda] Erro inesperado ao criar consulta:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao agendar a consulta.",
        variant: "destructive",
      });
      return null;
    }
  }, [fetchAppointments, toast]);

  const updateAppointment = useCallback(async (id: string, updateData: Partial<Appointment>) => {
    console.log('[Agenda] Iniciando atualização de consulta:', { id, updateData });
    
    try {
      await updateExistingAppointment(id, updateData);
      console.log('[Agenda] Consulta atualizada com sucesso');
      
      toast({
        title: "Alterações salvas",
        description: "As alterações foram salvas automaticamente.",
      });

      await fetchAppointments();
      return true;
    } catch (error) {
      console.error('[Agenda] Erro inesperado ao atualizar consulta:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as alterações.",
        variant: "destructive",
      });
      return false;
    }
  }, [fetchAppointments, toast]);

  useEffect(() => {
    console.log('[Agenda] Configurando sincronização em tempo real para profissional:', professionalId);
    
    const channel = supabase
      .channel('agenda-realtime')
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
          fetchAppointments();
        }
      )
      .subscribe((status) => {
        console.log('[Agenda] Status da sincronização:', status);
      });

    fetchAppointments();

    return () => {
      console.log('[Agenda] Limpando subscription');
      supabase.removeChannel(channel);
    };
  }, [professionalId, fetchAppointments]);

  return { 
    appointments,
    isLoading,
    fetchAppointments,
    createAppointment,
    updateAppointment
  };
};
