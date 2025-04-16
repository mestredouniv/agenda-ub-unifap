
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNetworkStatus } from "@/contexts/NetworkStatusContext";

export const useDeleteProfessional = (onSuccess?: (id: string) => void) => {
  const { toast } = useToast();
  const { status } = useNetworkStatus();

  const deleteProfessional = async (id: string) => {
    if (!status.isOnline || status.serverReachable === false) {
      toast({
        title: "Erro de conexão",
        description: "Você está offline. Não é possível remover profissionais.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      console.log("Deleting professional:", id);
      
      if (!id) {
        throw new Error("ID do profissional é obrigatório");
      }
      
      const { error } = await supabase
        .from('professionals')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete error details:', error);
        throw error;
      }

      if (onSuccess) {
        onSuccess(id);
      }
      
      toast({
        title: "Sucesso",
        description: "Profissional removido com sucesso.",
      });
      return true;
    } catch (error) {
      console.error('Error deleting professional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o profissional.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { deleteProfessional };
};
