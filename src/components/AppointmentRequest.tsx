import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentTicket } from "@/components/AppointmentTicket";
import { PersonalDataForm } from "@/components/PersonalDataForm";
import { AppointmentSelection } from "@/components/AppointmentSelection";
import { professionals } from "@/data/professionals";

interface AppointmentRequest {
  id: string;
  professionalId: string;
  patientName: string;
  cpf: string;
  sus: string;
  age: string;
  phone: string;
  preferredDate: Date | undefined;
  preferredTime: string;
  responsible?: string;
  status: "pending" | "approved" | "rejected" | "rescheduled" | "direct_visit";
  message?: string;
}

const generateId = () => {
  return Math.random().toString(36).substring(2, 15);
};

const AppointmentRequest = () => {
  const { toast } = useToast();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<string>("");
  const [formData, setFormData<Omit<AppointmentRequest, "id" | "status" | "message">>] = useState({
    professionalId: "",
    patientName: "",
    cpf: "",
    sus: "",
    age: "",
    phone: "",
    preferredDate: undefined,
    preferredTime: "",
  });

  const [errors, setErrors] = useState({});

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicketNumber = generateId();
    setTicketNumber(newTicketNumber);
    
    const appointment: AppointmentRequest = {
      id: newTicketNumber,
      ...formData,
      status: "pending",
      preferredDate: formData.preferredDate,
    };
    
    // Salvar na lista geral de agendamentos
    const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
    appointments.push(appointment);
    localStorage.setItem("appointments", JSON.stringify(appointments));

    // Adicionar à agenda do profissional específico
    const professionalSchedule = JSON.parse(
      localStorage.getItem(`schedule-${formData.professionalId}`) || "[]"
    );
    professionalSchedule.push(appointment);
    localStorage.setItem(
      `schedule-${formData.professionalId}`,
      JSON.stringify(professionalSchedule)
    );

    setShowConfirmation(true);
    toast({
      title: "Solicitação enviada",
      description: "Sua solicitação foi enviada e está aguardando aprovação do profissional.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            UNIVERSIDADE FEDERAL DO AMAPÁ
          </h1>
          <h2 className="text-xl font-semibold text-gray-800">
            UNIDADE BÁSICA DE SAÚDE
          </h2>
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Solicitação de Agendamento de Consulta
            </CardTitle>
            <CardDescription className="text-center">
              Preencha os dados abaixo para solicitar seu agendamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <AppointmentSelection
                professionals={professionals}
                formData={formData}
                onChange={handleFormChange}
              />

              <PersonalDataForm
                formData={{
                  patientName: formData.patientName,
                  cpf: formData.cpf,
                  sus: formData.sus,
                  age: formData.age,
                  phone: formData.phone,
                  birth_date: "",
                }}
                onChange={handleFormChange}
                errors={errors}
              />

              <div className="bg-blue-50 p-4 rounded-md flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Seus dados pessoais serão tratados de acordo com a Lei Geral de
                  Proteção de Dados (LGPD) e utilizados apenas para fins de
                  agendamento e atendimento médico.
                </p>
              </div>

              <Button type="submit" className="w-full">
                Solicitar Agendamento
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Status da Solicitação</DialogTitle>
            <DialogDescription>
              Guarde seu número de protocolo para consultar o status do agendamento
            </DialogDescription>
          </DialogHeader>
          
          <AppointmentTicket
            ticketNumber={ticketNumber}
            appointmentDate={formData.preferredDate}
            appointmentTime={formData.preferredTime}
          />
          
          <Button 
            onClick={() => window.location.href = "/consultar-agendamento"} 
            className="w-full mt-4"
          >
            Consultar Status do Agendamento
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentRequest;
