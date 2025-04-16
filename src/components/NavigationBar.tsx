
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import { Plus, Calendar, FileText, Volume2, Stethoscope, FileSignature, Heart, UserCog, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface NavigationBarProps {
  onAddProfessional: () => void;
}

export const NavigationBar = ({ onAddProfessional }: NavigationBarProps) => {
  const navigate = useNavigate();
  
  return (
    <NavigationMenu className="mb-4">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Ações</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-48 p-2 space-y-2">
              <button
                onClick={onAddProfessional}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
              >
                <Plus className="h-4 w-4" />
                Adicionar Profissional
              </button>
              <a
                href="/display"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
              >
                <Volume2 className="h-4 w-4" />
                Display
              </a>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Páginas</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-48 p-2 space-y-2">
              <button
                onClick={() => navigate("/solicitar")}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
              >
                <UserCog className="h-4 w-4" />
                Gerenciar Solicitações
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
              >
                <Home className="h-4 w-4" />
                Página Inicial
              </button>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Saúde</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-48 p-2 space-y-2">
              <button
                onClick={() => navigate("/hanseniase")}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
              >
                <Heart className="h-4 w-4" />
                Hanseníase
              </button>
              <button
                onClick={() => navigate("/pre-natal")}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
              >
                <Heart className="h-4 w-4" />
                Pré-Natal
              </button>
              <button
                onClick={() => navigate("/tuberculose")}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
              >
                <Heart className="h-4 w-4" />
                Tuberculose
              </button>
              <button
                onClick={() => navigate("/prep")}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
              >
                <Heart className="h-4 w-4" />
                PREP
              </button>
              <button
                onClick={() => navigate("/doencas-cronicas")}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
              >
                <Heart className="h-4 w-4" />
                Doenças Crônicas
              </button>
              <button
                onClick={() => navigate("/puericultura")}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
              >
                <Heart className="h-4 w-4" />
                Puericultura
              </button>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <button
            onClick={() => navigate("/consultas")}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
          >
            <Stethoscope className="h-4 w-4" />
            Consultas
          </button>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <button
            onClick={() => navigate("/reports")}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
          >
            <FileText className="h-4 w-4" />
            Relatórios
          </button>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <button
            onClick={() => navigate("/solicitar-agendamento")}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
          >
            <Calendar className="h-4 w-4" />
            Solicitar Agendamento
          </button>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
