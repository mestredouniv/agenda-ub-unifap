import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CheckAppointment = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [appointment, setAppointment] = useState<any>(null);
  const [error, setError] = useState("");

  const handleCheck = () => {
    const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
    const found = appointments.find((a: any) => 
      a.username === username && a.password === password
    );
    
    if (found) {
      setAppointment(found);
      setError("");
    } else {
      setError("Credenciais inválidas ou agendamento não encontrado");
      setAppointment(null);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Aguardando aprovação";
      case "approved":
        return "Aprovado";
      case "rejected":
        return "Rejeitado";
      default:
        return "Status desconhecido";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600";
      case "approved":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      default:
        return "text-gray-600";
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
              Digite suas credenciais para verificar o status do seu agendamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Nome de Usuário</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
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
                    Status: <span className={getStatusColor(appointment.status)}>
                      {getStatusText(appointment.status)}
                    </span>
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