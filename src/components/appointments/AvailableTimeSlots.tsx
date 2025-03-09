
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getDefaultMaxAppointments } from "@/utils/appointmentUtils";

interface AvailableTimeSlotsProps {
  professionalId: string;
  selectedDate?: Date;
}

interface TimeSlot {
  id: string;
  time_slot: string;
  max_appointments: number;
}

export const AvailableTimeSlots = ({
  professionalId,
  selectedDate,
}: AvailableTimeSlotsProps) => {
  const { toast } = useToast();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [newTimeSlot, setNewTimeSlot] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchTimeSlots = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('professional_available_slots')
        .select('*')
        .eq('professional_id', professionalId)
        .order('time_slot');

      if (error) throw error;

      console.log('[AvailableTimeSlots] Horários carregados:', data);
      setTimeSlots(data || []);
    } catch (error) {
      console.error('[AvailableTimeSlots] Erro ao carregar horários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os horários disponíveis.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeSlots();

    const channel = supabase
      .channel('available-slots-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'professional_available_slots',
          filter: `professional_id=eq.${professionalId}`
        },
        () => {
          console.log('[AvailableTimeSlots] Mudanças detectadas, recarregando...');
          fetchTimeSlots();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [professionalId]);

  const validateTimeFormat = (time: string) => {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  };

  const handleAddTimeSlot = async () => {
    if (!validateTimeFormat(newTimeSlot)) {
      toast({
        title: "Formato inválido",
        description: "Use o formato HH:MM (exemplo: 13:30)",
        variant: "destructive",
      });
      return;
    }

    try {
      const defaultMaxAppointments = getDefaultMaxAppointments();
      
      const { data, error } = await supabase
        .from('professional_available_slots')
        .insert({
          professional_id: professionalId,
          time_slot: `${newTimeSlot}:00`,
          max_appointments: defaultMaxAppointments
        })
        .select()
        .single();

      if (error) throw error;

      console.log('[AvailableTimeSlots] Novo horário adicionado:', data);
      setTimeSlots(prev => [...prev, data]);
      setNewTimeSlot("");
      
      toast({
        title: "Horário adicionado",
        description: "O horário foi adicionado com sucesso."
      });
    } catch (error) {
      console.error('[AvailableTimeSlots] Erro ao adicionar horário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o horário.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveTimeSlot = async (slot: TimeSlot) => {
    try {
      const { error } = await supabase
        .from('professional_available_slots')
        .delete()
        .eq('id', slot.id);

      if (error) throw error;

      console.log('[AvailableTimeSlots] Horário removido:', slot);
      setTimeSlots(prev => prev.filter(t => t.id !== slot.id));
      
      toast({
        title: "Horário removido",
        description: "O horário foi removido com sucesso."
      });
    } catch (error) {
      console.error('[AvailableTimeSlots] Erro ao remover horário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o horário.",
        variant: "destructive",
      });
    }
  };

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

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {timeSlots.map((slot) => (
            <Button
              key={slot.id}
              variant="default"
              onClick={() => handleRemoveTimeSlot(slot)}
              className="w-full"
            >
              {slot.time_slot.slice(0, -3)}
            </Button>
          ))}
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
          <Button onClick={handleAddTimeSlot} disabled={!newTimeSlot}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground mt-2">
        Clique nos horários para removê-los da lista.
      </div>
    </div>
  );
};
