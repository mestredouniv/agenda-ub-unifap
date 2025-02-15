
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

interface PatientInfoFormProps {
  patientName: string;
  birthDate: Date | undefined;
  phone: string;
  onPatientNameChange: (value: string) => void;
  onBirthDateSelect: (date: Date | undefined) => void;
  onPhoneChange: (value: string) => void;
}

export const PatientInfoForm = ({
  patientName,
  birthDate,
  phone,
  onPatientNameChange,
  onBirthDateSelect,
  onPhoneChange,
}: PatientInfoFormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="patientName">Nome do Paciente *</Label>
        <Input
          id="patientName"
          value={patientName}
          onChange={(e) => onPatientNameChange(e.target.value)}
          required
        />
      </div>

      <div>
        <Label>Data de Nascimento *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !birthDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {birthDate ? (
                format(birthDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
              ) : (
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={birthDate}
              onSelect={onBirthDateSelect}
              disabled={(date) => date > new Date()}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label htmlFor="phone">Telefone *</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          required
        />
      </div>
    </div>
  );
};
