
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { HanseniaseTreatment } from "@/types/patient";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TreatmentTableProps {
  patientId: string;
}

export const TreatmentTable = ({ patientId }: TreatmentTableProps) => {
  const [treatments, setTreatments] = useState<HanseniaseTreatment[]>([]);
  const [record, setRecord] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedMonth, setSelectedMonth] = useState<string>();
  const [status, setStatus] = useState<string>("completed");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchRecord = async () => {
      const { data, error } = await supabase
        .from('hanseniase_records')
        .select()
        .eq('patient_id', patientId)
        .single();

      if (error) {
        console.error('Error fetching record:', error);
        return;
      }

      if (data) {
        setRecord(data.id);
        fetchTreatments(data.id);
      }
    };

    fetchRecord();
  }, [patientId]);

  const fetchTreatments = async (recordId: string) => {
    const { data, error } = await supabase
      .from('hanseniase_treatments')
      .select()
      .eq('record_id', recordId)
      .order('treatment_month', { ascending: true });

    if (error) {
      console.error('Error fetching treatments:', error);
      return;
    }

    setTreatments(data || []);
  };

  const handleAddTreatment = async () => {
    if (!record || !selectedDate || !selectedMonth) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    try {
      const { error } = await supabase
        .from('hanseniase_treatments')
        .insert({
          record_id: record,
          treatment_month: parseInt(selectedMonth),
          treatment_date: selectedDate.toISOString(),
          treatment_status: status,
          notes,
        });

      if (error) throw error;

      toast.success("Acompanhamento registrado com sucesso!");
      fetchTreatments(record);
      setSelectedDate(undefined);
      setSelectedMonth(undefined);
      setStatus("completed");
      setNotes("");
    } catch (error) {
      console.error('Error adding treatment:', error);
      toast.error("Erro ao registrar acompanhamento");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
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
              <Button onClick={handleAddTreatment} className="w-full">
                Registrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mês</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Observações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {treatments.map((treatment) => (
              <TableRow key={treatment.id}>
                <TableCell>{treatment.treatment_month}º Mês</TableCell>
                <TableCell>
                  {format(new Date(treatment.treatment_date), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  {treatment.treatment_status === "completed" && "Concluído"}
                  {treatment.treatment_status === "pending" && "Pendente"}
                  {treatment.treatment_status === "missed" && "Faltou"}
                </TableCell>
                <TableCell>{treatment.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
