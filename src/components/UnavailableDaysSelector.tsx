
import { useCallback, useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AvailableTimeSlots } from "@/components/appointments/AvailableTimeSlots";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isSameDay, parseISO } from "date-fns";

interface UnavailableDaysSelectorProps {
  professionalId: string;
  onSuccess?: () => void;
}

interface UnavailableDay {
  id: string;
  date: string;
  professional_id: string;
}

export const UnavailableDaysSelector = ({
  professionalId,
  onSuccess,
}: UnavailableDaysSelectorProps) => {
  const { toast } = useToast();
  const [unavailableDays, setUnavailableDays] = useState<UnavailableDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

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

      if (onSuccess) {
        onSuccess();
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

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Calendar
              mode="single"
              onSelect={handleDaySelect}
              selected={selectedDate}
              modifiers={{
                unavailable: unavailableDays.map(d => parseISO(d.date)),
              }}
              modifiersStyles={{
                unavailable: { backgroundColor: "rgb(239 68 68)", color: "white" },
              }}
              className="rounded-md border"
              locale={ptBR}
            />
            <div className="text-sm text-muted-foreground mt-2">
              Clique nos dias para marcar/desmarcar ausências. Os dias em vermelho indicam que você não estará disponível para atendimento.
            </div>
          </div>
          
          <Card className="p-4">
            <AvailableTimeSlots 
              professionalId={professionalId} 
              selectedDate={selectedDate}
            />
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
};
