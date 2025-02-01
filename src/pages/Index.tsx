import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { AddProfessionalModal } from "@/components/AddProfessionalModal";
import { DailyAnnouncements } from "@/components/DailyAnnouncements";
import { Header } from "@/components/Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

interface Professional {
  id: number;
  name: string;
  profession: string;
  schedules?: {
    date: Date;
    appointments: number;
  }[];
}

const initialProfessionals: Professional[] = [
  { id: 1, name: "Luciana", profession: "Psicóloga" },
  { id: 2, name: "Janaína", profession: "Psicóloga" },
  { id: 3, name: "Anna", profession: "Fisioterapeuta" },
  { id: 4, name: "Anderson", profession: "Médico" },
  { id: 5, name: "Anna", profession: "Auriculoterapeuta" },
  { id: 6, name: "Wandervan", profession: "Enfermeiro" },
  { id: 7, name: "Patrícia", profession: "Enfermeira" },
  { id: 8, name: "Liliany", profession: "Médica" },
  { id: 9, name: "Janaína", profession: "Enfermeira" },
  { id: 10, name: "Equipe", profession: "Curativo" },
  { id: 11, name: "André", profession: "Médico" },
  { id: 12, name: "Ananda", profession: "Enfermeira" },
  { id: 13, name: "Nely", profession: "Enfermeira" },
  { id: 14, name: "Luciana", profession: "Psicóloga" },
  { id: 15, name: "Janaína", profession: "Psicóloga" },
  { id: 16, name: "Equipe", profession: "Laboratório" },
  { id: 17, name: "Equipe", profession: "Gestante" },
];

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [professionals, setProfessionals] = useState<Professional[]>(initialProfessionals);

  const handleProfessionalClick = (professional: Professional) => {
    navigate(`/agenda/${professional.id}`);
  };

  const handleAddProfessional = (name: string, profession: string) => {
    const newProfessional = {
      id: professionals.length + 1,
      name,
      profession,
    };
    setProfessionals([...professionals, newProfessional]);
  };

  const handleEditProfessional = (id: number, name: string, profession: string) => {
    setProfessionals(professionals.map(p => 
      p.id === id ? { ...p, name, profession } : p
    ));
  };

  const handleDeleteProfessional = (id: number) => {
    setProfessionals(professionals.filter(p => p.id !== id));
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
          console.log("Remove functionality to be implemented");
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
