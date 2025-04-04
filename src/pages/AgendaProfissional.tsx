import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  Users, 
  Clock, 
  UserPlus,
  List,
  Grid,
  Filter
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAppointments } from "@/hooks/useAppointments";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import { NovoAgendamento } from "@/components/NovoAgendamento";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { UnavailableDaysSelector } from "@/components/UnavailableDaysSelector";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const AgendaProfissional = () => {
  const { professionalId } = useParams<{ professionalId: string }>();
  const { appointments, isLoading, fetchAppointments } = useAppointments(professionalId || "");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isUnavailableDaysOpen, setIsUnavailableDaysOpen] = useState(false);
  const [professionalName, setProfessionalName] = useState("");
  const [availableMonths, setAvailableMonths] = useState<{ month: number; year: number }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    const fetchProfessionalName = async () => {
      if (professionalId) {
        const { data, error } = await supabase
          .from('professionals')
          .select('name')
          .eq('id', professionalId)
          .single();
        
        if (data && !error) {
          setProfessionalName(data.name);
        }
      }
    };

    fetchProfessionalName();
  }, [professionalId]);

  useEffect(() => {
    const fetchAvailableMonths = async () => {
      if (professionalId) {
        const { data, error } = await supabase
          .from('professional_available_months')
          .select('month, year')
          .eq('professional_id', professionalId)
          .order('year')
          .order('month');
        
        if (data && !error) {
          setAvailableMonths(data);
        }
      }
    };

    fetchAvailableMonths();
  }, [professionalId]);

  if (!professionalId) return <div>ID do profissional não encontrado</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <div className="w-64 min-h-screen bg-white border-r border-gray-200 p-4 space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Agenda</h2>
            <BackToHomeButton />
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => setIsNewAppointmentOpen(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setIsUnavailableDaysOpen(true)}
            >
              <Clock className="mr-2 h-4 w-4" />
              Organizar Horários
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
            
            <Button variant="outline" className="w-full justify-start">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Pacientes Hoje:</span>
              <span className="text-sm">{appointments.length}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Próximo:</span>
              <span className="text-sm">
                {appointments[0]?.appointment_time || "Sem agendamentos"}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Filtrar por Mês</Label>
            <Select
              value={selectedMonth}
              onValueChange={setSelectedMonth}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um mês" />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map(({ month, year }) => (
                  <SelectItem 
                    key={`${year}-${month}`} 
                    value={`${year}-${String(month).padStart(2, '0')}`}
                  >
                    {format(new Date(year, month - 1), 'MMMM yyyy', { locale: ptBR })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Agenda: {professionalName}
              </h1>
            </div>

            {isLoading ? (
              <div>Carregando agendamentos...</div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
                {appointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onSuccess={fetchAppointments}
                  />
                ))}
                {appointments.length === 0 && (
                  <Card className="p-8 text-center text-gray-500">
                    Nenhum agendamento para hoje
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Sheet open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Novo Agendamento</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <NovoAgendamento
              professionalId={professionalId}
              onSuccess={() => {
                setIsNewAppointmentOpen(false);
                fetchAppointments();
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Dialog 
        open={isUnavailableDaysOpen} 
        onOpenChange={setIsUnavailableDaysOpen}
        modal={true}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Organizar Meus Horários</DialogTitle>
            <DialogDescription>
              Selecione os dias em que você não estará disponível para atendimento
            </DialogDescription>
          </DialogHeader>
          <UnavailableDaysSelector
            professionalId={professionalId}
            onSuccess={() => {
              fetchAppointments();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgendaProfissional;
