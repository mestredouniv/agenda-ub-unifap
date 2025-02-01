import { NavigationBar } from "./NavigationBar";

interface HeaderProps {
  onAddClick: () => void;
  onRemoveClick: () => void;
}

export const Header = ({ onAddClick, onRemoveClick }: HeaderProps) => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-6 px-4 animate-fade-in">
      <div className="flex flex-col items-center gap-4 mb-6">
        <img 
          src="/unifap-logo.png" 
          alt="UNIFAP Logo" 
          className="h-24 w-auto"
        />
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            UNIVERSIDADE FEDERAL DO AMAPÁ
          </h1>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            UNIDADE BÁSICA DE SAÚDE
          </h2>
          <h3 className="text-lg font-medium text-gray-700">
            AGENDA UBS UNIFAP
          </h3>
        </div>
      </div>
      <NavigationBar 
        onAddProfessional={onAddClick}
        onRemoveProfessional={onRemoveClick}
      />
    </div>
  );
};