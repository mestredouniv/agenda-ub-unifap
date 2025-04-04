
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AppointmentFormData {
  patientName: string;
  birthDate: string;
  time: string;
  appointmentType: string;
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
    birthDate: initialData?.birthDate || "",
    time: initialData?.time || "",
    appointmentType: initialData?.appointmentType || "",
    hasRecord: initialData?.hasRecord || "no",
    responsible: initialData?.responsible || "",
    phone: initialData?.phone || "",
  });

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const utcDate = new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        12, 0, 0, 0
      ));
      setFormData({ ...formData, birthDate: utcDate.toISOString() });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.birthDate) {
      alert("Por favor, selecione a data de nascimento");
      return;
    }
    onSubmit(formData);
  };

  const maxDate = new Date();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Nome do Paciente</label>
          <Input
            placeholder="Nome do Paciente"
            value={formData.patientName}
            onChange={(e) =>
              setFormData({ ...formData, patientName: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Data de Nascimento</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.birthDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.birthDate ? (
                  format(new Date(formData.birthDate), "dd/MM/yyyy", { locale: ptBR })
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.birthDate ? new Date(formData.birthDate) : undefined}
                onSelect={handleDateSelect}
                disabled={(date) => date > maxDate}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Horário</label>
          <Input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Tipo de Consulta</label>
          <Input
            placeholder="Tipo de Consulta"
            value={formData.appointmentType}
            onChange={(e) =>
              setFormData({ ...formData, appointmentType: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Telefone para Contato</label>
          <Input
            placeholder="Telefone para Contato"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>

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

        <div>
          <label className="text-sm font-medium mb-1 block">Responsável</label>
          <Input
            placeholder="Responsável"
            value={formData.responsible}
            onChange={(e) =>
              setFormData({ ...formData, responsible: e.target.value })
            }
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        {initialData ? "Salvar Alterações" : "Agendar Consulta"}
      </Button>
    </form>
  );
};

export default AppointmentForm;
