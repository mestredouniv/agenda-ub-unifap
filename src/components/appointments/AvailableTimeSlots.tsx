
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface AvailableTimeSlotsProps {
  professionalId: string;
  selectedDate?: Date;
}

interface TimeSlot {
  time_slot: string;
  max_appointments: number;
}

export const AvailableTimeSlots = ({ professionalId, selectedDate }: AvailableTimeSlotsProps) => {
  const { toast } = useToast();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      const { error } = await supabase
        .from('professional_available_slots')
        .insert({
          professional_id: professionalId,
          time_slot: time,
          max_appointments: 1
        });

      if (error) throw error;

      setTimeSlots(prev => [...prev, { time_slot: time, max_appointments: 1 }].sort((a, b) => 
        a.time_slot.localeCompare(b.time_slot)
      ));

      toast({
        title: "Sucesso",
        description: "Horário adicionado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao adicionar horário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o horário.",
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

      <div className="grid grid-cols-2 gap-2">
        {["08:00", "09:00", "10:00", "11:00", "14:00", "15:00"].map((time) => {
          const isActive = timeSlots.some(slot => slot.time_slot === time);
          return (
            <Button
              key={time}
              variant={isActive ? "default" : "outline"}
              onClick={() => isActive ? handleRemoveTimeSlot(time) : handleAddTimeSlot(time)}
              className="w-full"
            >
              {time}
            </Button>
          );
        })}
      </div>

      <div className="text-sm text-muted-foreground mt-2">
        Clique nos horários para ativar/desativar a disponibilidade.
      </div>
    </div>
  );
};
