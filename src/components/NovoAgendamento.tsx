
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface NovoAgendamentoProps {
  professionalId: string;
  onSuccess: () => void;
}

export const NovoAgendamento = ({ professionalId, onSuccess }: NovoAgendamentoProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: "",
    birthDate: undefined as Date | undefined,
    appointmentDate: undefined as Date | undefined,
    appointmentTime: "",
    phone: "",
    isMinor: false,
    responsibleName: "",
    hasRecord: "" as "yes" | "no" | "electronic" | "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName || !formData.birthDate || !formData.appointmentDate || !formData.appointmentTime) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .insert([{
          professional_id: professionalId,
          patient_name: formData.patientName,
          birth_date: format(formData.birthDate, 'yyyy-MM-dd'),
          appointment_date: format(formData.appointmentDate, 'yyyy-MM-dd'),
          appointment_time: formData.appointmentTime,
          display_status: 'waiting',
          is_minor: formData.isMinor,
          responsible_name: formData.responsibleName,
          has_record: formData.hasRecord || null,
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Agendamento realizado com sucesso!",
      });
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar o agendamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBirthDateSelect = (date: Date | undefined) => {
    if (date) {
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      setFormData(prev => ({
        ...prev,
        birthDate: date,
        isMinor: age < 18
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="patientName">Nome do Paciente *</Label>
          <Input
            id="patientName"
            value={formData.patientName}
            onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label>Data de Nascimento *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.birthDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.birthDate ? (
                  format(formData.birthDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.birthDate}
                onSelect={handleBirthDateSelect}
                disabled={(date) => date > new Date()}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>Data da Consulta *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.appointmentDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.appointmentDate ? (
                  format(formData.appointmentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.appointmentDate}
                onSelect={(date) => setFormData(prev => ({ ...prev, appointmentDate: date }))}
                disabled={(date) => date < new Date()}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="appointmentTime">Horário da Consulta *</Label>
          <Input
            id="appointmentTime"
            type="time"
            value={formData.appointmentTime}
            onChange={(e) => setFormData(prev => ({ ...prev, appointmentTime: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Telefone *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            required
          />
        </div>

        {formData.isMinor && (
          <div>
            <Label htmlFor="responsibleName">Nome do Responsável *</Label>
            <Input
              id="responsibleName"
              value={formData.responsibleName}
              onChange={(e) => setFormData(prev => ({ ...prev, responsibleName: e.target.value }))}
              required
            />
          </div>
        )}

        <div>
          <Label>Possui Prontuário? *</Label>
          <Select
            value={formData.hasRecord}
            onValueChange={(value: "yes" | "no" | "electronic") => 
              setFormData(prev => ({ ...prev, hasRecord: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Sim</SelectItem>
              <SelectItem value="no">Não</SelectItem>
              <SelectItem value="electronic">Prontuário Eletrônico</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Agendando..." : "Agendar Consulta"}
      </Button>
    </form>
  );
};
