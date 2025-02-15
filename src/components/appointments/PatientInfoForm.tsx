
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PatientInfoFormProps {
  patientName: string;
  birthDate: string;
  phone: string;
  onPatientNameChange: (value: string) => void;
  onBirthDateChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
}

export const PatientInfoForm = ({
  patientName,
  birthDate,
  phone,
  onPatientNameChange,
  onBirthDateChange,
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
        <Label htmlFor="birthDate">Data de Nascimento *</Label>
        <Input
          id="birthDate"
          type="date"
          value={birthDate}
          onChange={(e) => onBirthDateChange(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          required
        />
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
