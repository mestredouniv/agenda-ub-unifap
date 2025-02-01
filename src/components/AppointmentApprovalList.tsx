import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { AppointmentCard } from "./AppointmentCard";
import { RescheduleDialog } from "./RescheduleDialog";
import { DirectVisitDialog } from "./DirectVisitDialog";

interface Appointment {
  id: string;
  patientName: string;
  preferredDate: string;
  preferredTime: string;
  status: "pending" | "approved" | "rejected" | "rescheduled" | "direct_visit";
  professionalId: string;
  suggestedDate?: string;
  suggestedTime?: string;
  message?: string;
}

interface AppointmentApprovalListProps {
  professionalId: string;
}

export const AppointmentApprovalList = ({ professionalId }: AppointmentApprovalListProps) => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showDirectVisitDialog, setShowDirectVisitDialog] = useState(false);
  const [suggestedDate, setSuggestedDate] = useState<Date | undefined>();
  const [suggestedTime, setSuggestedTime] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadAppointments = () => {
      const allAppointments = JSON.parse(localStorage.getItem("appointments") || "[]");
      const currentDate = new Date();
      const filteredAppointments = allAppointments.filter((app: Appointment) => {
        const appointmentDate = new Date(app.preferredDate);
        return (
          app.professionalId === professionalId &&
          app.status === "pending" &&
          appointmentDate >= currentDate
        );
      });
      setAppointments(filteredAppointments);
    };

    loadAppointments();
    const interval = setInterval(loadAppointments, 60000);
    return () => clearInterval(interval);
  }, [professionalId]);

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

    setAppointments(prevAppointments => 
      prevAppointments.filter(app => app.id !== appointmentId)
    );
  };

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleDialog(true);
  };

  const handleDirectVisit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDirectVisitDialog(true);
  };

  const handleSaveReschedule = () => {
    if (!selectedAppointment || !suggestedDate || !suggestedTime) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma nova data e horário.",
        variant: "destructive",
      });
      return;
    }

    const allAppointments = JSON.parse(localStorage.getItem("appointments") || "[]");
    const updatedAppointments = allAppointments.map((app: Appointment) =>
      app.id === selectedAppointment.id
        ? {
            ...app,
            status: "rescheduled",
            suggestedDate: suggestedDate.toISOString(),
            suggestedTime,
            message,
          }
        : app
    );

    localStorage.setItem("appointments", JSON.stringify(updatedAppointments));
    
    toast({
      title: "Nova data sugerida",
      description: "Uma nova data foi sugerida para o paciente.",
    });

    setShowRescheduleDialog(false);
    setSelectedAppointment(null);
    setSuggestedDate(undefined);
    setSuggestedTime("");
    setMessage("");
    
    setAppointments(prevAppointments => 
      prevAppointments.filter(app => app.id !== selectedAppointment.id)
    );
  };

  const handleSaveDirectVisit = () => {
    if (!selectedAppointment || !message) {
      toast({
        title: "Erro",
        description: "Por favor, adicione uma mensagem para o paciente.",
        variant: "destructive",
      });
      return;
    }

    const allAppointments = JSON.parse(localStorage.getItem("appointments") || "[]");
    const updatedAppointments = allAppointments.map((app: Appointment) =>
      app.id === selectedAppointment.id
        ? {
            ...app,
            status: "direct_visit",
            message,
          }
        : app
    );

    localStorage.setItem("appointments", JSON.stringify(updatedAppointments));
    
    toast({
      title: "Visita direta solicitada",
      description: "O paciente foi notificado para comparecer à UBS.",
    });

    setShowDirectVisitDialog(false);
    setSelectedAppointment(null);
    setMessage("");
    
    setAppointments(prevAppointments => 
      prevAppointments.filter(app => app.id !== selectedAppointment.id)
    );
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
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onApprove={(id) => handleApproval(id, true)}
          onReject={(id) => handleApproval(id, false)}
          onReschedule={handleReschedule}
          onDirectVisit={handleDirectVisit}
        />
      ))}

      <RescheduleDialog
        open={showRescheduleDialog}
        onOpenChange={setShowRescheduleDialog}
        suggestedDate={suggestedDate}
        suggestedTime={suggestedTime}
        message={message}
        onDateSelect={setSuggestedDate}
        onTimeChange={setSuggestedTime}
        onMessageChange={setMessage}
        onSave={handleSaveReschedule}
      />

      <DirectVisitDialog
        open={showDirectVisitDialog}
        onOpenChange={setShowDirectVisitDialog}
        message={message}
        onMessageChange={setMessage}
        onSave={handleSaveDirectVisit}
      />
    </div>
  );
};