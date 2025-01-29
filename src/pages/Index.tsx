import { useState } from "react";
import { Header } from "@/components/Header";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { AddProfessionalModal } from "@/components/AddProfessionalModal";
import { AttendingProfessionals } from "@/components/AttendingProfessionals";
import { DailyAnnouncements } from "@/components/DailyAnnouncements";

interface Professional {
  id: number;
  name: string;
  profession: string;
}

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  const handleAddProfessional = (name: string, profession: string) => {
    setProfessionals([
      ...professionals,
      {
        id: professionals.length + 1,
        name,
        profession,
      },
    ]);
  };

  const handleCardClick = (professional: Professional) => {
    console.log("Clicked professional:", professional);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAddClick={() => setIsModalOpen(true)} />
      
      <div className="container mx-auto px-4 py-4">
        <AttendingProfessionals professionals={professionals} />
        <DailyAnnouncements />
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {professionals.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              professional={professional}
              onClick={handleCardClick}
            />
          ))}
        </div>
        
        {professionals.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            Nenhum profissional cadastrado. Clique no botão acima para adicionar.
          </div>
        )}
      </div>

      <AddProfessionalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddProfessional}
      />
    </div>
  );
};

export default Index;