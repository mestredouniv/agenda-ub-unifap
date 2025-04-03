
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddProfessionalModal } from "@/components/AddProfessionalModal";
import { DailyAnnouncements } from "@/components/DailyAnnouncements";
import { Header } from "@/components/Header";
import { Professional } from "@/types/professional";
import { ProfessionalList } from "@/components/ProfessionalList";
import { useProfessionals } from "@/hooks/useProfessionals";
import { useToast } from "@/hooks/use-toast";
import { useNetwork } from "@/contexts/NetworkContext";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  
  const { checkConnection } = useNetwork();
  
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

  const handleRefreshConnection = async () => {
    const isConnected = await checkConnection();
    
    if (isConnected) {
      toast({
        title: "Conexão restabelecida",
        description: "A conexão com o servidor foi restabelecida com sucesso.",
      });
      refetch();
    }
  };

  const handleProfessionalClick = (professional: Professional) => {
    if (isOffline) {
      toast({
        title: "Modo offline",
        description: "Algumas funcionalidades podem estar limitadas no modo offline.",
        variant: "destructive",
      });
    }
    navigate(`/agenda/${professional.id}`);
  };

  const handleEditClick = (professional: Professional) => {
    if (isOffline) {
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
    if (isOffline) {
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
    if (isOffline) {
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <DailyAnnouncements />
        </div>

        <div className="mt-8">
          <ProfessionalList
            professionals={professionals}
            isLoading={isLoading}
            hasError={hasError}
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
