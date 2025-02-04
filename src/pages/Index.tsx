import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { AddProfessionalModal } from "@/components/AddProfessionalModal";
import { DailyAnnouncements } from "@/components/DailyAnnouncements";
import { Header } from "@/components/Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Professional {
  id: number;
  name: string;
  profession: string;
  schedules?: {
    date: Date;
    appointments: number;
  }[];
}

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const { toast } = useToast();

  // Carregar profissionais ao montar o componente
  const loadProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os profissionais",
        variant: "destructive",
      });
    }
  };

  const handleProfessionalClick = (professional: Professional) => {
    navigate(`/agenda/${professional.id}`);
  };

  const handleAddProfessional = async (name: string, profession: string) => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .insert([{ name, profession }])
        .select()
        .single();

      if (error) throw error;

      setProfessionals([...professionals, data]);
      toast({
        title: "Sucesso",
        description: "Profissional adicionado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao adicionar profissional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o profissional",
        variant: "destructive",
      });
    }
  };

  const handleEditProfessional = async (id: number, name: string, profession: string) => {
    try {
      const { error } = await supabase
        .from('professionals')
        .update({ name, profession })
        .eq('id', id);

      if (error) throw error;

      setProfessionals(professionals.map(p => 
        p.id === id ? { ...p, name, profession } : p
      ));
      toast({
        title: "Sucesso",
        description: "Profissional atualizado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o profissional",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProfessional = async (id: number) => {
    try {
      // Primeiro, excluir todas as consultas associadas ao profissional
      const { error: appointmentsError } = await supabase
        .from('appointments')
        .delete()
        .eq('professional_id', id);

      if (appointmentsError) throw appointmentsError;

      // Depois, excluir o profissional
      const { error: professionalError } = await supabase
        .from('professionals')
        .delete()
        .eq('id', id);

      if (professionalError) throw professionalError;

      setProfessionals(professionals.filter(p => p.id !== id));
      toast({
        title: "Sucesso",
        description: "Profissional removido com sucesso",
      });
    } catch (error) {
      console.error('Erro ao remover profissional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o profissional",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (professional: Professional) => {
    setSelectedProfessional(professional);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onAddClick={() => {
          setSelectedProfessional(null);
          setModalMode("add");
          setIsModalOpen(true);
        }}
        onRemoveClick={() => {
          if (selectedProfessional) {
            handleDeleteProfessional(selectedProfessional.id);
          } else {
            toast({
              title: "Aviso",
              description: "Selecione um profissional para remover",
            });
          }
        }}
      />
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <DailyAnnouncements />
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Profissionais</h2>
          <Button
            variant="outline"
            onClick={() => navigate("/relatorios")}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Relatórios
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {professionals.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              professional={professional}
              onClick={handleProfessionalClick}
              onEditClick={() => handleEditClick(professional)}
            />
          ))}
        </div>
      </main>

      <AddProfessionalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddProfessional}
        onEdit={handleEditProfessional}
        onDelete={handleDeleteProfessional}
        professional={selectedProfessional || undefined}
        mode={modalMode}
      />
    </div>
  );
};

export default Index;