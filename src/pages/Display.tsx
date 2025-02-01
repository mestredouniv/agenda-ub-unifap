import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Bold, Italic, Underline, Image as ImageIcon, Youtube, Eye, Send, Plus } from "lucide-react";

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
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const { toast } = useToast();

  // Function to play notification sound
  const playNotificationSound = () => {
    const audio = new Audio("/notification.mp3"); // You'll need to add this sound file to your public folder
    audio.play().catch(error => console.log("Audio playback failed:", error));
  };

  // Handle preview generation
  const handlePreview = () => {
    const activeTab = document.querySelector('[role="tab"][data-state="active"]')?.getAttribute('value');
    const newContent: Announcement = {
      id: Date.now().toString(),
      type: activeTab === 'youtube' ? 'youtube' : 'text',
      content: activeTab === 'youtube' ? '' : newAnnouncement,
      youtubeUrl: activeTab === 'youtube' ? youtubeUrl : undefined,
    };
    setPreviewContent(newContent);
  };

  const handlePublish = () => {
    if (previewContent) {
      setAnnouncements([...announcements, previewContent]);
      setNewAnnouncement("");
      setYoutubeUrl("");
      setPreviewContent(null);
      playNotificationSound();
      toast({
        title: "Publicado com sucesso!",
        description: "O conteúdo foi adicionado à lista de exibição.",
      });
    }
  };

  // Rotate through announcements every 10 seconds if not in edit mode
  useEffect(() => {
    if (!isEditMode && announcements.length > 0) {
      const interval = setInterval(() => {
        setCurrentAnnouncementIndex((prev) => {
          const nextIndex = prev === announcements.length - 1 ? 0 : prev + 1;
          if (nextIndex === 0) {
            playNotificationSound(); // Play sound when loop restarts
          }
          return nextIndex;
        });
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isEditMode, announcements.length]);

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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto p-8">
          {currentPatient && (
            <Card className="mb-8 p-8 bg-white shadow-lg rounded-xl border-2 border-primary/20">
              <div className="grid grid-cols-2 gap-8 text-center">
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-primary">SENHA</h3>
                  <p className="text-5xl font-bold text-gray-800">{currentPatient.password}</p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-primary">SALA</h3>
                  <p className="text-5xl text-gray-800">{currentPatient.room}</p>
                </div>
                <div className="col-span-2 mt-6">
                  <h3 className="text-2xl font-bold text-primary">PACIENTE</h3>
                  <p className="text-4xl mt-3 text-gray-800">{currentPatient.name}</p>
                </div>
                <div className="col-span-2">
                  <h3 className="text-2xl font-bold text-primary">PROFISSIONAL</h3>
                  <p className="text-4xl mt-3 text-gray-800">{currentPatient.professional}</p>
                </div>
              </div>
            </Card>
          )}

          {announcements.length > 0 && (
            <Card className="p-8 bg-white shadow-lg rounded-xl animate-fade-in">
              {announcements[currentAnnouncementIndex].type === "youtube" ? (
                <iframe
                  width="100%"
                  height="480"
                  src={announcements[currentAnnouncementIndex].youtubeUrl}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                />
              ) : (
                <div
                  className="prose max-w-none text-2xl"
                  dangerouslySetInnerHTML={{ __html: announcements[currentAnnouncementIndex].content }}
                />
              )}
            </Card>
          )}
        </div>

        <Button
          className="fixed bottom-4 right-4 shadow-lg"
          variant="outline"
          onClick={() => setIsEditMode(true)}
        >
          Editar
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <Button
        className="mb-8"
        variant="outline"
        onClick={() => setIsEditMode(false)}
      >
        Voltar para Visualização
      </Button>

      <Tabs defaultValue="text" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="text">Texto</TabsTrigger>
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
        </TabsList>

        <TabsContent value="text">
          <Card className="p-6">
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
                <Button variant="secondary" onClick={() => setNewAnnouncement(prev => prev + '\n')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Texto
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
              <Youtube className="h-8 w-8 mx-auto text-gray-400" />
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="mr-2 h-4 w-4" />
              Prévia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Prévia do Conteúdo</DialogTitle>
              <DialogDescription>
                Verifique como o conteúdo será exibido antes de publicar.
              </DialogDescription>
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
