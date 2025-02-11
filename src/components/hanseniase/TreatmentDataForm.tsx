
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { format, isValid, parse } from "date-fns";

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
  const handleDateChange = (value: string) => {
    try {
      // Remove any non-numeric characters except forward slash
      const cleanValue = value.replace(/[^\d/]/g, '');
      
      // Automatically add slashes after day and month
      let formattedValue = cleanValue;
      if (cleanValue.length >= 2 && !cleanValue.includes('/')) {
        formattedValue = cleanValue.slice(0, 2) + '/' + cleanValue.slice(2);
      }
      if (cleanValue.length >= 5 && formattedValue.split('/').length === 2) {
        const parts = formattedValue.split('/');
        formattedValue = parts[0] + '/' + parts[1].slice(0, 2) + '/' + parts[1].slice(2);
      }

      // Parse the date using date-fns
      if (formattedValue.split('/').length === 3) {
        const parsedDate = parse(formattedValue, 'dd/MM/yyyy', new Date());
        
        if (isValid(parsedDate) && parsedDate <= new Date()) {
          onChange("treatment_start_date", parsedDate.toISOString());
        }
      }
      
      // Update the input value even if the date is not valid yet
      // This allows the user to type the complete date
      const input = document.getElementById('treatment_start_date') as HTMLInputElement;
      if (input) {
        input.value = formattedValue;
      }
    } catch (error) {
      console.error('Error parsing date:', error);
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
          type="text"
          placeholder="DD/MM/AAAA"
          id="treatment_start_date"
          value={formData.treatment_start_date ? format(new Date(formData.treatment_start_date), "dd/MM/yyyy") : ""}
          onChange={(e) => handleDateChange(e.target.value)}
          maxLength={10}
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
