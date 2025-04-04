
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PersonalDataFormProps } from "@/types/appointment";

export const PersonalDataForm = ({ formData, onChange, errors = {} }: PersonalDataFormProps) => {
  const isMinor = parseInt(formData.age) < 18;

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange("birth_date", e.target.value);
    
    // Calcular idade automaticamente quando a data de nascimento muda
    if (e.target.value) {
      const birthDate = new Date(e.target.value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      onChange("age", age.toString());
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="patientName">Nome Completo</Label>
          <Input
            id="patientName"
            value={formData.patientName}
            onChange={(e) => onChange("patientName", e.target.value)}
            className={errors.patientName ? "border-red-500" : ""}
            required
          />
        </div>

        <div>
          <Label htmlFor="birth_date">Data de Nascimento</Label>
          <Input
            id="birth_date"
            type="date"
            value={formData.birth_date || ""}
            onChange={handleDateChange}
            className={errors.birth_date ? "border-red-500" : ""}
            max={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            value={formData.cpf}
            onChange={(e) => onChange("cpf", e.target.value)}
            className={errors.cpf ? "border-red-500" : ""}
            required
          />
        </div>

        <div>
          <Label htmlFor="sus">Cartão SUS</Label>
          <Input
            id="sus"
            value={formData.sus}
            onChange={(e) => onChange("sus", e.target.value)}
            className={errors.sus ? "border-red-500" : ""}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Telefone de Contato</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            className={errors.phone ? "border-red-500" : ""}
            required
          />
        </div>

        <div>
          <Label htmlFor="age">Idade</Label>
          <Input
            id="age"
            value={formData.age}
            readOnly
            className={errors.age ? "border-red-500" : "bg-gray-100"}
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
            className={errors.responsible ? "border-red-500" : ""}
            required
          />
        </div>
      )}
    </div>
  );
};
