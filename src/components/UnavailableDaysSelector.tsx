import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ptBR } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface UnavailableDaysSelectorProps {
  selectedDays: Date[];
  onChange: (days: Date[]) => void;
  timeSlots?: TimeSlot[];
  onTimeSlotsChange?: (slots: TimeSlot[]) => void;
}

const DEFAULT_TIME_SLOTS = [
  { time: "08:00", available: true },
  { time: "09:00", available: true },
  { time: "10:00", available: true },
  { time: "11:00", available: true },
  { time: "14:00", available: true },
  { time: "15:00", available: true },
];

export const UnavailableDaysSelector = ({
  selectedDays,
  onChange,
  timeSlots = DEFAULT_TIME_SLOTS,
  onTimeSlotsChange,
}: UnavailableDaysSelectorProps) => {
  const handleSelect = (date: Date | undefined) => {
    if (!date) return;

    const isAlreadySelected = selectedDays.some(
      (selectedDate) =>
        selectedDate.toISOString().split("T")[0] === date.toISOString().split("T")[0]
    );

    if (isAlreadySelected) {
      onChange(
        selectedDays.filter(
          (selectedDate) =>
            selectedDate.toISOString().split("T")[0] !== date.toISOString().split("T")[0]
        )
      );
    } else {
      onChange([...selectedDays, date]);
    }
  };

  const handleTimeSlotChange = (time: string, checked: boolean) => {
    if (onTimeSlotsChange) {
      const updatedSlots = timeSlots.map((slot) =>
        slot.time === time ? { ...slot, available: checked } : slot
      );
      onTimeSlotsChange(updatedSlots);
    }
  };

  return (
    <div className="space-y-6">
      <Calendar
        mode="single"
        onSelect={handleSelect}
        selected={undefined}
        modifiers={{
          unavailable: selectedDays,
        }}
        modifiersStyles={{
          unavailable: { backgroundColor: "rgb(239 68 68)", color: "white" },
        }}
        className="rounded-md border"
        locale={ptBR}
      />
      
      <div className="space-y-4">
        <h3 className="font-medium text-sm">Horários disponíveis para atendimento:</h3>
        <div className="grid grid-cols-2 gap-4">
          {timeSlots.map((slot) => (
            <div key={slot.time} className="flex items-center space-x-2">
              <Checkbox
                id={`time-${slot.time}`}
                checked={slot.available}
                onCheckedChange={(checked) => 
                  handleTimeSlotChange(slot.time, checked as boolean)
                }
              />
              <Label htmlFor={`time-${slot.time}`}>{slot.time}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Clique nos dias para marcar/desmarcar ausências e selecione os horários disponíveis
      </div>
    </div>
  );
};
