import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AppointmentRequest {
  id: string;
  patientName: string;
  cpf: string;
  preferredDate: string;
  preferredTime: string;
  status: "pending" | "approved" | "rejected" | "rescheduled";
  professionalId: string;
}

const statusMap = {
  pending: { label: "Aguardando Aprovação", color: "bg-yellow-100 text-yellow-800" },
  approved: { label: "Aprovado", color: "bg-green-100 text-green-800" },
  rejected: { label: "Rejeitado", color: "bg-red-100 text-red-800" },
  rescheduled: { label: "Nova Data Sugerida", color: "bg-blue-100 text-blue-800" },
};

export const AppointmentRequestsReport = () => {
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);

  useEffect(() => {
    const loadAppointments = () => {
      const storedAppointments = JSON.parse(localStorage.getItem("appointments") || "[]");
      const currentDate = new Date();
      
      // Filter out past appointments and sort by date
      const activeAppointments = storedAppointments
        .filter((app: AppointmentRequest) => {
          const appointmentDate = new Date(app.preferredDate);
          return appointmentDate >= currentDate;
        })
        .sort((a: AppointmentRequest, b: AppointmentRequest) => {
          return new Date(a.preferredDate).getTime() - new Date(b.preferredDate).getTime();
        });

      setAppointments(activeAppointments);
    };

    loadAppointments();
    // Refresh the list every minute to check for updates
    const interval = setInterval(loadAppointments, 60000);

    return () => clearInterval(interval);
  }, []);

  const formatCPF = (cpf: string) => {
    return cpf.slice(0, 3) + ".***.***-**";
  };

  const formatName = (name: string) => {
    return name.split(" ")[0];
  };

  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="py-4">
          <p className="text-center text-gray-500">
            Não há solicitações de agendamento ativas no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Espera - Solicitações Ativas</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Data Preferencial</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>{formatName(appointment.patientName)}</TableCell>
                <TableCell>{formatCPF(appointment.cpf)}</TableCell>
                <TableCell>
                  {format(new Date(appointment.preferredDate), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell>{appointment.preferredTime}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={statusMap[appointment.status].color}
                  >
                    {statusMap[appointment.status].label}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};