
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Appointment } from "@/types/appointment";

export const useAppointments = (selectedProfessional: string) => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const fetchAppointments = async () => {
    const today = new Date().toISOString().split('T')[0];
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
      .eq('appointment_date', today);

    if (selectedProfessional !== "all") {
      query = query.eq('professional_id', selectedProfessional);
    }

    const { data, error } = await query.order('appointment_time', { ascending: true });

    if (error) {
      console.error('Erro ao buscar consultas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as consultas",
        variant: "destructive",
      });
      return;
    }

    // Formatar os dados para garantir a consistência dos tipos
    const formattedAppointments: Appointment[] = (data || []).map(item => ({
      id: item.id,
      patient_name: item.patient_name,
      professional_id: item.professional_id,
      professional: {
        name: item.professionals.name
      },
      appointment_date: item.appointment_date,
      appointment_time: item.appointment_time,
      display_status: item.display_status,
      priority: item.priority,
      notes: item.notes,
      actual_start_time: item.actual_start_time,
      actual_end_time: item.actual_end_time
    }));

    setAppointments(formattedAppointments);
  };

  useEffect(() => {
    fetchAppointments();

    // Configurar subscription para atualizações em tempo real
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedProfessional]);

  // Adicionar função para criar novo agendamento
  const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'professional'>) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
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

      toast({
        title: "Sucesso",
        description: "Consulta agendada com sucesso!",
      });

      // Atualizar a lista de consultas
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

  return { 
    appointments, 
    fetchAppointments,
    createAppointment 
  };
};
