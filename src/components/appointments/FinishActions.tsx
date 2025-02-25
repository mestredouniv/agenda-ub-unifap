
import { Button } from "@/components/ui/button";
import { Appointment } from "@/types/appointment";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FinishActionsProps {
  appointment: Appointment;
  onUpdateRequired?: () => void;
}

export const FinishActions = ({ appointment, onUpdateRequired }: FinishActionsProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCompleteAppointment = async (status: 'completed' | 'missed' | 'rescheduled') => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          display_status: status,
          actual_end_time: new Date().toLocaleTimeString()
        })
        .eq('id', appointment.id);

      if (error) throw error;

      const messages = {
        completed: "Consulta finalizada com sucesso.",
        missed: "Paciente marcado como falta.",
        rescheduled: "Consulta marcada para reagendamento."
      };

      toast({
        title: "Status atualizado",
        description: messages[status],
      });

      if (status === 'rescheduled') {
        navigate(`/agendamento/${appointment.professional_id}`);
      }

      onUpdateRequired?.();
    } catch (error) {
      console.error('Erro ao finalizar consulta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  };

  if (appointment.display_status !== 'in_progress') {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          Finalizar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleCompleteAppointment('completed')}>
          <Clock className="mr-2 h-4 w-4" />
          Consulta finalizada
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCompleteAppointment('missed')}>
          <Clock className="mr-2 h-4 w-4" />
          Paciente faltou
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCompleteAppointment('rescheduled')}>
          <Calendar className="mr-2 h-4 w-4" />
          Reagendar consulta
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
