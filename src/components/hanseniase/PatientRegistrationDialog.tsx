
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalDataForm } from "@/components/PersonalDataForm";
import { TreatmentDataForm } from "./TreatmentDataForm";
import { BasicPersonalData } from "@/types/appointment";

interface PatientRegistrationDialogProps {
  personalData: Omit<BasicPersonalData, 'birth_date'> & {
    birth_date: string;
    address: string;
    cep: string;
    neighborhood: string;
    city: string;
  };
  treatmentData: {
    pb: string;
    mb: string;
    classification: string;
    treatment_start_date: string;
  };
  onPersonalDataChange: (field: string, value: string) => void;
  onTreatmentDataChange: (field: string, value: string) => void;
  onSubmit: () => void;
}

export const PatientRegistrationDialog = ({
  personalData,
  treatmentData,
  onPersonalDataChange,
  onTreatmentDataChange,
  onSubmit,
}: PatientRegistrationDialogProps) => {
  return (
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
              formData={{
                patientName: personalData.patientName,
                age: personalData.age,
                birth_date: personalData.birth_date,
                cpf: personalData.cpf,
                sus: personalData.sus,
                phone: personalData.phone,
                responsible: personalData.responsible,
              }}
              onChange={onPersonalDataChange}
            />
          </TabsContent>
          <TabsContent value="treatment">
            <TreatmentDataForm
              formData={treatmentData}
              onChange={onTreatmentDataChange}
              onSubmit={onSubmit}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
