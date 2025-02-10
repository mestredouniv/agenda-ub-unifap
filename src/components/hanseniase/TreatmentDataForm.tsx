
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TreatmentFormData {
  pb: string;
  mb: string;
  classification: string;
  treatment_start_date: string;
}

interface TreatmentDataFormProps {
  formData: TreatmentFormData;
  onChange: (field: string, value: string) => void;
  onSubmit?: () => void;
  mode?: "create" | "edit";
}

export const TreatmentDataForm = ({
  formData,
  onChange,
  onSubmit,
  mode = "create"
}: TreatmentDataFormProps) => {
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onChange("treatment_start_date", date.toISOString());
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pb">PB (Pronto para Baixar)</Label>
          <Input
            id="pb"
            value={formData.pb}
            onChange={(e) => onChange("pb", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="mb">MB (Mantenha Baixado)</Label>
          <Input
            id="mb"
            value={formData.mb}
            onChange={(e) => onChange("mb", e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="classification">Classificação</Label>
        <Input
          id="classification"
          value={formData.classification}
          onChange={(e) => onChange("classification", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="treatment_start_date">Data de Início</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.treatment_start_date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.treatment_start_date ? (
                format(new Date(formData.treatment_start_date), "dd/MM/yyyy")
              ) : (
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.treatment_start_date ? new Date(formData.treatment_start_date) : undefined}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      {mode === "create" && onSubmit && (
        <Button 
          onClick={onSubmit} 
          className="w-full"
          disabled={!formData.treatment_start_date}
        >
          <Plus className="mr-2" />
          Registrar Paciente
        </Button>
      )}
    </div>
  );
};
