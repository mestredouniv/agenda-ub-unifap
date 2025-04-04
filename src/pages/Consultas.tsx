import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { professionals } from "@/data/professionals";
import { Card } from "@/components/ui/card";

interface Patient {
  id: string;
  name: string;
  professional: string;
  professionalId: string;
  time: string;
  status: 'waiting' | 'triage' | 'in_progress' | 'completed';
  priority: 'normal' | 'priority';
  responsible?: string;
}

const Consultas = () => {
  const { toast } = useToast();
  const setCurrentPatient = useDisplayState((state) => state.setCurrentPatient);
  const [selectedProfessional, setSelectedProfessional] = useState("all");
  const [appointments, setAppointments] = useState<Patient[]>([]);

  useEffect(() => {
    const loadAppointments = () => {
      const storedAppointments = JSON.parse(localStorage.getItem("appointments") || "[]");
      const today = new Date().toISOString().split('T')[0];
      
      const activeAppointments = storedAppointments
        .filter((app: any) => app.preferredDate?.split('T')[0] === today && app.status === "approved")
        .map((app: any) => ({
          id: app.id,
          name: app.patientName,
          professional: professionals.find(p => p.id === app.professionalId)?.name || "Não encontrado",
          professionalId: app.professionalId,
          time: app.preferredTime,
          status: 'waiting' as const,
          priority: 'normal' as const,
          responsible: app.responsible,
        }));

      setAppointments(activeAppointments);
    };

    loadAppointments();
    window.addEventListener("storage", loadAppointments);
    return () => window.removeEventListener("storage", loadAppointments);
  }, []);

  const filteredAppointments = appointments.filter(appointment => 
    selectedProfessional === "all" || appointment.professionalId === selectedProfessional
  );

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
    window.open('/display', '_blank');
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
    window.open('/display', '_blank');
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
    window.open('/display', '_blank');
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

  // Mobile card view component
  const AppointmentCard = ({ patient }: { patient: Patient }) => (
    <Card className="p-4 mb-4">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{patient.name}</h3>
            <p className="text-sm text-gray-500">{patient.time}</p>
          </div>
          {getStatusBadge(patient.status)}
        </div>
        <div className="text-sm text-gray-600">
          <p>Profissional: {patient.professional}</p>
          {patient.responsible && <p>Responsável: {patient.responsible}</p>}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
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
      </div>
    </Card>
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <BackToHomeButton />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Consultas do Dia</h1>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
          <Select
            value={selectedProfessional}
            onValueChange={setSelectedProfessional}
          >
            <SelectTrigger className="w-full md:w-[250px]">
              <SelectValue placeholder="Filtrar por profissional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Profissionais</SelectItem>
              {professionals.map((prof) => (
                <SelectItem key={prof.id} value={prof.id}>
                  {prof.name} - {prof.profession}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
      </div>
      
      {/* Mobile view */}
      <div className="md:hidden">
        {filteredAppointments.length === 0 ? (
          <Card className="p-4">
            <p className="text-center text-muted-foreground">
              Não há consultas agendadas para hoje
            </p>
          </Card>
        ) : (
          filteredAppointments.map((patient) => (
            <AppointmentCard key={patient.id} patient={patient} />
          ))
        )}
      </div>

      {/* Desktop view */}
      <div className="hidden md:block bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Horário</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Profissional</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Não há consultas agendadas para hoje
                </TableCell>
              </TableRow>
            ) : (
              filteredAppointments.map((patient) => (
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
                  <TableCell>{patient.responsible || "-"}</TableCell>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Consultas;