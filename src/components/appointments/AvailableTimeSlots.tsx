
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface AvailableTimeSlotsProps {
  professionalId: string;
  selectedDate?: Date;
}

interface TimeSlot {
  time_slot: string;
  max_appointments: number;
}

const DEFAULT_TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "14:00", "15:00"
];

export const AvailableTimeSlots = ({ professionalId, selectedDate }: AvailableTimeSlotsProps) => {
  const { toast } = useToast();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTimeSlot, setNewTimeSlot] = useState("");

  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const { data, error } = await supabase
          .from('professional_available_slots')
          .select('time_slot, max_appointments')
          .eq('professional_id', professionalId)
          .order('time_slot');

        if (error) throw error;
        setTimeSlots(data || []);
      } catch (error) {
        console.error('Erro ao buscar horários:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os horários disponíveis.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeSlots();
  }, [professionalId, toast]);

  const handleAddTimeSlot = async (time: string) => {
    try {
      const formattedTime = time.length === 5 ? time : `${time}:00`;
      
      // Verificar se o horário já existe
      const existingSlot = timeSlots.find(slot => slot.time_slot === formattedTime);
      if (existingSlot) {
        toast({
          title: "Aviso",
          description: "Este horário já está adicionado.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('professional_available_slots')
        .insert({
          professional_id: professionalId,
          time_slot: formattedTime,
          max_appointments: 1
        });

      if (error) throw error;

      setTimeSlots(prev => [...prev, { time_slot: formattedTime, max_appointments: 1 }].sort((a, b) => 
        a.time_slot.localeCompare(b.time_slot)
      ));

      if (time === newTimeSlot) {
        setNewTimeSlot("");
      }

      toast({
        title: "Sucesso",
        description: "Horário adicionado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao adicionar horário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o horário. Verifique se ele já não existe.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveTimeSlot = async (time: string) => {
    try {
      const { error } = await supabase
        .from('professional_available_slots')
        .delete()
        .match({ professional_id: professionalId, time_slot: time });

      if (error) throw error;

      setTimeSlots(prev => prev.filter(slot => slot.time_slot !== time));

      toast({
        title: "Sucesso",
        description: "Horário removido com sucesso",
      });
    } catch (error) {
      console.error('Erro ao remover horário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o horário.",
        variant: "destructive",
      });
    }
  };

  const validateTimeFormat = (time: string) => {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  };

  const handleManualTimeAdd = () => {
    if (!validateTimeFormat(newTimeSlot)) {
      toast({
        title: "Formato inválido",
        description: "Use o formato HH:MM (exemplo: 13:30)",
        variant: "destructive",
      });
      return;
    }

    // Verificar se o horário já existe
    const formattedTime = newTimeSlot.length === 5 ? newTimeSlot : `${newTimeSlot}:00`;
    const existingSlot = timeSlots.find(slot => slot.time_slot === formattedTime);
    if (existingSlot) {
      toast({
        title: "Aviso",
        description: "Este horário já está adicionado.",
        variant: "destructive",
      });
      return;
    }

    handleAddTimeSlot(newTimeSlot);
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
                onClick={() => isActive ? handleRemoveTimeSlot(`${time}:00`) : handleAddTimeSlot(time)}
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
                  onClick={() => handleRemoveTimeSlot(slot.time_slot)}
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
