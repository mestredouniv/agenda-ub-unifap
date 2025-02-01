import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PersonalDataFormProps {
  formData: {
    patientName: string;
    cpf: string;
    sus: string;
    age: string;
    phone: string;
    responsible?: string;
  };
  onChange: (field: string, value: string) => void;
}

export const PersonalDataForm = ({ formData, onChange }: PersonalDataFormProps) => {
  const isMinor = parseInt(formData.age) < 18;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="patientName">Nome Completo</Label>
          <Input
            id="patientName"
            value={formData.patientName}
            onChange={(e) => onChange("patientName", e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="age">Idade</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => onChange("age", e.target.value)}
            required
          />
        </div>
      </div>

      {isMinor && (
        <div>
          <Label htmlFor="responsible">Nome do Responsável</Label>
          <Input
            id="responsible"
            value={formData.responsible}
            onChange={(e) => onChange("responsible", e.target.value)}
            required
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            value={formData.cpf}
            onChange={(e) => onChange("cpf", e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="sus">Cartão SUS</Label>
          <Input
            id="sus"
            value={formData.sus}
            onChange={(e) => onChange("sus", e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="phone">Telefone de Contato</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          required
        />
      </div>
    </div>
  );
};