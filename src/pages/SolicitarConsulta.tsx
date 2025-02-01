import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { Search, Asterisk } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ptBR } from "date-fns/locale";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";
import { Badge } from "@/components/ui/badge";

interface Professional {
  id: string;
  name: string;
  profession: string;
}

const RequiredField = () => (
  <Asterisk className="inline-block h-2 w-2 text-red-500 ml-1" />
);

const SolicitarConsulta = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
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

  // Load professionals from localStorage and watch for changes
  useEffect(() => {
    const loadProfessionals = () => {
      const storedProfessionals = JSON.parse(localStorage.getItem("professionals") || "[]");
      setProfessionals(storedProfessionals);
    };

    loadProfessionals();
    window.addEventListener("storage", loadProfessionals);
    return () => window.removeEventListener("storage", loadProfessionals);
  }, []);

  const { slots: availableSlots } = useAvailableSlots(
    formData.professionalId,
    formData.preferredDate
  );

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {};
    const requiredFields = ["patientName", "cpf", "sus", "age", "phone", "professionalId", "preferredDate", "preferredTime"];
    
    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = true;
      }
    });

    if (parseInt(formData.age) < 18 && !formData.responsible) {
      newErrors.responsible = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
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
      preferredDate: formData.preferredDate?.toISOString(),
    };

    const updatedRequests = [...requests, newAppointment];
    setRequests(updatedRequests);
    localStorage.setItem("appointments", JSON.stringify(updatedRequests));

    toast({
      title: "Solicitação enviada",
      description: "Sua solicitação foi enviada com sucesso!",
    });

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
      <div className="text-center space-y-2 bg-primary/5 p-6 rounded-lg">
        <h1 className="text-2xl font-bold text-primary">UNIVERSIDADE FEDERAL DO AMAPÁ</h1>
        <h2 className="text-xl text-primary/80">UNIDADE BÁSICA DE SAÚDE</h2>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">Solicitar Consulta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="professional" className="flex items-center">
                  Profissional <RequiredField />
                </Label>
                <Select
                  value={formData.professionalId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, professionalId: value, preferredTime: "" })
                  }
                >
                  <SelectTrigger className={errors.professionalId ? "border-red-500" : ""}>
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
                <Label htmlFor="preferredTime" className="flex items-center">
                  Horário <RequiredField />
                </Label>
                <Select
                  value={formData.preferredTime}
                  onValueChange={(value) =>
                    setFormData({ ...formData, preferredTime: value })
                  }
                  disabled={!formData.preferredDate || !availableSlots.length}
                >
                  <SelectTrigger className={errors.preferredTime ? "border-red-500" : ""}>
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
                <Label htmlFor="patientName" className="flex items-center">
                  Nome Completo <RequiredField />
                </Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) =>
                    setFormData({ ...formData, patientName: e.target.value })
                  }
                  className={errors.patientName ? "border-red-500" : ""}
                />
              </div>

              <div>
                <Label htmlFor="age" className="flex items-center">
                  Idade <RequiredField />
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className={errors.age ? "border-red-500" : ""}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cpf" className="flex items-center">
                  CPF <RequiredField />
                </Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  className={errors.cpf ? "border-red-500" : ""}
                />
              </div>

              <div>
                <Label htmlFor="sus" className="flex items-center">
                  Cartão SUS <RequiredField />
                </Label>
                <Input
                  id="sus"
                  value={formData.sus}
                  onChange={(e) => setFormData({ ...formData, sus: e.target.value })}
                  className={errors.sus ? "border-red-500" : ""}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone" className="flex items-center">
                Telefone <RequiredField />
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={errors.phone ? "border-red-500" : ""}
              />
            </div>

            {parseInt(formData.age) < 18 && (
              <div>
                <Label htmlFor="responsible" className="flex items-center">
                  Nome do Responsável <RequiredField />
                </Label>
                <Input
                  id="responsible"
                  value={formData.responsible}
                  onChange={(e) =>
                    setFormData({ ...formData, responsible: e.target.value })
                  }
                  className={errors.responsible ? "border-red-500" : ""}
                />
              </div>
            )}

            <div>
              <Label className="flex items-center">
                Data Preferencial <RequiredField />
              </Label>
              <Calendar
                mode="single"
                selected={formData.preferredDate}
                onSelect={(date) =>
                  setFormData({ ...formData, preferredDate: date, preferredTime: "" })
                }
                className={`rounded-md border ${errors.preferredDate ? "border-red-500" : ""}`}
                locale={ptBR}
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
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
                className="flex justify-between items-center p-4 border rounded-lg hover:bg-primary/5 transition-colors"
              >
                <div>
                  <p className="font-medium">
                    {request.patientName.split(" ")[0]}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tel: {formatPhone(request.phone)}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm">
                    {new Date(request.preferredDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {request.preferredTime}
                  </p>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Aguardando Aprovação
                  </Badge>
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