
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
import { RefreshCcw, Loader2 } from "lucide-react";
import { checkSupabaseConnection } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isConnectionChecking, setIsConnectionChecking] = useState(false);
  
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

  useEffect(() => {
    // Try to establish connection when component mounts
    const checkConnection = async () => {
      try {
        setIsConnectionChecking(true);
        const isConnected = await checkSupabaseConnection();
        if (isConnected) {
          console.log('Database connection successful, refreshing data');
          refetch();
        } else {
          console.log('Database connection failed');
        }
      } catch (err) {
        console.error('Connection check error:', err);
      } finally {
        setIsConnectionChecking(false);
      }
    };
    
    checkConnection();
  }, []);

  const handleRefreshConnection = async () => {
    setIsConnectionChecking(true);
    try {
      const isConnected = await checkSupabaseConnection();
      if (isConnected) {
        toast({
          title: "Conexão restabelecida",
          description: "A conexão com o servidor foi restabelecida com sucesso.",
        });
        refetch();
      } else {
        toast({
          title: "Erro de conexão",
          description: "Ainda não foi possível conectar ao servidor. Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Connection check error:', err);
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
        {hasError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-red-800 font-medium">Erro de conexão</h3>
                <p className="text-red-600 text-sm">
                  {isOffline 
                    ? "Você está offline. Verifique sua conexão com a internet." 
                    : "Não foi possível conectar ao servidor. Verifique sua conexão com o servidor."}
                </p>
              </div>
              <Button 
                onClick={handleRefreshConnection} 
                variant="outline" 
                size="sm" 
                className="border-red-300 text-red-700"
                disabled={isConnectionChecking}
              >
                {isConnectionChecking ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4 mr-2" />
                )}
                Verificar conexão
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <DailyAnnouncements />
        </div>

        <div className="mt-8">
          <ProfessionalList
            professionals={professionals}
            isLoading={isLoading}
            hasError={hasError}
            onRefresh={refetch}
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
