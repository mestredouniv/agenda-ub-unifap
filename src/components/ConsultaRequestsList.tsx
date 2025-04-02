
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase, retryOperation } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";

interface AppointmentRequest {
  id: string;
  professionalId: string;
  patientName: string;
  preferredDate: string;
  preferredTime: string;
  status: "pending" | "approved" | "rejected" | "rescheduled" | "direct_visit";
  message?: string;
}

export const ConsultaRequestsList = () => {
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      fetchRequests();
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
  }, []);

  // Initial fetch of appointment requests
  const fetchRequests = async () => {
    if (isOffline) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    try {
      setIsLoading(true);
      setHasError(false);
      
      const { data, error } = await retryOperation(async () => {
        return supabase
          .from('appointments')
          .select('*')
          .order('created_at', { ascending: false });
      });
      
      if (error) throw error;

      setRequests(data.map(appointment => ({
        id: appointment.id,
        professionalId: appointment.professional_id || '',
        patientName: appointment.patient_name,
        preferredDate: appointment.appointment_date,
        preferredTime: appointment.appointment_time,
        status: appointment.display_status as AppointmentRequest['status'],
        message: appointment.has_record
      })));
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setHasError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    // Only set up realtime subscription if we're online
    if (!isOffline) {
      const channel = supabase
        .channel('appointment-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments'
          },
          () => {
            fetchRequests(); // Refetch data when changes occur
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOffline]);

  const getStatusBadge = (status: AppointmentRequest["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Aguardando</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Aprovada</Badge>;
      case "rejected":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejeitada</Badge>;
      case "rescheduled":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Remarcada</Badge>;
      case "direct_visit":
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Visita Direta</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Solicitações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Carregando solicitações...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isOffline) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Solicitações</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>Sem conexão</AlertTitle>
            <AlertDescription>
              Você está offline. Conecte-se à internet para ver as solicitações.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Solicitações</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro de conexão</AlertTitle>
            <AlertDescription>
              Não foi possível carregar as solicitações. Verifique sua conexão e tente novamente.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Solicitações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Não há solicitações de consulta no momento
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Solicitações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50"
          >
            <div>
              <p className="font-medium">{request.patientName}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(request.preferredDate), "dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
                {" - "}
                {request.preferredTime}
              </p>
              {request.message && (
                <p className="text-sm text-muted-foreground mt-1">
                  {request.message}
                </p>
              )}
            </div>
            <div>{getStatusBadge(request.status)}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
