
import { Professional } from "@/types/professional";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfessionalListProps {
  professionals: Professional[];
  onProfessionalClick: (professional: Professional) => void;
  onEditClick: (professional: Professional) => void;
}

export const ProfessionalList = ({
  professionals,
  onProfessionalClick,
  onEditClick,
}: ProfessionalListProps) => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between">
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
            onClick={onProfessionalClick}
            onEditClick={() => onEditClick(professional)}
          />
        ))}
      </div>
    </div>
  );
};
