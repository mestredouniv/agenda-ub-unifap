
import { useState } from "react";
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
import { Button } from "@/components/ui/button";

interface ConsultaFiltersProps {
  selectedProfessional: string;
  setSelectedProfessional: (value: string) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  professionals: any[];
}

export const ConsultaFilters = ({
  selectedProfessional,
  setSelectedProfessional,
  selectedDate,
  setSelectedDate,
  professionals,
}: ConsultaFiltersProps) => {
  return (
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
  );
};
