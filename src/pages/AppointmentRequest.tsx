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
import { LoginCredentialsForm } from "@/components/LoginCredentialsForm";

interface AppointmentRequest {
  professionalId: string;
  patientName: string;
  cpf: string;
  sus: string;
  age: string;
  phone: string;
  preferredDate: Date | undefined;
  preferredTime: string;
  responsible?: string;
  username: string;
  password: string;
}

const generateTicketNumber = () => {
  return Math.random().toString().substring(2, 8);
};

const AppointmentRequest = () => {
  const { toast } = useToast();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<string>("");
  const [formData, setFormData] = useState<AppointmentRequest>({
    professionalId: "",
    patientName: "",
    cpf: "",
    sus: "",
    age: "",
    phone: "",
    preferredDate: undefined,
    preferredTime: "",
    username: "",
    password: "",
  });

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicketNumber = generateTicketNumber();
    setTicketNumber(newTicketNumber);
    setShowConfirmation(true);
    
    const appointment = {
      ...formData,
      ticketNumber: newTicketNumber,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    
    const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
    appointments.push(appointment);
    localStorage.setItem("appointments", JSON.stringify(appointments));

    toast({
      title: "Solicitação enviada",
      description: "Sua solicitação de agendamento foi enviada com sucesso!",
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
                professionals={initialProfessionals}
                formData={formData}
                onChange={handleFormChange}
              />

              <PersonalDataForm
                formData={formData}
                onChange={handleFormChange}
              />

              <LoginCredentialsForm
                formData={formData}
                onChange={handleFormChange}
              />

              <div className="bg-blue-50 p-4 rounded-md flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Seus dados pessoais serão tratados de acordo com a Lei Geral de
                  Proteção de Dados (LGPD) e utilizados apenas para fins de
                  agendamento e atendimento médico.
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-md">
                <p className="text-sm text-yellow-800 font-medium">
                  Importante: Lembre-se de trazer seu CPF e cartão SUS no dia da
                  consulta. Mesmo com senha, a ordem de atendimento é por ordem de
                  chegada.
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
              Guarde seu número de protocolo e credenciais para consultar o status do agendamento
            </DialogDescription>
          </DialogHeader>
          
          <AppointmentTicket
            ticketNumber={ticketNumber}
            appointmentDate={formData.preferredDate}
            appointmentTime={formData.preferredTime}
            username={formData.username}
            password={formData.password}
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