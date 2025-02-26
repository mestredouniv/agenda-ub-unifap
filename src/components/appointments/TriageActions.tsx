
import { Button } from "@/components/ui/button";
import { Appointment } from "@/types/appointment";
import { useToast } from "@/components/ui/use-toast";
import { useDisplayState } from "@/hooks/useDisplayState";
import { supabase } from "@/integrations/supabase/client";
import { getTriageButtonStyle, getTriageButtonText } from "@/utils/appointmentUtils";

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
      const isStartingTriage = appointment.display_status === 'waiting';
      
      if (isStartingTriage && (!room || !block)) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha a sala e o bloco antes de iniciar a triagem.",
          variant: "destructive",
        });
        return;
      }

      console.log('[Triagem] Iniciando atualização:', {
        id: appointment.id,
        isStartingTriage,
        room,
        block
      });

      const updateData: Partial<Appointment> = {
        display_status: isStartingTriage ? 'triage' : 'waiting',
        room: isStartingTriage ? room : null,
        block: isStartingTriage ? block : null,
        actual_start_time: isStartingTriage ? new Date().toLocaleTimeString() : null,
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointment.id);

      if (updateError) throw updateError;

      console.log('[Triagem] Appointment atualizado com sucesso');

      if (isStartingTriage) {
        const { error: lastCallError } = await supabase
          .from('last_calls')
          .insert([{
            patient_name: appointment.patient_name,
            professional_name: appointment.professionals?.name,
            status: 'triage'
          }]);

        if (lastCallError) throw lastCallError;

        console.log('[Triagem] Last call registrado com sucesso');

        setCurrentPatient({
          name: appointment.patient_name,
          status: 'triage',
          professional: appointment.professionals?.name || '',
        });
      }

      toast({
        title: isStartingTriage ? "Triagem iniciada" : "Triagem finalizada",
        description: isStartingTriage 
          ? "O paciente foi encaminhado para triagem."
          : "O paciente está pronto para consulta.",
      });

      if (onUpdateRequired) {
        console.log('[Triagem] Solicitando atualização da lista');
        onUpdateRequired();
      }
    } catch (error) {
      console.error('[Triagem] Erro ao gerenciar triagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da triagem.",
        variant: "destructive",
      });
    }
  };

  const isDisabled = appointment.display_status === 'in_progress' || 
                     appointment.display_status === 'completed' ||
                     appointment.display_status === 'missed' ||
                     appointment.display_status === 'rescheduled';

  const buttonStyle = getTriageButtonStyle(appointment.display_status);
  const buttonText = getTriageButtonText(appointment.display_status);

  return (
    <Button
      size="sm"
      className={`text-white ${buttonStyle}`}
      onClick={handleTriageAction}
      disabled={isDisabled}
    >
      {buttonText}
    </Button>
  );
};
