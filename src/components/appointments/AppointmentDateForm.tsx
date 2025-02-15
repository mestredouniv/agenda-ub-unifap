
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TimeSlot {
  time: string;
  available: boolean;
  maxAppointments?: number;
  currentAppointments?: number;
}

export interface AppointmentDateFormProps {
  appointmentDate: Date | undefined;
  appointmentTime: string;
  onAppointmentDateSelect: (date: Date | undefined) => void;
  onAppointmentTimeChange: (value: string) => void;
  availableSlots: TimeSlot[];
}

export const AppointmentDateForm = ({
  appointmentDate,
  appointmentTime,
  onAppointmentDateSelect,
  onAppointmentTimeChange,
  availableSlots,
}: AppointmentDateFormProps) => {
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
                format(appointmentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
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
              disabled={(date) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                return date < new Date() || !availableSlots.some(slot => slot.available);
              }}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label htmlFor="appointmentTime">Horário da Consulta *</Label>
        <Input
          id="appointmentTime"
          type="time"
          value={appointmentTime}
          onChange={(e) => onAppointmentTimeChange(e.target.value)}
          required
        />
      </div>
    </div>
  );
};
