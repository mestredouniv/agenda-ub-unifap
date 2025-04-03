
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Loader2, RefreshCcw } from "lucide-react";
import { NetworkStatus } from "./ui/network-status";
import { AnnouncementEditor } from "./AnnouncementEditor";
import { useNetwork } from "@/contexts/NetworkContext";

export const DailyAnnouncements = () => {
  const { announcements, isLoading, hasError, isOffline, addAnnouncement, removeAnnouncement, refetch } = useAnnouncements();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { checkConnection } = useNetwork();

  const handleRefresh = async () => {
    const isConnected = await checkConnection();
    if (isConnected) {
      refetch();
    }
  };

  const handleAddAnnouncement = async (content: string) => {
    const success = await addAnnouncement(content);
    if (success) {
      setIsEditorOpen(false);
    }
    return success;
  };

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Avisos Diários</CardTitle>
        <div className="flex gap-2">
          <Button 
            onClick={handleRefresh} 
            size="sm" 
            variant="ghost"
            disabled={isLoading || isOffline}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            <span className="sr-only">Atualizar</span>
          </Button>
          
          <Button 
            onClick={() => setIsEditorOpen(true)} 
            size="sm" 
            variant="outline"
            disabled={isOffline}
          >
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <NetworkStatus 
          onRefresh={handleRefresh}
          className="mb-4"
        />
        
        {isLoading && !announcements.length ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Carregando avisos...</span>
          </div>
        ) : hasError && !announcements.length ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertTitle>Erro ao carregar avisos</AlertTitle>
            <AlertDescription>
              Não foi possível carregar os avisos. Verifique sua conexão.
            </AlertDescription>
          </Alert>
        ) : announcements.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            Nenhum aviso disponível.
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div 
                key={announcement.id} 
                className="p-3 border rounded-md bg-white"
              >
                <p className="whitespace-pre-wrap">{announcement.content}</p>
                <div className="flex justify-between items-center mt-2 pt-2 border-t text-sm text-gray-500">
                  <span>
                    {format(new Date(announcement.created_at), "dd 'de' MMMM", {
                      locale: ptBR,
                    })}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeAnnouncement(announcement.id)}
                    disabled={isOffline}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <AnnouncementEditor
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSubmit={handleAddAnnouncement}
        />
      </CardContent>
    </Card>
  );
};
