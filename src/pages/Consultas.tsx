
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
import { supabase } from "@/integrations/supabase/client";
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
  const [professionals, setProfessionals] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfessionals = async () => {
      const { data } = await supabase
        .from('professionals')
        .select('*');
      if (data) {
        setProfessionals(data);
      }
    };

    fetchProfessionals();

    // Subscribe to professionals changes
    const professionalChannel = supabase
      .channel('professionals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'professionals'
        },
        () => {
          fetchProfessionals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(professionalChannel);
    };
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('appointments')
        .select(`
          id,
          patient_name,
          appointment_time,
          patient_status,
          priority,
          professional_id,
          display_status,
          professionals (
            name
          )
        `)
        .eq('appointment_date', today)
        .order('appointment_time', { ascending: true });

      if (data) {
        const formattedAppointments = data.map(app => ({
          id: app.id,
          name: app.patient_name,
          professional: app.professionals?.name || 'Não encontrado',
          professionalId: app.professional_id,
          time: app.appointment_time,
          status: app.display_status,
          priority: app.priority || 'normal',
        }));
        setAppointments(formattedAppointments);
      }
    };

    fetchAppointments();

    // Subscribe to appointments changes
    const appointmentChannel = supabase
      .channel('appointments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        () => {
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(appointmentChannel);
    };
  }, []);

  const handleCallNext = async (patient: Patient) => {
    try {
      // Update appointment status
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({ display_status: 'called' })
        .eq('id', patient.id);

      if (appointmentError) throw appointmentError;

      // Add to last_calls
      const { error: lastCallError } = await supabase
        .from('last_calls')
        .insert([{
          patient_name: patient.name,
          professional_name: patient.professional,
          status: 'called'
        }]);

      if (lastCallError) throw lastCallError;

      setCurrentPatient({
        name: patient.name,
        status: 'waiting',
        professional: patient.professional,
      });

      toast({
        title: "Paciente chamado",
        description: "O display foi atualizado com o próximo paciente.",
      });
    } catch (error) {
      console.error('Error calling next patient:', error);
      toast({
        title: "Erro",
        description: "Não foi possível chamar o próximo paciente.",
        variant: "destructive",
      });
    }
  };

  const handleStartTriage = async (patient: Patient) => {
    try {
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({ display_status: 'in_progress' })
        .eq('id', patient.id);

      if (appointmentError) throw appointmentError;

      const { error: lastCallError } = await supabase
        .from('last_calls')
        .insert([{
          patient_name: patient.name,
          professional_name: patient.professional,
          status: 'triage'
        }]);

      if (lastCallError) throw lastCallError;

      setCurrentPatient({
        name: patient.name,
        status: 'triage',
        professional: patient.professional,
      });

      toast({
        title: "Triagem iniciada",
        description: "Paciente encaminhado para triagem.",
      });
    } catch (error) {
      console.error('Error starting triage:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a triagem.",
        variant: "destructive",
      });
    }
  };

  const handleStartAppointment = async (patient: Patient) => {
    try {
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({ display_status: 'in_progress' })
        .eq('id', patient.id);

      if (appointmentError) throw appointmentError;

      const { error: lastCallError } = await supabase
        .from('last_calls')
        .insert([{
          patient_name: patient.name,
          professional_name: patient.professional,
          status: 'in_progress'
        }]);

      if (lastCallError) throw lastCallError;

      setCurrentPatient({
        name: patient.name,
        status: 'in_progress',
        professional: patient.professional,
      });

      toast({
        title: "Consulta iniciada",
        description: "Paciente em atendimento.",
      });
    } catch (error) {
      console.error('Error starting appointment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a consulta.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteAppointment = async (patient: Patient) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ display_status: 'completed' })
        .eq('id', patient.id);

      if (error) throw error;

      toast({
        title: "Consulta finalizada",
        description: "O atendimento foi concluído com sucesso.",
      });
    } catch (error) {
      console.error('Error completing appointment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível finalizar a consulta.",
        variant: "destructive",
      });
    }
  };

  const filteredAppointments = appointments.filter(appointment => 
    selectedProfessional === "all" || appointment.professionalId === selectedProfessional
  );

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
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCompleteAppointment(patient)}
            disabled={patient.status !== 'in_progress'}
          >
            Finalizar
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCompleteAppointment(patient)}
                        disabled={patient.status !== 'in_progress'}
                      >
                        Finalizar
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
