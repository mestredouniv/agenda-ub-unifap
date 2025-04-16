
import { Professional } from "@/types/professional";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNetworkStatus } from "@/contexts/NetworkStatusContext";

export const useUpdateProfessional = (onSuccess?: (id: string, name: string, profession: string) => void) => {
  const { toast } = useToast();
  const { status } = useNetworkStatus();

  const updateProfessional = async (id: string, name: string, profession: string) => {
    if (!status.isOnline || status.serverReachable === false) {
      toast({
        title: "Erro de conexão",
        description: "Você está offline. Não é possível atualizar profissionais.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      console.log("Updating professional:", { id, name, profession });
      
      if (!id || !name || !profession) {
        throw new Error("ID, nome e profissão são obrigatórios");
      }
      
      const { error } = await supabase
        .from('professionals')
        .update({ 
          name, 
          profession,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Update error details:', error);
        throw error;
      }

      if (onSuccess) {
        onSuccess(id, name, profession);
      }
      
      toast({
        title: "Sucesso",
        description: "Dados do profissional atualizados com sucesso.",
      });
      return true;
    } catch (error) {
      console.error('Error updating professional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os dados do profissional.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { updateProfessional };
};
