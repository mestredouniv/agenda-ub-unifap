
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PatientInfoForm } from "@/components/appointments/PatientInfoForm";
import { AppointmentDateForm } from "@/components/appointments/AppointmentDateForm";
import { AdditionalInfoForm } from "@/components/appointments/AdditionalInfoForm";
import { criarAgendamento } from "@/services/agendamentoSimples";

interface NovoAgendamentoProps {
  professionalId: string;
  onSuccess: () => void;
}

export const NovoAgendamento = ({ professionalId, onSuccess }: NovoAgendamentoProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
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

  const validateForm = () => {
    console.log('[NovoAgendamento] Validando formulário:', formData);

    const errors: string[] = [];

    if (!formData.patientName?.trim()) {
      errors.push("Nome do paciente é obrigatório");
    }
    if (!formData.birth_date) {
      errors.push("Data de nascimento é obrigatória");
    }
    if (!formData.appointmentDate) {
      errors.push("Data da consulta é obrigatória");
    }
    if (!formData.appointmentTime) {
      errors.push("Horário da consulta é obrigatório");
    }
    if (!formData.phone?.trim()) {
      errors.push("Telefone é obrigatório");
    }
    if (formData.isMinor && !formData.responsibleName?.trim()) {
      errors.push("Nome do responsável é obrigatório para pacientes menores de idade");
    }

    if (errors.length > 0) {
      console.log('[NovoAgendamento] Erros de validação:', errors);
      toast({
        title: "Campos obrigatórios",
        description: errors.join(", "),
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[NovoAgendamento] Iniciando submissão do formulário:', formData);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      if (!formData.appointmentDate) {
        throw new Error("Data da consulta não selecionada");
      }

      const appointmentDate = format(formData.appointmentDate, 'yyyy-MM-dd');
      console.log('[NovoAgendamento] Data formatada:', appointmentDate);
      console.log('[NovoAgendamento] Horário selecionado:', formData.appointmentTime);

      // Usando o novo serviço simplificado
      const agendamento = await criarAgendamento({
        professional_id: professionalId,
        patient_name: formData.patientName,
        birth_date: formData.birth_date,
        appointment_date: appointmentDate,
        appointment_time: formData.appointmentTime,
        phone: formData.phone,
        is_minor: formData.isMinor,
        responsible_name: formData.isMinor ? formData.responsibleName : null,
        has_record: formData.hasRecord || null
      });

      console.log('[NovoAgendamento] Agendamento criado com sucesso:', agendamento);
      toast({
        title: "Sucesso",
        description: "Agendamento realizado com sucesso!",
      });
      
      // Limpar formulário
      setFormData({
        patientName: "",
        birth_date: "",
        appointmentDate: undefined,
        appointmentTime: "",
        phone: "",
        isMinor: false,
        responsibleName: "",
        hasRecord: "",
      });
      
      onSuccess();
    } catch (error) {
      console.error('[NovoAgendamento] Erro ao criar agendamento:', error);
      toast({
        title: "Erro",
        description: error instanceof Error 
          ? error.message 
          : "Não foi possível realizar o agendamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PatientInfoForm
        patientName={formData.patientName}
        birthDate={formData.birth_date}
        phone={formData.phone}
        onPatientNameChange={(value) => {
          console.log('[NovoAgendamento] Atualizando nome do paciente:', value);
          setFormData(prev => ({ ...prev, patientName: value }));
        }}
        onBirthDateChange={(value) => {
          console.log('[NovoAgendamento] Atualizando data de nascimento:', value);
          const birthDate = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          setFormData(prev => ({
            ...prev,
            birth_date: value,
            isMinor: age < 18
          }));
        }}
        onPhoneChange={(value) => {
          console.log('[NovoAgendamento] Atualizando telefone:', value);
          setFormData(prev => ({ ...prev, phone: value }));
        }}
      />

      <AppointmentDateForm
        professionalId={professionalId}
        appointmentDate={formData.appointmentDate}
        appointmentTime={formData.appointmentTime}
        onAppointmentDateSelect={(date) => {
          console.log('[NovoAgendamento] Selecionando data:', date);
          setFormData(prev => ({ ...prev, appointmentDate: date, appointmentTime: "" }));
        }}
        onAppointmentTimeChange={(value) => {
          console.log('[NovoAgendamento] Selecionando horário:', value);
          setFormData(prev => ({ ...prev, appointmentTime: value }));
        }}
      />

      <AdditionalInfoForm
        isMinor={formData.isMinor}
        responsibleName={formData.responsibleName}
        hasRecord={formData.hasRecord}
        onResponsibleNameChange={(value) => {
          console.log('[NovoAgendamento] Atualizando responsável:', value);
          setFormData(prev => ({ ...prev, responsibleName: value }));
        }}
        onHasRecordChange={(value) => {
          console.log('[NovoAgendamento] Atualizando info de prontuário:', value);
          setFormData(prev => ({ ...prev, hasRecord: value }));
        }}
      />

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Agendando..." : "Agendar Consulta"}
      </Button>
    </form>
  );
};
