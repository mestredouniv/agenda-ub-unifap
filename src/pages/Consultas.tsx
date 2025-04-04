
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import { AppointmentActions } from "@/components/appointments/AppointmentActions";
import { useAppointments } from "@/hooks/useAppointments";
import { getStatusBadge } from "@/utils/appointment";
import { useToast } from "@/components/ui/use-toast";

const Consultas = () => {
  const { toast } = useToast();
  const [selectedProfessional, setSelectedProfessional] = useState("all");
  const [professionals, setProfessionals] = useState<any[]>([]);
  const { appointments, fetchAppointments } = useAppointments(selectedProfessional);

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
            <AppointmentCard 
              key={appointment.id} 
              appointment={appointment} 
              onSuccess={fetchAppointments}
            />
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
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
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
                  <TableCell>
                    <AppointmentActions 
                      appointment={appointment}
                      onSuccess={fetchAppointments}
                    />
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
