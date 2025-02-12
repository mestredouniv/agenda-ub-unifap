
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

    setAppointments(data || []);
  };

  useEffect(() => {
    fetchAppointments();

    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        () => {
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedProfessional]);

  return { appointments, fetchAppointments };
};
