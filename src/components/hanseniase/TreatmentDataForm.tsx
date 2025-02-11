
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { format } from "date-fns";

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
          type="text"
          placeholder="DD/MM/AAAA"
          id="treatment_start_date"
          value={formData.treatment_start_date ? format(new Date(formData.treatment_start_date), "dd/MM/yyyy") : ""}
          onChange={(e) => {
            const value = e.target.value;
            if (value) {
              // Convert DD/MM/YYYY to YYYY-MM-DD for Date object
              const [day, month, year] = value.split('/');
              if (day && month && year && year.length === 4) {
                const dateStr = `${year}-${month}-${day}`;
                const date = new Date(dateStr);
                if (!isNaN(date.getTime()) && date <= new Date()) {
                  onChange("treatment_start_date", date.toISOString());
                }
              }
            }
          }}
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
