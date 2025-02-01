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
  username?: string;
  password?: string;
}

export const AppointmentTicket = ({
  ticketNumber,
  appointmentDate,
  appointmentTime,
  username,
  password,
}: AppointmentTicketProps) => {
  // Ensure ticketNumber is exactly 6 digits
  const formattedTicketNumber = ticketNumber.padStart(6, '0').slice(0, 6);

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
            value={formattedTicketNumber}
            maxLength={6}
            readOnly
            disabled
            render={({ slots }) => (
              <InputOTPGroup className="gap-2">
                {slots.map((slot, i) => (
                  <InputOTPSlot
                    key={i}
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

        {username && password && (
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <p className="text-sm text-blue-800 font-medium">
              Suas credenciais de acesso:
            </p>
            <div className="space-y-1">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Usuário:</span> {username}
              </p>
              <p className="text-sm text-blue-800">
                <span className="font-medium">Senha:</span> {password}
              </p>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-800 text-center">
            Guarde estas informações! Você precisará delas para consultar o status do seu agendamento.
            Acesse a página "Verificar Consulta" mais tarde para verificar se sua solicitação foi aprovada.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};