
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
        <Input
          type="date"
          value={appointmentDate ? format(appointmentDate, 'yyyy-MM-dd') : ''}
          onChange={(e) => {
            const date = e.target.value ? new Date(e.target.value) : undefined;
            onAppointmentDateSelect(date);
          }}
          min={format(new Date(), 'yyyy-MM-dd')}
          required
        />
      </div>

      <div>
        <Label>Horário da Consulta *</Label>
        <Select
          value={appointmentTime}
          onValueChange={onAppointmentTimeChange}
          disabled={!appointmentDate || !availableSlots.length}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um horário" />
          </SelectTrigger>
          <SelectContent>
            {availableSlots.map((slot) => (
              <SelectItem 
                key={slot.time} 
                value={slot.time}
                disabled={!slot.available}
              >
                {slot.time} ({slot.currentAppointments || 0}/{slot.maxAppointments || 10} agendamentos)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
