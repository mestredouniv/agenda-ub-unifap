
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { ConsultaHeader } from "@/components/ConsultaHeader";
import { Download, Plus, Printer, Search, Share2, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { ptBR } from "date-fns/locale";
import { PersonalDataForm } from "@/components/PersonalDataForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Patient {
  id: string;
  full_name: string;
  address: string;
  sus_number: string;
  phone: string;
  cpf: string;
  birth_date: string;
}

interface HanseniaseRecord {
  id: string;
  patient_id: string;
  pb: string;
  mb: string;
  classification: string;
  treatment_start_date: string;
}

const Hanseniase = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [personalData, setPersonalData] = useState({
    patientName: "",
    cpf: "",
    sus: "",
    age: "",
    phone: "",
  });
  const [treatmentData, setTreatmentData] = useState<Omit<HanseniaseRecord, 'id' | 'patient_id'>>({
    pb: "",
    mb: "",
    classification: "",
    treatment_start_date: "",
  });

  const handlePersonalDataChange = (field: string, value: string) => {
    setPersonalData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTreatmentDataChange = (field: string, value: string) => {
    setTreatmentData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRegisterPatient = async () => {
    try {
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .insert([{
          full_name: personalData.patientName,
          cpf: personalData.cpf,
          sus_number: personalData.sus,
          birth_date: new Date().toISOString(),
          phone: personalData.phone,
        }])
        .select()
        .single();

      if (patientError) throw patientError;

      if (patientData) {
        const { error: recordError } = await supabase
          .from('hanseniase_records')
          .insert([{
            patient_id: patientData.id,
            ...treatmentData,
          }]);

        if (recordError) throw recordError;

        toast.success("Paciente registrado com sucesso!");
        setPersonalData({
          patientName: "",
          cpf: "",
          sus: "",
          age: "",
          phone: "",
        });
        setTreatmentData({
          pb: "",
          mb: "",
          classification: "",
          treatment_start_date: "",
        });
      }
    } catch (error) {
      console.error('Erro ao registrar paciente:', error);
      toast.error("Erro ao registrar paciente");
    }
  };

  const handleSearch = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select()
        .or(`full_name.ilike.%${searchTerm}%,cpf.eq.${searchTerm},sus_number.eq.${searchTerm}`);

      if (error) throw error;

      setPatients(data || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Erro na busca:', error);
      toast.error("Erro ao buscar pacientes");
    }
  };

  const handleSelectPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    setShowSearchResults(false);
    try {
      const { data, error } = await supabase
        .from('hanseniase_records')
        .select()
        .eq('patient_id', patient.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setTreatmentData({
          pb: data.pb,
          mb: data.mb,
          classification: data.classification,
          treatment_start_date: data.treatment_start_date,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar registro:', error);
      toast.error("Erro ao carregar dados do paciente");
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);

      if (error) throw error;

      setPatients(patients.filter(p => p.id !== patientId));
      toast.success("Paciente removido com sucesso");
    } catch (error) {
      console.error('Erro ao deletar paciente:', error);
      toast.error("Erro ao remover paciente");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const data = JSON.stringify(patients, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hanseniase-${selectedDate ? selectedDate.toISOString().split('T')[0] : 'dados'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dados Hanseníase',
          text: JSON.stringify(patients, null, 2),
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <BackToHomeButton />
      <ConsultaHeader />
      
      <div className="flex gap-2 mb-4">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="mr-2" />
          Imprimir
        </Button>
        <Button onClick={handleDownload} variant="outline">
          <Download className="mr-2" />
          Baixar
        </Button>
        <Button onClick={handleShare} variant="outline">
          <Share2 className="mr-2" />
          Compartilhar
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar por nome, CPF ou número do SUS"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button onClick={handleSearch}>
              <Search className="mr-2" />
              Buscar
            </Button>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2" />
              Novo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Paciente</DialogTitle>
              <DialogDescription>
                Preencha os dados do paciente para criar um novo registro.
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="personal" className="w-full">
              <TabsList>
                <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
                <TabsTrigger value="treatment">Dados do Tratamento</TabsTrigger>
              </TabsList>
              <TabsContent value="personal">
                <PersonalDataForm
                  formData={personalData}
                  onChange={handlePersonalDataChange}
                />
              </TabsContent>
              <TabsContent value="treatment">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pb">PB</Label>
                    <Input
                      id="pb"
                      value={treatmentData.pb}
                      onChange={(e) => handleTreatmentDataChange("pb", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mb">MB</Label>
                    <Input
                      id="mb"
                      value={treatmentData.mb}
                      onChange={(e) => handleTreatmentDataChange("mb", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="classification">Classificação</Label>
                    <Input
                      id="classification"
                      value={treatmentData.classification}
                      onChange={(e) => handleTreatmentDataChange("classification", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="treatment_start_date">Data de Início</Label>
                    <Input
                      id="treatment_start_date"
                      type="date"
                      value={treatmentData.treatment_start_date}
                      onChange={(e) => handleTreatmentDataChange("treatment_start_date", e.target.value)}
                    />
                  </div>
                  <Button onClick={handleRegisterPatient} className="w-full">
                    <Plus className="mr-2" />
                    Registrar Paciente
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {showSearchResults && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Busca</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>SUS</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>{patient.full_name}</TableCell>
                    <TableCell>{patient.cpf}</TableCell>
                    <TableCell>{patient.sus_number}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSelectPatient(patient)}
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePatient(patient.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {selectedPatient && (
        <Card>
          <CardHeader>
            <CardTitle>Dados do Paciente: {selectedPatient.full_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="edit">
              <TabsList>
                <TabsTrigger value="edit">Editar Dados</TabsTrigger>
                <TabsTrigger value="treatment">Acompanhamento</TabsTrigger>
              </TabsList>
              <TabsContent value="edit">
                <div className="space-y-4">
                  {/* Patient edit form will go here */}
                </div>
              </TabsContent>
              <TabsContent value="treatment">
                <div className="space-y-4">
                  {/* Treatment tracking table will go here */}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Hanseniase;
