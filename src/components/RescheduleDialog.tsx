import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ptBR } from "date-fns/locale";

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestedDate: Date | undefined;
  suggestedTime: string;
  message: string;
  onDateSelect: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  onMessageChange: (message: string) => void;
  onSave: () => void;
}

export const RescheduleDialog = ({
  open,
  onOpenChange,
  suggestedDate,
  suggestedTime,
  message,
  onDateSelect,
  onTimeChange,
  onMessageChange,
  onSave,
}: RescheduleDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sugerir Nova Data</DialogTitle>
          <DialogDescription>
            Selecione uma nova data e horário para o paciente
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nova Data</label>
            <Calendar
              mode="single"
              selected={suggestedDate}
              onSelect={onDateSelect}
              className="rounded-md border"
              locale={ptBR}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Novo Horário</label>
            <Input
              type="time"
              value={suggestedTime}
              onChange={(e) => onTimeChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mensagem para o Paciente</label>
            <Textarea
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="Ex: Por favor, confirme se este horário é adequado"
            />
          </div>
          <Button onClick={onSave} className="w-full">
            Salvar Nova Data
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};