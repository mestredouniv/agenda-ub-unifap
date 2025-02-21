
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAppointmentSlots } from "@/hooks/useAppointmentSlots";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";

interface AppointmentDateFormProps {
  professionalId: string;
  appointmentDate: Date | undefined;
  appointmentTime: string;
  onAppointmentDateSelect: (date: Date | undefined) => void;
  onAppointmentTimeChange: (value: string) => void;
}

export const AppointmentDateForm = ({
  professionalId,
  appointmentDate,
  appointmentTime,
  onAppointmentDateSelect,
  onAppointmentTimeChange,
}: AppointmentDateFormProps) => {
  const { toast } = useToast();
  const [lastClickTime, setLastClickTime] = useState(0);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const { slots, isLoading, fetchUnavailableDays } = useAppointmentSlots(professionalId, appointmentDate);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (!date) {
      onAppointmentDateSelect(undefined);
      return;
    }

    const now = Date.now();
    const isDoubleClick = now - lastClickTime < 300; // 300ms para duplo clique
    setLastClickTime(now);

    if (isDoubleClick) {
      // Verificar se a data está disponível
      const isUnavailable = unavailableDates.some(
        unavailableDate => format(unavailableDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );

      if (isUnavailable) {
        toast({
          title: "Data indisponível",
          description: "O profissional não está disponível nesta data.",
          variant: "destructive",
        });
        return;
      }

      // Se disponível, seleciona a data
      onAppointmentDateSelect(date);
      toast({
        title: "Data selecionada",
        description: format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
      });
    }
  }, [lastClickTime, onAppointmentDateSelect, toast, unavailableDates]);

  useEffect(() => {
    const loadUnavailableDays = async () => {
      const dates = await fetchUnavailableDays();
      setUnavailableDates(dates.map(d => new Date(d.date)));
    };

    loadUnavailableDays();

    // Configurar polling para atualização a cada 5 segundos
    const interval = setInterval(loadUnavailableDays, 5000);

    return () => clearInterval(interval);
  }, [fetchUnavailableDays]);

  return (
    <div className="space-y-4">
      <div>
        <Label>Data da Consulta *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !appointmentDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {appointmentDate ? (
                format(appointmentDate, "PPP", { locale: ptBR })
              ) : (
                <span>Selecione uma data (clique duplo para confirmar)</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={appointmentDate}
              onSelect={handleDateSelect}
              disabled={[
                ...unavailableDates,
                {
                  before: new Date(new Date().setHours(0, 0, 0, 0)),
                },
              ]}
              modifiers={{
                unavailable: unavailableDates,
              }}
              modifiersStyles={{
                unavailable: { 
                  backgroundColor: "rgb(239 68 68)", 
                  color: "white",
                  cursor: "not-allowed" 
                },
              }}
              className="rounded-md border"
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label>Horário da Consulta *</Label>
        <Select
          value={appointmentTime}
          onValueChange={onAppointmentTimeChange}
          disabled={!appointmentDate || isLoading || slots.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={
              !appointmentDate 
                ? "Selecione uma data primeiro" 
                : isLoading 
                ? "Carregando horários..." 
                : slots.length === 0 
                ? "Nenhum horário disponível" 
                : "Selecione um horário"
            } />
          </SelectTrigger>
          <SelectContent>
            {slots.map((slot) => (
              <SelectItem 
                key={slot.time} 
                value={slot.time}
                disabled={!slot.available}
              >
                {slot.time} ({slot.currentAppointments}/{slot.maxAppointments} agendamentos)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
