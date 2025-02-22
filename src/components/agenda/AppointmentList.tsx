
import { Card } from "@/components/ui/card";
import { Appointment } from "@/types/appointment";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";

interface AppointmentListProps {
  appointments: Appointment[];
  viewMode: 'list' | 'grid';
  onSuccess: () => void;
  isLoading: boolean;
}

export const AppointmentList = ({
  appointments,
  viewMode,
  onSuccess,
  isLoading
}: AppointmentListProps) => {
  if (isLoading) {
    return <div>Carregando agendamentos...</div>;
  }

  if (appointments.length === 0) {
    return (
      <Card className="p-8 text-center text-gray-500">
        Nenhum agendamento para hoje
      </Card>
    );
  }

  return (
    <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onSuccess={onSuccess}
        />
      ))}
    </div>
  );
};
