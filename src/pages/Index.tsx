
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddProfessionalModal } from "@/components/AddProfessionalModal";
import { DailyAnnouncements } from "@/components/DailyAnnouncements";
import { Header } from "@/components/Header";
import { Professional } from "@/types/professional";
import { ProfessionalList } from "@/components/ProfessionalList";
import { useProfessionals } from "@/hooks/useProfessionals";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  
  const {
    professionals,
    addProfessional,
    updateProfessional,
    deleteProfessional,
  } = useProfessionals();

  const handleProfessionalClick = (professional: Professional) => {
    navigate(`/agenda/${professional.id}`);
  };

  const handleEditClick = (professional: Professional) => {
    setSelectedProfessional(professional);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedProfessional(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleRemoveClick = async (professional: Professional) => {
    if (!professional?.id) {
      toast({
        title: "Erro",
        description: "Selecione um profissional para remover.",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja remover ${professional.name}?`
    );

    if (confirmed) {
      const success = await deleteProfessional(professional.id);
      if (success) {
        toast({
          title: "Sucesso",
          description: "Profissional removido com sucesso.",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onAddClick={handleAddClick}
        onRemoveClick={() => {
          if (professionals.length > 0) {
            setSelectedProfessional(professionals[0]);
            setModalMode("edit");
            setIsModalOpen(true);
          } else {
            toast({
              title: "Aviso",
              description: "Não há profissionais para remover.",
              variant: "destructive",
            });
          }
        }}
      />
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <DailyAnnouncements />
        </div>

        <div className="mt-8">
          <ProfessionalList
            professionals={professionals}
            onProfessionalClick={handleProfessionalClick}
            onEditClick={handleEditClick}
            onRemoveClick={handleRemoveClick}
          />
        </div>
      </main>

      <AddProfessionalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addProfessional}
        onEdit={updateProfessional}
        onDelete={deleteProfessional}
        professional={selectedProfessional}
        mode={modalMode}
      />
    </div>
  );
};

export default Index;
