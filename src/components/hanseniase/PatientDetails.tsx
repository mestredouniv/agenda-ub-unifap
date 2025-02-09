
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalDataForm } from "@/components/PersonalDataForm";
import { Patient, HanseniaseTreatment } from "@/types/patient";
import { TreatmentDataForm } from "./TreatmentDataForm";
import { TreatmentTable } from "./TreatmentTable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
}

export const PatientDetails = ({
  patient,
  treatmentData,
  onTreatmentDataChange,
  onPersonalDataChange,
}: PatientDetailsProps) => {
  const [treatments, setTreatments] = useState<HanseniaseTreatment[]>([]);

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados do Paciente: {patient.full_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="edit">
          <TabsList>
            <TabsTrigger value="edit">Editar Dados</TabsTrigger>
            <TabsTrigger value="treatment">Acompanhamento</TabsTrigger>
          </TabsList>
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
          <TabsContent value="treatment">
            <div className="space-y-6">
              <TreatmentDataForm
                formData={treatmentData}
                onChange={onTreatmentDataChange}
                onSubmit={handlePrint}
              />
              <TreatmentTable patientId={patient.id} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
