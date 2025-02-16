
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
import { useAppointments } from "@/hooks/useAppointments";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import { NovoAgendamento } from "@/components/NovoAgendamento";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { UnavailableDaysSelector } from "@/components/UnavailableDaysSelector";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

export const AgendaProfissional = () => {
  const { professionalId } = useParams<{ professionalId: string }>();
  const { appointments, isLoading, fetchAppointments } = useAppointments(professionalId || "");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isUnavailableDaysOpen, setIsUnavailableDaysOpen] = useState(false);
  const [professionalName, setProfessionalName] = useState("");

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

  if (!professionalId) return <div>ID do profissional não encontrado</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
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
        </div>

        {/* Main Content */}
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

      <Dialog open={isUnavailableDaysOpen} onOpenChange={setIsUnavailableDaysOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Organizar Meus Horários</DialogTitle>
          </DialogHeader>
          <UnavailableDaysSelector
            professionalId={professionalId}
            onSuccess={() => {
              setIsUnavailableDaysOpen(false);
              fetchAppointments();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgendaProfissional;
