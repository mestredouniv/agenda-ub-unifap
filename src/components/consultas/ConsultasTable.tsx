
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getStatusBadge } from "@/utils/appointment";
import { AppointmentActions } from "@/components/appointments/AppointmentActions";

interface ConsultasTableProps {
  appointments: any[];
  onSuccess: () => void;
}

export const ConsultasTable = ({ appointments, onSuccess }: ConsultasTableProps) => {
  if (appointments.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Horário</TableHead>
            <TableHead>Paciente</TableHead>
            <TableHead>Profissional</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              Não há consultas agendadas para este dia
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Horário</TableHead>
          <TableHead>Paciente</TableHead>
          <TableHead>Profissional</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Prioridade</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((appointment) => (
          <TableRow key={appointment.id}>
            <TableCell>{appointment.appointment_time}</TableCell>
            <TableCell>{appointment.patient_name}</TableCell>
            <TableCell>{appointment.professionals.name}</TableCell>
            <TableCell>{getStatusBadge(appointment.display_status)}</TableCell>
            <TableCell>
              <Badge variant={appointment.priority === 'priority' ? "destructive" : "secondary"}>
                {appointment.priority === 'priority' ? 'Prioritário' : 'Normal'}
              </Badge>
            </TableCell>
            <TableCell>
              <AppointmentActions 
                appointment={appointment}
                onSuccess={onSuccess}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
