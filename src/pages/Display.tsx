import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Eye, Send } from "lucide-react";
import { DisplayHeader } from "@/components/DisplayHeader";
import { PatientCard } from "@/components/PatientCard";
import { AnnouncementEditor } from "@/components/AnnouncementEditor";

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

  const playNotificationSound = () => {
    const audio = new Audio("/notification.mp3");
    audio.play().catch(error => console.log("Audio playback failed:", error));
  };

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

  useEffect(() => {
    if (!isEditMode && announcements.length > 0) {
      const interval = setInterval(() => {
        setCurrentAnnouncementIndex((prev) => {
          const nextIndex = prev === announcements.length - 1 ? 0 : prev + 1;
          if (nextIndex === 0) {
            playNotificationSound();
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
          <DisplayHeader />
          {currentPatient && <PatientCard patient={currentPatient} />}

          {announcements.length > 0 && (
            <div className="animate-fade-in">
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
            </div>
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

      <AnnouncementEditor
        newAnnouncement={newAnnouncement}
        youtubeUrl={youtubeUrl}
        onAnnouncementChange={setNewAnnouncement}
        onYoutubeUrlChange={setYoutubeUrl}
      />

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