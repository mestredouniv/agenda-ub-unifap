import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home, Printer, Share2 } from "lucide-react";

interface Appointment {
  id: number;
  date: Date;
  patientName: string;
  time: string;
  appointmentType: string;
  birthDate: string;
  hasRecord: boolean;
  responsible: string;
}

const ProfessionalSchedule = () => {
  const navigate = useNavigate();
  const currentMonth = format(new Date(), "MMMM", { locale: ptBR });
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "M"));

  // Dados de exemplo - substituir por dados reais posteriormente
  const appointments: Appointment[] = [
    {
      id: 1,
      date: new Date(),
      patientName: "João Silva",
      time: "08:00",
      appointmentType: "Consulta Regular",
      birthDate: "1990-05-15",
      hasRecord: true,
      responsible: "Dr. André",
    },
    // Adicione mais agendamentos conforme necessário
  ];

  const months = [
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    // Implementar lógica de compartilhamento
    console.log("Compartilhar agenda");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho fixo */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/")}
              className="hover:bg-primary/10"
            >
              <Home className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-4">
              <Select
                value={selectedMonth}
                onValueChange={(value) => setSelectedMonth(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={currentMonth} />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={handlePrint}
                className="hover:bg-primary/10"
              >
                <Printer className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                className="hover:bg-primary/10"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Espaçamento para o cabeçalho fixo */}
      <div className="pt-24">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Dia</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data Nasc.</TableHead>
                  <TableHead>Prontuário</TableHead>
                  <TableHead>Responsável</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      {format(appointment.date, "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      {format(appointment.date, "EEEE", { locale: ptBR })}
                    </TableCell>
                    <TableCell>{appointment.patientName}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>{appointment.appointmentType}</TableCell>
                    <TableCell>{appointment.birthDate}</TableCell>
                    <TableCell>
                      {appointment.hasRecord ? "Sim" : "Não"}
                    </TableCell>
                    <TableCell>{appointment.responsible}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalSchedule;