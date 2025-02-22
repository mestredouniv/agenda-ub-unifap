
import { Button } from "@/components/ui/button";
import { Users, Clock, UserPlus, List, Grid, Filter } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AgendaSidebarProps {
  appointments: number;
  nextAppointmentTime: string;
  viewMode: 'list' | 'grid';
  setViewMode: (mode: 'list' | 'grid') => void;
  onNewAppointmentClick: () => void;
  onUnavailableDaysClick: () => void;
  availableMonths: { month: number; year: number }[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
}

export const AgendaSidebar = ({
  appointments,
  nextAppointmentTime,
  viewMode,
  setViewMode,
  onNewAppointmentClick,
  onUnavailableDaysClick,
  availableMonths,
  selectedMonth,
  setSelectedMonth
}: AgendaSidebarProps) => {
  return (
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
          <span className="text-sm">{appointments}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Próximo:</span>
          <span className="text-sm">{nextAppointmentTime}</span>
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
  );
};
