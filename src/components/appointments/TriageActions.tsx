
import { Button } from "@/components/ui/button";
import { Appointment } from "@/types/appointment";
import { useToast } from "@/components/ui/use-toast";
import { useDisplayState } from "@/hooks/useDisplayState";
import { supabase } from "@/integrations/supabase/client";
import { generateTicketNumber, getTriageButtonStyle, getTriageButtonText } from "@/utils/appointmentUtils";

interface TriageActionsProps {
  appointment: Appointment;
  room: string;
  block: string;
  onUpdateRequired?: () => void;
}

export const TriageActions = ({ appointment, room, block, onUpdateRequired }: TriageActionsProps) => {
  const { toast } = useToast();
  const setCurrentPatient = useDisplayState((state) => state.setCurrentPatient);

  const handleTriageAction = async () => {
    try {
      if (appointment.display_status === 'triage') {
        // Finalizar triagem
        const { error: updateError } = await supabase
          .from('appointments')
          .update({ 
            display_status: 'waiting',
            actual_start_time: null
          })
          .eq('id', appointment.id);

        if (updateError) throw updateError;

        toast({
          title: "Triagem finalizada",
          description: "O paciente está pronto para a consulta.",
        });
      } else {
        // Iniciar triagem
        if (!room || !block) {
          toast({
            title: "Campos obrigatórios",
            description: "Por favor, preencha a sala e o bloco antes de iniciar a triagem.",
            variant: "destructive",
          });
          return;
        }

        const ticketNumber = generateTicketNumber();
        const updateData: Partial<Appointment> = {
          display_status: 'triage',
          actual_start_time: new Date().toLocaleTimeString(),
          ticket_number: ticketNumber,
          room,
          block
        };

        const { error: updateError } = await supabase
          .from('appointments')
          .update(updateData)
          .eq('id', appointment.id);

        if (updateError) throw updateError;

        const { error: lastCallError } = await supabase
          .from('last_calls')
          .insert([{
            patient_name: appointment.patient_name,
            professional_name: appointment.professionals?.name,
            status: 'triage'
          }]);

        if (lastCallError) throw lastCallError;

        setCurrentPatient({
          name: appointment.patient_name,
          status: 'triage',
          professional: appointment.professionals?.name || '',
        });

        toast({
          title: "Triagem iniciada",
          description: `Paciente encaminhado para triagem. Senha: ${ticketNumber}`,
        });
      }

      onUpdateRequired?.();
    } catch (error) {
      console.error('Erro ao gerenciar triagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar a operação.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      size="sm"
      className={`text-white ${getTriageButtonStyle(appointment.display_status)}`}
      onClick={handleTriageAction}
      disabled={appointment.display_status === 'in_progress' || 
               appointment.display_status === 'completed' || 
               appointment.display_status === 'missed' || 
               appointment.display_status === 'rescheduled'}
    >
      {getTriageButtonText(appointment.display_status)}
    </Button>
  );
};
