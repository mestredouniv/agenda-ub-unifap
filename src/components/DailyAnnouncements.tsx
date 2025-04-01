
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, RefreshCcw, Loader2 } from "lucide-react";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { format } from "date-fns";

export const DailyAnnouncements = () => {
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const { announcements, addAnnouncement, removeAnnouncement, isLoading, hasError, refetch } = useAnnouncements();

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
          {hasError && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refetch} 
              className="text-muted-foreground hover:text-primary"
            >
              <RefreshCcw className="h-4 w-4 mr-1" /> Recarregar
            </Button>
          )}
        </div>
        
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
            disabled={isLoading || hasError}
          />
          <Button
            onClick={handleAddAnnouncement}
            className="bg-primary hover:bg-primary/90 text-white"
            disabled={isLoading || hasError || !newAnnouncement.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : hasError ? (
          <div className="p-6 text-center">
            <p className="text-red-500 mb-2">Não foi possível carregar os avisos</p>
            <p className="text-sm text-muted-foreground">
              Verifique sua conexão com a internet e tente novamente
            </p>
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
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {announcements.length === 0 && (
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
