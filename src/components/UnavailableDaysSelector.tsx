import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ptBR } from "date-fns/locale";

interface UnavailableDaysSelectorProps {
  selectedDays: Date[];
  onChange: (days: Date[]) => void;
}

export const UnavailableDaysSelector = ({
  selectedDays,
  onChange,
}: UnavailableDaysSelectorProps) => {
  const handleSelect = (date: Date | undefined) => {
    if (!date) return;

    const isAlreadySelected = selectedDays.some(
      (selectedDate) =>
        selectedDate.toISOString().split("T")[0] === date.toISOString().split("T")[0]
    );

    if (isAlreadySelected) {
      onChange(
        selectedDays.filter(
          (selectedDate) =>
            selectedDate.toISOString().split("T")[0] !== date.toISOString().split("T")[0]
        )
      );
    } else {
      onChange([...selectedDays, date]);
    }
  };

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        onSelect={handleSelect}
        selected={undefined}
        modifiers={{
          unavailable: selectedDays,
        }}
        modifiersStyles={{
          unavailable: { backgroundColor: "rgb(239 68 68)", color: "white" },
        }}
        className="rounded-md border"
        locale={ptBR}
      />
      <div className="text-sm text-muted-foreground">
        Clique nos dias para marcar/desmarcar ausências
      </div>
    </div>
  );
};