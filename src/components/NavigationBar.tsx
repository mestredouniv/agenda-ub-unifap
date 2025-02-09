
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import { Plus, Calendar, FileText, Volume2, Stethoscope, FileSignature, Heart } from "lucide-react";
import { Link } from "react-router-dom";

interface NavigationBarProps {
  onAddProfessional: () => void;
  onRemoveProfessional: () => void;
}

export const NavigationBar = ({
  onAddProfessional,
}: NavigationBarProps) => {
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
              <Link
                to="/relatorios"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
              >
                <FileText className="h-4 w-4" />
                Relatórios
              </Link>
              <Link
                to="/solicitar"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
              >
                <FileSignature className="h-4 w-4" />
                Solicitações
              </Link>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Saúde</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-48 p-2 space-y-2">
              <Link
                to="/hanseniase"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
              >
                <Heart className="h-4 w-4" />
                Hanseníase
              </Link>
              <Link
                to="/pre-natal"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
              >
                <Heart className="h-4 w-4" />
                Pré-Natal
              </Link>
              <Link
                to="/tuberculose"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
              >
                <Heart className="h-4 w-4" />
                Tuberculose
              </Link>
              <Link
                to="/prep"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
              >
                <Heart className="h-4 w-4" />
                PREP
              </Link>
              <Link
                to="/doencas-cronicas"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
              >
                <Heart className="h-4 w-4" />
                Doenças Crônicas
              </Link>
              <Link
                to="/puericultura"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
              >
                <Heart className="h-4 w-4" />
                Puericultura
              </Link>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link
            to="/consultas"
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
          >
            <Stethoscope className="h-4 w-4" />
            Consultas
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
