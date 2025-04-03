
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bold, Italic, Underline, Image as ImageIcon, Youtube, Plus, Loader2 } from "lucide-react";

export interface AnnouncementEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => Promise<boolean>;
}

export const AnnouncementEditor = ({
  isOpen,
  onClose,
  onSubmit,
}: AnnouncementEditorProps) => {
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("text");

  const handleSubmit = async () => {
    if (!newAnnouncement && !youtubeUrl) return;

    let content = newAnnouncement;
    
    if (activeTab === "youtube" && youtubeUrl) {
      // Convert YouTube URL to embed HTML
      const videoId = getYoutubeVideoId(youtubeUrl);
      if (videoId) {
        content = `<div class="aspect-w-16 aspect-h-9">
          <iframe src="https://www.youtube.com/embed/${videoId}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            class="w-full h-full">
          </iframe>
        </div>`;
      } else {
        content = `<p>URL de vídeo inválido: ${youtubeUrl}</p>`;
      }
    }

    setIsSubmitting(true);
    try {
      const success = await onSubmit(content);
      if (success) {
        setNewAnnouncement("");
        setYoutubeUrl("");
        setActiveTab("text");
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getYoutubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleFormatText = (format: string) => {
    let formattedText = "";
    
    switch (format) {
      case "bold":
        formattedText = `<strong>${newAnnouncement}</strong>`;
        break;
      case "italic":
        formattedText = `<em>${newAnnouncement}</em>`;
        break;
      case "underline":
        formattedText = `<u>${newAnnouncement}</u>`;
        break;
      default:
        return;
    }
    
    setNewAnnouncement(formattedText);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Aviso</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="text" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="text">Texto</TabsTrigger>
            <TabsTrigger value="youtube">YouTube</TabsTrigger>
          </TabsList>

          <TabsContent value="text">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="icon" onClick={() => handleFormatText("bold")}>
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="outline" size="icon" onClick={() => handleFormatText("italic")}>
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="outline" size="icon" onClick={() => handleFormatText("underline")}>
                    <Underline className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="outline" size="icon">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                  placeholder="Digite seu anúncio aqui..."
                  className="min-h-[200px]"
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="youtube">
            <Card className="p-6">
              <div className="space-y-4">
                <Input
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="Cole o URL do vídeo do YouTube aqui..."
                />
                <div className="flex justify-center items-center h-32 bg-gray-100 rounded-lg">
                  {youtubeUrl ? (
                    <p className="text-sm text-gray-500">
                      Prévia do vídeo será exibida após salvar
                    </p>
                  ) : (
                    <Youtube className="h-8 w-8 text-gray-400" />
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || (!newAnnouncement && !youtubeUrl)}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>Adicionar Aviso</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
