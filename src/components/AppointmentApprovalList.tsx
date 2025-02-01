import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, Calendar } from "lucide-react";
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

interface Appointment {
  id: string;
  patientName: string;
  preferredDate: string;
  preferredTime: string;
  status: "pending" | "approved" | "rejected" | "rescheduled";
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
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [suggestedDate, setSuggestedDate] = useState<Date | undefined>();
  const [suggestedTime, setSuggestedTime] = useState("");
  const [message, setMessage] = useState("");

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

    window.location.reload();
  };

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleDialog(true);
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
                onClick={() => handleReschedule(appointment)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Calendar className="h-4 w-4" />
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
              <Input
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
    </div>
  );
};