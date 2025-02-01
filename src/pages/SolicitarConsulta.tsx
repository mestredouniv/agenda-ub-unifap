import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Asterisk } from "lucide-react";
import { ConsultaHeader } from "@/components/ConsultaHeader";
import { ConsultaRequestsList } from "@/components/ConsultaRequestsList";
import { PersonalDataForm } from "@/components/PersonalDataForm";
import { AppointmentSelection } from "@/components/AppointmentSelection";

interface Professional {
  id: string;
  name: string;
  profession: string;
}

const RequiredField = () => (
  <Asterisk className="inline-block h-2 w-2 text-red-500 ml-1" />
);

const SolicitarConsulta = () => {
  const { toast } = useToast();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    patientName: "",
    cpf: "",
    sus: "",
    age: "",
    phone: "",
    responsible: "",
    professionalId: "",
    preferredDate: undefined as Date | undefined,
    preferredTime: "",
  });

  useEffect(() => {
    const storedProfessionals = JSON.parse(localStorage.getItem("professionals") || "[]");
    setProfessionals(storedProfessionals);
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {};
    const requiredFields = ["patientName", "cpf", "sus", "age", "phone", "professionalId", "preferredDate", "preferredTime"];
    
    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = true;
      }
    });

    if (parseInt(formData.age) < 18 && !formData.responsible) {
      newErrors.responsible = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const appointmentId = crypto.randomUUID();
    const newAppointment = {
      id: appointmentId,
      ...formData,
      status: "pending",
      preferredDate: formData.preferredDate?.toISOString(),
    };

    // Salvar na lista geral de agendamentos
    const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
    appointments.push(newAppointment);
    localStorage.setItem("appointments", JSON.stringify(appointments));

    // Adicionar à agenda do profissional específico
    const professionalSchedule = JSON.parse(
      localStorage.getItem(`schedule-${formData.professionalId}`) || "[]"
    );
    professionalSchedule.push(newAppointment);
    localStorage.setItem(
      `schedule-${formData.professionalId}`,
      JSON.stringify(professionalSchedule)
    );

    toast({
      title: "Solicitação enviada",
      description: "Sua solicitação foi enviada com sucesso! Aguarde a aprovação do profissional.",
    });

    setFormData({
      patientName: "",
      cpf: "",
      sus: "",
      age: "",
      phone: "",
      responsible: "",
      professionalId: "",
      preferredDate: undefined,
      preferredTime: "",
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <ConsultaHeader />

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">Solicitar Consulta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <AppointmentSelection
              professionals={professionals}
              formData={formData}
              onChange={handleFormChange}
            />

            <PersonalDataForm
              formData={formData}
              onChange={handleFormChange}
              errors={errors}
            />

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              Solicitar Consulta
            </Button>
          </form>
        </CardContent>
      </Card>

      <ConsultaRequestsList />
    </div>
  );
};

export default SolicitarConsulta;