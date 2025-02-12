
import { useState, useEffect } from "react";
import { useDisplayState } from "@/hooks/useDisplayState";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
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
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BackToHomeButton } from "@/components/BackToHomeButton";

interface Appointment {
  id: string;
  patient_name: string;
  professional_id: string;
  professional: {
    name: string;
  };
  appointment_date: string;
  appointment_time: string;
  display_status: 'waiting' | 'triage' | 'in_progress' | 'completed';
  priority: 'priority' | 'normal';
  responsible?: string;
  notes?: string;
  actual_start_time?: string;
  actual_end_time?: string;
}

const Consultas = () => {
  const { toast } = useToast();
  const setCurrentPatient = useDisplayState((state) => state.setCurrentPatient);
  const [selectedProfessional, setSelectedProfessional] = useState("all");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfessionals = async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*');
      
      if (error) {
        console.error('Erro ao buscar profissionais:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de profissionais",
          variant: "destructive",
        });
        return;
      }

      setProfessionals(data || []);
    };

    fetchProfessionals();
  }, [toast]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const today = new Date().toISOString().split('T')[0];
      let query = supabase
        .from('appointments')
        .select(`
          id,
          patient_name,
          professional_id,
          appointment_date,
          appointment_time,
          display_status,
          priority,
          responsible,
          notes,
          actual_start_time,
          actual_end_time,
          professionals (
            name
          )
        `)
        .eq('appointment_date', today);

      if (selectedProfessional !== "all") {
        query = query.eq('professional_id', selectedProfessional);
      }

      const { data, error } = await query.order('appointment_time', { ascending: true });

      if (error) {
        console.error('Erro ao buscar consultas:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as consultas",
          variant: "destructive",
        });
        return;
      }

      setAppointments(data || []);
    };

    fetchAppointments();

    // Inscrever-se para atualizações em tempo real
    const channel = supabase
      .channel('appointments-changes')
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
      supabase.removeChannel(channel);
    };
  }, [selectedProfessional, toast]);

  const handleCallNext = async (appointment: Appointment) => {
    try {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ 
          display_status: 'waiting',
          actual_start_time: new Date().toLocaleTimeString()
        })
        .eq('id', appointment.id);

      if (updateError) throw updateError;

      const { error: lastCallError } = await supabase
        .from('last_calls')
        .insert([{
          patient_name: appointment.patient_name,
          professional_name: appointment.professional.name,
          status: 'called'
        }]);

      if (lastCallError) throw lastCallError;

      setCurrentPatient({
        name: appointment.patient_name,
        status: 'waiting',
        professional: appointment.professional.name,
      });

      toast({
        title: "Paciente chamado",
        description: "O display foi atualizado com o próximo paciente.",
      });
    } catch (error) {
      console.error('Erro ao chamar próximo paciente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível chamar o próximo paciente.",
        variant: "destructive",
      });
    }
  };

  const handleStartTriage = async (appointment: Appointment) => {
    try {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ 
          display_status: 'triage',
          actual_start_time: new Date().toLocaleTimeString()
        })
        .eq('id', appointment.id);

      if (updateError) throw updateError;

      const { error: lastCallError } = await supabase
        .from('last_calls')
        .insert([{
          patient_name: appointment.patient_name,
          professional_name: appointment.professional.name,
          status: 'triage'
        }]);

      if (lastCallError) throw lastCallError;

      setCurrentPatient({
        name: appointment.patient_name,
        status: 'triage',
        professional: appointment.professional.name,
      });

      toast({
        title: "Triagem iniciada",
        description: "Paciente encaminhado para triagem.",
      });
    } catch (error) {
      console.error('Erro ao iniciar triagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a triagem.",
        variant: "destructive",
      });
    }
  };

  const handleStartAppointment = async (appointment: Appointment) => {
    try {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ 
          display_status: 'in_progress',
          actual_start_time: new Date().toLocaleTimeString()
        })
        .eq('id', appointment.id);

      if (updateError) throw updateError;

      const { error: lastCallError } = await supabase
        .from('last_calls')
        .insert([{
          patient_name: appointment.patient_name,
          professional_name: appointment.professional.name,
          status: 'in_progress'
        }]);

      if (lastCallError) throw lastCallError;

      setCurrentPatient({
        name: appointment.patient_name,
        status: 'in_progress',
        professional: appointment.professional.name,
      });

      toast({
        title: "Consulta iniciada",
        description: "Paciente em atendimento.",
      });
    } catch (error) {
      console.error('Erro ao iniciar consulta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a consulta.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteAppointment = async (appointment: Appointment) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          display_status: 'completed',
          actual_end_time: new Date().toLocaleTimeString()
        })
        .eq('id', appointment.id);

      if (error) throw error;

      toast({
        title: "Consulta finalizada",
        description: "O atendimento foi concluído com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao finalizar consulta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível finalizar a consulta.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: Appointment['display_status']) => {
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
  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="p-4 mb-4">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{appointment.patient_name}</h3>
            <p className="text-sm text-gray-500">{appointment.appointment_time}</p>
          </div>
          {getStatusBadge(appointment.display_status)}
        </div>
        <div className="text-sm text-gray-600">
          <p>Profissional: {appointment.professional.name}</p>
          {appointment.responsible && <p>Responsável: {appointment.responsible}</p>}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Button
            size="sm"
            onClick={() => handleCallNext(appointment)}
            disabled={appointment.display_status !== 'waiting'}
          >
            Chamar
          </Button>
          <Button
            size="sm"
            onClick={() => handleStartTriage(appointment)}
            disabled={appointment.display_status !== 'waiting'}
          >
            Triagem
          </Button>
          <Button
            size="sm"
            onClick={() => handleStartAppointment(appointment)}
            disabled={appointment.display_status !== 'triage'}
          >
            Iniciar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCompleteAppointment(appointment)}
            disabled={appointment.display_status !== 'in_progress'}
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
        {appointments.length === 0 ? (
          <Card className="p-4">
            <p className="text-center text-muted-foreground">
              Não há consultas agendadas para hoje
            </p>
          </Card>
        ) : (
          appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
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
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Não há consultas agendadas para hoje
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.appointment_time}</TableCell>
                  <TableCell>{appointment.patient_name}</TableCell>
                  <TableCell>{appointment.professional.name}</TableCell>
                  <TableCell>{getStatusBadge(appointment.display_status)}</TableCell>
                  <TableCell>
                    <Badge variant={appointment.priority === 'priority' ? "destructive" : "secondary"}>
                      {appointment.priority === 'priority' ? 'Prioritário' : 'Normal'}
                    </Badge>
                  </TableCell>
                  <TableCell>{appointment.responsible || "-"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleCallNext(appointment)}
                        disabled={appointment.display_status !== 'waiting'}
                      >
                        Chamar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStartTriage(appointment)}
                        disabled={appointment.display_status !== 'waiting'}
                      >
                        Triagem
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStartAppointment(appointment)}
                        disabled={appointment.display_status !== 'triage'}
                      >
                        Iniciar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCompleteAppointment(appointment)}
                        disabled={appointment.display_status !== 'in_progress'}
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
