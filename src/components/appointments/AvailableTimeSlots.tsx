
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";
import { useToast } from "@/components/ui/use-toast";

interface AvailableTimeSlotsProps {
  professionalId: string;
  selectedDate?: Date;
}

const DEFAULT_TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "14:00", "15:00"
];

export const AvailableTimeSlots = ({ professionalId, selectedDate }: AvailableTimeSlotsProps) => {
  const { toast } = useToast();
  const [newTimeSlot, setNewTimeSlot] = useState("");
  const { 
    timeSlots, 
    isLoading, 
    addTimeSlot, 
    removeTimeSlot 
  } = useAvailableSlots(professionalId);

  const validateTimeFormat = (time: string) => {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  };

  const handleManualTimeAdd = async () => {
    if (!validateTimeFormat(newTimeSlot)) {
      toast({
        title: "Formato inválido",
        description: "Use o formato HH:MM (exemplo: 13:30)",
        variant: "destructive",
      });
      return;
    }

    const success = await addTimeSlot(newTimeSlot);
    if (success) {
      setNewTimeSlot("");
    }
  };

  const handleTimeSlotToggle = async (time: string, isActive: boolean) => {
    if (isActive) {
      await removeTimeSlot(`${time}:00`);
    } else {
      await addTimeSlot(time);
    }
  };

  if (isLoading) {
    return <div>Carregando horários...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Horários Disponíveis</Label>
        <div className="text-sm text-muted-foreground mb-4">
          {selectedDate ? (
            `Gerenciar horários para ${format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
          ) : (
            "Selecione uma data no calendário para gerenciar os horários"
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {DEFAULT_TIME_SLOTS.map((time) => {
            const isActive = timeSlots.some(slot => slot.time_slot === `${time}:00`);
            return (
              <Button
                key={time}
                variant={isActive ? "default" : "outline"}
                onClick={() => handleTimeSlotToggle(time, isActive)}
                className="w-full"
              >
                {time}
              </Button>
            );
          })}
        </div>

        <Separator />

        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Adicionar horário (HH:MM)"
            value={newTimeSlot}
            onChange={(e) => setNewTimeSlot(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleManualTimeAdd} disabled={!newTimeSlot}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {timeSlots.filter(slot => !DEFAULT_TIME_SLOTS.includes(slot.time_slot.slice(0, -3))).length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {timeSlots
              .filter(slot => !DEFAULT_TIME_SLOTS.includes(slot.time_slot.slice(0, -3)))
              .sort((a, b) => a.time_slot.localeCompare(b.time_slot))
              .map((slot) => (
                <Button
                  key={slot.time_slot}
                  variant="default"
                  onClick={() => removeTimeSlot(slot.time_slot)}
                  className="w-full"
                >
                  {slot.time_slot.slice(0, -3)}
                </Button>
              ))}
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground mt-2">
        Clique nos horários para ativar/desativar a disponibilidade.
      </div>
    </div>
  );
};
