
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { ConsultaHeader } from "@/components/ConsultaHeader";
import { Download, Printer, Search, Share2, UserPlus } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SearchResultsTable } from "@/components/hanseniase/SearchResultsTable";
import { TreatmentDataForm } from "@/components/hanseniase/TreatmentDataForm";
import { PatientDetails } from "@/components/hanseniase/PatientDetails";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalDataForm } from "@/components/PersonalDataForm";
import { Patient, HanseniaseRecord } from "@/types/patient";

const Hanseniase = () => {
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
      // Ensure we have a treatment start date before proceeding
      if (!treatmentData.treatment_start_date) {
        toast.error("Por favor, selecione uma data de início do tratamento");
        return;
      }

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
            pb: treatmentData.pb,
            mb: treatmentData.mb,
            classification: treatmentData.classification,
            treatment_start_date: treatmentData.treatment_start_date,
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
    link.download = "hanseniase-dados.json";
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
                <TreatmentDataForm
                  formData={treatmentData}
                  onChange={handleTreatmentDataChange}
                  onSubmit={handleRegisterPatient}
                />
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
            <SearchResultsTable
              patients={patients}
              onSelectPatient={handleSelectPatient}
              onDeletePatient={handleDeletePatient}
            />
          </CardContent>
        </Card>
      )}

      {selectedPatient && (
        <PatientDetails
          patient={selectedPatient}
          treatmentData={treatmentData}
          onTreatmentDataChange={handleTreatmentDataChange}
          onPersonalDataChange={handlePersonalDataChange}
        />
      )}
    </div>
  );
};

export default Hanseniase;
