import { useState } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { AppointmentApprovalList } from "@/components/AppointmentApprovalList";

interface Appointment {
  id: string;
  patientName: string;
  preferredDate: string;
  preferredTime: string;
  responsible?: string;
  status: "pending" | "approved" | "rejected" | "rescheduled" | "direct_visit";
  professionalId: string;
}

const ProfessionalSchedule = () => {
  const { professionalId } = useParams();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [unavailableDays, setUnavailableDays] = useState<Date[]>([]);

  if (!professionalId) {
    return <div>Professional ID not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <BackToHomeButton />
      
      <div className="max-w-7xl mx-auto mt-8 space-y-8">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Agenda do Profissional</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-semibold mb-4">Calendário</h2>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                locale={ptBR}
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Solicitações Pendentes</h2>
              <AppointmentApprovalList professionalId={professionalId} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfessionalSchedule;