
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Appointment } from "@/types/appointment";

export const useAppointments = (selectedProfessional: string) => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const fetchAppointments = async () => {
    const today = new Date().toISOString().split('T')[0];
    console.log('Buscando consultas para:', today);
    
    let query = supabase
      .from('appointments')
      .select(`
        id,
        patient_name,
        professional_id,
        appointment_date,
        appointment_time,
        display_status,
        priority,
        notes,
        actual_start_time,
        actual_end_time,
        professionals (
          name
        )
      `)
      .eq('appointment_date', today)
      .is('deleted_at', null);

    if (selectedProfessional !== "all") {
      query = query.eq('professional_id', selectedProfessional);
    }

    const { data, error } = await query.order('priority', { ascending: false }).order('appointment_time', { ascending: true });

    if (error) {
      console.error('Erro ao buscar consultas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as consultas",
        variant: "destructive",
      });
      return;
    }

    console.log('Dados recebidos:', data);

    const formattedAppointments: Appointment[] = (data || []).map(item => {
      console.log('Formatando item:', item);
      const status = item.display_status as Appointment['display_status'] || 'waiting';
      const priority = item.priority as Appointment['priority'] || 'normal';
      
      return {
        id: item.id,
        patient_name: item.patient_name,
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
        actual_end_time: item.actual_end_time
      };
    });

    console.log('Appointments formatados:', formattedAppointments);
    setAppointments(formattedAppointments);
  };

  const updateAppointment = async (id: string, updateData: Partial<Appointment>) => {
    console.log('Atualizando consulta:', id, updateData);
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar consulta:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a consulta",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sucesso",
        description: "Consulta atualizada com sucesso!",
      });

      await fetchAppointments();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar consulta:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar a consulta",
        variant: "destructive",
      });
      return false;
    }
  };

  const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'professional'>) => {
    console.log('Criando nova consulta:', appointmentData);
    
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          ...appointmentData,
          display_status: 'waiting' as const,
          priority: appointmentData.priority || 'normal',
          deleted_at: null
        }])
        .select(`
          id,
          patient_name,
          professional_id,
          appointment_date,
          appointment_time,
          display_status,
          priority,
          notes,
          actual_start_time,
          actual_end_time,
          professionals (
            name
          )
        `)
        .single();

      if (error) {
        console.error('Erro ao criar consulta:', error);
        toast({
          title: "Erro",
          description: "Não foi possível agendar a consulta",
          variant: "destructive",
        });
        return null;
      }

      console.log('Consulta criada com sucesso:', data);
      toast({
        title: "Sucesso",
        description: "Consulta agendada com sucesso!",
      });

      await fetchAppointments();
      return data;
    } catch (error) {
      console.error('Erro ao criar consulta:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao agendar a consulta",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    console.log('Inicializando useEffect com professional:', selectedProfessional);
    
    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: selectedProfessional !== "all" 
            ? `professional_id=eq.${selectedProfessional}` 
            : undefined
        },
        (payload) => {
          console.log('Mudança detectada:', payload);
          fetchAppointments();
        }
      )
      .subscribe((status) => {
        console.log('Status da subscription:', status);
      });

    fetchAppointments();

    return () => {
      console.log('Limpando subscription');
      supabase.removeChannel(channel);
    };
  }, [selectedProfessional]);

  return { 
    appointments, 
    fetchAppointments,
    createAppointment,
    updateAppointment
  };
};
