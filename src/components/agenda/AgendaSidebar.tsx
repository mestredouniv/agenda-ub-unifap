
import { Button } from "@/components/ui/button";
import { Users, Clock, UserPlus, List, Grid, Calendar as CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AgendaSidebarProps } from "@/types/agenda";

export const AgendaSidebar = ({
  appointments,
  nextAppointmentTime,
  viewMode,
  setViewMode,
  onNewAppointmentClick,
  onUnavailableDaysClick,
  availableMonths,
  selectedDate,
  setSelectedDate
}: AgendaSidebarProps) => {
  return (
    <div className="w-72 min-h-screen bg-white border-r border-gray-200 p-4 space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Agenda</h2>
        <BackToHomeButton />
      </div>
      
      <Separator />
      
      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          onClick={onNewAppointmentClick}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={onUnavailableDaysClick}
        >
          <Clock className="mr-2 h-4 w-4" />
          Organizar Horários
        </Button>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
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

        <div className="bg-gray-50 rounded-lg p-4">
          <Label className="mb-2 block">Selecionar Data</Label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            locale={ptBR}
            className="rounded-md border w-full"
          />
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Pacientes Hoje:</span>
          <span className="text-sm">{appointments}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Próximo:</span>
          <span className="text-sm">{nextAppointmentTime}</span>
        </div>
      </div>
    </div>
  );
};
