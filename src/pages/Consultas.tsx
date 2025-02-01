import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AttendingProfessionals } from "@/components/AttendingProfessionals";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  UserRound, 
  Stethoscope, 
  ClipboardCheck,
  Bell
} from "lucide-react";

interface Patient {
  id: number;
  name: string;
  birthDate: string;
  password: string;
  triageStatus: "waiting" | "in_progress" | "completed";
  consultationStatus: "waiting" | "in_progress" | "completed";
  triageTime?: string;
}

const initialPatients: Patient[] = [
  {
    id: 1,
    name: "João Silva",
    birthDate: "1990-05-15",
    password: "A001",
    triageStatus: "completed",
    consultationStatus: "waiting",
    triageTime: "09:30"
  },
  {
    id: 2,
    name: "Maria Santos",
    birthDate: "1985-08-22",
    password: "A002",
    triageStatus: "in_progress",
    consultationStatus: "waiting"
  }
];

const Consultas = () => {
  const [selectedProfessional, setSelectedProfessional] = useState<string>("all");
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [showNotification, setShowNotification] = useState(false);
  const { toast } = useToast();

  const handleTriageComplete = (patientId: number) => {
    setPatients(patients.map(patient => 
      patient.id === patientId 
        ? { 
            ...patient, 
            triageStatus: "completed", 
            triageTime: format(new Date(), "HH:mm") 
          } 
        : patient
    ));
    toast({
      title: "Triagem finalizada",
      description: "O paciente está liberado para consulta"
    });
  };

  const handleConsultationStart = (patientId: number) => {
    setPatients(patients.map(patient => 
      patient.id === patientId 
        ? { ...patient, consultationStatus: "in_progress" } 
        : patient
    ));
    toast({
      title: "Consulta iniciada",
      description: "O paciente foi chamado para atendimento"
    });
  };

  const handleConsultationComplete = (patientId: number) => {
    setPatients(patients.map(patient => 
      patient.id === patientId 
        ? { ...patient, consultationStatus: "completed" } 
        : patient
    ));
    toast({
      title: "Consulta finalizada",
      description: "O paciente foi liberado"
    });
    setShowNotification(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Acompanhamento de Consultas</h1>
      
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Profissionais em Atendimento</h2>
          <AttendingProfessionals professionals={[]} />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Filtrar por Profissional</h2>
          <Select
            value={selectedProfessional}
            onValueChange={setSelectedProfessional}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um profissional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Profissionais</SelectItem>
              <SelectItem value="1">Dr. Anderson</SelectItem>
              <SelectItem value="2">Dra. Liliany</SelectItem>
            </SelectContent>
          </Select>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Pacientes</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Senha</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Data de Nascimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.password}</TableCell>
                <TableCell>{patient.name}</TableCell>
                <TableCell>
                  {format(new Date(patient.birthDate), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  {patient.triageStatus === "completed" ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <ClipboardCheck className="h-4 w-4" />
                      Triagem Concluída
                    </span>
                  ) : patient.triageStatus === "in_progress" ? (
                    <span className="text-yellow-600">Em Triagem</span>
                  ) : (
                    <span className="text-gray-600">Aguardando</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTriageComplete(patient.id)}
                      disabled={
                        patient.triageStatus === "completed" ||
                        patient.consultationStatus !== "waiting"
                      }
                    >
                      <ClipboardCheck className="h-4 w-4 mr-1" />
                      Triagem
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => 
                        patient.consultationStatus === "waiting"
                          ? handleConsultationStart(patient.id)
                          : handleConsultationComplete(patient.id)
                      }
                      disabled={
                        patient.triageStatus !== "completed" ||
                        patient.consultationStatus === "completed"
                      }
                    >
                      <Stethoscope className="h-4 w-4 mr-1" />
                      {patient.consultationStatus === "waiting"
                        ? "Iniciar"
                        : "Finalizar"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {showNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Paciente Liberado</h3>
            </div>
            <p className="mb-4">Deseja chamar o próximo paciente?</p>
            <div className="space-y-4">
              <h4 className="font-medium">Pacientes triados:</h4>
              {patients
                .filter(p => p.triageStatus === "completed" && p.consultationStatus === "waiting")
                .map(patient => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-gray-500">
                        Triagem: {patient.triageTime}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        handleConsultationStart(patient.id);
                        setShowNotification(false);
                      }}
                    >
                      Chamar
                    </Button>
                  </div>
                ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowNotification(false)}
              >
                Fechar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Consultas;