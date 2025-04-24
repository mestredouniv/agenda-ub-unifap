
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
  const { professionals } = useProfessionals();
  const { toast } = useToast();

  const loadRequests = async () => {
    setLoading(true);
    const data = await fetchAppointmentRequests();
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (
    requestId: string, 
    appointmentDate: string, 
    appointmentTime: string, 
    professionalId: string
  ) => {
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
    handleApprove,
    handleReject,
    refreshRequests: loadRequests
  };
};
