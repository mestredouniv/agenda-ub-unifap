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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BackToHomeButton } from "@/components/BackToHomeButton";

interface AppointmentRequest {
  professionalId: string;
  patientName: string;
  cpf: string;
  sus: string;
  age: string;
  phone: string;
  preferredDate: Date | undefined;
  preferredTime: string;
  responsible?: string;
}

const initialProfessionals = [
  { id: 1, name: "Luciana", profession: "Psicóloga" },
  { id: 2, name: "Janaína", profession: "Psicóloga" },
  { id: 3, name: "Anna", profession: "Fisioterapeuta" },
  { id: 4, name: "Anderson", profession: "Médico" },
  { id: 5, name: "Anna", profession: "Auriculoterapeuta" },
  { id: 6, name: "Wandervan", profession: "Enfermeiro" },
  { id: 7, name: "Patrícia", profession: "Enfermeira" },
  { id: 8, name: "Liliany", profession: "Médica" },
  { id: 9, name: "Janaína", profession: "Enfermeira" },
  { id: 10, name: "Equipe", profession: "Curativo" },
  { id: 11, name: "André", profession: "Médico" },
  { id: 12, name: "Ananda", profession: "Enfermeira" },
  { id: 13, name: "Nely", profession: "Enfermeira" },
  { id: 14, name: "Luciana", profession: "Psicóloga" },
  { id: 15, name: "Janaína", profession: "Psicóloga" },
  { id: 16, name: "Equipe", profession: "Laboratório" },
  { id: 17, name: "Equipe", profession: "Gestante" },
];

const AppointmentRequest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showConfirmation, setShowConfirmation] = useState(false);
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
    setShowConfirmation(true);
    toast({
      title: "Solicitação enviada",
      description: "Sua solicitação de agendamento foi enviada com sucesso!",
    });
  };

  const isMinor = parseInt(formData.age) < 18;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <BackToHomeButton />
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
                      {initialProfessionals.map((prof) => (
                        <SelectItem key={prof.id} value={prof.id.toString()}>
                          {prof.name} - {prof.profession}
                        </SelectItem>
                      ))}
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
                      disabled={(date) => date < new Date()}
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

                {isMinor && (
                  <div>
                    <Label htmlFor="responsible">Nome do Responsável</Label>
                    <Input
                      id="responsible"
                      value={formData.responsible}
                      onChange={(e) =>
                        setFormData({ ...formData, responsible: e.target.value })
                      }
                      required
                    />
                  </div>
                )}

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

              <Button type="submit" className="w-full">
                Solicitar Agendamento
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Status da Solicitação</DialogTitle>
            <DialogDescription>
              Sua solicitação está aguardando aprovação do profissional
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-md">
              <p className="text-sm text-yellow-800">
                Aguardando confirmação do profissional. Você será notificado sobre:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-yellow-700">
                <li>• Consulta agendada com sucesso</li>
                <li>• Necessidade de remarcação</li>
                <li>• Contato com o SAME para mais informações</li>
              </ul>
            </div>
            <Button onClick={() => navigate("/")} className="w-full">
              Voltar para a Página Inicial
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentRequest;
