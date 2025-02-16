
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TimeSlot {
  id: string;
  time_slot: string;
  max_appointments: number;
  professional_id: string;
  created_at: string;
  updated_at: string;
}

interface AvailableTimeSlotsProps {
  professionalId: string;
}

export const AvailableTimeSlots = ({ professionalId }: AvailableTimeSlotsProps) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchTimeSlots();
  }, [professionalId]);

  const fetchTimeSlots = async () => {
    try {
      const { data, error } = await supabase
        .from("professional_available_slots")
        .select("*")
        .eq("professional_id", professionalId)
        .order("time_slot");

      if (error) throw error;

      if (data) {
        setTimeSlots(data);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os horários disponíveis.",
        variant: "destructive",
      });
    }
  };

  const handleMaxAppointmentsChange = async (slotId: string, value: number) => {
    try {
      const { error } = await supabase
        .from("professional_available_slots")
        .update({ max_appointments: value })
        .eq("id", slotId);

      if (error) throw error;

      await fetchTimeSlots();
      toast({
        title: "Sucesso",
        description: "Número máximo de pacientes atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Error updating max appointments:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o número máximo de pacientes.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Label>Horários Disponíveis</Label>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Horário</TableHead>
            <TableHead>Máximo de Pacientes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {timeSlots.map((slot) => (
            <TableRow key={slot.id}>
              <TableCell>{slot.time_slot}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={slot.max_appointments}
                  min={1}
                  max={20}
                  onChange={(e) => handleMaxAppointmentsChange(slot.id, parseInt(e.target.value))}
                  className="w-24"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
