
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAppointments } from "@/hooks/useAppointments";
import { AgendaSidebar } from "@/components/agenda/AgendaSidebar";
import { AgendaContent } from "@/components/agenda/AgendaContent";
import { NewAppointmentSheet } from "@/components/agenda/NewAppointmentSheet";
import { UnavailableDaysDialog } from "@/components/agenda/UnavailableDaysDialog";
import { AgendaState } from "@/types/agenda";

export const AgendaProfissional = () => {
  const { professionalId } = useParams<{ professionalId: string }>();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<AgendaState['viewMode']>('list');
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isUnavailableDaysOpen, setIsUnavailableDaysOpen] = useState(false);
  const [professionalName, setProfessionalName] = useState("");
  const [availableMonths, setAvailableMonths] = useState<AgendaState['availableMonths']>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Log para debug
  useEffect(() => {
    console.log('[AgendaProfissional] Carregando agenda do profissional com ID:', professionalId);
  }, [professionalId]);

  const { appointments, isLoading, fetchAppointments } = useAppointments(professionalId || "", selectedDate);

  useEffect(() => {
    const fetchProfessionalName = async () => {
      if (professionalId && professionalId !== ':professionalId') {
        const { data, error } = await supabase
          .from('professionals')
          .select('name')
          .eq('id', professionalId)
          .single();
        
        if (data && !error) {
          setProfessionalName(data.name);
        } else if (error) {
          console.error("Erro ao buscar nome do profissional:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados do profissional.",
            variant: "destructive",
          });
        }
      } else {
        console.error("ID do profissional inválido:", professionalId);
      }
    };

    fetchProfessionalName();
  }, [professionalId, toast]);

  useEffect(() => {
    const fetchAvailableMonths = async () => {
      if (professionalId && professionalId !== ':professionalId') {
        const { data, error } = await supabase
          .from('professional_available_months')
          .select('month, year')
          .eq('professional_id', professionalId)
          .order('year')
          .order('month');
        
        if (data && !error) {
          setAvailableMonths(data);
        } else if (error) {
          console.error("Erro ao buscar meses disponíveis:", error);
        }
      }
    };

    fetchAvailableMonths();
  }, [professionalId]);

  const handleAppointmentSuccess = () => {
    console.log("[AgendaProfissional] Agendamento criado com sucesso, atualizando lista...");
    setIsNewAppointmentOpen(false);
    // Atualizar a lista de agendamentos
    fetchAppointments();
  };

  if (!professionalId || professionalId === ':professionalId') 
    return <div className="p-8 text-center">ID do profissional não encontrado ou inválido</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AgendaSidebar
          appointments={appointments.length}
          nextAppointmentTime={appointments[0]?.appointment_time || "Sem agendamentos"}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onNewAppointmentClick={() => setIsNewAppointmentOpen(true)}
          onUnavailableDaysClick={() => setIsUnavailableDaysOpen(true)}
          availableMonths={availableMonths}
          selectedDate={selectedDate}
          setSelectedDate={(date) => {
            setSelectedDate(date);
            // Recarregar agendamentos quando a data mudar
            fetchAppointments();
          }}
        />

        <AgendaContent
          professionalName={professionalName}
          appointments={appointments}
          viewMode={viewMode}
          isLoading={isLoading}
          onSuccess={fetchAppointments}
        />
      </div>

      <NewAppointmentSheet
        isOpen={isNewAppointmentOpen}
        onOpenChange={setIsNewAppointmentOpen}
        professionalId={professionalId}
        onSuccess={handleAppointmentSuccess}
      />

      <UnavailableDaysDialog
        isOpen={isUnavailableDaysOpen}
        onOpenChange={setIsUnavailableDaysOpen}
        professionalId={professionalId}
        onSuccess={fetchAppointments}
      />
    </div>
  );
};

export default AgendaProfissional;
