
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdditionalInfoFormProps {
  isMinor: boolean;
  responsibleName: string;
  hasRecord: "yes" | "no" | "electronic" | "";
  onResponsibleNameChange: (value: string) => void;
  onHasRecordChange: (value: "yes" | "no" | "electronic") => void;
}

export const AdditionalInfoForm = ({
  isMinor,
  responsibleName,
  hasRecord,
  onResponsibleNameChange,
  onHasRecordChange,
}: AdditionalInfoFormProps) => {
  return (
    <div className="space-y-4">
      {isMinor && (
        <div>
          <Label htmlFor="responsibleName">Nome do Responsável *</Label>
          <Input
            id="responsibleName"
            value={responsibleName}
            onChange={(e) => onResponsibleNameChange(e.target.value)}
            required
          />
        </div>
      )}

      <div>
        <Label>Possui Prontuário? *</Label>
        <Select
          value={hasRecord}
          onValueChange={onHasRecordChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma opção" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Sim</SelectItem>
            <SelectItem value="no">Não</SelectItem>
            <SelectItem value="electronic">Prontuário Eletrônico</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
