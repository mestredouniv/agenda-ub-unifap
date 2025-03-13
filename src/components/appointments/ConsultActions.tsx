
import { Button } from "@/components/ui/button";
import { Appointment } from "@/types/appointment";
import { useToast } from "@/components/ui/use-toast";
import { useDisplayState } from "@/hooks/useDisplayState";
import { supabase } from "@/integrations/supabase/client";
import { getConsultButtonStyle, getConsultButtonText } from "@/utils/appointmentUtils";

interface ConsultActionsProps {
  appointment: Appointment;
  onUpdateRequired?: () => void;
}

export const ConsultActions = ({ appointment, onUpdateRequired }: ConsultActionsProps) => {
  const { toast } = useToast();
  const setCurrentPatient = useDisplayState((state) => state.setCurrentPatient);

  const handleConsultAction = async () => {
    try {
      // Check if we're starting or finishing a consultation
      const isStartingConsult = appointment.display_status === 'triage';
      
      const updateData: Partial<Appointment> = {
        display_status: isStartingConsult ? 'in_progress' : 'completed',
        actual_end_time: !isStartingConsult ? new Date().toLocaleTimeString() : null
      };

      const { error: updateError } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointment.id);

      if (updateError) throw updateError;

      if (isStartingConsult) {
        const { error: lastCallError } = await supabase
          .from('last_calls')
          .insert([{
            patient_name: appointment.patient_name,
            professional_name: appointment.professionals?.name,
            status: 'in_progress'
          }]);

        if (lastCallError) throw lastCallError;

        setCurrentPatient({
          name: appointment.patient_name,
          status: 'in_progress',
          professional: appointment.professionals?.name || '',
        });
      }

      toast({
        title: isStartingConsult ? "Paciente chamado" : "Consulta finalizada",
        description: isStartingConsult 
          ? "O paciente foi chamado para consulta."
          : "A consulta foi finalizada com sucesso.",
      });

      onUpdateRequired?.();
    } catch (error) {
      console.error('Erro ao gerenciar consulta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da consulta.",
        variant: "destructive",
      });
    }
  };

  // Determine if the button should be disabled
  const isButtonDisabled = 
    appointment.display_status === 'waiting' || // Waiting for triage
    appointment.display_status === 'completed' || // Already completed
    appointment.display_status === 'missed' || // Patient missed appointment
    appointment.display_status === 'rescheduled'; // Appointment rescheduled

  const buttonStyle = getConsultButtonStyle(appointment.display_status);
  const buttonText = getConsultButtonText(appointment.display_status);

  return (
    <Button
      size="sm"
      className={`text-white ${buttonStyle}`}
      onClick={handleConsultAction}
      disabled={isButtonDisabled}
    >
      {buttonText}
    </Button>
  );
};
