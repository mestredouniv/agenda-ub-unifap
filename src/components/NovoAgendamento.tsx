
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PatientInfoForm } from "@/components/appointments/PatientInfoForm";
import { AppointmentDateForm } from "@/components/appointments/AppointmentDateForm";
import { AdditionalInfoForm } from "@/components/appointments/AdditionalInfoForm";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";

interface NovoAgendamentoProps {
  professionalId: string;
  onSuccess: () => void;
}

export const NovoAgendamento = ({ professionalId, onSuccess }: NovoAgendamentoProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { slots: availableSlots } = useAvailableSlots(professionalId, undefined);
  const [formData, setFormData] = useState({
    patientName: "",
    birth_date: "",
    appointmentDate: undefined as Date | undefined,
    appointmentTime: "",
    phone: "",
    isMinor: false,
    responsibleName: "",
    hasRecord: "" as "yes" | "no" | "electronic" | "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName || !formData.birth_date || !formData.appointmentDate || !formData.appointmentTime) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .insert([{
          professional_id: professionalId,
          patient_name: formData.patientName,
          birth_date: formData.birth_date,
          appointment_date: format(formData.appointmentDate, 'yyyy-MM-dd'),
          appointment_time: formData.appointmentTime,
          display_status: 'waiting',
          is_minor: formData.isMinor,
          responsible_name: formData.responsibleName,
          has_record: formData.hasRecord || null,
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Agendamento realizado com sucesso!",
      });
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar o agendamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBirthDateChange = (value: string) => {
    setFormData(prev => {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return {
        ...prev,
        birth_date: value,
        isMinor: age < 18
      };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PatientInfoForm
        patientName={formData.patientName}
        birthDate={formData.birth_date}
        phone={formData.phone}
        onPatientNameChange={(value) => setFormData(prev => ({ ...prev, patientName: value }))}
        onBirthDateChange={handleBirthDateChange}
        onPhoneChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
      />

      <AppointmentDateForm
        appointmentDate={formData.appointmentDate}
        appointmentTime={formData.appointmentTime}
        onAppointmentDateSelect={(date) => setFormData(prev => ({ ...prev, appointmentDate: date }))}
        onAppointmentTimeChange={(value) => setFormData(prev => ({ ...prev, appointmentTime: value }))}
        availableSlots={availableSlots}
      />

      <AdditionalInfoForm
        isMinor={formData.isMinor}
        responsibleName={formData.responsibleName}
        hasRecord={formData.hasRecord}
        onResponsibleNameChange={(value) => setFormData(prev => ({ ...prev, responsibleName: value }))}
        onHasRecordChange={(value) => setFormData(prev => ({ ...prev, hasRecord: value }))}
      />

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Agendando..." : "Agendar Consulta"}
      </Button>
    </form>
  );
};
