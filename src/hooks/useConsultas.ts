
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { supabase, retryOperation } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useConsultas = (selectedProfessional: string, selectedDate: Date) => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Auto-retry when coming back online
      if (hasError && connectionAttempts < 3) {
        fetchAppointments();
        fetchProfessionals();
        setConnectionAttempts(prev => prev + 1);
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
  }, [hasError, connectionAttempts]);

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
      console.log('[useConsultas] Buscando agendamentos para:', { selectedProfessional, formattedDate });
      
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
      }, 5, 800); // 5 retries, starting with 800ms delay

      if (error) {
        console.error('[useConsultas] Erro na busca:', error);
        throw error;
      }
      
      console.log('[useConsultas] Dados recebidos:', data);
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
      console.log('[useConsultas] Buscando profissionais');
      
      // Using the retry utility
      const { data, error } = await retryOperation(async () => {
        return supabase
          .from('professionals')
          .select('*');
      }, 5, 800);
      
      if (error) {
        console.error('[useConsultas] Erro na busca de profissionais:', error);
        throw error;
      }

      console.log('[useConsultas] Profissionais recebidos:', data);
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

  // Fetch professionals immediately and when online status changes
  useEffect(() => {
    fetchProfessionals();
  }, [isOffline]); 

  // Fetch appointments when selected professional or date changes, or when online status changes
  useEffect(() => {
    fetchAppointments();

    // Only set up realtime subscription if we're online
    if (!isOffline) {
      try {
        const channel = supabase
          .channel('appointments-changes')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'appointments',
          }, () => {
            console.log('[useConsultas] Atualização de agendamentos detectada');
            fetchAppointments();
          })
          .subscribe((status) => {
            console.log('[useConsultas] Status da subscription:', status);
          });

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (err) {
        console.error('[useConsultas] Erro ao configurar subscription:', err);
      }
    }
  }, [selectedProfessional, selectedDate, isOffline]);

  const manualRefetch = useCallback(() => {
    console.log('[useConsultas] Atualizando dados manualmente');
    setConnectionAttempts(0); // Reset connection attempts
    fetchAppointments();
    fetchProfessionals();
  }, [selectedProfessional, selectedDate]);

  return { 
    appointments, 
    professionals, 
    isLoading,
    hasError,
    isOffline,
    isRetrying,
    fetchAppointments: manualRefetch,
    refetchProfessionals: fetchProfessionals
  };
};
