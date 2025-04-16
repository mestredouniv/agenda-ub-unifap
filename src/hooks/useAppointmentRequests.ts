
import { useState, useEffect } from 'react';
import { AppointmentRequest } from '@/types/appointmentRequest';
import { 
  fetchAppointmentRequests, 
  approveAppointmentRequest, 
  rejectAppointmentRequest 
} from '@/services/appointment/appointmentRequest';
import { useProfessionals } from '@/hooks/useProfessionals';
import { useToast } from '@/components/ui/use-toast';

export const useAppointmentRequests = () => {
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { professionals } = useProfessionals();
  const { toast } = useToast();

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (hasError) loadRequests();
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

  const loadRequests = async () => {
    if (isOffline) {
      setLoading(false);
      setHasError(true);
      return;
    }

    try {
      setLoading(true);
      setHasError(false);
      const data = await fetchAppointmentRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
      setHasError(true);
      if (navigator.onLine) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar as solicitações. Verifique sua conexão com o servidor.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [isOffline]);

  const handleApprove = async (
    requestId: string, 
    appointmentDate: string, 
    appointmentTime: string, 
    professionalId: string
  ) => {
    if (isOffline) {
      toast({
        title: "Sem conexão",
        description: "Você está offline. Não é possível aprovar solicitações.",
        variant: "destructive",
      });
      return false;
    }

    const success = await approveAppointmentRequest(
      requestId,
      appointmentDate,
      appointmentTime,
      professionalId
    );

    if (success) {
      toast({
        title: "Solicitação aprovada",
        description: "O agendamento foi aprovado com sucesso.",
      });
      loadRequests();
      return true;
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível aprovar a solicitação.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleReject = async (requestId: string) => {
    if (isOffline) {
      toast({
        title: "Sem conexão",
        description: "Você está offline. Não é possível rejeitar solicitações.",
        variant: "destructive",
      });
      return false;
    }

    const success = await rejectAppointmentRequest(requestId);

    if (success) {
      toast({
        title: "Solicitação rejeitada",
        description: "A solicitação foi rejeitada.",
      });
      loadRequests();
      return true;
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar a solicitação.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    requests,
    loading,
    professionals,
    hasError,
    isOffline,
    handleApprove,
    handleReject,
    refreshRequests: loadRequests
  };
};
