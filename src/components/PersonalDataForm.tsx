import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PersonalDataFormProps {
  formData: {
    patientName: string;
    cpf: string;
    sus: string;
    age: string;
    phone: string;
    responsible: string;
    professionalId: string;
    preferredDate: Date | undefined;
    preferredTime: string;
  };
  onChange: (field: string, value: any) => void;
  errors?: Record<string, boolean>;
}

export const PersonalDataForm = ({ formData, onChange, errors = {} }: PersonalDataFormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="patientName">Nome do Paciente</Label>
        <Input
          id="patientName"
          value={formData.patientName}
          onChange={(e) => onChange("patientName", e.target.value)}
          className={errors.patientName ? "border-red-500" : ""}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            value={formData.cpf}
            onChange={(e) => onChange("cpf", e.target.value)}
            className={errors.cpf ? "border-red-500" : ""}
          />
        </div>
        <div>
          <Label htmlFor="sus">Cartão SUS</Label>
          <Input
            id="sus"
            value={formData.sus}
            onChange={(e) => onChange("sus", e.target.value)}
            className={errors.sus ? "border-red-500" : ""}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="age">Idade</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => onChange("age", e.target.value)}
            className={errors.age ? "border-red-500" : ""}
          />
        </div>
        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            className={errors.phone ? "border-red-500" : ""}
          />
        </div>
      </div>
      {parseInt(formData.age) < 18 && (
        <div>
          <Label htmlFor="responsible">Responsável</Label>
          <Input
            id="responsible"
            value={formData.responsible}
            onChange={(e) => onChange("responsible", e.target.value)}
            className={errors.responsible ? "border-red-500" : ""}
          />
        </div>
      )}
    </div>
  );
};