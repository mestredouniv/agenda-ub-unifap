
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase, retryOperation } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { fetchDailyAppointments } from "@/services/appointment";
import { Appointment } from "@/types/appointment";

export const useConsultas = (selectedProfessional: string, selectedDate: Date) => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Auto-retry when coming back online
      if (hasError) {
        fetchAppointments();
        fetchProfessionals();
      }
    };
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set initial state
    setIsOffline(!navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hasError]);

  const fetchAppointments = async () => {
    if (isOffline) {
      setHasError(true);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setHasError(false);
      setIsRetrying(false);
      
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Using the retry utility
      const { data, error } = await retryOperation(async () => {
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

        return query
          .order('priority', { ascending: false })
          .order('appointment_time', { ascending: true });
      });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      setHasError(true);
      
      // Only show toast if we're online (to avoid double error messages)
      if (navigator.onLine) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os agendamentos. Verifique sua conexão com o servidor.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfessionals = async () => {
    if (isOffline) {
      return;
    }
    
    try {
      setIsRetrying(true);
      
      // Using the retry utility
      const { data, error } = await retryOperation(async () => {
        return supabase
          .from('professionals')
          .select('*');
      });
      
      if (error) {
        throw error;
      }

      setProfessionals(data || []);
      setIsRetrying(false);
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
      
      // Only show toast if we're online (to avoid double error messages)
      if (navigator.onLine && !isRetrying) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de profissionais. Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, [isOffline]); // Re-fetch when online status changes

  useEffect(() => {
    fetchAppointments();

    // Only set up realtime subscription if we're online
    if (!isOffline) {
      const channel = supabase
        .channel('appointments-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'appointments',
        }, () => {
          fetchAppointments();
        })
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedProfessional, selectedDate, isOffline]);

  return { 
    appointments, 
    professionals, 
    isLoading,
    hasError,
    isOffline,
    isRetrying,
    fetchAppointments,
    refetchProfessionals: fetchProfessionals
  };
};
