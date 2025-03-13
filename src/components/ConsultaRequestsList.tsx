import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    // Initial fetch of appointment requests
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching requests:', error);
        return;
      }

      setRequests(data.map(appointment => ({
        id: appointment.id,
        professionalId: appointment.professional_id || '',
        patientName: appointment.patient_name,
        preferredDate: appointment.appointment_date,
        preferredTime: appointment.appointment_time,
        status: appointment.display_status as AppointmentRequest['status'],
        message: appointment.has_record
      })));
    };

    fetchRequests();

    // Subscribe to realtime updates
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
  }, []);

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
