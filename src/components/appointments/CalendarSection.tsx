
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import { parseISO } from "date-fns";

interface CalendarSectionProps {
  unavailableDays: { date: string }[];
  selectedDate: Date | undefined;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  onDaySelect: (date: Date | undefined) => void;
}

export const CalendarSection = ({
  unavailableDays,
  selectedDate,
  currentMonth,
  onMonthChange,
  onDaySelect
}: CalendarSectionProps) => {
  return (
    <div>
      <Calendar
        mode="single"
        month={currentMonth}
        onMonthChange={onMonthChange}
        onSelect={onDaySelect}
        selected={selectedDate}
        modifiers={{
          unavailable: unavailableDays.map(d => parseISO(d.date)),
        }}
        modifiersStyles={{
          unavailable: { backgroundColor: "rgb(239 68 68)", color: "white" },
        }}
        className="rounded-md border"
        locale={ptBR}
        defaultMonth={currentMonth}
      />
      <div className="text-sm text-muted-foreground mt-2">
        Clique nos dias para marcar/desmarcar ausências. Os dias em vermelho indicam que você não estará disponível para atendimento.
      </div>
    </div>
  );
};
