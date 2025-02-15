
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Appointment } from "@/types/appointment";

export const useAppointments = (professionalId: string) => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    try {
      console.log('[Agenda] Iniciando busca de consultas para profissional:', professionalId);
      setIsLoading(true);
      
      const today = new Date().toISOString().split('T')[0];
      console.log('[Agenda] Data atual:', today);
      
      let query = supabase
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
          professionals (
            name
          )
        `)
        .eq('appointment_date', today)
        .is('deleted_at', null); // Modificado aqui: usando .is() ao invés de .eq()

      if (professionalId !== "all") {
        query = query.eq('professional_id', professionalId);
      }

      const { data, error } = await query
        .order('priority', { ascending: false })
        .order('appointment_time', { ascending: true });

      if (error) {
        console.error('[Agenda] Erro ao buscar consultas:', error);
        toast({
          title: "Erro ao carregar agenda",
          description: "Não foi possível carregar as consultas. Por favor, tente novamente.",
          variant: "destructive",
        });
        return;
      }

      console.log('[Agenda] Dados recebidos do banco:', data);

      const formattedAppointments: Appointment[] = (data || []).map(item => {
        console.log('[Agenda] Formatando item:', item);
        const status = item.display_status as Appointment['display_status'] || 'waiting';
        const priority = item.priority as Appointment['priority'] || 'normal';
        
        return {
          id: item.id,
          patient_name: item.patient_name,
          birth_date: item.birth_date,
          professional_id: item.professional_id,
          professional: {
            name: item.professionals?.name || ''
          },
          appointment_date: item.appointment_date,
          appointment_time: item.appointment_time,
          display_status: status,
          priority: priority,
          notes: item.notes,
          actual_start_time: item.actual_start_time,
          actual_end_time: item.actual_end_time,
          updated_at: item.updated_at,
          deleted_at: item.deleted_at
        };
      });

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
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          ...appointmentData,
          display_status: 'waiting' as const,
          priority: appointmentData.priority || 'normal',
          deleted_at: null,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('[Agenda] Erro ao criar consulta:', error);
        toast({
          title: "Erro ao criar",
          description: "Não foi possível criar a consulta. Tente novamente.",
          variant: "destructive",
        });
        return null;
      }

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
      const { error } = await supabase
        .from('appointments')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('[Agenda] Erro ao atualizar consulta:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar as alterações. Tente novamente.",
          variant: "destructive",
        });
        return false;
      }

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
