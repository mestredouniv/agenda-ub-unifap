
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, isSameDay, parseISO } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

interface UnavailableDay {
  id: string;
  date: string;
  professional_id: string;
}

export const useUnavailableDays = (professionalId: string) => {
  const { toast } = useToast();
  const [unavailableDays, setUnavailableDays] = useState<UnavailableDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const fetchUnavailableDays = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('professional_unavailable_days')
        .select('id, date, professional_id')
        .eq('professional_id', professionalId);

      if (error) throw error;

      console.log('[UnavailableDaysSelector] Dias indisponíveis carregados:', data);
      setUnavailableDays(data || []);
    } catch (error) {
      console.error('[UnavailableDaysSelector] Erro ao carregar dias:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dias indisponíveis.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [professionalId, toast]);

  const handleDaySelect = async (date: Date | undefined) => {
    if (!date) return;

    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const existingDay = unavailableDays.find(
        day => isSameDay(parseISO(day.date), date)
      );

      if (existingDay) {
        // Remove o dia indisponível
        const { error } = await supabase
          .from('professional_unavailable_days')
          .delete()
          .eq('id', existingDay.id);

        if (error) throw error;

        console.log('[UnavailableDaysSelector] Dia removido com sucesso:', dateStr);
        setUnavailableDays(prev => prev.filter(d => d.id !== existingDay.id));

        toast({
          title: "Dia disponibilizado",
          description: "O dia foi marcado como disponível com sucesso."
        });
      } else {
        // Adiciona novo dia indisponível
        const { data, error } = await supabase
          .from('professional_unavailable_days')
          .insert({
            professional_id: professionalId,
            date: dateStr,
          })
          .select()
          .single();

        if (error) throw error;

        console.log('[UnavailableDaysSelector] Novo dia indisponível adicionado:', data);
        setUnavailableDays(prev => [...prev, data]);

        toast({
          title: "Dia bloqueado",
          description: "O dia foi marcado como indisponível com sucesso."
        });
      }
    } catch (error) {
      console.error('[UnavailableDaysSelector] Erro ao atualizar dia:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a disponibilidade.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUnavailableDays();

    const channel = supabase
      .channel('unavailable-days-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'professional_unavailable_days',
          filter: `professional_id=eq.${professionalId}`
        },
        () => {
          console.log('[UnavailableDaysSelector] Mudanças detectadas, recarregando...');
          fetchUnavailableDays();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUnavailableDays, professionalId]);

  return {
    unavailableDays,
    isLoading,
    currentMonth,
    setCurrentMonth,
    handleDaySelect
  };
};
