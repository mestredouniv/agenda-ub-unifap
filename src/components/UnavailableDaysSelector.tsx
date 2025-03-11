
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AvailableTimeSlots } from "@/components/appointments/AvailableTimeSlots";
import { CalendarSection } from "@/components/appointments/CalendarSection";
import { useUnavailableDays } from "@/hooks/useUnavailableDays";

interface UnavailableDaysSelectorProps {
  professionalId: string;
  onSuccess?: () => void;
}

export const UnavailableDaysSelector = ({
  professionalId,
  onSuccess,
}: UnavailableDaysSelectorProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  const {
    unavailableDays,
    isLoading,
    currentMonth,
    setCurrentMonth,
    handleDaySelect
  } = useUnavailableDays(professionalId);

  const onDaySelect = async (date: Date | undefined) => {
    await handleDaySelect(date);
    setSelectedDate(date);
    
    if (onSuccess) {
      onSuccess();
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <CalendarSection
              unavailableDays={unavailableDays}
              selectedDate={selectedDate}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              onDaySelect={onDaySelect}
            />
          </div>
          
          <Card className="p-4">
            <AvailableTimeSlots 
              professionalId={professionalId} 
              selectedDate={selectedDate}
            />
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
};
