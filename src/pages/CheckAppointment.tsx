import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CheckAppointment = () => {
  const [ticketNumber, setTicketNumber] = useState("");
  const [appointment, setAppointment] = useState<any>(null);
  const [error, setError] = useState("");

  const handleCheck = () => {
    const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
    const found = appointments.find((a: any) => a.ticketNumber === ticketNumber);
    
    if (found) {
      setAppointment(found);
      setError("");
    } else {
      setError("Agendamento não encontrado");
      setAppointment(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            UNIVERSIDADE FEDERAL DO AMAPÁ
          </h1>
          <h2 className="text-xl font-semibold text-gray-800">
            UNIDADE BÁSICA DE SAÚDE
          </h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Consultar Agendamento</CardTitle>
            <CardDescription>
              Digite o número de protocolo recebido
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                value={ticketNumber}
                onChange={setTicketNumber}
                maxLength={6}
                render={({ slots }) => (
                  <InputOTPGroup className="gap-2">
                    {slots.map((slot, i) => (
                      <InputOTPSlot
                        key={i}
                        {...slot}
                        index={i}
                        className="w-12 h-12 text-2xl"
                      />
                    ))}
                  </InputOTPGroup>
                )}
              />
            </div>

            <Button onClick={handleCheck} className="w-full">
              Verificar Status
            </Button>

            {error && (
              <p className="text-red-500 text-center">{error}</p>
            )}

            {appointment && (
              <div className="space-y-4">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="font-medium text-lg mb-2">
                    Status: {appointment.status === "pending" ? "Pendente" : "Aprovado"}
                  </h3>
                  <p>Data solicitada: {format(new Date(appointment.preferredDate), "dd/MM/yyyy")}</p>
                  <p>Horário solicitado: {appointment.preferredTime}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Dados do Paciente:</h4>
                  <p>Nome: {appointment.patientName}</p>
                  <p>CPF: {appointment.cpf}</p>
                  <p>Cartão SUS: {appointment.sus}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckAppointment;