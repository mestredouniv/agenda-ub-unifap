import { format } from "date-fns";
import { NavigationBar } from "./NavigationBar";

interface HeaderProps {
  onAddClick: () => void;
  onRemoveClick: () => void;
}

export const Header = ({ onAddClick, onRemoveClick }: HeaderProps) => {
  const today = new Date();

  return (
    <div className="w-full flex flex-col items-center justify-center py-6 px-4 animate-fade-in relative">
      <div className="absolute right-4 top-4 text-gray-600">
        {format(today, "dd/MM/yyyy")}
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
        Agenda UBS UNIFAP
      </h1>
      <p className="text-gray-600 mb-4 text-center">
        Sistema de Agendamento de Consultas
      </p>
      <NavigationBar 
        onAddProfessional={onAddClick}
        onRemoveProfessional={onRemoveClick}
      />
    </div>
  );
};