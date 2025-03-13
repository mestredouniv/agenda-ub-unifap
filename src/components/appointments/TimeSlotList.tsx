
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface TimeSlotListProps {
  timeSlots: {
    id: string;
    time_slot: string;
    max_appointments: number;
  }[];
  onRemoveTimeSlot: (slot: { id: string; time_slot: string; max_appointments: number }) => void;
  isLoading: boolean;
}

export const TimeSlotList = ({
  timeSlots,
  onRemoveTimeSlot,
  isLoading,
}: TimeSlotListProps) => {
  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando horários...</div>;
  }

  if (timeSlots.length === 0) {
    return <div className="text-sm text-muted-foreground">Nenhum horário disponível</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {timeSlots.map((slot) => (
          <Button
            key={slot.id}
            variant="default"
            onClick={() => onRemoveTimeSlot(slot)}
            className="w-full"
          >
            {slot.time_slot.slice(0, -3)}
          </Button>
        ))}
      </div>

      <Separator />
    </div>
  );
};
