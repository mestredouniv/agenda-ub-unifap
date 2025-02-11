import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { Home, Printer, Share2, Plus, Edit2, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { UnavailableDaysSelector } from "@/components/UnavailableDaysSelector";
import { BackToHomeButton } from "@/components/BackToHomeButton";

interface Appointment {
  id: number;
  date: Date;
  patientName: string;
  time: string;
  appointmentType: string;
  birthDate: string;
  hasRecord: "yes" | "no" | "electronic";
  responsible: string;
  phone: string;
}

interface AppointmentFormData {
  patientName: string;
  time: string;
  appointmentType: string;
  birthDate: string;
  hasRecord: "yes" | "no" | "electronic";
  responsible: string;
  phone: string;
}

const ProfessionalSchedule = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "M"));
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [unavailableDays, setUnavailableDays] = useState<Date[]>([]);
  const [isSelectingUnavailableDays, setIsSelectingUnavailableDays] = useState(false);

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

  const handleAddAppointment = (formData: AppointmentFormData) => {
    // Check if the selected date is marked as unavailable
    if (isDateUnavailable(selectedDate || new Date())) {
      toast({
        title: "Data Indisponível",
        description: "O profissional não está disponível nesta data. Por favor, selecione outra data.",
        variant: "destructive",
      });
      return;
    }

    const newAppointment: Appointment = {
      id: appointments.length + 1,
      date: selectedDate || new Date(),
      ...formData,
    };
    setAppointments([...appointments, newAppointment]);
    setIsAddingAppointment(false);
    toast({
      title: "Consulta agendada",
      description: "A consulta foi agendada com sucesso!",
    });
  };

  const handleEditAppointment = (appointment: Appointment) => {
    const updatedAppointments = appointments.map((app) =>
      app.id === appointment.id ? appointment : app
    );
    setAppointments(updatedAppointments);
    setEditingAppointment(null);
    toast({
      title: "Consulta atualizada",
      description: "As alterações foram salvas com sucesso!",
    });
  };

  const handleDeleteAppointment = (appointmentId: number) => {
    setAppointments(appointments.filter((app) => app.id !== appointmentId));
    toast({
      title: "Consulta removida",
      description: "A consulta foi removida com sucesso!",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    toast({
      title: "Compartilhar agenda",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  const handleUnavailableDaysChange = (days: Date[]) => {
    setUnavailableDays(days);
    toast({
      title: "Dias indisponíveis atualizados",
      description: "O calendário foi atualizado com os dias de ausência.",
    });
  };

  const isDateUnavailable = (date: Date) => {
    return unavailableDays.some(
      (unavailableDate) =>
        format(unavailableDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
  };

  const getRecordStatus = (hasRecord: "yes" | "no" | "electronic") => {
    switch (hasRecord) {
      case "yes":
        return "Sim";
      case "no":
        return "Não";
      case "electronic":
        return "Prontuário Eletrônico";
      default:
        return "Não";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BackToHomeButton />
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
              <Button
                variant="outline"
                onClick={() => setIsSelectingUnavailableDays(true)}
                className="flex items-center gap-2"
              >
                <CalendarIcon className="h-4 w-4" />
                Organizar Meu Horário
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setIsAddingAppointment(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Agendar Consulta
                  </Button>
                </DialogTrigger>
              </Dialog>

              <Select
                value={selectedMonth}
                onValueChange={(value) => setSelectedMonth(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={format(new Date(), "MMMM", { locale: ptBR })} />
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
                  <TableHead>Ações</TableHead>
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
                      {getRecordStatus(appointment.hasRecord)}
                    </TableCell>
                    <TableCell>{appointment.responsible}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingAppointment(appointment)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          className="text-destructive hover:text-destructive/90"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={isAddingAppointment} onOpenChange={setIsAddingAppointment}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agendar Consulta</DialogTitle>
            <DialogDescription>
              Preencha os dados para agendar uma nova consulta
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              locale={ptBR}
              disabled={(date) => isDateUnavailable(date)}
            />
            <AppointmentForm
              onSubmit={handleAddAppointment}
              initialData={null}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSelectingUnavailableDays} onOpenChange={setIsSelectingUnavailableDays}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Organizar Meu Horário</DialogTitle>
            <DialogDescription>
              Selecione os dias em que não estará disponível e configure seus horários de atendimento
            </DialogDescription>
          </DialogHeader>
          <UnavailableDaysSelector
            professionalId="1" // Você pode ajustar isso para usar o ID do profissional atual
            selectedDays={unavailableDays}
            onChange={handleUnavailableDaysChange}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingAppointment} onOpenChange={() => setEditingAppointment(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Consulta</DialogTitle>
            <DialogDescription>
              Modifique os dados da consulta
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Calendar
              mode="single"
              selected={editingAppointment?.date}
              onSelect={(date) =>
                editingAppointment &&
                setEditingAppointment({ ...editingAppointment, date: date || new Date() })
              }
              className="rounded-md border"
              locale={ptBR}
              disabled={(date) => isDateUnavailable(date)}
            />
            {editingAppointment && (
              <AppointmentForm
                onSubmit={(formData) =>
                  handleEditAppointment({ ...editingAppointment, ...formData })
                }
                initialData={editingAppointment}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AppointmentForm = ({
  onSubmit,
  initialData,
}: {
  onSubmit: (data: AppointmentFormData) => void;
  initialData: Appointment | null;
}) => {
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientName: initialData?.patientName || "",
    time: initialData?.time || "",
    appointmentType: initialData?.appointmentType || "",
    birthDate: initialData?.birthDate || "",
    hasRecord: initialData?.hasRecord || "no",
    responsible: initialData?.responsible || "",
    phone: initialData?.phone || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <Input
          placeholder="Nome do Paciente"
          value={formData.patientName}
          onChange={(e) =>
            setFormData({ ...formData, patientName: e.target.value })
          }
        />
        <Input
          type="time"
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
        />
        <Input
          placeholder="Tipo de Consulta"
          value={formData.appointmentType}
          onChange={(e) =>
            setFormData({ ...formData, appointmentType: e.target.value })
          }
        />
        <Input
          type="date"
          value={formData.birthDate}
          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
        />
        <Input
          placeholder="Telefone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <div className="space-y-2">
          <label className="text-sm font-medium">Prontuário</label>
          <Select
            value={formData.hasRecord}
            onValueChange={(value) =>
              setFormData({ ...formData, hasRecord: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Possui prontuário?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Sim</SelectItem>
              <SelectItem value="no">Não</SelectItem>
              <SelectItem value="electronic">Prontuário Eletrônico</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="Responsável"
          value={formData.responsible}
          onChange={(e) =>
            setFormData({ ...formData, responsible: e.target.value })
          }
        />
      </div>
      <Button type="submit" className="w-full">
        {initialData ? "Salvar Alterações" : "Agendar Consulta"}
      </Button>
    </form>
  );
};

export default ProfessionalSchedule;
