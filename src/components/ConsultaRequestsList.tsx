
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from "@/types/appointment";

interface ConsultaRequestsListProps {
  requests: Appointment[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const ConsultaRequestsList = ({
  requests,
  onApprove,
  onReject,
}: ConsultaRequestsListProps) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return <Badge variant="warning">Aguardando</Badge>;
      case "completed":
        return <Badge variant="success">Aprovado</Badge>;
      case "missed":
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Paciente</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                {format(new Date(request.appointment_date), "dd 'de' MMMM", {
                  locale: ptBR,
                })}
                <br />
                <span className="text-sm text-muted-foreground">
                  {request.appointment_time}
                </span>
              </TableCell>
              <TableCell>
                {request.patient_name}
                <br />
                <span className="text-sm text-muted-foreground">
                  {request.has_record ? "Possui prontuário" : "Sem prontuário"}
                </span>
              </TableCell>
              <TableCell>{getStatusBadge(request.display_status)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onApprove(request.id)}
                  >
                    Aprovar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReject(request.id)}
                  >
                    Rejeitar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
