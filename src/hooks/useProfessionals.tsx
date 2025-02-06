
import { useState, useEffect } from "react";
import { Professional } from "@/types/professional";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useProfessionals = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const { toast } = useToast();

  const fetchProfessionals = async () => {
    try {
      console.log("Fetching professionals...");
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error details:', error);
        throw error;
      }
      
      console.log("Fetched professionals:", data);
      setProfessionals(data || []);
    } catch (error) {
      console.error('Error fetching professionals:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de profissionais.",
        variant: "destructive",
      });
    }
  };

  const addProfessional = async (name: string, profession: string) => {
    try {
      console.log("Adding professional:", { name, profession });
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
      setProfessionals(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Profissional adicionado com sucesso.",
      });
      return true;
    } catch (error) {
      console.error('Error adding professional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o profissional.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateProfessional = async (id: string, name: string, profession: string) => {
    try {
      console.log("Updating professional:", { id, name, profession });
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

      setProfessionals(professionals.map(p => 
        p.id === id ? { ...p, name, profession } : p
      ));
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

  const deleteProfessional = async (id: string) => {
    try {
      console.log("Deleting professional:", id);
      const { error } = await supabase
        .from('professionals')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete error details:', error);
        throw error;
      }

      setProfessionals(professionals.filter(p => p.id !== id));
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

  useEffect(() => {
    fetchProfessionals();
  }, []);

  return {
    professionals,
    addProfessional,
    updateProfessional,
    deleteProfessional,
    refetch: fetchProfessionals
  };
};
