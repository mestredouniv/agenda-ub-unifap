
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
import { useAvailabilityManager } from "@/hooks/useAvailabilityManager";
import { useTimeSlots } from "@/hooks/useTimeSlots";

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
  // Gerenciamento de disponibilidade
  const {
    isMonthAvailable,
    isDayUnavailable,
    isLoading: isLoadingAvailability
  } = useAvailabilityManager(professionalId);

  // Verificar se a data selecionada está disponível
  const isDateAvailable = appointmentDate ? 
    isMonthAvailable(appointmentDate) && !isDayUnavailable(appointmentDate) : 
    false;

  // Gerenciamento de horários
  const {
    timeSlots,
    isLoading: isLoadingTimeSlots
  } = useTimeSlots(professionalId, appointmentDate, isDateAvailable);

  const isDateDisabled = (date: Date) => {
    // Desabilitar datas passadas
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;

    // Verificar disponibilidade
    return !isMonthAvailable(date) || isDayUnavailable(date);
  };

  const isLoading = isLoadingAvailability || isLoadingTimeSlots;

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
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={appointmentDate}
              onSelect={onAppointmentDateSelect}
              disabled={isDateDisabled}
              initialFocus
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
          disabled={!appointmentDate || isLoading || !isDateAvailable || timeSlots.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={
              !appointmentDate 
                ? "Selecione uma data primeiro" 
                : !isDateAvailable
                ? "Data indisponível"
                : isLoading 
                ? "Carregando horários..." 
                : timeSlots.length === 0 
                ? "Nenhum horário disponível" 
                : "Selecione um horário"
            } />
          </SelectTrigger>
          <SelectContent>
            {timeSlots.map((slot) => (
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
