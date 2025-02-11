
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
          <Label htmlFor="pb">PB</Label>
          <Input
            id="pb"
            value={formData.pb}
            onChange={(e) => onChange("pb", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="mb">MB</Label>
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
        <Input
          type="date"
          id="treatment_start_date"
          value={formData.treatment_start_date ? format(new Date(formData.treatment_start_date), "yyyy-MM-dd") : ""}
          onChange={(e) => {
            if (e.target.value) {
              const date = new Date(e.target.value);
              onChange("treatment_start_date", date.toISOString());
            }
          }}
          max={format(new Date(), "yyyy-MM-dd")}
        />
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
