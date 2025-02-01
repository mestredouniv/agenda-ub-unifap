import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface AppointmentTicketProps {
  ticketNumber: string;
  appointmentDate?: Date;
  appointmentTime?: string;
}

export const AppointmentTicket = ({
  ticketNumber,
  appointmentDate,
  appointmentTime,
}: AppointmentTicketProps) => {
  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold text-primary">
          Seu Número de Protocolo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <InputOTP
            value={ticketNumber}
            maxLength={6}
            readOnly
            render={({ slots }) => (
              <InputOTPGroup className="gap-2">
                {slots.map((slot, index) => (
                  <InputOTPSlot
                    key={index}
                    {...slot}
                    className="w-12 h-12 text-2xl"
                  />
                ))}
              </InputOTPGroup>
            )}
          />
        </div>

        {appointmentDate && appointmentTime && (
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Solicitação para:
            </p>
            <p className="font-medium">
              {format(appointmentDate, "EEEE, dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </p>
            <p className="font-medium">{appointmentTime}</p>
          </div>
        )}

        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-800 text-center">
            Guarde este número! Você precisará dele para consultar o status do seu agendamento.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};