
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";

interface NewTreatmentDialogProps {
  onAddTreatment: (data: {
    month: string;
    date: Date;
    status: string;
    notes: string;
  }) => void;
}

export const NewTreatmentDialog = ({ onAddTreatment }: NewTreatmentDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedMonth, setSelectedMonth] = useState<string>();
  const [status, setStatus] = useState<string>("completed");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (!selectedDate || !selectedMonth) return;
    
    onAddTreatment({
      month: selectedMonth,
      date: selectedDate,
      status,
      notes,
    });

    setSelectedDate(undefined);
    setSelectedMonth(undefined);
    setStatus("completed");
    setNotes("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Acompanhamento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Acompanhamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Mês do Tratamento</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <SelectItem key={month} value={month.toString()}>
                    {month}º Mês
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Data do Atendimento</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="missed">Faltou</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Observações</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações se necessário"
            />
          </div>
          <Button onClick={handleSubmit} className="w-full">
            Registrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
