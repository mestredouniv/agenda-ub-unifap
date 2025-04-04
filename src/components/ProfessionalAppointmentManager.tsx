
import React from "react";
import { Card } from "@/components/ui/card";
import { AppointmentApprovalList } from "./AppointmentApprovalList";
import { UnavailableDaysSelector } from "./UnavailableDaysSelector";

interface ProfessionalAppointmentManagerProps {
  professionalId: string;
}

export const ProfessionalAppointmentManager = ({
  professionalId,
}: ProfessionalAppointmentManagerProps) => {
  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Gerenciar Agendamentos</h2>
        <AppointmentApprovalList professionalId={professionalId} />
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Gerenciar Disponibilidade</h2>
        <UnavailableDaysSelector
          professionalId={professionalId}
          onSuccess={() => {
            // Atualizar dados se necessário
          }}
        />
      </Card>
    </div>
  );
};
