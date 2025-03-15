
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "../integrations/supabase/client"; // Ajuste do caminho de importação
import { useToast } from "../components/ui/use-toast"; // Ajuste do caminho de importação
import { fetchDailyAppointments } from "../services/appointment"; // Ajuste do caminho de importação

export const useConsultas = (selectedProfessional: string, selectedDate: Date) => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppointments = async () => {
    if (!selectedDate) {
      console.error("Data selecionada é inválida.");
      return; // Adicionando retorno para evitar execução adicional
    }
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      console.log("Buscando agendamentos para a data:", formattedDate); // Log de depuração
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

      if (error) {
        console.error("Erro ao buscar agendamentos:", error); // Log de erro
        throw error;
      }
      console.log("Agendamentos buscados:", data); // Log de depuração
      setAppointments(data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
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
      console.error('Erro ao buscar profissionais:', error);
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

    const channel = supabase
      .channel('appointments-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments',
      }, () => {
        fetchAppointments();
      })
      .subscribe();

    return () => {
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
