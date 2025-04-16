
import { Professional } from "@/types/professional";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNetworkStatus } from "@/contexts/NetworkStatusContext";

export const useCreateProfessional = (onSuccess?: (professional: Professional) => void) => {
  const { toast } = useToast();
  const { status } = useNetworkStatus();

  const addProfessional = async (name: string, profession: string) => {
    if (!status.isOnline || status.serverReachable === false) {
      toast({
        title: "Erro de conexão",
        description: "Você está offline. Não é possível adicionar profissionais.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      console.log("Adding professional:", { name, profession });
      
      if (!name || !profession) {
        throw new Error("Nome e profissão são obrigatórios");
      }
      
      const { data, error } = await supabase
        .from('professionals')
        .insert([{ 
          name, 
          profession,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Insert error details:', error);
        throw error;
      }

      console.log("Added professional:", data);
      if (onSuccess) {
        onSuccess(data);
      }
      
      toast({
        title: "Sucesso",
        description: "Profissional adicionado com sucesso.",
      });
      return true;
    } catch (error) {
      console.error('Error adding professional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o profissional. Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { addProfessional };
};
