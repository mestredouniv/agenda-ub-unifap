
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { criarAgendamento } from "@/services/agendamentoSimples";

export type AppointmentFormData = {
  patientName: string;
  birth_date: string;
  appointmentDate: Date | undefined;
  appointmentTime: string;
  phone: string;
  isMinor: boolean;
  responsibleName: string;
  hasRecord: "yes" | "no" | "electronic" | "";
};

interface UseAppointmentFormProps {
  professionalId: string;
  onSuccess: () => void;
}

export const useAppointmentForm = ({ professionalId, onSuccess }: UseAppointmentFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientName: "",
    birth_date: "",
    appointmentDate: undefined,
    appointmentTime: "",
    phone: "",
    isMinor: false,
    responsibleName: "",
    hasRecord: "",
  });

  // Verificar se o ID do profissional é válido
  useEffect(() => {
    if (professionalId === ':professionalId' || !professionalId) {
      console.error('[useAppointmentForm] ID do profissional inválido:', professionalId);
    }
  }, [professionalId]);

  const resetForm = () => {
    console.log('[useAppointmentForm] Resetting form');
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
  };

  const validateForm = () => {
    console.log('[useAppointmentForm] Validando formulário:', formData);

    const errors: string[] = [];

    // Validar ID do profissional
    if (!professionalId || professionalId === ':professionalId') {
      errors.push("ID do profissional inválido");
    }

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
      console.log('[useAppointmentForm] Erros de validação:', errors);
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
    console.log('[useAppointmentForm] Iniciando submissão do formulário:', formData);
    console.log('[useAppointmentForm] Professional ID:', professionalId);

    if (!validateForm()) {
      return;
    }

    if (!professionalId || professionalId === ':professionalId') {
      toast({
        title: "Erro no agendamento",
        description: "ID do profissional inválido. Por favor, navegue para a página do profissional correto.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      if (!formData.appointmentDate) {
        throw new Error("Data da consulta não selecionada");
      }

      const appointmentDate = format(formData.appointmentDate, 'yyyy-MM-dd');
      console.log('[useAppointmentForm] Data formatada:', appointmentDate);
      console.log('[useAppointmentForm] Horário selecionado:', formData.appointmentTime);

      const result = await criarAgendamento({
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

      console.log('[useAppointmentForm] Agendamento criado com sucesso:', result);
      
      toast({
        title: "Sucesso!",
        description: "Agendamento realizado com sucesso!",
      });
      
      resetForm();
      onSuccess();
      
    } catch (error) {
      console.error('[useAppointmentForm] Erro ao criar agendamento:', error);
      
      // Mensagem de erro mais específica
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Não foi possível realizar o agendamento. Tente novamente.";
        
      toast({
        title: "Erro no agendamento",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof AppointmentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    isLoading,
    updateFormData,
    handleSubmit,
    resetForm
  };
};
