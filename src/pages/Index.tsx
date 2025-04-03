
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AddProfessionalModal } from "@/components/AddProfessionalModal";
import { DailyAnnouncements } from "@/components/DailyAnnouncements";
import { Header } from "@/components/Header";
import { Professional } from "@/types/professional";
import { ProfessionalList } from "@/components/ProfessionalList";
import { useProfessionals } from "@/hooks/useProfessionals";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Loader2, WifiOff, ServerOff } from "lucide-react";
import { checkSupabaseConnection, isOfflineError } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isConnectionChecking, setIsConnectionChecking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline' | 'server-error'>('checking');
  
  const {
    professionals,
    isLoading,
    hasError,
    isOffline,
    addProfessional,
    updateProfessional,
    deleteProfessional,
    refetch
  } = useProfessionals();

  // Check connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus('checking');
        setIsConnectionChecking(true);
        
        // First check if device is online
        if (!navigator.onLine) {
          setConnectionStatus('offline');
          setIsConnectionChecking(false);
          return;
        }
        
        // Then check if server is reachable
        const isConnected = await checkSupabaseConnection();
        setConnectionStatus(isConnected ? 'online' : 'server-error');
        
        if (isConnected) {
          console.log('Database connection successful, refreshing data');
          refetch();
        } else {
          console.log('Database connection failed');
        }
      } catch (err) {
        console.error('Connection check error:', err);
        setConnectionStatus(isOfflineError(err) ? 'offline' : 'server-error');
      } finally {
        setIsConnectionChecking(false);
      }
    };
    
    checkConnection();
    
    // Setup listeners for online/offline events
    const handleOnline = () => {
      console.log('Device came online');
      checkConnection();
    };
    
    const handleOffline = () => {
      console.log('Device went offline');
      setConnectionStatus('offline');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRefreshConnection = async () => {
    setIsConnectionChecking(true);
    try {
      if (!navigator.onLine) {
        toast({
          title: "Sem conexão",
          description: "Seu dispositivo está offline. Verifique sua conexão com a internet.",
          variant: "destructive",
        });
        setConnectionStatus('offline');
        setIsConnectionChecking(false);
        return;
      }
      
      const isConnected = await checkSupabaseConnection();
      if (isConnected) {
        toast({
          title: "Conexão restabelecida",
          description: "A conexão com o servidor foi restabelecida com sucesso.",
        });
        setConnectionStatus('online');
        refetch();
      } else {
        toast({
          title: "Erro de conexão",
          description: "Ainda não foi possível conectar ao servidor. Tente novamente mais tarde.",
          variant: "destructive",
        });
        setConnectionStatus('server-error');
      }
    } catch (err) {
      console.error('Connection check error:', err);
      setConnectionStatus(isOfflineError(err) ? 'offline' : 'server-error');
    } finally {
      setIsConnectionChecking(false);
    }
  };

  const handleProfessionalClick = (professional: Professional) => {
    navigate(`/agenda/${professional.id}`);
  };

  const handleEditClick = (professional: Professional) => {
    setSelectedProfessional(professional);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedProfessional(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleRemoveClick = async (professional: Professional) => {
    if (!professional?.id) {
      toast({
        title: "Erro",
        description: "Selecione um profissional para remover.",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja remover ${professional.name}?`
    );

    if (confirmed) {
      const success = await deleteProfessional(professional.id);
      if (success) {
        toast({
          title: "Sucesso",
          description: "Profissional removido com sucesso.",
        });
      }
    }
  };

  // Render connection error message
  const renderConnectionAlert = () => {
    if (connectionStatus === 'offline') {
      return (
        <Alert variant="destructive" className="mb-6">
          <WifiOff className="h-4 w-4 mr-2" />
          <AlertTitle>Sem conexão</AlertTitle>
          <AlertDescription>
            Você está offline. Verifique sua conexão com a internet.
          </AlertDescription>
          <Button 
            onClick={handleRefreshConnection} 
            variant="outline" 
            size="sm" 
            className="mt-2 border-red-300 text-red-700"
            disabled={isConnectionChecking}
          >
            {isConnectionChecking ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4 mr-2" />
            )}
            Verificar conexão
          </Button>
        </Alert>
      );
    }
    
    if (connectionStatus === 'server-error') {
      return (
        <Alert variant="destructive" className="mb-6">
          <ServerOff className="h-4 w-4 mr-2" />
          <AlertTitle>Erro de conexão</AlertTitle>
          <AlertDescription>
            Não foi possível conectar ao servidor. Verifique sua conexão com o servidor.
          </AlertDescription>
          <Button 
            onClick={handleRefreshConnection} 
            variant="outline" 
            size="sm" 
            className="mt-2 border-red-300 text-red-700"
            disabled={isConnectionChecking}
          >
            {isConnectionChecking ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4 mr-2" />
            )}
            Verificar conexão
          </Button>
        </Alert>
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onAddClick={handleAddClick}
        onRemoveClick={() => {
          if (professionals.length > 0) {
            setSelectedProfessional(professionals[0]);
            setModalMode("edit");
            setIsModalOpen(true);
          } else {
            toast({
              title: "Aviso",
              description: "Não há profissionais para remover.",
              variant: "destructive",
            });
          }
        }}
      />
      
      <main className="container mx-auto px-4 py-6">
        {renderConnectionAlert()}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <DailyAnnouncements />
        </div>

        <div className="mt-8">
          <ProfessionalList
            professionals={professionals}
            isLoading={isLoading || connectionStatus === 'checking'}
            hasError={hasError || connectionStatus === 'server-error'}
            onRefresh={handleRefreshConnection}
            onProfessionalClick={handleProfessionalClick}
            onEditClick={handleEditClick}
            onRemoveClick={handleRemoveClick}
          />
        </div>
      </main>

      <AddProfessionalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addProfessional}
        onEdit={updateProfessional}
        onDelete={deleteProfessional}
        professional={selectedProfessional}
        mode={modalMode}
      />
    </div>
  );
};

export default Index;
