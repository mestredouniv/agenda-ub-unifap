import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";

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
      className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white animate-fade-in flex flex-col"
      onClick={() => onClick(professional)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
      </div>
      <h3 className="font-semibold text-lg text-gray-900 mb-1">{professional.name}</h3>
      <p className="text-gray-600 text-sm">{professional.profession}</p>
    </Card>
  );
};