
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface AppointmentFormData {
  patientName: string;
  time: string;
  appointmentType: string;
  birthDate: string;
  hasRecord: "yes" | "no" | "electronic";
  responsible: string;
  phone: string;
}

interface AppointmentFormProps {
  onSubmit: (data: AppointmentFormData) => void;
  initialData: AppointmentFormData | null;
}

const AppointmentForm = ({ onSubmit, initialData }: AppointmentFormProps) => {
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientName: initialData?.patientName || "",
    time: initialData?.time || "",
    appointmentType: initialData?.appointmentType || "",
    birthDate: initialData?.birthDate || "",
    hasRecord: initialData?.hasRecord || "no",
    responsible: initialData?.responsible || "",
    phone: initialData?.phone || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <Input
          placeholder="Nome do Paciente"
          value={formData.patientName}
          onChange={(e) =>
            setFormData({ ...formData, patientName: e.target.value })
          }
        />
        <Input
          type="time"
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
        />
        <Input
          placeholder="Tipo de Consulta"
          value={formData.appointmentType}
          onChange={(e) =>
            setFormData({ ...formData, appointmentType: e.target.value })
          }
        />
        <Input
          type="date"
          value={formData.birthDate}
          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
        />
        <Input
          placeholder="Telefone para Contato"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <div className="space-y-2">
          <label className="text-sm font-medium">Prontuário</label>
          <Select
            value={formData.hasRecord}
            onValueChange={(value: "yes" | "no" | "electronic") =>
              setFormData({ ...formData, hasRecord: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Possui prontuário?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Sim</SelectItem>
              <SelectItem value="no">Não</SelectItem>
              <SelectItem value="electronic">Prontuário Eletrônico</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="Responsável"
          value={formData.responsible}
          onChange={(e) =>
            setFormData({ ...formData, responsible: e.target.value })
          }
        />
      </div>
      <Button type="submit" className="w-full">
        {initialData ? "Salvar Alterações" : "Agendar Consulta"}
      </Button>
    </form>
  );
};

export default AppointmentForm;
