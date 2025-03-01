
import { useState } from "react";
import { ProfessionalHeader } from "@/components/agenda/ProfessionalHeader";
import { AppointmentList } from "@/components/agenda/AppointmentList";
import { Appointment } from "@/types/appointment";

interface AgendaContentProps {
  professionalName: string;
  appointments: Appointment[];
  viewMode: 'list' | 'grid';
  isLoading: boolean;
  onSuccess: () => void;
}

export const AgendaContent = ({
  professionalName,
  appointments,
  viewMode,
  isLoading,
  onSuccess
}: AgendaContentProps) => {
  return (
    <div className="flex-1 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <ProfessionalHeader professionalName={professionalName} />
        <AppointmentList
          appointments={appointments}
          viewMode={viewMode}
          onSuccess={onSuccess}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
