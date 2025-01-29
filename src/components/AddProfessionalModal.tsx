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

interface AddProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, profession: string) => void;
}

export const AddProfessionalModal = ({
  isOpen,
  onClose,
  onAdd,
}: AddProfessionalModalProps) => {
  const [name, setName] = useState("");
  const [profession, setProfession] = useState("");
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
    onAdd(name, profession);
    setName("");
    setProfession("");
    onClose();
    toast({
      title: "Sucesso",
      description: "Profissional adicionado com sucesso",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Profissional</DialogTitle>
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
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};