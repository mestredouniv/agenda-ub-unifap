import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ptBR } from "date-fns/locale";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";

interface Professional {
  id: string;
  name: string;
  profession: string;
}

interface AppointmentSelectionProps {
  professionals: Professional[];
  formData: {
    professionalId: string;
    preferredDate: Date | undefined;
    preferredTime: string;
  };
  onChange: (field: string, value: any) => void;
}

export const AppointmentSelection = ({
  professionals,
  formData,
  onChange,
}: AppointmentSelectionProps) => {
  const { slots: availableSlots, isLoading } = useAvailableSlots(
    formData.professionalId,
    formData.preferredDate
  );

  const availableTimeSlots = availableSlots.filter(slot => 
    slot.available && 
    (!slot.currentAppointments || slot.currentAppointments < (slot.maxAppointments || 10))
  );

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="professional">Profissional</Label>
        <Select
          value={formData.professionalId}
          onValueChange={(value) => {
            onChange("professionalId", value);
            onChange("preferredTime", "");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o profissional" />
          </SelectTrigger>
          <SelectContent>
            {professionals.map((prof) => (
              <SelectItem key={prof.id} value={prof.id}>
                {prof.name} - {prof.profession}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="preferredDate">Data Preferencial</Label>
          <Calendar
            mode="single"
            selected={formData.preferredDate}
            onSelect={(date) => {
              onChange("preferredDate", date);
              onChange("preferredTime", "");
            }}
            className="rounded-md border"
            locale={ptBR}
            disabled={(date) => {
              const isBeforeToday = date < new Date(new Date().setHours(0, 0, 0, 0));
              const unavailableDays = JSON.parse(
                localStorage.getItem(`unavailableDays-${formData.professionalId}`) || '[]'
              );
              const isUnavailable = unavailableDays.some(
                (unavailableDate: string) =>
                  new Date(unavailableDate).toDateString() === date.toDateString()
              );
              return isBeforeToday || isUnavailable;
            }}
          />
        </div>

        <div>
          <Label htmlFor="preferredTime">Horário Preferencial</Label>
          <Select
            value={formData.preferredTime}
            onValueChange={(value) => onChange("preferredTime", value)}
            disabled={!formData.preferredDate || !availableTimeSlots.length}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um horário disponível" />
            </SelectTrigger>
            <SelectContent>
              {availableTimeSlots.map((slot) => (
                <SelectItem key={slot.time} value={slot.time}>
                  {slot.time} ({slot.currentAppointments || 0}/{slot.maxAppointments || 10} agendamentos)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isLoading && (
            <p className="text-sm text-muted-foreground mt-1">
              Carregando horários disponíveis...
            </p>
          )}
          {!isLoading && !availableTimeSlots.length && formData.preferredDate && (
            <p className="text-sm text-muted-foreground mt-1">
              Não há horários disponíveis para esta data
            </p>
          )}
        </div>
      </div>
    </div>
  );
};