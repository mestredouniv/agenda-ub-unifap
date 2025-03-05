
import { useAppointmentForm } from "@/hooks/useAppointmentForm";
import { PatientInfoForm } from "@/components/appointments/PatientInfoForm";
import { AppointmentDateForm } from "@/components/appointments/AppointmentDateForm";
import { AdditionalInfoForm } from "@/components/appointments/AdditionalInfoForm";
import { AppointmentSubmitButton } from "@/components/appointments/AppointmentSubmitButton";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface NovoAgendamentoProps {
  professionalId: string;
  onSuccess: () => void;
}

export const NovoAgendamento = ({ professionalId, onSuccess }: NovoAgendamentoProps) => {
  const { toast } = useToast();
  
  // Validar ID do profissional
  useEffect(() => {
    if (!professionalId || professionalId === ':professionalId') {
      toast({
        title: "Erro",
        description: "ID do profissional inválido. Navegue para a página correta.",
        variant: "destructive",
      });
    }
  }, [professionalId, toast]);
  
  const { 
    formData, 
    isLoading, 
    updateFormData, 
    handleSubmit 
  } = useAppointmentForm({ 
    professionalId: professionalId, 
    onSuccess 
  });

  useEffect(() => {
    // Log para debug do ID do profissional
    console.log('[NovoAgendamento] Rendering with professionalId:', professionalId);
  }, [professionalId]);

  const handlePatientNameChange = (value: string) => {
    console.log('[NovoAgendamento] Atualizando nome do paciente:', value);
    updateFormData('patientName', value);
  };

  const handleBirthDateChange = (value: string) => {
    console.log('[NovoAgendamento] Atualizando data de nascimento:', value);
    const birthDate = new Date(value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    updateFormData('birth_date', value);
    updateFormData('isMinor', age < 18);
  };

  // Verificar se o ID do profissional é válido
  const isValidId = professionalId && professionalId !== ':professionalId';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!isValidId && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          ID do profissional inválido. Por favor, selecione um profissional válido.
        </div>
      )}
      
      <PatientInfoForm
        patientName={formData.patientName}
        birthDate={formData.birth_date}
        phone={formData.phone}
        onPatientNameChange={handlePatientNameChange}
        onBirthDateChange={handleBirthDateChange}
        onPhoneChange={(value) => {
          console.log('[NovoAgendamento] Atualizando telefone:', value);
          updateFormData('phone', value);
        }}
      />

      <AppointmentDateForm
        professionalId={professionalId}
        appointmentDate={formData.appointmentDate}
        appointmentTime={formData.appointmentTime}
        onAppointmentDateSelect={(date) => {
          console.log('[NovoAgendamento] Selecionando data:', date);
          updateFormData('appointmentDate', date);
          updateFormData('appointmentTime', "");
        }}
        onAppointmentTimeChange={(value) => {
          console.log('[NovoAgendamento] Selecionando horário:', value);
          updateFormData('appointmentTime', value);
        }}
      />

      <AdditionalInfoForm
        isMinor={formData.isMinor}
        responsibleName={formData.responsibleName}
        hasRecord={formData.hasRecord}
        onResponsibleNameChange={(value) => {
          console.log('[NovoAgendamento] Atualizando responsável:', value);
          updateFormData('responsibleName', value);
        }}
        onHasRecordChange={(value) => {
          console.log('[NovoAgendamento] Atualizando info de prontuário:', value);
          updateFormData('hasRecord', value);
        }}
      />

      <AppointmentSubmitButton isLoading={isLoading} disabled={!isValidId} />
    </form>
  );
};
