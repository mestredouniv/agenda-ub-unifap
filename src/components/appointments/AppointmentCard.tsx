
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Appointment } from "@/types/appointment";
import { AppointmentActions } from "./AppointmentActions";
import { getStatusBadge } from "@/utils/appointment";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AppointmentCardProps {
  appointment: Appointment;
  onSuccess?: () => void;
}

export const AppointmentCard = ({ appointment, onSuccess }: AppointmentCardProps) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return dateString;
    }
  };

  return (
    <Card className="p-4 mb-4">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{appointment.patient_name}</h3>
            <p className="text-sm text-gray-500">
              Data de Nascimento: {formatDate(appointment.birth_date)}
            </p>
            <p className="text-sm text-gray-500">
              Horário: {appointment.appointment_time}
            </p>
          </div>
          {getStatusBadge(appointment.display_status)}
        </div>
        <div className="text-sm text-gray-600">
          <p>Profissional: {appointment.professional.name}</p>
          {appointment.notes && (
            <p className="mt-2 text-gray-700">
              Observações: {appointment.notes}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <AppointmentActions appointment={appointment} onSuccess={onSuccess} />
        </div>
      </div>
    </Card>
  );
};
