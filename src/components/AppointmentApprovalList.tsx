import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, Calendar, UserPlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Appointment {
  id: string;
  patientName: string;
  preferredDate: string;
  preferredTime: string;
  responsible?: string;
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
      {appointments.map((appointment) => (
        <Card key={appointment.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="font-medium">{appointment.patientName}</p>
              {appointment.responsible && (
                <p className="text-sm text-muted-foreground">
                  Responsável: {appointment.responsible}
                </p>
              )}
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
                onClick={() => handleReschedule(appointment)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Calendar className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDirectVisit(appointment)}
                className="text-yellow-600 hover:text-yellow-700"
              >
                <UserPlus className="h-4 w-4" />
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

      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sugerir Nova Data</DialogTitle>
            <DialogDescription>
              Selecione uma nova data e horário para o paciente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nova Data</label>
              <CalendarComponent
                mode="single"
                selected={suggestedDate}
                onSelect={setSuggestedDate}
                className="rounded-md border"
                locale={ptBR}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Novo Horário</label>
              <Input
                type="time"
                value={suggestedTime}
                onChange={(e) => setSuggestedTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mensagem para o Paciente</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: Por favor, confirme se este horário é adequado"
              />
            </div>
            <Button onClick={handleSaveReschedule} className="w-full">
              Salvar Nova Data
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDirectVisitDialog} onOpenChange={setShowDirectVisitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Visita Direta à UBS</DialogTitle>
            <DialogDescription>
              Adicione uma mensagem explicando o motivo da visita direta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mensagem para o Paciente</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: Por favor, compareça à UBS para uma avaliação inicial"
              />
            </div>
            <Button onClick={handleSaveDirectVisit} className="w-full">
              Solicitar Visita Direta
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};