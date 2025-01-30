import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { AddProfessionalModal } from "@/components/AddProfessionalModal";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { DailyAnnouncements } from "@/components/DailyAnnouncements";
import { AttendingProfessionals } from "@/components/AttendingProfessionals";
import { Header } from "@/components/Header";
import { useIsMobile } from "@/hooks/use-mobile";

interface Professional {
  id: number;
  name: string;
  profession: string;
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
  const [professionals, setProfessionals] = useState<Professional[]>(initialProfessionals);

  const handleProfessionalClick = (professional: Professional) => {
    navigate(`/agenda/${professional.id}`);
  };

  const handleAddProfessional = (newProfessional: Omit<Professional, "id">) => {
    const id = professionals.length + 1;
    setProfessionals([...professionals, { ...newProfessional, id }]);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <AttendingProfessionals />
          <DailyAnnouncements />
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Profissionais</h2>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Adicionar Profissional
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {professionals.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              professional={professional}
              onClick={handleProfessionalClick}
            />
          ))}
        </div>
      </main>

      <AddProfessionalModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleAddProfessional}
      />
    </div>
  );
};

export default Index;