
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useNetworkStatus } from "@/contexts/NetworkStatusContext";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [retryCount, setRetryCount] = useState(0);
  
  // Use the network context instead of local state
  const { status, checkConnection, isLoading: isConnectionChecking } = useNetworkStatus();
  
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

  // Force refetch when we gain connectivity
  useEffect(() => {
    if (status.isOnline && status.serverReachable && retryCount < 3) {
      refetch();
      setRetryCount(prev => prev + 1);
    }
  }, [status.isOnline, status.serverReachable, refetch, retryCount]);

  const handleRefreshConnection = async () => {
    const isConnected = await checkConnection();
    
    if (isConnected) {
      toast({
        title: "Conexão restabelecida",
        description: "A conexão com o servidor foi restabelecida com sucesso.",
      });
      refetch();
    } else {
      toast({
        title: "Erro de conexão",
        description: status.isOnline 
          ? "O servidor está inacessível. Tente novamente mais tarde."
          : "Você está offline. Verifique sua conexão com a internet.",
        variant: "destructive",
      });
    }
  };

  const handleProfessionalClick = (professional: Professional) => {
    if (!status.isOnline) {
      toast({
        title: "Sem conexão",
        description: "Você está offline. Algumas funções podem não estar disponíveis.",
        variant: "destructive",
      });
    }
    navigate(`/agenda/${professional.id}`);
  };

  const handleEditClick = (professional: Professional) => {
    if (!status.isOnline || !status.serverReachable) {
      toast({
        title: "Sem conexão",
        description: "Você está offline. Não é possível editar profissionais.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedProfessional(professional);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    if (!status.isOnline || !status.serverReachable) {
      toast({
        title: "Sem conexão",
        description: "Você está offline. Não é possível adicionar profissionais.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedProfessional(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleRemoveClick = async (professional: Professional) => {
    if (!status.isOnline || !status.serverReachable) {
      toast({
        title: "Sem conexão",
        description: "Você está offline. Não é possível remover profissionais.",
        variant: "destructive",
      });
      return;
    }
    
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
    if (!status.isOnline) {
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
    
    if (!status.serverReachable) {
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
            handleEditClick(professionals[0]);
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
            isLoading={isLoading || isConnectionChecking}
            hasError={hasError || (!status.isOnline || !status.serverReachable)}
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
