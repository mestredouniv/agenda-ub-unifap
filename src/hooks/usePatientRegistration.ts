
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { HanseniaseRecord } from "@/types/patient";

export const usePatientRegistration = () => {
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

  return {
    personalData,
    treatmentData,
    handlePersonalDataChange,
    handleTreatmentDataChange,
    handleRegisterPatient,
  };
};
