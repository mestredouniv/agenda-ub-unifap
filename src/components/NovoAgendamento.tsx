
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PatientInfoForm } from "@/components/appointments/PatientInfoForm";
import { AppointmentDateForm } from "@/components/appointments/AppointmentDateForm";
import { AdditionalInfoForm } from "@/components/appointments/AdditionalInfoForm";

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
    if (!formData.patientName || !formData.birth_date || !formData.appointmentDate || !formData.appointmentTime) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return false;
    }
    if (formData.isMinor && !formData.responsibleName) {
      toast({
        title: "Responsável necessário",
        description: "Para pacientes menores de idade, informe o nome do responsável.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[NovoAgendamento] Iniciando submissão do formulário:', formData);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const checkDate = format(formData.appointmentDate, 'yyyy-MM-dd');
      console.log('[NovoAgendamento] Data formatada:', checkDate);

      // Verificar disponibilidade do dia
      const { data: unavailableDay, error: unavailableError } = await supabase
        .from('professional_unavailable_days')
        .select('date')
        .eq('professional_id', professionalId)
        .eq('date', checkDate)
        .maybeSingle();

      if (unavailableError) {
        console.error('[NovoAgendamento] Erro ao verificar disponibilidade:', unavailableError);
        throw unavailableError;
      }

      if (unavailableDay) {
        console.log('[NovoAgendamento] Dia indisponível:', checkDate);
        toast({
          title: "Data indisponível",
          description: "O profissional não está disponível nesta data.",
          variant: "destructive",
        });
        return;
      }

      // Verificar disponibilidade do horário
      const timeSlot = `${formData.appointmentTime}:00`;
      console.log('[NovoAgendamento] Verificando horário:', timeSlot);

      const { data: slotConfig, error: slotError } = await supabase
        .from('professional_available_slots')
        .select('max_appointments')
        .eq('professional_id', professionalId)
        .eq('time_slot', timeSlot)
        .maybeSingle();

      if (slotError) {
        console.error('[NovoAgendamento] Erro ao verificar configuração do slot:', slotError);
        throw slotError;
      }

      if (!slotConfig) {
        console.log('[NovoAgendamento] Horário não configurado');
        toast({
          title: "Horário inválido",
          description: "Este horário não está configurado para atendimento.",
          variant: "destructive",
        });
        return;
      }

      const { data: existingAppointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id')
        .eq('professional_id', professionalId)
        .eq('appointment_date', checkDate)
        .eq('appointment_time', timeSlot)
        .is('deleted_at', null);

      if (appointmentsError) {
        console.error('[NovoAgendamento] Erro ao verificar agendamentos existentes:', appointmentsError);
        throw appointmentsError;
      }

      if (existingAppointments && existingAppointments.length >= slotConfig.max_appointments) {
        console.log('[NovoAgendamento] Horário lotado:', {
          atual: existingAppointments.length,
          maximo: slotConfig.max_appointments
        });
        toast({
          title: "Horário indisponível",
          description: "Este horário já está totalmente ocupado.",
          variant: "destructive",
        });
        return;
      }

      // Criar o agendamento
      console.log('[NovoAgendamento] Criando agendamento');
      const { error: insertError } = await supabase
        .from('appointments')
        .insert([{
          professional_id: professionalId,
          patient_name: formData.patientName,
          birth_date: formData.birth_date,
          appointment_date: checkDate,
          appointment_time: timeSlot,
          display_status: 'waiting',
          is_minor: formData.isMinor,
          responsible_name: formData.responsibleName,
          has_record: formData.hasRecord || null,
          phone: formData.phone || null,
        }]);

      if (insertError) {
        console.error('[NovoAgendamento] Erro ao criar agendamento:', insertError);
        throw insertError;
      }

      console.log('[NovoAgendamento] Agendamento criado com sucesso');
      toast({
        title: "Sucesso",
        description: "Agendamento realizado com sucesso!",
      });
      onSuccess();
    } catch (error) {
      console.error('[NovoAgendamento] Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar o agendamento. Tente novamente.",
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
