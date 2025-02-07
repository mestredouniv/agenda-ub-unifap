
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DisplayContent } from "@/types/display";

export const useDisplayContentManager = () => {
  const [contents, setContents] = useState<DisplayContent[]>([]);
  const { toast } = useToast();

  const fetchContents = async () => {
    try {
      const { data, error } = await supabase
        .from('display_content')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true, nullsFirst: true });

      if (error) throw error;
      
      const typedData = data?.map(item => ({
        ...item,
        type: item.type as DisplayContent['type']
      })) || [];
      
      setContents(typedData);
    } catch (error) {
      console.error('Error fetching display contents:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os conteúdos.",
        variant: "destructive",
      });
    }
  };

  const addContent = async (content: Omit<DisplayContent, 'id' | 'active'>) => {
    try {
      const { data, error } = await supabase
        .from('display_content')
        .insert([{ ...content, active: true }])
        .select()
        .single();

      if (error) throw error;
      
      const typedData = {
        ...data,
        type: data.type as DisplayContent['type']
      };
      
      setContents(prev => [...prev, typedData]);
      toast({
        title: "Sucesso",
        description: "Conteúdo adicionado com sucesso.",
      });
      return true;
    } catch (error) {
      console.error('Error adding content:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o conteúdo.",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('display_content')
        .update({ active: false })
        .eq('id', id);

      if (error) throw error;
      setContents(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Sucesso",
        description: "Conteúdo removido com sucesso.",
      });
      return true;
    } catch (error) {
      console.error('Error removing content:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o conteúdo.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    contents,
    fetchContents,
    addContent,
    removeContent,
  };
};
