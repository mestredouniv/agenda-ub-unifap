
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
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Calendar, Clock, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  const generateTicketNumber = () => {
    const date = new Date();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${date.getHours()}${date.getMinutes()}${random}`;
  };

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
      // Atualizar todos os agendamentos do mesmo dia com a mesma sala e bloco
      const { error } = await supabase
        .from('appointments')
        .update({ 
          room: room,
          block: block
        })
        .eq('professional_id', appointment.professional_id)
        .eq('appointment_date', appointment.appointment_date);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar sala/bloco:', error);
      return false;
    }
  };

  const handleStartTriage = async () => {
    try {
      // Primeiro atualiza sala e bloco
      const updated = await updateRoomAndBlock();
      if (!updated) return;

      // Gera número da senha
      const ticketNumber = generateTicketNumber();

      const { error: updateError } = await supabase
        .from('appointments')
        .update({ 
          display_status: 'triage',
          actual_start_time: new Date().toLocaleTimeString(),
          ticket_number: ticketNumber
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
        description: `Paciente encaminhado para triagem. Senha: ${ticketNumber}`,
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

  const getTriageButtonStyle = () => {
    switch (appointment.display_status) {
      case 'triage':
        return 'bg-red-500 hover:bg-red-600';
      case 'in_progress':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  const getTriageButtonText = () => {
    switch (appointment.display_status) {
      case 'triage':
        return 'Triagem em andamento';
      case 'in_progress':
        return 'Triagem finalizada';
      default:
        return 'Iniciar triagem';
    }
  };

  const getConsultButtonStyle = () => {
    if (appointment.display_status === 'in_progress') {
      return 'bg-orange-500 hover:bg-orange-600';
    }
    return 'bg-gray-500 hover:bg-gray-600';
  };

  const isAppointmentFinished = appointment.display_status === 'completed' || 
                               appointment.display_status === 'missed' ||
                               appointment.display_status === 'rescheduled';

  const showLocationInputs = !isAppointmentFinished && appointment.display_status === 'waiting';

  return (
    <div className="space-y-4">
      {showLocationInputs && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="room">Sala</Label>
            <Input
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Número da sala"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="block">Bloco</Label>
            <Input
              id="block"
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              placeholder="Número/letra do bloco"
            />
          </div>
        </div>
      )}

      {appointment.ticket_number && (
        <div className="mb-4 p-2 bg-gray-100 rounded-md">
          <Label>Senha: {appointment.ticket_number}</Label>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          className={`text-white ${getTriageButtonStyle()}`}
          onClick={handleStartTriage}
          disabled={isAppointmentFinished}
        >
          {getTriageButtonText()}
        </Button>

        <Button
          size="sm"
          className={`text-white ${getConsultButtonStyle()}`}
          onClick={handleStartAppointment}
          disabled={appointment.display_status !== 'triage'}
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

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover agendamento</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover este agendamento? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAppointment}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
