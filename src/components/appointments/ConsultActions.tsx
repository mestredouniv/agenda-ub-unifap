
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

  const handleStartAppointment = async () => {
    try {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ 
          display_status: 'in_progress',
          actual_start_time: new Date().toLocaleTimeString()
        })
        .eq('id', appointment.id);

      if (updateError) throw updateError;

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

      toast({
        title: "Consulta iniciada",
        description: "Paciente em atendimento.",
      });

      onUpdateRequired?.();
    } catch (error) {
      console.error('Erro ao iniciar consulta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a consulta.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      size="sm"
      className={`text-white ${getConsultButtonStyle(appointment.display_status)}`}
      onClick={handleStartAppointment}
      disabled={appointment.display_status !== 'waiting'}
    >
      {getConsultButtonText(appointment.display_status)}
    </Button>
  );
};
