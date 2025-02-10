
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Patient } from "@/types/patient";

export const usePatientSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

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

  return {
    searchTerm,
    setSearchTerm,
    patients,
    showSearchResults,
    setShowSearchResults,
    handleSearch,
  };
};
