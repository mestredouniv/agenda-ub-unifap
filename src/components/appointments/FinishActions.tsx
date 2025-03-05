
import { Button } from "@/components/ui/button";
import { Appointment } from "@/types/appointment";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, UserX } from "lucide-react";

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
    <div className="flex gap-2">
      <Button 
        size="sm" 
        className="bg-[#ea384c] hover:bg-red-700 text-white"
        onClick={() => handleCompleteAppointment('completed')}
      >
        <Clock className="mr-2 h-4 w-4" />
        Finalizar Consulta
      </Button>
      
      <Button 
        size="sm" 
        variant="outline"
        className="border-amber-500 text-amber-500 hover:bg-amber-100 hover:text-amber-600"
        onClick={() => handleCompleteAppointment('missed')}
      >
        <UserX className="mr-2 h-4 w-4" />
        Paciente Faltou
      </Button>
      
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => handleCompleteAppointment('rescheduled')}
      >
        <Calendar className="mr-2 h-4 w-4" />
        Reagendar
      </Button>
    </div>
  );
};
