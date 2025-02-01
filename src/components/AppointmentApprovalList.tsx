import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Appointment {
  id: string;
  patientName: string;
  preferredDate: string;
  preferredTime: string;
  status: "pending" | "approved" | "rejected";
  professionalId: string;
  username: string;
}

interface AppointmentApprovalListProps {
  professionalId: string;
}

export const AppointmentApprovalList = ({ professionalId }: AppointmentApprovalListProps) => {
  const { toast } = useToast();

  const appointments = JSON.parse(localStorage.getItem("appointments") || "[]")
    .filter((app: Appointment) => app.professionalId === professionalId && app.status === "pending");

  const handleApproval = (appointmentId: string, approved: boolean) => {
    const allAppointments = JSON.parse(localStorage.getItem("appointments") || "[]");
    const updatedAppointments = allAppointments.map((app: Appointment) =>
      app.id === appointmentId
        ? { ...app, status: approved ? "approved" : "rejected" }
        : app
    );
    
    localStorage.setItem("appointments", JSON.stringify(updatedAppointments));
    
    toast({
      title: approved ? "Consulta aprovada" : "Consulta rejeitada",
      description: `A solicitação de consulta foi ${approved ? "aprovada" : "rejeitada"} com sucesso.`,
    });

    // Force re-render
    window.location.reload();
  };

  if (appointments.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-center text-muted-foreground">
          Não há solicitações de consulta pendentes
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Solicitações Pendentes</h3>
      {appointments.map((appointment: Appointment) => (
        <Card key={appointment.id} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{appointment.patientName}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(appointment.preferredDate), "dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
                {" - "}
                {appointment.preferredTime}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleApproval(appointment.id, true)}
                className="text-green-600 hover:text-green-700"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleApproval(appointment.id, false)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};