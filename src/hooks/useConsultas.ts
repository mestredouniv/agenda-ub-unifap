import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { fetchDailyAppointments } from "@/services/appointment";

export const useConsultas = (selectedProfessional: string, selectedDate: Date) => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      console.log('[useConsultas] Fetching appointments...');
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      let query = supabase
        .from('appointments')
        .select(`
          *,
          professionals:professional_id(name)
        `)
        .eq('appointment_date', formattedDate)
        .is('deleted_at', null);

      if (selectedProfessional !== "all") {
        query = query.eq('professional_id', selectedProfessional);
      }

      const { data, error } = await query
        .order('priority', { ascending: false })
        .order('appointment_time', { ascending: true });

      if (error) throw error;
      console.log('[useConsultas] Appointments fetched:', data?.length);
      setAppointments(data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('[useConsultas] Error fetching appointments:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const fetchProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*');
      
      if (error) {
        throw error;
      }

      setProfessionals(data || []);
    } catch (error) {
      console.error('[useConsultas] Error fetching professionals:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de profissionais",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

  useEffect(() => {
    fetchAppointments();

    // Create a channel for both Postgres changes and broadcast events
    const channel = supabase
      .channel('appointments-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments',
      }, (payload) => {
        console.log('[useConsultas] Postgres change detected:', payload);
        fetchAppointments();
      })
      .on('broadcast', { event: 'appointment_created' }, (payload) => {
        console.log('[useConsultas] Broadcast event received:', payload);
        fetchAppointments();
      })
      .subscribe((status) => {
        console.log('[useConsultas] Channel status:', status);
      });

    return () => {
      console.log('[useConsultas] Removing channel');
      supabase.removeChannel(channel);
    };
  }, [selectedProfessional, selectedDate]);

  return { 
    appointments, 
    professionals, 
    isLoading,
    fetchAppointments 
  };
};