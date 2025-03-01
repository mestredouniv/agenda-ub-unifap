
import { useAppointmentForm } from "@/hooks/useAppointmentForm";
import { PatientInfoForm } from "@/components/appointments/PatientInfoForm";
import { AppointmentDateForm } from "@/components/appointments/AppointmentDateForm";
import { AdditionalInfoForm } from "@/components/appointments/AdditionalInfoForm";
import { AppointmentSubmitButton } from "@/components/appointments/AppointmentSubmitButton";

interface NovoAgendamentoProps {
  professionalId: string;
  onSuccess: () => void;
}

export const NovoAgendamento = ({ professionalId, onSuccess }: NovoAgendamentoProps) => {
  const { 
    formData, 
    isLoading, 
    updateFormData, 
    handleSubmit 
  } = useAppointmentForm({ professionalId, onSuccess });

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <AppointmentSubmitButton isLoading={isLoading} />
    </form>
  );
};
