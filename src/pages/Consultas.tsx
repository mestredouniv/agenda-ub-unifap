
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import { AppointmentActions } from "@/components/appointments/AppointmentActions";
import { useToast } from "@/components/ui/use-toast";

const Consultas = () => {
  const { toast } = useToast();
  const [selectedProfessional, setSelectedProfessional] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  const fetchAppointments = async () => {
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      let query = supabase
        .from('appointments')
        .select(`
          *,
          professionals (
            name
          )
        `)
        .eq('appointment_date', formattedDate)
        .is('deleted_at', null);

      if (selectedProfessional !== "all") {
        query = query.eq('professional_id', selectedProfessional);
      }

      const { data, error } = await query
        .order('priority', { ascending: false })
        .order('appointment_time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos",
        variant: "destructive",
      });
    }
  };

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
    fetchAppointments();

    const channel = supabase
      .channel('appointments-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments',
      }, () => {
        fetchAppointments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedProfessional, selectedDate]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <BackToHomeButton />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Consultas</h1>
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

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full md:w-[280px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Mobile view */}
      <div className="md:hidden">
        {appointments.length === 0 ? (
          <Card className="p-4">
            <p className="text-center text-muted-foreground">
              Não há consultas agendadas para este dia
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
                  Não há consultas agendadas para este dia
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.appointment_time}</TableCell>
                  <TableCell>{appointment.patient_name}</TableCell>
                  <TableCell>{appointment.professionals.name}</TableCell>
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
