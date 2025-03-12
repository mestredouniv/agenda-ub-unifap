
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
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  const fetchUnavailableDays = useCallback(async () => {
    if (!professionalId) {
      console.warn('[useUnavailableDays] ID do profissional não fornecido');
      setUnavailableDays([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('professional_unavailable_days')
        .select('id, date, professional_id')
        .eq('professional_id', professionalId);

      if (error) {
        console.error('[useUnavailableDays] Erro ao carregar dias:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dias indisponíveis.",
          variant: "destructive",
        });
        return;
      }

      console.log('[useUnavailableDays] Dias indisponíveis carregados:', data);
      
      // Garantir que os dados são válidos antes de atualizar o estado
      const validDays = (data || []).filter(day => {
        try {
          // Verificar se a data é válida
          const parsedDate = parseISO(day.date);
          return !isNaN(parsedDate.getTime());
        } catch (e) {
          console.error('[useUnavailableDays] Data inválida ignorada:', day.date, e);
          return false;
        }
      });
      
      setUnavailableDays(validDays);
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('[useUnavailableDays] Erro inesperado ao carregar dias:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao carregar os dias indisponíveis.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [professionalId, toast]);

  // Função para sincronizar com outros componentes
  const syncWithAppointmentSystem = useCallback(async () => {
    try {
      console.log('[useUnavailableDays] Sincronizando com sistema de agendamentos...');
      
      // Atualizar a tabela de meses disponíveis para o profissional
      const currentYear = currentMonth.getFullYear();
      const currentMonthNumber = currentMonth.getMonth() + 1;
      
      // Verificar se o mês já existe
      const { data: existingMonth, error: checkError } = await supabase
        .from('professional_available_months')
        .select('id')
        .eq('professional_id', professionalId)
        .eq('year', currentYear)
        .eq('month', currentMonthNumber)
        .maybeSingle();
        
      if (checkError) {
        console.error('[useUnavailableDays] Erro ao verificar mês:', checkError);
        return;
      }
      
      // Se o mês não existir, criar
      if (!existingMonth) {
        const { error: insertError } = await supabase
          .from('professional_available_months')
          .insert({
            professional_id: professionalId,
            year: currentYear,
            month: currentMonthNumber,
            is_available: true
          });
          
        if (insertError) {
          console.error('[useUnavailableDays] Erro ao inserir mês:', insertError);
        } else {
          console.log('[useUnavailableDays] Mês adicionado com sucesso:', currentYear, currentMonthNumber);
        }
      }
      
      console.log('[useUnavailableDays] Sincronização concluída');
    } catch (error) {
      console.error('[useUnavailableDays] Erro ao sincronizar com sistema de agendamentos:', error);
    }
  }, [professionalId, currentMonth]);

  const handleDaySelect = async (date: Date | undefined) => {
    if (!date) {
      // Se não houver data, apenas sincronizar
      await fetchUnavailableDays();
      await syncWithAppointmentSystem();
      return;
    }

    if (!professionalId) {
      console.warn('[useUnavailableDays] ID do profissional não fornecido');
      toast({
        title: "Erro",
        description: "ID do profissional não encontrado.",
        variant: "destructive",
      });
      return;
    }

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

        if (error) {
          console.error('[useUnavailableDays] Erro ao remover dia:', error);
          toast({
            title: "Erro",
            description: "Não foi possível remover o dia indisponível.",
            variant: "destructive",
          });
          return;
        }

        console.log('[useUnavailableDays] Dia removido com sucesso:', dateStr);
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

        if (error) {
          console.error('[useUnavailableDays] Erro ao adicionar dia:', error);
          toast({
            title: "Erro",
            description: "Não foi possível adicionar o dia indisponível.",
            variant: "destructive",
          });
          return;
        }

        console.log('[useUnavailableDays] Novo dia indisponível adicionado:', data);
        setUnavailableDays(prev => [...prev, data]);

        toast({
          title: "Dia bloqueado",
          description: "O dia foi marcado como indisponível com sucesso."
        });
      }

      // Sincronizar com o sistema de agendamentos
      await syncWithAppointmentSystem();
      
    } catch (error) {
      console.error('[useUnavailableDays] Erro ao atualizar dia:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a disponibilidade.",
        variant: "destructive",
      });
    }
  };

  // Efeito para carregar os dias indisponíveis e configurar a sincronização
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) {
        await fetchUnavailableDays();
        await syncWithAppointmentSystem();
      }
    };
    
    loadData();

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
          if (isMounted) {
            console.log('[useUnavailableDays] Mudanças detectadas, recarregando...');
            fetchUnavailableDays();
          }
        }
      )
      .subscribe();

    // Configurar intervalo para sincronização periódica
    const syncInterval = setInterval(() => {
      if (isMounted) {
        // Verificar se a última sincronização foi há mais de 5 minutos
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        
        if (lastSyncTime < fiveMinutesAgo) {
          console.log('[useUnavailableDays] Sincronização periódica iniciada');
          fetchUnavailableDays();
          syncWithAppointmentSystem();
        }
      }
    }, 60000); // Verificar a cada minuto

    return () => {
      isMounted = false;
      clearInterval(syncInterval);
      supabase.removeChannel(channel);
    };
  }, [fetchUnavailableDays, syncWithAppointmentSystem, professionalId, lastSyncTime]);

  // Efeito adicional para sincronizar quando o mês atual mudar
  useEffect(() => {
    syncWithAppointmentSystem();
  }, [currentMonth, syncWithAppointmentSystem]);

  return {
    unavailableDays,
    isLoading,
    currentMonth,
    setCurrentMonth,
    handleDaySelect,
    syncWithAppointmentSystem
  };
};