
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

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!appointmentDate || !professionalId) return;

      setIsLoading(true);
      try {
        // Buscar horários disponíveis do profissional
        const { data: availableSlots, error: slotsError } = await supabase
          .from('professional_available_slots')
          .select('time_slot, max_appointments')
          .eq('professional_id', professionalId)
          .order('time_slot');

        if (slotsError) throw slotsError;

        // Buscar agendamentos existentes para a data
        const formattedDate = format(appointmentDate, 'yyyy-MM-dd');
        const { data: existingAppointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select('appointment_time, id')
          .eq('professional_id', professionalId)
          .eq('appointment_date', formattedDate)
          .is('deleted_at', null);

        if (appointmentsError) throw appointmentsError;

        // Verificar dias indisponíveis
        const { data: unavailableDays, error: unavailableError } = await supabase
          .from('professional_unavailable_days')
          .select('date')
          .eq('professional_id', professionalId)
          .eq('date', formattedDate);

        if (unavailableError) throw unavailableError;

        // Se o dia estiver marcado como indisponível, não mostrar horários
        if (unavailableDays && unavailableDays.length > 0) {
          setTimeSlots([]);
          toast({
            title: "Dia indisponível",
            description: "O profissional não atende nesta data.",
            variant: "destructive",
          });
          return;
        }

        // Processar os horários disponíveis
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
  }, [professionalId, appointmentDate, toast]);

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
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
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
