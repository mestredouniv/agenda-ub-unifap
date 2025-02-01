import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import { Plus, Trash2, Calendar, FileText, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";

interface NavigationBarProps {
  onAddProfessional: () => void;
  onRemoveProfessional: () => void;
}

export const NavigationBar = ({
  onAddProfessional,
  onRemoveProfessional,
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
              <button
                onClick={onRemoveProfessional}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
              >
                <Trash2 className="h-4 w-4" />
                Remover Profissional
              </button>
              <Link
                to="/display"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
              >
                <Volume2 className="h-4 w-4" />
                Display
              </Link>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Páginas</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-48 p-2 space-y-2">
              <Link
                to="/solicitar-agendamento"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
              >
                <Calendar className="h-4 w-4" />
                Solicitar Agendamento
              </Link>
              <Link
                to="/relatorios"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
              >
                <FileText className="h-4 w-4" />
                Relatórios
              </Link>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};