
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AppointmentDateFormProps {
  professionalId: string;
  appointmentDate: Date | undefined;
  appointmentTime: string;
  onAppointmentDateSelect: (date: Date | undefined) => void;
  onAppointmentTimeChange: (value: string) => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
  currentAppointments: number;
  maxAppointments: number;
}

export const AppointmentDateForm = ({
  professionalId,
  appointmentDate,
  appointmentTime,
  onAppointmentDateSelect,
  onAppointmentTimeChange,
}: AppointmentDateFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [unavailableDays, setUnavailableDays] = useState<Date[]>([]);
  const [availableMonths, setAvailableMonths] = useState<{ month: number; year: number }[]>([]);

  // Buscar meses disponíveis e dias indisponíveis
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        // Buscar meses disponíveis
        const { data: months, error: monthsError } = await supabase
          .from('professional_available_months')
          .select('month, year')
          .eq('professional_id', professionalId)
          .order('year')
          .order('month');

        if (monthsError) throw monthsError;
        setAvailableMonths(months || []);

        // Buscar dias indisponíveis
        const { data: days, error: daysError } = await supabase
          .from('professional_unavailable_days')
          .select('date')
          .eq('professional_id', professionalId);

        if (daysError) throw daysError;
        
        const unavailableDates = (days || []).map(day => new Date(day.date));
        setUnavailableDays(unavailableDates);
      } catch (error) {
        console.error('Erro ao buscar disponibilidade:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a disponibilidade do profissional.",
          variant: "destructive",
        });
      }
    };

    fetchAvailability();
  }, [professionalId, toast]);

  // Buscar horários disponíveis quando uma data é selecionada
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!appointmentDate || !professionalId) return;

      setIsLoading(true);
      try {
        const formattedDate = format(appointmentDate, 'yyyy-MM-dd');

        // Verificar se a data está em um mês disponível
        const selectedMonth = appointmentDate.getMonth() + 1;
        const selectedYear = appointmentDate.getFullYear();
        const isMonthAvailable = availableMonths.some(
          m => m.month === selectedMonth && m.year === selectedYear
        );

        if (!isMonthAvailable) {
          setTimeSlots([]);
          toast({
            title: "Mês indisponível",
            description: "O profissional não atende neste mês.",
            variant: "destructive",
          });
          return;
        }

        // Verificar se o dia está bloqueado
        const isDayUnavailable = unavailableDays.some(
          date => format(date, 'yyyy-MM-dd') === formattedDate
        );

        if (isDayUnavailable) {
          setTimeSlots([]);
          toast({
            title: "Dia indisponível",
            description: "O profissional não atende nesta data.",
            variant: "destructive",
          });
          return;
        }

        // Buscar horários disponíveis
        const { data: availableSlots, error: slotsError } = await supabase
          .from('professional_available_slots')
          .select('time_slot, max_appointments')
          .eq('professional_id', professionalId)
          .order('time_slot');

        if (slotsError) throw slotsError;

        // Buscar agendamentos existentes
        const { data: existingAppointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select('appointment_time')
          .eq('professional_id', professionalId)
          .eq('appointment_date', formattedDate)
          .is('deleted_at', null);

        if (appointmentsError) throw appointmentsError;

        // Processar horários disponíveis
        const slots = (availableSlots || []).map(slot => {
          const timeStr = slot.time_slot.slice(0, 5);
          const appointmentsAtTime = existingAppointments?.filter(
            app => app.appointment_time.slice(0, 5) === timeStr
          ).length || 0;

          return {
            time: timeStr,
            available: appointmentsAtTime < slot.max_appointments,
            currentAppointments: appointmentsAtTime,
            maxAppointments: slot.max_appointments
          };
        });

        setTimeSlots(slots);
      } catch (error) {
        console.error('Erro ao buscar horários:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os horários disponíveis.",
          variant: "destructive",
        });
        setTimeSlots([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [professionalId, appointmentDate, availableMonths, unavailableDays, toast]);

  const isDateDisabled = (date: Date) => {
    // Desabilitar datas passadas
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;

    // Verificar se o mês está disponível
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const isMonthAvailable = availableMonths.some(
      m => m.month === month && m.year === year
    );
    if (!isMonthAvailable) return true;

    // Verificar se o dia está bloqueado
    return unavailableDays.some(
      unavailableDate => format(unavailableDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Data da Consulta *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !appointmentDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {appointmentDate ? (
                format(appointmentDate, "PPP", { locale: ptBR })
              ) : (
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={appointmentDate}
              onSelect={onAppointmentDateSelect}
              disabled={isDateDisabled}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label>Horário da Consulta *</Label>
        <Select
          value={appointmentTime}
          onValueChange={onAppointmentTimeChange}
          disabled={!appointmentDate || isLoading || timeSlots.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={
              !appointmentDate 
                ? "Selecione uma data primeiro" 
                : isLoading 
                ? "Carregando horários..." 
                : timeSlots.length === 0 
                ? "Nenhum horário disponível" 
                : "Selecione um horário"
            } />
          </SelectTrigger>
          <SelectContent>
            {timeSlots.map((slot) => (
              <SelectItem 
                key={slot.time} 
                value={slot.time}
                disabled={!slot.available}
              >
                {slot.time} ({slot.currentAppointments}/{slot.maxAppointments} agendamentos)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
