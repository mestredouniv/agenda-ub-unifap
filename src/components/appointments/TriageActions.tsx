
import { Button } from "@/components/ui/button";
import { Appointment } from "@/types/appointment";
import { useToast } from "@/components/ui/use-toast";
import { useDisplayState } from "@/hooks/useDisplayState";
import { supabase } from "@/integrations/supabase/client";
import { getTriageButtonStyle, getTriageButtonText, generateTicketNumber } from "@/utils/appointmentUtils";
import { format } from "date-fns";

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

      // If starting triage, check if we should reuse room/block for this professional today
      let roomToUse = room;
      let blockToUse = block;
      
      if (isStartingTriage) {
        // Try to find any appointment from the same professional and date that already has room/block
        const today = format(new Date(), 'yyyy-MM-dd');
        
        const { data: existingAppointments } = await supabase
          .from('appointments')
          .select('room, block')
          .eq('professional_id', appointment.professional_id)
          .eq('appointment_date', today)
          .not('room', 'is', null)
          .not('block', 'is', null)
          .limit(1);
          
        if (existingAppointments && existingAppointments.length > 0) {
          // Reuse the existing room and block for this professional
          roomToUse = existingAppointments[0].room || room;
          blockToUse = existingAppointments[0].block || block;
        }
      }

      const updateData: Partial<Appointment> = {
        display_status: isStartingTriage ? 'triage' : 'waiting',
        room: isStartingTriage ? roomToUse : null,
        block: isStartingTriage ? blockToUse : null,
        actual_start_time: isStartingTriage ? new Date().toLocaleTimeString() : null
      };

      // Generate ticket number when starting triage
      if (isStartingTriage) {
        updateData.ticket_number = generateTicketNumber();
      }

      const { error: updateError } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointment.id);

      if (updateError) throw updateError;

      if (isStartingTriage) {
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
      }

      toast({
        title: isStartingTriage ? "Triagem iniciada" : "Triagem finalizada",
        description: isStartingTriage 
          ? `O paciente foi encaminhado para triagem. Senha: ${updateData.ticket_number}`
          : "O paciente está pronto para consulta.",
      });

      // Critical change: When finishing triage, set to triage completed state
      if (!isStartingTriage) {
        // Update status to indicate triage is complete but consultation hasn't started
        const { error } = await supabase
          .from('appointments')
          .update({ display_status: 'triage' })
          .eq('id', appointment.id);
          
        if (error) throw error;
      }

      onUpdateRequired?.();
    } catch (error) {
      console.error('Erro ao gerenciar triagem:', error);
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
