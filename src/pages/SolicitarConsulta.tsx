
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Asterisk } from "lucide-react";
import { ConsultaHeader } from "@/components/ConsultaHeader";
import { ConsultaRequestsList } from "@/components/ConsultaRequestsList";
import { PersonalDataForm } from "@/components/PersonalDataForm";
import { AppointmentSelection } from "@/components/AppointmentSelection";
import { supabase } from "@/integrations/supabase/client";

interface Professional {
  id: string;
  name: string;
  profession: string;
}

const RequiredField = () => (
  <Asterisk className="inline-block h-2 w-2 text-red-500 ml-1" />
);

export const SolicitarConsulta = () => {
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
    const fetchProfessionals = async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*');
      
      if (error) {
        console.error('Error fetching professionals:', error);
        return;
      }

      setProfessionals(data);
    };

    fetchProfessionals();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        professional_id: formData.professionalId,
        patient_name: formData.patientName,
        appointment_date: formData.preferredDate?.toISOString().split('T')[0],
        appointment_time: formData.preferredTime,
        status: 'pending',
        medical_record_type: `CPF: ${formData.cpf}, SUS: ${formData.sus}, Idade: ${formData.age}, Telefone: ${formData.phone}${formData.responsible ? `, Responsável: ${formData.responsible}` : ''}`
      }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar a solicitação. Por favor, tente novamente.",
        variant: "destructive",
      });
      console.error('Error submitting appointment request:', error);
      return;
    }

    toast({
      title: "Solicitação enviada",
      description: "Sua solicitação foi enviada com sucesso!",
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
