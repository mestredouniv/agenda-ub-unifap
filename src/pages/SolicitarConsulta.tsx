import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ptBR } from "date-fns/locale";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";

interface Professional {
  id: string;
  name: string;
  profession: string;
}

const SolicitarConsulta = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    patientName: "",
    cpf: "",
    sus: "",
    age: "",
    phone: "",
    responsible: "",
    professionalId: "",
    preferredDate: undefined as Date | undefined,
    preferredTime: "",
  });

  const [requests, setRequests] = useState(() => {
    const stored = localStorage.getItem("appointments");
    return stored ? JSON.parse(stored) : [];
  });

  const professionals = [
    { id: "1", name: "Dr. Anderson", profession: "Médico" },
    { id: "2", name: "Dra. Liliany", profession: "Psicóloga" },
  ];

  const { slots: availableSlots } = useAvailableSlots(
    formData.professionalId,
    formData.preferredDate
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.professionalId || !formData.preferredDate || !formData.preferredTime) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const newAppointment = {
      id: crypto.randomUUID(),
      ...formData,
      status: "pending",
      preferredDate: formData.preferredDate.toISOString(),
    };

    const updatedRequests = [...requests, newAppointment];
    setRequests(updatedRequests);
    localStorage.setItem("appointments", JSON.stringify(updatedRequests));

    toast({
      title: "Solicitação enviada",
      description: "Sua solicitação foi enviada com sucesso!",
    });

    // Reset form
    setFormData({
      patientName: "",
      cpf: "",
      sus: "",
      age: "",
      phone: "",
      responsible: "",
      professionalId: "",
      preferredDate: undefined,
      preferredTime: "",
    });
  };

  const filteredRequests = requests.filter(
    (request: any) =>
      request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      new Date(request.preferredDate) >= new Date()
  );

  const formatPhone = (phone: string) => {
    return phone.slice(0, 4) + "****" + phone.slice(-4);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">UNIVERSIDADE FEDERAL DO AMAPÁ</h1>
        <h2 className="text-xl">UNIDADE BÁSICA DE SAÚDE</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitar Consulta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="professional">Profissional</Label>
                <Select
                  value={formData.professionalId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, professionalId: value, preferredTime: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionals.map((prof) => (
                      <SelectItem key={prof.id} value={prof.id}>
                        {prof.name} - {prof.profession}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="preferredTime">Horário</Label>
                <Select
                  value={formData.preferredTime}
                  onValueChange={(value) =>
                    setFormData({ ...formData, preferredTime: value })
                  }
                  disabled={!formData.preferredDate || !availableSlots.length}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.map((slot) => (
                      <SelectItem key={slot.time} value={slot.time}>
                        {slot.time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="sus">Cartão SUS</Label>
                <Input
                  id="sus"
                  value={formData.sus}
                  onChange={(e) => setFormData({ ...formData, sus: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            {parseInt(formData.age) < 18 && (
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

            <div>
              <Label>Data Preferencial</Label>
              <Calendar
                mode="single"
                selected={formData.preferredDate}
                onSelect={(date) =>
                  setFormData({ ...formData, preferredDate: date, preferredTime: "" })
                }
                className="rounded-md border"
                locale={ptBR}
              />
            </div>

            <Button type="submit" className="w-full">
              Solicitar Consulta
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Solicitações</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar solicitação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRequests.map((request: any) => (
              <div
                key={request.id}
                className="flex justify-between items-center p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {request.patientName.split(" ")[0]}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tel: {formatPhone(request.phone)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">
                    {new Date(request.preferredDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {request.preferredTime}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SolicitarConsulta;