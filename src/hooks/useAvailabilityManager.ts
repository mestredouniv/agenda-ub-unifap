
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

export interface AvailabilityData {
  availableMonths: { month: number; year: number }[];
  unavailableDays: Date[];
  isMonthAvailable: (date: Date) => boolean;
  isDayUnavailable: (date: Date) => boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAvailabilityManager = (professionalId: string): AvailabilityData => {
  const { toast } = useToast();
  const [availableMonths, setAvailableMonths] = useState<{ month: number; year: number }[]>([]);
  const [unavailableDays, setUnavailableDays] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        // Buscar meses disponíveis
        const { data: months, error: monthsError } = await supabase
          .from('professional_available_months')
          .select('month, year')
          .eq('professional_id', professionalId)
          .order('year')
          .order('month');

        if (monthsError) throw monthsError;

        // Buscar dias indisponíveis
        const { data: days, error: daysError } = await supabase
          .from('professional_unavailable_days')
          .select('date')
          .eq('professional_id', professionalId);

        if (daysError) throw daysError;

        setAvailableMonths(months || []);
        setUnavailableDays((days || []).map(day => new Date(day.date)));
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar disponibilidade:', err);
        setError('Erro ao carregar disponibilidade');
        toast({
          title: "Erro",
          description: "Não foi possível carregar a disponibilidade do profissional.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();

    // Configurar subscription para atualizações em tempo real
    const channel = supabase
      .channel('availability-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'professional_available_months',
          filter: `professional_id=eq.${professionalId}`
        },
        () => fetchAvailability()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'professional_unavailable_days',
          filter: `professional_id=eq.${professionalId}`
        },
        () => fetchAvailability()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [professionalId, toast]);

  const isMonthAvailable = (date: Date) => {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return availableMonths.some(m => m.month === month && m.year === year);
  };

  const isDayUnavailable = (date: Date) => {
    return unavailableDays.some(
      unavailableDate => format(unavailableDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  return {
    availableMonths,
    unavailableDays,
    isMonthAvailable,
    isDayUnavailable,
    isLoading,
    error
  };
};
