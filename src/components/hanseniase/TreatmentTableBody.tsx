
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { HanseniaseTreatment } from "@/types/patient";
import { format } from "date-fns";

interface TreatmentTableBodyProps {
  treatments: HanseniaseTreatment[];
}

export const TreatmentTableBody = ({ treatments }: TreatmentTableBodyProps) => {
  return (
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
  );
};
