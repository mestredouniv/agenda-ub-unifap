import { Button } from "@/components/ui/button";
import { Appointment } from "@/types/appointment";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useDisplayState } from "@/hooks/useDisplayState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Calendar, Clock, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { LocationInputs } from "./LocationInputs";
import { DeleteAppointmentDialog } from "./DeleteAppointmentDialog";
import {
  generateTicketNumber,
  getTriageButtonStyle,
  getTriageButtonText,
  getConsultButtonStyle,
} from "@/utils/appointmentUtils";

interface AppointmentActionsProps {
  appointment: Appointment;
  onSuccess?: () => void;
}

export const AppointmentActions = ({ appointment, onSuccess }: AppointmentActionsProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const setCurrentPatient = useDisplayState((state) => state.setCurrentPatient);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [room, setRoom] = useState(appointment.room || '');
  const [block, setBlock] = useState(appointment.block || '');

  const updateRoomAndBlock = async () => {
    if (!room || !block) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha a sala e o bloco antes de iniciar a triagem.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const updateData: Partial<Appointment> = {
        room,
        block
      };

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('professional_id', appointment.professional_id)
        .eq('appointment_date', appointment.appointment_date);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar sala/bloco:', error);
      return false;
    }
  };

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
        const updated = await updateRoomAndBlock();
        if (!updated) return;

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
            professional_name: appointment.professionals.name,
            status: 'triage'
          }]);

        if (lastCallError) throw lastCallError;

        setCurrentPatient({
          name: appointment.patient_name,
          status: 'triage',
          professional: appointment.professionals.name,
        });

        toast({
          title: "Triagem iniciada",
          description: `Paciente encaminhado para triagem. Senha: ${ticketNumber}`,
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao gerenciar triagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar a operação.",
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
          professional_name: appointment.professionals.name,
          status: 'in_progress'
        }]);

      if (lastCallError) throw lastCallError;

      setCurrentPatient({
        name: appointment.patient_name,
        status: 'in_progress',
        professional: appointment.professionals.name,
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

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao finalizar consulta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAppointment = async () => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointment.id);

      if (error) throw error;

      toast({
        title: "Agendamento removido",
        description: "O agendamento foi removido com sucesso.",
      });

      onSuccess?.();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Erro ao remover agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o agendamento.",
        variant: "destructive",
      });
    }
  };

  const isAppointmentFinished = appointment.display_status === 'completed' || 
                               appointment.display_status === 'missed' ||
                               appointment.display_status === 'rescheduled';

  const showLocationInputs = !isAppointmentFinished && appointment.display_status === 'waiting';

  return (
    <div className="space-y-4">
      {showLocationInputs && (
        <LocationInputs
          room={room}
          block={block}
          onRoomChange={setRoom}
          onBlockChange={setBlock}
        />
      )}

      {appointment.ticket_number && (
        <div className="mb-4 p-2 bg-gray-100 rounded-md">
          <Label>Senha: {appointment.ticket_number}</Label>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          className={`text-white ${getTriageButtonStyle(appointment.display_status)}`}
          onClick={handleTriageAction}
          disabled={appointment.display_status === 'in_progress' || 
                   appointment.display_status === 'completed' || 
                   appointment.display_status === 'missed' || 
                   appointment.display_status === 'rescheduled'}
        >
          {appointment.display_status === 'triage' ? 'Finalizar triagem' : 'Iniciar triagem'}
        </Button>

        <Button
          size="sm"
          className={`text-white ${getConsultButtonStyle(appointment.display_status)}`}
          onClick={handleStartAppointment}
          disabled={appointment.display_status !== 'waiting'}
        >
          {appointment.display_status === 'in_progress' ? 'Em consulta' : 'Iniciar consulta'}
        </Button>

        {appointment.display_status === 'in_progress' && (
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
        )}

        <Button
          size="sm"
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <DeleteAppointmentDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDeleteAppointment}
        />
      </div>
    </div>
  );
};
