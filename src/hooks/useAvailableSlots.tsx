
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TimeSlot {
  time_slot: string;
  max_appointments: number;
}

export const useAvailableSlots = (professionalId: string) => {
  const { toast } = useToast();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Carregar slots iniciais
  useEffect(() => {
    const loadTimeSlots = async () => {
      try {
        console.log('[useAvailableSlots] Carregando horários para:', professionalId);
        const { data, error } = await supabase
          .from('professional_available_slots')
          .select('time_slot, max_appointments')
          .eq('professional_id', professionalId)
          .order('time_slot');

        if (error) throw error;
        console.log('[useAvailableSlots] Horários carregados:', data);
        setTimeSlots(data || []);
      } catch (error) {
        console.error('[useAvailableSlots] Erro ao carregar horários:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os horários. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTimeSlots();

    // Configurar listener para mudanças em tempo real
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
        (payload) => {
          console.log('[useAvailableSlots] Mudança detectada:', payload);
          loadTimeSlots();
        }
      )
      .subscribe();

    // Aviso antes de sair da página se houver mudanças não salvas
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      supabase.removeChannel(channel);
    };
  }, [professionalId, toast, hasUnsavedChanges]);

  const addTimeSlot = async (time: string): Promise<boolean> => {
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
        return false;
      }

      console.log('[useAvailableSlots] Adicionando horário:', formattedTime);
      const { error } = await supabase
        .from('professional_available_slots')
        .insert({
          professional_id: professionalId,
          time_slot: formattedTime,
          max_appointments: 1
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Horário adicionado com sucesso",
      });
      
      return true;
    } catch (error) {
      console.error('[useAvailableSlots] Erro ao adicionar horário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o horário. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeTimeSlot = async (time: string): Promise<boolean> => {
    try {
      console.log('[useAvailableSlots] Removendo horário:', time);
      const { error } = await supabase
        .from('professional_available_slots')
        .delete()
        .match({ professional_id: professionalId, time_slot: time });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Horário removido com sucesso",
      });
      
      return true;
    } catch (error) {
      console.error('[useAvailableSlots] Erro ao remover horário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o horário. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    timeSlots,
    isLoading,
    hasUnsavedChanges,
    addTimeSlot,
    removeTimeSlot,
  };
};
