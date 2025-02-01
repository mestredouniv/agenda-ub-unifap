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
import { PersonalDataForm } from "@/components/PersonalDataForm";
import { AppointmentSelection } from "@/components/AppointmentSelection";
import { AppointmentRequestsReport } from "./AppointmentRequestsReport";

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
  status: "pending" | "approved" | "rejected" | "rescheduled";
  createdAt: string;
}

const professionals = [
  { id: "1", name: "Luciana", profession: "Psicóloga" },
  { id: "2", name: "Janaína", profession: "Psicóloga" },
  { id: "3", name: "Anna", profession: "Fisioterapeuta" },
  { id: "4", name: "Anderson", profession: "Médico" },
  { id: "5", name: "Anna", profession: "Auriculoterapeuta" },
  { id: "6", name: "Wandervan", profession: "Enfermeiro" },
  { id: "7", name: "Patrícia", profession: "Enfermeira" },
  { id: "8", name: "Liliany", profession: "Médica" },
  { id: "9", name: "Janaína", profession: "Enfermeira" },
  { id: "10", name: "Equipe", profession: "Curativo" },
  { id: "11", name: "André", profession: "Médico" },
  { id: "12", name: "Ananda", profession: "Enfermeira" },
  { id: "13", name: "Nely", profession: "Enfermeira" },
  { id: "14", name: "Luciana", profession: "Psicóloga" },
  { id: "15", name: "Janaína", profession: "Psicóloga" },
  { id: "16", name: "Equipe", profession: "Laboratório" },
  { id: "17", name: "Equipe", profession: "Gestante" },
];

const generateId = () => {
  return Math.random().toString(36).substring(2, 15);
};

const AppointmentRequest = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Omit<AppointmentRequest, "id" | "status" | "createdAt">>({
    professionalId: "",
    patientName: "",
    cpf: "",
    sus: "",
    age: "",
    phone: "",
    preferredDate: undefined,
    preferredTime: "",
  });

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const appointment: AppointmentRequest = {
      id: generateId(),
      ...formData,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    
    const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
    appointments.push(appointment);
    localStorage.setItem("appointments", JSON.stringify(appointments));

    toast({
      title: "Solicitação enviada",
      description: "Sua solicitação foi enviada e está aguardando aprovação do profissional.",
    });

    // Reset form
    setFormData({
      professionalId: "",
      patientName: "",
      cpf: "",
      sus: "",
      age: "",
      phone: "",
      preferredDate: undefined,
      preferredTime: "",
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

              <Button type="submit" className="w-full">
                Solicitar Agendamento
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8">
          <AppointmentRequestsReport />
        </div>
      </div>
    </div>
  );
};

export default AppointmentRequest;