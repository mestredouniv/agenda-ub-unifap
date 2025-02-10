
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Trash2 } from "lucide-react";
import { Patient } from "@/types/patient";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SearchResultsTableProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onDeletePatient: (patientId: string) => void;
}

export const SearchResultsTable = ({
  patients,
  onSelectPatient,
  onDeletePatient,
}: SearchResultsTableProps) => {
  const handleDelete = async (patientId: string) => {
    if (!confirm("Tem certeza que deseja excluir este paciente?")) return;

    try {
      const { error: recordError } = await supabase
        .from('hanseniase_records')
        .delete()
        .eq('patient_id', patientId);

      if (recordError) throw recordError;

      const { error: patientError } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);

      if (patientError) throw patientError;

      onDeletePatient(patientId);
      toast.success("Paciente excluído com sucesso");
    } catch (error) {
      console.error('Erro ao excluir paciente:', error);
      toast.error("Erro ao excluir paciente");
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>CPF</TableHead>
          <TableHead>SUS</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => (
          <TableRow key={patient.id}>
            <TableCell>{patient.full_name}</TableCell>
            <TableCell>{patient.cpf}</TableCell>
            <TableCell>{patient.sus_number}</TableCell>
            <TableCell>{patient.phone}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onSelectPatient(patient)}
                >
                  <Search className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(patient.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
