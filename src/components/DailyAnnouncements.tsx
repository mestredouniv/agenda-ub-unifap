
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCcw, Loader2 } from "lucide-react";
import { AnnouncementEditor } from "@/components/AnnouncementEditor";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { NetworkStatus } from "@/components/NetworkStatus";

export const DailyAnnouncements = () => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const {
    announcements,
    isLoading,
    hasError,
    isOffline,
    isRetrying,
    addAnnouncement,
    removeAnnouncement,
    refetch
  } = useAnnouncements();

  const handleAdd = async (content: string) => {
    const success = await addAnnouncement(content);
    if (success) {
      setIsEditorOpen(false);
    }
    return success;
  };

  // Ensure we display the right content based on connection status
  const renderAnnouncements = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">
            Carregando avisos...
          </span>
        </div>
      );
    }

    if (isOffline || hasError) {
      return (
        <NetworkStatus onRefresh={refetch} />
      );
    }

    if (announcements.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Não há avisos para hoje.
          </p>
          <Button
            onClick={() => setIsEditorOpen(true)}
            variant="outline"
            className="mt-4"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar Aviso
          </Button>
        </div>
      );
    }

    return (
      <>
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-white p-4 border rounded-lg shadow-sm"
            >
              <div 
                className="prose max-w-none" 
                dangerouslySetInnerHTML={{ __html: announcement.content }}
              />
              <div className="flex justify-end mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeAnnouncement(announcement.id)}
                >
                  Remover
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-4">
          <Button
            onClick={() => setIsEditorOpen(true)}
            variant="outline"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar Aviso
          </Button>

          <Button
            onClick={() => refetch()}
            variant="ghost"
            size="sm"
            disabled={isRetrying}
          >
            {isRetrying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4 mr-2" />
            )}
            Atualizar
          </Button>
        </div>
      </>
    );
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Avisos do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          {renderAnnouncements()}
        </CardContent>
      </Card>

      <AnnouncementEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSubmit={handleAdd}
      />
    </>
  );
};
