
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Appointment } from "@/types/appointment";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LocationInputs } from "./LocationInputs";
import { DeleteAppointmentDialog } from "./DeleteAppointmentDialog";
import { TriageActions } from "./TriageActions";
import { ConsultActions } from "./ConsultActions";
import { FinishActions } from "./FinishActions";

interface AppointmentActionsProps {
  appointment: Appointment;
  onSuccess?: () => void;
}

export const AppointmentActions = ({ appointment, onSuccess }: AppointmentActionsProps) => {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [room, setRoom] = useState(appointment.room || '');
  const [block, setBlock] = useState(appointment.block || '');

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
        <TriageActions 
          appointment={appointment}
          room={room}
          block={block}
          onUpdateRequired={onSuccess}
        />

        <ConsultActions 
          appointment={appointment}
          onUpdateRequired={onSuccess}
        />

        <FinishActions 
          appointment={appointment}
          onUpdateRequired={onSuccess}
        />

        <Button
          size="sm"
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
          type="button"
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