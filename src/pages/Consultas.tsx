import { useDisplayState } from "@/hooks/useDisplayState";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Patient {
  id: number;
  name: string;
  professional: string;
  time: string;
  status: 'waiting' | 'triage' | 'in_progress' | 'completed';
  priority: 'normal' | 'priority';
}

const Consultas = () => {
  const { toast } = useToast();
  const setCurrentPatient = useDisplayState((state) => state.setCurrentPatient);

  const initialPatients: Patient[] = [
    {
      id: 1,
      name: "João Silva",
      professional: "Dr. Anderson",
      time: "09:00",
      status: 'waiting',
      priority: 'normal',
    },
    {
      id: 2,
      name: "Maria Santos",
      professional: "Dra. Liliany",
      time: "09:30",
      status: 'waiting',
      priority: 'priority',
    },
    {
      id: 3,
      name: "Pedro Oliveira",
      professional: "Dr. André",
      time: "10:00",
      status: 'waiting',
      priority: 'normal',
    },
  ];

  const handleCallNext = (patient: Patient) => {
    setCurrentPatient({
      name: patient.name,
      status: 'waiting',
      professional: patient.professional,
    });
    toast({
      title: "Paciente chamado",
      description: "O display foi atualizado com o próximo paciente.",
    });
  };

  const handleStartTriage = (patient: Patient) => {
    setCurrentPatient({
      name: patient.name,
      status: 'triage',
      professional: patient.professional,
    });
    toast({
      title: "Triagem iniciada",
      description: "Paciente encaminhado para triagem.",
    });
  };

  const handleStartAppointment = (patient: Patient) => {
    setCurrentPatient({
      name: patient.name,
      status: 'in_progress',
      professional: patient.professional,
    });
    toast({
      title: "Consulta iniciada",
      description: "Paciente em atendimento.",
    });
  };

  const getStatusBadge = (status: Patient['status']) => {
    const statusConfig = {
      waiting: { label: 'Aguardando', variant: 'secondary' as const },
      triage: { label: 'Em Triagem', variant: 'outline' as const },
      in_progress: { label: 'Em Atendimento', variant: 'default' as const },
      completed: { label: 'Finalizado', variant: 'secondary' as const },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto p-8">
      <BackToHomeButton />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Consultas do Dia</h1>
        <p className="text-sm text-muted-foreground">
          {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow">
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
            {initialPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.time}</TableCell>
                <TableCell>{patient.name}</TableCell>
                <TableCell>{patient.professional}</TableCell>
                <TableCell>{getStatusBadge(patient.status)}</TableCell>
                <TableCell>
                  <Badge variant={patient.priority === 'priority' ? "destructive" : "secondary"}>
                    {patient.priority === 'priority' ? 'Prioritário' : 'Normal'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleCallNext(patient)}
                      disabled={patient.status !== 'waiting'}
                    >
                      Chamar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleStartTriage(patient)}
                      disabled={patient.status !== 'waiting'}
                    >
                      Triagem
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleStartAppointment(patient)}
                      disabled={patient.status !== 'triage'}
                    >
                      Iniciar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Consultas;