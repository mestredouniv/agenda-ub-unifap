
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useTimeSlots } from "@/hooks/useTimeSlots";
import { TimeSlotList } from "./TimeSlotList";
import { AddTimeSlotForm } from "./AddTimeSlotForm";

interface AvailableTimeSlotsProps {
  professionalId: string;
  selectedDate?: Date;
}

export const AvailableTimeSlots = ({
  professionalId,
  selectedDate,
}: AvailableTimeSlotsProps) => {
  const {
    timeSlots,
    newTimeSlot,
    setNewTimeSlot,
    isLoading,
    handleAddTimeSlot,
    handleRemoveTimeSlot
  } = useTimeSlots(professionalId);

  return (
    <div className="space-y-4">
      <div>
        <Label>Horários Disponíveis</Label>
        <div className="text-sm text-muted-foreground mb-4">
          {selectedDate ? (
            `Gerenciar horários para ${format(selectedDate, "dd 'de' MMMM 'de' yyyy")}`
          ) : (
            "Selecione uma data no calendário para gerenciar os horários"
          )}
        </div>
      </div>

      <Separator />

      <TimeSlotList 
        timeSlots={timeSlots}
        onRemoveTimeSlot={handleRemoveTimeSlot}
        isLoading={isLoading}
      />

      <AddTimeSlotForm
        onAddTimeSlot={handleAddTimeSlot}
        newTimeSlot={newTimeSlot}
        setNewTimeSlot={setNewTimeSlot}
      />

      <div className="text-sm text-muted-foreground mt-2">
        Clique nos horários para removê-los da lista.
      </div>
    </div>
  );
};
