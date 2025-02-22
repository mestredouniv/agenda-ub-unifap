
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { NovoAgendamento } from "@/components/NovoAgendamento";
import { UnavailableDaysSelector } from "@/components/UnavailableDaysSelector";
import { supabase } from "@/integrations/supabase/client";
import { useAppointments } from "@/hooks/useAppointments";
import { AgendaSidebar } from "@/components/agenda/AgendaSidebar";
import { AppointmentList } from "@/components/agenda/AppointmentList";
import { ProfessionalHeader } from "@/components/agenda/ProfessionalHeader";

export const AgendaProfissional = () => {
  const { professionalId } = useParams<{ professionalId: string }>();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isUnavailableDaysOpen, setIsUnavailableDaysOpen] = useState(false);
  const [professionalName, setProfessionalName] = useState("");
  const [availableMonths, setAvailableMonths] = useState<{ month: number; year: number }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const { appointments, isLoading, fetchAppointments } = useAppointments(professionalId || "");

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
        <AgendaSidebar
          appointments={appointments.length}
          nextAppointmentTime={appointments[0]?.appointment_time || "Sem agendamentos"}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onNewAppointmentClick={() => setIsNewAppointmentOpen(true)}
          onUnavailableDaysClick={() => setIsUnavailableDaysOpen(true)}
          availableMonths={availableMonths}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
        />

        <div className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <ProfessionalHeader professionalName={professionalName} />
            <AppointmentList
              appointments={appointments}
              viewMode={viewMode}
              onSuccess={fetchAppointments}
              isLoading={isLoading}
            />
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
