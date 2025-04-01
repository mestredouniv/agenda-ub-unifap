
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserX, UserCog, Loader2 } from "lucide-react";
import { Professional } from "@/types/professional";
import { supabase } from "@/integrations/supabase/client";

interface AddProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, profession: string) => Promise<boolean>;
  onEdit?: (id: string, name: string, profession: string) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
  professional?: Professional | null;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && professional && mode === "edit") {
      setName(professional.name || "");
      setProfession(professional.profession || "");
    } else if (isOpen && mode === "add") {
      setName("");
      setProfession("");
    }
  }, [isOpen, professional, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !profession) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (mode === "edit" && professional && onEdit) {
        await onEdit(professional.id, name, profession);
      } else {
        await onAdd(name, profession);
      }
      
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o profissional",
        variant: "destructive",
      });
      console.error("Error saving professional:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!professional || !onDelete) return;
    
    try {
      setIsSubmitting(true);
      const confirmed = window.confirm(
        `Tem certeza que deseja remover ${professional.name}?`
      );

      if (confirmed) {
        await onDelete(professional.id);
        onClose();
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover o profissional",
        variant: "destructive",
      });
      console.error("Error deleting professional:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Adicionar Novo Profissional" : "Editar Profissional"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add" 
              ? "Preencha os dados do novo profissional" 
              : "Edite os dados do profissional ou remova-o"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome do profissional"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profession">Profissão</Label>
            <Input
              id="profession"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="Digite a profissão"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end gap-2">
            {mode === "edit" && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserX className="h-4 w-4" />
                )}
                Remover
              </Button>
            )}
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90 flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "edit" ? (
                <UserCog className="h-4 w-4" />
              ) : null}
              {isSubmitting 
                ? "Processando..." 
                : mode === "edit" 
                  ? "Atualizar" 
                  : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
