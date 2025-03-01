
import { Button } from "@/components/ui/button";

interface AppointmentSubmitButtonProps {
  isLoading: boolean;
}

export const AppointmentSubmitButton = ({ isLoading }: AppointmentSubmitButtonProps) => {
  return (
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? "Agendando..." : "Agendar Consulta"}
    </Button>
  );
};
