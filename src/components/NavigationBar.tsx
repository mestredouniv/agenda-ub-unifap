import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Plus, Trash2, UserCog } from "lucide-react";

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
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};