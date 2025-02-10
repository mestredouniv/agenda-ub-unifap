
import { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HanseniaseTreatment } from "@/types/patient";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NewTreatmentDialog } from "./NewTreatmentDialog";
import { TreatmentTableBody } from "./TreatmentTableBody";

interface TreatmentTableProps {
  patientId: string;
}

export const TreatmentTable = ({ patientId }: TreatmentTableProps) => {
  const [treatments, setTreatments] = useState<HanseniaseTreatment[]>([]);
  const [record, setRecord] = useState<string | null>(null);

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

  const handleAddTreatment = async (data: {
    month: string;
    date: Date;
    status: string;
    notes: string;
  }) => {
    if (!record) {
      toast.error("Registro não encontrado");
      return;
    }

    try {
      const { error } = await supabase
        .from('hanseniase_treatments')
        .insert({
          record_id: record,
          treatment_month: parseInt(data.month),
          treatment_date: data.date.toISOString(),
          treatment_status: data.status,
          notes: data.notes,
        });

      if (error) throw error;

      toast.success("Acompanhamento registrado com sucesso!");
      fetchTreatments(record);
    } catch (error) {
      console.error('Error adding treatment:', error);
      toast.error("Erro ao registrar acompanhamento");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <NewTreatmentDialog onAddTreatment={handleAddTreatment} />
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
          <TreatmentTableBody treatments={treatments} />
        </Table>
      </div>
    </div>
  );
};
