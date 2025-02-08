
import { Professional } from "@/types/professional";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { Button } from "@/components/ui/button";
import { BarChart3, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfessionalListProps {
  professionals: Professional[];
  onProfessionalClick: (professional: Professional) => void;
  onEditClick: (professional: Professional) => void;
  onRemoveClick: (professional: Professional) => void;
}

export const ProfessionalList = ({
  professionals,
  onProfessionalClick,
  onEditClick,
  onRemoveClick,
}: ProfessionalListProps) => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Profissionais</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/relatorios")}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Relatórios
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {professionals.map((professional) => (
          <div key={professional.id} className="relative group">
            <ProfessionalCard
              professional={professional}
              onClick={onProfessionalClick}
              onEditClick={() => onEditClick(professional)}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveClick(professional);
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
