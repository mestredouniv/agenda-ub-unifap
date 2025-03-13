
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getDefaultMaxAppointments } from "@/utils/appointmentUtils";

interface TimeSlot {
  id: string;
  time_slot: string;
  max_appointments: number;
}

export const useTimeSlots = (professionalId: string) => {
  const { toast } = useToast();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [newTimeSlot, setNewTimeSlot] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchTimeSlots = useCallback(async () => {
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
  }, [professionalId, toast]);

  const validateTimeFormat = (time: string) => {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  };

  const handleAddTimeSlot = async (timeSlot: string) => {
    if (!validateTimeFormat(timeSlot)) {
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
          time_slot: `${timeSlot}:00`,
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
  }, [professionalId, fetchTimeSlots]);

  return {
    timeSlots,
    newTimeSlot,
    setNewTimeSlot,
    isLoading,
    handleAddTimeSlot,
    handleRemoveTimeSlot
  };
};
