import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, Calendar, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AppointmentCardProps {
  appointment: {
    id: string;
    patientName: string;
    preferredDate: string;
    preferredTime: string;
  };
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onReschedule: (appointment: any) => void;
  onDirectVisit: (appointment: any) => void;
}

export const AppointmentCard = ({
  appointment,
  onApprove,
  onReject,
  onReschedule,
  onDirectVisit,
}: AppointmentCardProps) => {
  return (
    <Card key={appointment.id} className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{appointment.patientName}</p>
          <p className="text-sm text-muted-foreground">
            {format(new Date(appointment.preferredDate), "dd 'de' MMMM 'de' yyyy", {
              locale: ptBR,
            })}
            {" - "}
            {appointment.preferredTime}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onApprove(appointment.id)}
            className="text-green-600 hover:text-green-700"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onReschedule(appointment)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDirectVisit(appointment)}
            className="text-yellow-600 hover:text-yellow-700"
          >
            <UserPlus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onReject(appointment.id)}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};