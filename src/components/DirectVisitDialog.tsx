import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface DirectVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  onMessageChange: (message: string) => void;
  onSave: () => void;
}

export const DirectVisitDialog = ({
  open,
  onOpenChange,
  message,
  onMessageChange,
  onSave,
}: DirectVisitDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar Visita Direta à UBS</DialogTitle>
          <DialogDescription>
            Adicione uma mensagem explicando o motivo da visita direta
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Mensagem para o Paciente</label>
            <Textarea
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="Ex: Por favor, compareça à UBS para uma avaliação inicial"
            />
          </div>
          <Button onClick={onSave} className="w-full">
            Solicitar Visita Direta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};