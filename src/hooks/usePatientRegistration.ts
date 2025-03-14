
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
    responsible: "",
    address: "",
    cep: "",
    neighborhood: "",
    city: "",
    birthDate: "",
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

  const checkDuplicatePatient = async () => {
    const queries = [];
    
    if (personalData.cpf) {
      queries.push(`cpf.eq.${personalData.cpf}`);
    }
    if (personalData.sus) {
      queries.push(`sus_number.eq.${personalData.sus}`);
    }
    
    if (queries.length === 0) return false;

    const { data, error } = await supabase
      .from('patients')
      .select()
      .or(queries.join(','))
      .maybeSingle();

    if (error) {
      console.error('Error checking duplicate:', error);
      return false;
    }

    return !!data;
  };

  const handleRegisterPatient = async () => {
    try {
      if (!treatmentData.treatment_start_date) {
        toast.error("Por favor, selecione uma data de início do tratamento");
        return;
      }

      const isDuplicate = await checkDuplicatePatient();
      if (isDuplicate) {
        toast.error("Paciente já cadastrado com este CPF ou número do SUS");
        return;
      }

      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .insert([{
          full_name: personalData.patientName,
          cpf: personalData.cpf,
          sus_number: personalData.sus,
          birth_date: personalData.birthDate,
          phone: personalData.phone,
          address: personalData.address,
          cep: personalData.cep,
          neighborhood: personalData.neighborhood,
          city: personalData.city
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
          responsible: "",
          address: "",
          cep: "",
          neighborhood: "",
          city: "",
          birthDate: "",
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
