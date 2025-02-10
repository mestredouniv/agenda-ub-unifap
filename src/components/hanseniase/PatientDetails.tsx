
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalDataForm } from "@/components/PersonalDataForm";
import { Patient, HanseniaseTreatment } from "@/types/patient";
import { TreatmentDataForm } from "./TreatmentDataForm";
import { TreatmentTable } from "./TreatmentTable";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface PatientDetailsProps {
  patient: Patient;
  treatmentData: {
    pb: string;
    mb: string;
    classification: string;
    treatment_start_date: string;
  };
  onTreatmentDataChange: (field: string, value: string) => void;
  onPersonalDataChange: (field: string, value: string) => void;
  onBack: () => void;
}

export const PatientDetails = ({
  patient,
  treatmentData,
  onTreatmentDataChange,
  onPersonalDataChange,
  onBack,
}: PatientDetailsProps) => {
  const [treatments, setTreatments] = useState<HanseniaseTreatment[]>([]);
  const navigate = useNavigate();

  const handleUpdatePatient = async () => {
    try {
      const { error } = await supabase
        .from('patients')
        .update({
          full_name: patient.full_name,
          cpf: patient.cpf,
          sus_number: patient.sus_number,
          birth_date: patient.birth_date,
          phone: patient.phone,
        })
        .eq('id', patient.id);

      if (error) throw error;
      toast.success("Dados do paciente atualizados com sucesso!");
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      toast.error("Erro ao atualizar dados do paciente");
    }
  };

  const handleDeletePatient = async () => {
    if (!confirm("Tem certeza que deseja excluir este paciente?")) return;

    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patient.id);

      if (error) throw error;
      toast.success("Paciente excluído com sucesso");
      navigate("/hanseniase");
    } catch (error) {
      console.error('Erro ao excluir paciente:', error);
      toast.error("Erro ao excluir paciente");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <Button variant="ghost" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <CardTitle className="inline">Dados do Paciente: {patient.full_name}</CardTitle>
        </div>
        <Button variant="destructive" onClick={handleDeletePatient}>
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir Paciente
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="treatment">
          <TabsList>
            <TabsTrigger value="treatment">Acompanhamento</TabsTrigger>
            <TabsTrigger value="edit">Editar Dados</TabsTrigger>
          </TabsList>
          <TabsContent value="treatment">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">PB (Paucibacilar)</label>
                    <TreatmentDataForm
                      formData={treatmentData}
                      onChange={onTreatmentDataChange}
                      mode="edit"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">MB (Multibacilar)</label>
                  </div>
                </div>
              </div>
              <TreatmentTable patientId={patient.id} />
            </div>
          </TabsContent>
          <TabsContent value="edit">
            <div className="space-y-4">
              <PersonalDataForm
                formData={{
                  patientName: patient.full_name,
                  cpf: patient.cpf || "",
                  sus: patient.sus_number || "",
                  age: "",
                  phone: patient.phone || "",
                }}
                onChange={onPersonalDataChange}
              />
              <Button onClick={handleUpdatePatient} className="w-full">
                Atualizar Dados
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
