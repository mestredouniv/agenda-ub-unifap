
import { Button } from "@/components/ui/button";
import { Appointment } from "@/types/appointment";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useDisplayState } from "@/hooks/useDisplayState";

interface AppointmentActionsProps {
  appointment: Appointment;
  onSuccess?: () => void;
}

export const AppointmentActions = ({ appointment, onSuccess }: AppointmentActionsProps) => {
  const { toast } = useToast();
  const setCurrentPatient = useDisplayState((state) => state.setCurrentPatient);

  const handleCallNext = async () => {
    try {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ 
          display_status: 'waiting',
          actual_start_time: new Date().toLocaleTimeString()
        })
        .eq('id', appointment.id);

      if (updateError) throw updateError;

      const { error: lastCallError } = await supabase
        .from('last_calls')
        .insert([{
          patient_name: appointment.patient_name,
          professional_name: appointment.professional.name,
          status: 'called'
        }]);

      if (lastCallError) throw lastCallError;

      setCurrentPatient({
        name: appointment.patient_name,
        status: 'waiting',
        professional: appointment.professional.name,
      });

      toast({
        title: "Paciente chamado",
        description: "O display foi atualizado com o próximo paciente.",
      });

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao chamar próximo paciente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível chamar o próximo paciente.",
        variant: "destructive",
      });
    }
  };

  const handleStartTriage = async () => {
    try {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ 
          display_status: 'triage',
          actual_start_time: new Date().toLocaleTimeString()
        })
        .eq('id', appointment.id);

      if (updateError) throw updateError;

      const { error: lastCallError } = await supabase
        .from('last_calls')
        .insert([{
          patient_name: appointment.patient_name,
          professional_name: appointment.professional.name,
          status: 'triage'
        }]);

      if (lastCallError) throw lastCallError;

      setCurrentPatient({
        name: appointment.patient_name,
        status: 'triage',
        professional: appointment.professional.name,
      });

      toast({
        title: "Triagem iniciada",
        description: "Paciente encaminhado para triagem.",
      });

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao iniciar triagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a triagem.",
        variant: "destructive",
      });
    }
  };

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
          professional_name: appointment.professional.name,
          status: 'in_progress'
        }]);

      if (lastCallError) throw lastCallError;

      setCurrentPatient({
        name: appointment.patient_name,
        status: 'in_progress',
        professional: appointment.professional.name,
      });

      toast({
        title: "Consulta iniciada",
        description: "Paciente em atendimento.",
      });

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao iniciar consulta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a consulta.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteAppointment = async () => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          display_status: 'completed',
          actual_end_time: new Date().toLocaleTimeString()
        })
        .eq('id', appointment.id);

      if (error) throw error;

      toast({
        title: "Consulta finalizada",
        description: "O atendimento foi concluído com sucesso.",
      });

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao finalizar consulta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível finalizar a consulta.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex space-x-2">
      <Button
        size="sm"
        onClick={handleCallNext}
        disabled={appointment.display_status !== 'waiting'}
      >
        Chamar
      </Button>
      <Button
        size="sm"
        onClick={handleStartTriage}
        disabled={appointment.display_status !== 'waiting'}
      >
        Triagem
      </Button>
      <Button
        size="sm"
        onClick={handleStartAppointment}
        disabled={appointment.display_status !== 'triage'}
      >
        Iniciar
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleCompleteAppointment}
        disabled={appointment.display_status !== 'in_progress'}
      >
        Finalizar
      </Button>
    </div>
  );
};
