import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ptBR } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface UnavailableDaysSelectorProps {
  professionalId: string;
  selectedDays: Date[];
  onChange: (days: Date[]) => void;
  timeSlots?: TimeSlot[];
  onTimeSlotsChange?: (slots: TimeSlot[]) => void;
}

export const UnavailableDaysSelector = ({
  professionalId,
  selectedDays,
  onChange,
  timeSlots,
  onTimeSlotsChange,
}: UnavailableDaysSelectorProps) => {
  const { toast } = useToast();
  const { slots: availableSlots, updateSlots, updateUnavailableDays } = useAvailableSlots(professionalId, undefined);

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;

    const isAlreadySelected = selectedDays.some(
      (selectedDate) =>
        selectedDate.toISOString().split("T")[0] === date.toISOString().split("T")[0]
    );

    const newSelectedDays = isAlreadySelected
      ? selectedDays.filter(
          (selectedDate) =>
            selectedDate.toISOString().split("T")[0] !== date.toISOString().split("T")[0]
        )
      : [...selectedDays, date];

    onChange(newSelectedDays);
    updateUnavailableDays(newSelectedDays);
  };

  const handleTimeSlotChange = (time: string, checked: boolean) => {
    const updatedSlots = availableSlots.map((slot) =>
      slot.time === time ? { ...slot, available: checked } : slot
    );
    
    updateSlots(updatedSlots);
    if (onTimeSlotsChange) {
      onTimeSlotsChange(updatedSlots);
    }
    
    toast({
      title: "Horários atualizados",
      description: "Os horários de atendimento foram atualizados com sucesso.",
    });
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
      
      <Card className="p-4">
        <h3 className="font-medium text-sm mb-4">Horários disponíveis para atendimento:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {availableSlots.map((slot) => (
            <div
              key={slot.time}
              className="flex items-center space-x-2 bg-white rounded-lg p-3 shadow-sm border"
            >
              <Checkbox
                id={`time-${slot.time}`}
                checked={slot.available}
                onCheckedChange={(checked) => 
                  handleTimeSlotChange(slot.time, checked as boolean)
                }
                className="data-[state=checked]:bg-primary"
              />
              <Label
                htmlFor={`time-${slot.time}`}
                className="text-sm font-medium cursor-pointer"
              >
                {slot.time}
              </Label>
            </div>
          ))}
        </div>
      </Card>

      <div className="text-sm text-muted-foreground">
        Clique nos dias para marcar/desmarcar ausências e selecione os horários disponíveis
      </div>
    </div>
  );
};