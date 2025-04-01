
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Plus, X, RefreshCcw, Loader2, WifiOff, AlertTriangle, ServerOff } from "lucide-react";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { format } from "date-fns";

export const DailyAnnouncements = () => {
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const { 
    announcements, 
    addAnnouncement, 
    removeAnnouncement, 
    isLoading, 
    hasError, 
    isOffline, 
    isRetrying, 
    refetch 
  } = useAnnouncements();

  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.trim()) return;
    const success = await addAnnouncement(newAnnouncement);
    if (success) {
      setNewAnnouncement("");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 animate-fade-in">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Avisos do Dia</h2>
          {hasError && !isOffline && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refetch} 
              disabled={isRetrying}
              className="text-muted-foreground hover:text-primary"
            >
              {isRetrying ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4 mr-1" />
              )}
              Recarregar
            </Button>
          )}
        </div>
        
        {isOffline && (
          <Alert variant="destructive" className="mb-4">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>Sem conexão</AlertTitle>
            <AlertDescription>
              Você está offline. Verifique sua conexão com a internet.
            </AlertDescription>
          </Alert>
        )}

        {hasError && !isOffline && (
          <Alert variant="destructive" className="mb-4">
            <ServerOff className="h-4 w-4" />
            <AlertTitle>Erro de conexão</AlertTitle>
            <AlertDescription>
              Não foi possível conectar ao servidor. Verifique a disponibilidade do servidor.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 mb-4">
          <Input
            value={newAnnouncement}
            onChange={(e) => setNewAnnouncement(e.target.value)}
            placeholder="Digite um novo aviso..."
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddAnnouncement();
              }
            }}
            disabled={isLoading || hasError || isOffline || isRetrying}
          />
          <Button
            onClick={handleAddAnnouncement}
            className="bg-primary hover:bg-primary/90 text-white"
            disabled={isLoading || hasError || isOffline || isRetrying || !newAnnouncement.trim()}
          >
            {isRetrying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : hasError && !isOffline ? (
          <div className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-red-500 mb-2">Não foi possível carregar os avisos</p>
            <p className="text-sm text-muted-foreground">
              Verifique a conexão com o servidor e tente novamente
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refetch} 
              disabled={isRetrying}
              className="mt-4"
            >
              {isRetrying ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4 mr-2" />
              )}
              Tentar novamente
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="p-3 bg-gray-50 rounded-md text-sm relative group"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <p>{announcement.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Expira em: {format(new Date(announcement.expires_at), "HH:mm")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeAnnouncement(announcement.id)}
                    disabled={isOffline || isRetrying}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {announcements.length === 0 && !isOffline && !hasError && (
              <p className="text-gray-500 text-sm text-center">
                Nenhum aviso para hoje
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
