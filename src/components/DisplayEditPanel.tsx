
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDisplayContent } from "@/hooks/useDisplayContent";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DisplayEditPanelProps {
  onClose: () => void;
}

export const DisplayEditPanel = ({ onClose }: DisplayEditPanelProps) => {
  const { addContent, removeContent, contents } = useDisplayContent();
  const { toast } = useToast();
  const [newContent, setNewContent] = useState({
    type: "text",
    content: "",
    display_time: 10,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newContent.content) {
      toast({
        title: "Erro",
        description: "Preencha o conteúdo",
        variant: "destructive",
      });
      return;
    }

    const success = await addContent({
      ...newContent,
      display_order: contents.length,
      type: newContent.type as "text" | "image" | "youtube" | "last_calls",
    });

    if (success) {
      setNewContent({
        type: "text",
        content: "",
        display_time: 10,
      });
      toast({
        title: "Sucesso",
        description: "Conteúdo adicionado com sucesso",
      });
    }
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-80 bg-white shadow-lg p-4 overflow-y-auto z-40">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Painel de Edição</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo de Conteúdo</label>
          <Select
            value={newContent.type}
            onValueChange={(value) => setNewContent({ ...newContent, type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Texto</SelectItem>
              <SelectItem value="image">Imagem</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="last_calls">Últimas Chamadas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Conteúdo</label>
          {newContent.type === "text" ? (
            <Textarea
              value={newContent.content}
              onChange={(e) => setNewContent({ ...newContent, content: e.target.value })}
              placeholder="Digite o texto..."
              className="min-h-[100px]"
            />
          ) : (
            <Input
              value={newContent.content}
              onChange={(e) => setNewContent({ ...newContent, content: e.target.value })}
              placeholder={
                newContent.type === "image"
                  ? "URL da imagem"
                  : newContent.type === "youtube"
                  ? "ID do vídeo"
                  : ""
              }
            />
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tempo de exibição (segundos)</label>
          <Input
            type="number"
            min="1"
            value={newContent.display_time}
            onChange={(e) =>
              setNewContent({ ...newContent, display_time: Number(e.target.value) })
            }
          />
        </div>

        <Button type="submit" className="w-full">
          Adicionar Conteúdo
        </Button>
      </form>

      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-semibold">Conteúdos Ativos</h3>
        {contents.map((content) => (
          <div
            key={content.id}
            className="bg-gray-50 p-3 rounded-lg flex items-center justify-between"
          >
            <div>
              <p className="font-medium capitalize">{content.type}</p>
              <p className="text-sm text-gray-500 truncate max-w-[180px]">
                {content.content}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                removeContent(content.id);
                toast({
                  title: "Sucesso",
                  description: "Conteúdo removido com sucesso",
                });
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
