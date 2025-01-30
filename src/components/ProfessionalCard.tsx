import { Card } from "@/components/ui/card";
import { 
  UserRound, 
  Stethoscope, 
  BookOpen, 
  Bandage,
  FlaskConical,
  UserCheck
} from "lucide-react";

interface Professional {
  id: number;
  name: string;
  profession: string;
}

interface ProfessionalCardProps {
  professional: Professional;
  onClick: (professional: Professional) => void;
}

const getProfessionIcon = (profession: string) => {
  const lowerProfession = profession.toLowerCase();
  if (lowerProfession.includes("médic")) return Stethoscope;
  if (lowerProfession.includes("psicólog")) return BookOpen;
  if (lowerProfession.includes("enfermeir") || lowerProfession.includes("curativo")) return Bandage;
  if (lowerProfession.includes("laboratório")) return FlaskConical;
  if (lowerProfession.includes("fisioterapeuta") || lowerProfession.includes("auriculoterapeuta")) return UserCheck;
  return UserRound;
};

export const ProfessionalCard = ({ professional, onClick }: ProfessionalCardProps) => {
  const Icon = getProfessionIcon(professional.profession);
  
  return (
    <Card
      className="p-3 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white animate-fade-in"
      onClick={() => onClick(professional)}
    >
      <div className="flex items-center space-x-2">
        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-3 w-3 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-gray-900 truncate">{professional.name}</h3>
          <p className="text-xs text-gray-600 truncate">{professional.profession}</p>
        </div>
      </div>
    </Card>
  );
};