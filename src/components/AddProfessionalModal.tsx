import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { UserX, UserCog } from "lucide-react";

interface Professional {
  id: number;
  name: string;
  profession: string;
}

interface AddProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, profession: string) => void;
  onEdit?: (id: number, name: string, profession: string) => void;
  onDelete?: (id: number) => void;
  professional?: Professional;
  mode?: "add" | "edit";
}

export const AddProfessionalModal = ({
  isOpen,
  onClose,
  onAdd,
  onEdit,
  onDelete,
  professional,
  mode = "add",
}: AddProfessionalModalProps) => {
  const [name, setName] = useState(professional?.name || "");
  const [profession, setProfession] = useState(professional?.profession || "");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !profession) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    if (mode === "edit" && professional && onEdit) {
      onEdit(professional.id, name, profession);
      toast({
        title: "Sucesso",
        description: "Profissional atualizado com sucesso",
      });
    } else {
      onAdd(name, profession);
      toast({
        title: "Sucesso",
        description: "Profissional adicionado com sucesso",
      });
    }
    
    setName("");
    setProfession("");
    onClose();
  };

  const handleDelete = () => {
    if (professional && onDelete) {
      onDelete(professional.id);
      toast({
        title: "Sucesso",
        description: "Profissional removido com sucesso",
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Adicionar Novo Profissional" : "Editar Profissional"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome do profissional"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profession">Profissão</Label>
            <Input
              id="profession"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="Digite a profissão"
            />
          </div>
          <div className="flex justify-end gap-2">
            {mode === "edit" && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="flex items-center gap-2"
              >
                <UserX className="h-4 w-4" />
                Remover
              </Button>
            )}
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 flex items-center gap-2">
              {mode === "edit" ? (
                <>
                  <UserCog className="h-4 w-4" />
                  Atualizar
                </>
              ) : (
                "Adicionar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};