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
  id: number;
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

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="professional">Profissional</Label>
        <Select
          value={formData.professionalId}
          onValueChange={(value) => onChange("professionalId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o profissional" />
          </SelectTrigger>
          <SelectContent>
            {professionals.map((prof) => (
              <SelectItem key={prof.id} value={prof.id.toString()}>
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
            onSelect={(date) => onChange("preferredDate", date)}
            className="rounded-md border"
            locale={ptBR}
            disabled={(date) => date < new Date()}
          />
        </div>

        <div>
          <Label htmlFor="preferredTime">Horário Preferencial</Label>
          <Select
            value={formData.preferredTime}
            onValueChange={(value) => onChange("preferredTime", value)}
            disabled={!formData.preferredDate || !availableSlots}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um horário disponível" />
            </SelectTrigger>
            <SelectContent>
              {availableSlots?.map((slot) => (
                <SelectItem
                  key={slot.time}
                  value={slot.time}
                  disabled={!slot.available}
                >
                  {slot.time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isLoading && (
            <p className="text-sm text-muted-foreground mt-1">
              Carregando horários disponíveis...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};