
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AvailableTimeSlots } from "@/components/appointments/AvailableTimeSlots";
import { CalendarSection } from "@/components/appointments/CalendarSection";
import { useUnavailableDays } from "@/hooks/useUnavailableDays";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface UnavailableDaysSelectorProps {
  professionalId: string;
  onSuccess?: () => void;
}

export const UnavailableDaysSelector = ({
  professionalId,
  onSuccess,
}: UnavailableDaysSelectorProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const {
    unavailableDays,
    isLoading,
    currentMonth,
    setCurrentMonth,
    handleDaySelect
  } = useUnavailableDays(professionalId);

  // Função para sincronizar os calendários
  const syncCalendars = async () => {
    try {
      setSyncStatus('syncing');
      setErrorMessage(null);
      
      // Forçar a atualização dos dias indisponíveis
      await handleDaySelect(undefined);
      
      setSyncStatus('success');
      
      // Resetar o status após 3 segundos
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error('[UnavailableDaysSelector] Erro ao sincronizar calendários:', error);
      setSyncStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao sincronizar calendários');
      
      // Resetar o status de erro após 5 segundos
      setTimeout(() => {
        setSyncStatus('idle');
        setErrorMessage(null);
      }, 5000);
    }
  };

  const onDaySelect = async (date: Date | undefined) => {
    try {
      setSyncStatus('syncing');
      setErrorMessage(null);
      
      await handleDaySelect(date);
      setSelectedDate(date);
      
      setSyncStatus('success');
      
      // Resetar o status após 3 segundos
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('[UnavailableDaysSelector] Erro ao atualizar dia:', error);
      setSyncStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao atualizar dia');
      
      // Resetar o status de erro após 5 segundos
      setTimeout(() => {
        setSyncStatus('idle');
        setErrorMessage(null);
      }, 5000);
    }
  };

  // Efeito para sincronizar os calendários quando o componente é montado
  useEffect(() => {
    syncCalendars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-6">
        {syncStatus === 'success' && (
          <Alert className="bg-green-50 border-green-200">
            <AlertTitle>Sucesso!</AlertTitle>
            <AlertDescription>
              Calendários sincronizados com sucesso. As alterações foram salvas.
            </AlertDescription>
          </Alert>
        )}
        
        {syncStatus === 'error' && errorMessage && (
          <Alert className="bg-red-50 border-red-200">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-end">
          <Button 
            onClick={syncCalendars}
            disabled={syncStatus === 'syncing'}
            variant="outline"
            className="mb-4"
          >
            {syncStatus === 'syncing' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sincronizando...
              </>
            ) : (
              'Sincronizar Calendários'
            )}
          </Button>
        </div>
        
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