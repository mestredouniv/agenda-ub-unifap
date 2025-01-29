import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface HeaderProps {
  onAddClick: () => void;
}

export const Header = ({ onAddClick }: HeaderProps) => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-8 px-4 animate-fade-in">
      <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">
        Agenda UBS UNIFAP
      </h1>
      <p className="text-gray-600 mb-6 text-center">
        Sistema de Agendamento de Consultas
      </p>
      <Button
        onClick={onAddClick}
        className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Adicionar Profissional
      </Button>
    </div>
  );
};