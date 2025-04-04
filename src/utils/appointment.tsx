
import { Badge } from "@/components/ui/badge";
import { Appointment } from "@/types/appointment";

export const getStatusBadge = (status: Appointment['display_status']) => {
  const statusConfig = {
    waiting: { label: 'Aguardando', variant: 'secondary' as const },
    triage: { label: 'Em Triagem', variant: 'outline' as const },
    in_progress: { label: 'Em Atendimento', variant: 'default' as const },
    completed: { label: 'Finalizado', variant: 'secondary' as const },
  };

  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};
