
import { useCallback, useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AvailableTimeSlots } from "@/components/appointments/AvailableTimeSlots";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface UnavailableDaysSelectorProps {
  professionalId: string;
  onSuccess?: () => void;
}

interface UnavailableDay {
  date: string;
}

export const UnavailableDaysSelector = ({
  professionalId,
  onSuccess,
}: UnavailableDaysSelectorProps) => {
  const { toast } = useToast();
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableMonths, setAvailableMonths] = useState<{ month: number; year: number }[]>([]);

  const fetchAvailableMonths = async () => {
    try {
      console.log('[UnavailableDaysSelector] Buscando meses disponíveis');
      const { data, error } = await supabase
        .from('professional_available_months')
        .select('month, year')
        .eq('professional_id', professionalId)
        .order('year')
        .order('month');

      if (error) {
        console.error('[UnavailableDaysSelector] Erro ao buscar meses:', error);
        throw error;
      }
      console.log('[UnavailableDaysSelector] Meses disponíveis:', data);
      setAvailableMonths(data || []);
    } catch (error) {
      console.error('[UnavailableDaysSelector] Erro ao buscar meses:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os meses disponíveis.",
        variant: "destructive",
      });
    }
  };

  const fetchUnavailableDays = useCallback(async () => {
    try {
      console.log('[UnavailableDaysSelector] Buscando dias indisponíveis');
      const { data, error } = await supabase
        .from('professional_unavailable_days')
        .select('date')
        .eq('professional_id', professionalId);

      if (error) {
        console.error('[UnavailableDaysSelector] Erro ao buscar dias:', error);
        throw error;
      }

      if (data) {
        console.log('[UnavailableDaysSelector] Dias indisponíveis:', data);
        setSelectedDays(data.map(item => new Date(item.date)));
      }
    } catch (error) {
      console.error('[UnavailableDaysSelector] Erro ao buscar dias:', error);
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
    fetchAvailableMonths();
  }, [fetchUnavailableDays]);

  const handleDaySelect = async (date: Date | undefined) => {
    if (!date) return;

    try {
      console.log('[UnavailableDaysSelector] Alterando disponibilidade para:', date);
      const dateStr = format(date, 'yyyy-MM-dd');
      const isSelected = selectedDays.some(
        (selectedDate) => format(selectedDate, 'yyyy-MM-dd') === dateStr
      );

      if (isSelected) {
        console.log('[UnavailableDaysSelector] Removendo data:', dateStr);
        const { error } = await supabase
          .from('professional_unavailable_days')
          .delete()
          .eq('professional_id', professionalId)
          .eq('date', dateStr);

        if (error) {
          console.error('[UnavailableDaysSelector] Erro ao deletar:', error);
          throw error;
        }

        setSelectedDays(prev => 
          prev.filter(d => format(d, 'yyyy-MM-dd') !== dateStr)
        );

        toast({
          title: "Sucesso",
          description: "Data removida dos dias indisponíveis"
        });
      } else {
        console.log('[UnavailableDaysSelector] Adicionando data:', dateStr);
        const { error } = await supabase
          .from('professional_unavailable_days')
          .insert([{
            professional_id: professionalId,
            date: dateStr,
          }]);

        if (error) {
          console.error('[UnavailableDaysSelector] Erro ao inserir:', error);
          throw error;
        }

        setSelectedDays(prev => [...prev, date]);

        toast({
          title: "Sucesso",
          description: "Data adicionada aos dias indisponíveis"
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

  const isDateInAvailableMonth = (date: Date) => {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return availableMonths.some(am => am.month === month && am.year === year);
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
              selected={undefined}
              modifiers={{
                unavailable: selectedDays,
              }}
              modifiersStyles={{
                unavailable: { backgroundColor: "rgb(239 68 68)", color: "white" },
              }}
              className="rounded-md border"
              locale={ptBR}
              disabled={(date) => !isDateInAvailableMonth(date)}
            />
            <div className="text-sm text-muted-foreground mt-2">
              Clique nos dias para marcar/desmarcar ausências. Os dias em vermelho indicam que você não estará disponível para atendimento.
            </div>
          </div>
          
          <Card className="p-4">
            <AvailableTimeSlots professionalId={professionalId} />
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
};
