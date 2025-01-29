import { Card } from "@/components/ui/card";
import { UserRound } from "lucide-react";

interface Professional {
  id: number;
  name: string;
  profession: string;
}

interface ProfessionalCardProps {
  professional: Professional;
  onClick: (professional: Professional) => void;
}

export const ProfessionalCard = ({ professional, onClick }: ProfessionalCardProps) => {
  return (
    <Card
      className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white animate-fade-in flex flex-col"
      onClick={() => onClick(professional)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <UserRound className="h-4 w-4 text-primary" />
        </div>
      </div>
      <h3 className="font-semibold text-base text-gray-900 mb-1">{professional.name}</h3>
      <p className="text-gray-600 text-xs">{professional.profession}</p>
    </Card>
  );
};