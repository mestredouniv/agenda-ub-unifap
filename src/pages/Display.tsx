import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Bold, Italic, Underline, Image as ImageIcon, Youtube, Eye, Send } from "lucide-react";

interface Patient {
  password: string;
  name: string;
  room: string;
  professional: string;
}

interface Announcement {
  id: string;
  content: string;
  type: "text" | "youtube";
  youtubeUrl?: string;
}

const Display = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [previewContent, setPreviewContent] = useState<Announcement | null>(null);
  const { toast } = useToast();

  const handlePublish = () => {
    if (previewContent) {
      setAnnouncements([...announcements, previewContent]);
      setPreviewContent(null);
      toast({
        title: "Publicado com sucesso!",
        description: "O conteúdo foi adicionado à lista de exibição.",
      });
    }
  };

  // Simulated patient data - in a real app, this would come from an API
  useEffect(() => {
    const mockPatient = {
      password: "A123",
      name: "João Silva",
      room: "Sala 3",
      professional: "Dra. Maria Santos",
    };
    setCurrentPatient(mockPatient);
  }, []);

  if (!isEditMode) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto p-4">
          {currentPatient && (
            <Card className="mb-8 p-6 bg-white shadow-lg">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-primary">SENHA</h3>
                  <p className="text-4xl font-bold">{currentPatient.password}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-primary">SALA</h3>
                  <p className="text-4xl">{currentPatient.room}</p>
                </div>
                <div className="col-span-2 mt-4">
                  <h3 className="text-2xl font-bold text-primary">PACIENTE</h3>
                  <p className="text-3xl mt-2">{currentPatient.name}</p>
                </div>
                <div className="col-span-2">
                  <h3 className="text-2xl font-bold text-primary">PROFISSIONAL</h3>
                  <p className="text-3xl mt-2">{currentPatient.professional}</p>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="p-4">
                {announcement.type === "youtube" ? (
                  <iframe
                    width="100%"
                    height="315"
                    src={announcement.youtubeUrl}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg"
                  />
                ) : (
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: announcement.content }}
                  />
                )}
              </Card>
            ))}
          </div>
        </div>

        <Button
          className="fixed bottom-4 right-4"
          variant="outline"
          onClick={() => setIsEditMode(true)}
        >
          Editar
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Button
        className="mb-4"
        variant="outline"
        onClick={() => setIsEditMode(false)}
      >
        Voltar para Visualização
      </Button>

      <Tabs defaultValue="text" className="w-full">
        <TabsList>
          <TabsTrigger value="text">Texto</TabsTrigger>
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
        </TabsList>

        <TabsContent value="text">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Bold className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Italic className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Underline className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
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
          <Card className="p-4">
            <div className="space-y-4">
              <Input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="Cole o URL do vídeo do YouTube aqui..."
              />
              <Youtube className="h-8 w-8 mx-auto text-gray-400" />
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-4 flex justify-end gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Prévia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Prévia do Conteúdo</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {previewContent && (
                <div className="prose max-w-none">
                  {previewContent.type === "youtube" ? (
                    <iframe
                      width="100%"
                      height="315"
                      src={previewContent.youtubeUrl}
                      title="YouTube video preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-lg"
                    />
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: previewContent.content }} />
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Button onClick={handlePublish}>
          <Send className="mr-2 h-4 w-4" />
          Publicar
        </Button>
      </div>
    </div>
  );
};

export default Display;