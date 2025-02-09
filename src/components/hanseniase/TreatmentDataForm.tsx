
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TreatmentFormData {
  pb: string;
  mb: string;
  classification: string;
  treatment_start_date: string;
}

interface TreatmentDataFormProps {
  formData: TreatmentFormData;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
}

export const TreatmentDataForm = ({
  formData,
  onChange,
  onSubmit,
}: TreatmentDataFormProps) => {
  return (
    <div className="space-y-4">
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
          id="treatment_start_date"
          type="date"
          value={formData.treatment_start_date}
          onChange={(e) => onChange("treatment_start_date", e.target.value)}
        />
      </div>
      <Button onClick={onSubmit} className="w-full">
        <Plus className="mr-2" />
        Registrar Paciente
      </Button>
    </div>
  );
};
