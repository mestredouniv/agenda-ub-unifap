import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PatientInfoForm } from "@/components/appointments/PatientInfoForm";
import { AppointmentDateForm } from "@/components/appointments/AppointmentDateForm";
import { AdditionalInfoForm } from "@/components/appointments/AdditionalInfoForm";
import { createNewAppointment } from "@/services/appointment";

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
    
    try {
      console.log('[NovoAgendamento] Iniciando submissão do formulário:', formData);

      if (!validateForm()) {
        return;
      }

      setIsLoading(true);
      
      if (!formData.appointmentDate) {
        throw new Error("Data da consulta não selecionada");
      }

      // Formatar a data com tratamento de erro
      let appointmentDate: string;
      try {
        appointmentDate = format(formData.appointmentDate, 'yyyy-MM-dd');
        console.log('[NovoAgendamento] Data formatada:', appointmentDate);
      } catch (error) {
        console.error('[NovoAgendamento] Erro ao formatar data:', error);
        throw new Error("Formato de data inválido. Por favor, selecione a data novamente.");
      }

      // Verificar se o ID do profissional é válido
      if (!professionalId) {
        throw new Error("ID do profissional não encontrado");
      }

      // Criar o agendamento com tratamento de erro
      const appointment = await createNewAppointment({
        professional_id: professionalId,
        patient_name: formData.patientName.trim(),
        birth_date: formData.birth_date,
        appointment_date: appointmentDate,
        appointment_time: `${formData.appointmentTime}:00`,
        display_status: 'waiting',
        priority: 'normal',
        is_minor: formData.isMinor,
        responsible_name: formData.responsibleName.trim() || null,
        has_record: formData.hasRecord || null,
        phone: formData.phone.trim()
      });

      console.log('[NovoAgendamento] Agendamento criado com sucesso:', appointment);
      
      // Mostrar mensagem de sucesso
      toast({
        title: "Sucesso",
        description: "Agendamento realizado com sucesso!",
      });
      
      // Limpar o formulário e chamar o callback de sucesso
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
      
      // Chamar o callback de sucesso de forma segura
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (error) {
      console.error('[NovoAgendamento] Erro ao criar agendamento:', error);
      
      // Mostrar mensagem de erro amigável
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

  // Manipuladores de eventos com tratamento de erro
  const handlePatientNameChange = (value: string) => {
    try {
      console.log('[NovoAgendamento] Atualizando nome do paciente:', value);
      setFormData(prev => ({ ...prev, patientName: value }));
    } catch (error) {
      console.error('[NovoAgendamento] Erro ao atualizar nome do paciente:', error);
    }
  };

  const handleBirthDateChange = (value: string) => {
    try {
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
    } catch (error) {
      console.error('[NovoAgendamento] Erro ao atualizar data de nascimento:', error);
    }
  };

  const handlePhoneChange = (value: string) => {
    try {
      console.log('[NovoAgendamento] Atualizando telefone:', value);
      setFormData(prev => ({ ...prev, phone: value }));
    } catch (error) {
      console.error('[NovoAgendamento] Erro ao atualizar telefone:', error);
    }
  };

  const handleAppointmentDateSelect = (date: Date | undefined) => {
    try {
      console.log('[NovoAgendamento] Selecionando data:', date);
      setFormData(prev => ({ ...prev, appointmentDate: date, appointmentTime: "" }));
    } catch (error) {
      console.error('[NovoAgendamento] Erro ao selecionar data:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao selecionar a data. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleAppointmentTimeChange = (value: string) => {
    try {
      console.log('[NovoAgendamento] Selecionando horário:', value);
      setFormData(prev => ({ ...prev, appointmentTime: value }));
    } catch (error) {
      console.error('[NovoAgendamento] Erro ao selecionar horário:', error);
    }
  };

  const handleResponsibleNameChange = (value: string) => {
    try {
      console.log('[NovoAgendamento] Atualizando responsável:', value);
      setFormData(prev => ({ ...prev, responsibleName: value }));
    } catch (error) {
      console.error('[NovoAgendamento] Erro ao atualizar responsável:', error);
    }
  };

  const handleHasRecordChange = (value: "yes" | "no" | "electronic" | "") => {
    try {
      console.log('[NovoAgendamento] Atualizando info de prontuário:', value);
      setFormData(prev => ({ ...prev, hasRecord: value }));
    } catch (error) {
      console.error('[NovoAgendamento] Erro ao atualizar info de prontuário:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PatientInfoForm
        patientName={formData.patientName}
        birthDate={formData.birth_date}
        phone={formData.phone}
        onPatientNameChange={handlePatientNameChange}
        onBirthDateChange={handleBirthDateChange}
        onPhoneChange={handlePhoneChange}
      />

      <AppointmentDateForm
        professionalId={professionalId}
        appointmentDate={formData.appointmentDate}
        appointmentTime={formData.appointmentTime}
        onAppointmentDateSelect={handleAppointmentDateSelect}
        onAppointmentTimeChange={handleAppointmentTimeChange}
      />

      <AdditionalInfoForm
        isMinor={formData.isMinor}
        responsibleName={formData.responsibleName}
        hasRecord={formData.hasRecord}
        onResponsibleNameChange={handleResponsibleNameChange}
        onHasRecordChange={handleHasRecordChange}
      />

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Agendando..." : "Agendar Consulta"}
      </Button>
    </form>
  );
};