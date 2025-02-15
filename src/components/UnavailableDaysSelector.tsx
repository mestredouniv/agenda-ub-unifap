
import { useCallback, useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UnavailableDaysSelectorProps {
  professionalId: string;
  onSuccess?: () => void;
}

export const UnavailableDaysSelector = ({
  professionalId,
  onSuccess,
}: UnavailableDaysSelectorProps) => {
  const { toast } = useToast();
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUnavailableDays = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('professional_unavailable_days')
        .select('date')
        .eq('professional_id', professionalId);

      if (error) throw error;

      setSelectedDays(data.map(item => new Date(item.date)));
    } catch (error) {
      console.error('Erro ao buscar dias indisponíveis:', error);
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
  }, [fetchUnavailableDays]);

  const handleDaySelect = async (date: Date | undefined) => {
    if (!date) return;

    try {
      const dateStr = date.toISOString().split('T')[0];
      const isSelected = selectedDays.some(
        (selectedDate) => selectedDate.toISOString().split('T')[0] === dateStr
      );

      if (isSelected) {
        // Remover data
        const { error } = await supabase
          .from('professional_unavailable_days')
          .delete()
          .eq('professional_id', professionalId)
          .eq('date', dateStr);

        if (error) throw error;

        setSelectedDays(prev => 
          prev.filter(d => d.toISOString().split('T')[0] !== dateStr)
        );
      } else {
        // Adicionar data
        const { error } = await supabase
          .from('professional_unavailable_days')
          .insert([{
            professional_id: professionalId,
            date: dateStr,
          }]);

        if (error) throw error;

        setSelectedDays(prev => [...prev, date]);
      }

      toast({
        title: "Sucesso",
        description: isSelected 
          ? "Dia marcado como disponível"
          : "Dia marcado como indisponível",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao atualizar dias indisponíveis:', error);
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
    <div className="space-y-6">
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
      />
      
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">
          Clique nos dias para marcar/desmarcar ausências. Os dias em vermelho indicam que você não estará disponível para atendimento.
        </div>
      </Card>
    </div>
  );
};
