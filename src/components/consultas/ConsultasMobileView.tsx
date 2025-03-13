
import { Card } from "@/components/ui/card";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";

interface ConsultasMobileViewProps {
  appointments: any[];
  isLoading: boolean;
  onSuccess: () => void;
}

export const ConsultasMobileView = ({ 
  appointments, 
  isLoading, 
  onSuccess 
}: ConsultasMobileViewProps) => {
  if (isLoading) {
    return <div className="p-4 text-center">Carregando...</div>;
  }
  
  if (appointments.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-center text-muted-foreground">
          Não há consultas agendadas para este dia
        </p>
      </Card>
    );
  }

  return (
    <>
      {appointments.map((appointment) => (
        <AppointmentCard 
          key={appointment.id} 
          appointment={appointment} 
          onSuccess={onSuccess}
        />
      ))}
    </>
  );
};
