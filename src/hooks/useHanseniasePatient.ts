
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Patient, HanseniaseRecord } from "@/types/patient";

export const useHanseniasePatient = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [treatmentData, setTreatmentData] = useState<Omit<HanseniaseRecord, 'id' | 'patient_id'>>({
    pb: "",
    mb: "",
    classification: "",
    treatment_start_date: "",
  });

  const handleTreatmentDataChange = (field: string, value: string) => {
    setTreatmentData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    try {
      const { data, error } = await supabase
        .from('hanseniase_records')
        .select()
        .eq('patient_id', patient.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setTreatmentData({
          pb: data.pb,
          mb: data.mb,
          classification: data.classification,
          treatment_start_date: data.treatment_start_date,
        });
      } else {
        setTreatmentData({
          pb: "",
          mb: "",
          classification: "",
          treatment_start_date: "",
        });
      }
    } catch (error) {
      console.error('Erro ao carregar registro:', error);
      toast.error("Erro ao carregar dados do paciente");
    }
  };

  const handleDownload = async () => {
    if (!selectedPatient) return;
    
    try {
      const { data: record, error: recordError } = await supabase
        .from('hanseniase_records')
        .select('*')
        .eq('patient_id', selectedPatient.id)
        .single();

      if (recordError) throw recordError;

      const { data: treatments, error: treatmentsError } = await supabase
        .from('hanseniase_treatments')
        .select('*')
        .eq('record_id', record.id);

      if (treatmentsError) throw treatmentsError;

      const reportData = {
        patient: {
          name: selectedPatient.full_name,
          cpf: selectedPatient.cpf,
          sus_number: selectedPatient.sus_number,
        },
        treatment: {
          pb: record.pb,
          mb: record.mb,
          classification: record.classification,
          treatment_start_date: record.treatment_start_date,
        },
        followups: treatments || [],
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `hanseniase-${selectedPatient.full_name}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Relatório baixado com sucesso!");
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
      toast.error("Erro ao gerar relatório");
    }
  };

  const handleShare = async () => {
    if (!selectedPatient || !navigator.share) return;
    
    try {
      const { data: record, error: recordError } = await supabase
        .from('hanseniase_records')
        .select('*')
        .eq('patient_id', selectedPatient.id)
        .single();

      if (recordError) throw recordError;

      const { data: treatments, error: treatmentsError } = await supabase
        .from('hanseniase_treatments')
        .select('*')
        .eq('record_id', record.id);

      if (treatmentsError) throw treatmentsError;

      const reportData = {
        patient: {
          name: selectedPatient.full_name,
          cpf: selectedPatient.cpf,
          sus_number: selectedPatient.sus_number,
        },
        treatment: {
          pb: record.pb,
          mb: record.mb,
          classification: record.classification,
          treatment_start_date: record.treatment_start_date,
        },
        followups: treatments || [],
      };

      await navigator.share({
        title: `Relatório Hanseníase - ${selectedPatient.full_name}`,
        text: JSON.stringify(reportData, null, 2),
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast.error("Erro ao compartilhar relatório");
    }
  };

  return {
    selectedPatient,
    setSelectedPatient,
    treatmentData,
    handleTreatmentDataChange,
    handleSelectPatient,
    handleDownload,
    handleShare,
  };
};
