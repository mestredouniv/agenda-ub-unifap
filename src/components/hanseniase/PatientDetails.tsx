
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalDataForm } from "@/components/PersonalDataForm";
import { Patient } from "@/types/patient";
import { TreatmentDataForm } from "./TreatmentDataForm";

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
          </TabsContent>
          <TabsContent value="treatment">
            <TreatmentDataForm
              formData={treatmentData}
              onChange={onTreatmentDataChange}
              onSubmit={() => {}}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
