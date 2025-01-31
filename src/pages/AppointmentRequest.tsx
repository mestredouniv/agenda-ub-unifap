import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AppointmentRequest {
  professionalId: string;
  patientName: string;
  cpf: string;
  sus: string;
  age: string;
  phone: string;
  preferredDate: Date | undefined;
  preferredTime: string;
}

const AppointmentRequest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<AppointmentRequest>({
    professionalId: "",
    patientName: "",
    cpf: "",
    sus: "",
    age: "",
    phone: "",
    preferredDate: undefined,
    preferredTime: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here we would handle the appointment request submission
    toast({
      title: "Solicitação enviada",
      description: "Sua solicitação de agendamento foi enviada com sucesso!",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Solicitação de Agendamento de Consulta
            </CardTitle>
            <CardDescription className="text-center">
              Preencha os dados abaixo para solicitar seu agendamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="professional">Profissional</Label>
                  <Select
                    value={formData.professionalId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, professionalId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o profissional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Dr. João Silva</SelectItem>
                      <SelectItem value="2">Dra. Maria Santos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="preferredDate">Data Preferencial</Label>
                    <Calendar
                      mode="single"
                      selected={formData.preferredDate}
                      onSelect={(date) =>
                        setFormData({ ...formData, preferredDate: date })
                      }
                      className="rounded-md border"
                      locale={ptBR}
                    />
                  </div>

                  <div>
                    <Label htmlFor="preferredTime">Horário Preferencial</Label>
                    <Input
                      type="time"
                      value={formData.preferredTime}
                      onChange={(e) =>
                        setFormData({ ...formData, preferredTime: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="patientName">Nome Completo</Label>
                    <Input
                      id="patientName"
                      value={formData.patientName}
                      onChange={(e) =>
                        setFormData({ ...formData, patientName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="age">Idade</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({ ...formData, age: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) =>
                        setFormData({ ...formData, cpf: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="sus">Cartão SUS</Label>
                    <Input
                      id="sus"
                      value={formData.sus}
                      onChange={(e) =>
                        setFormData({ ...formData, sus: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Telefone de Contato</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-md flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Seus dados pessoais serão tratados de acordo com a Lei Geral de
                  Proteção de Dados (LGPD) e utilizados apenas para fins de
                  agendamento e atendimento médico.
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-md">
                <p className="text-sm text-yellow-800 font-medium">
                  Importante: Lembre-se de trazer seu CPF e cartão SUS no dia da
                  consulta. Mesmo com senha, a ordem de atendimento é por ordem de
                  chegada.
                </p>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="w-full sm:w-auto"
            >
              Solicitar Agendamento
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentRequest;