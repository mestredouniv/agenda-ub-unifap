
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddProfessionalModal } from "@/components/AddProfessionalModal";
import { DailyAnnouncements } from "@/components/DailyAnnouncements";
import { Header } from "@/components/Header";
import { Professional } from "@/types/professional";
import { ProfessionalList } from "@/components/ProfessionalList";
import { useProfessionals } from "@/hooks/useProfessionals";

const Index = () => {
  const navigate = useNavigate();
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

  const handleRemoveProfessionals = () => {
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
        onRemoveClick={handleRemoveProfessionals}
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
