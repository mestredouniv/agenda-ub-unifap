
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Professional } from "@/types/professional";
import { ProfessionalList } from "@/components/ProfessionalList";
import { useProfessionals } from "@/hooks/useProfessionals";
import { useToast } from "@/hooks/use-toast";
import { AddProfessionalModal } from "@/components/AddProfessionalModal";
import { useNetworkStatus } from "@/contexts/NetworkStatusContext";

export const ProfessionalsManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  
  const { status } = useNetworkStatus();
  
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
    if (!status.isOnline || status.serverReachable === false) {
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
    if (!status.isOnline || status.serverReachable === false) {
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
    if (!status.isOnline || status.serverReachable === false) {
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
    <>
      <ProfessionalList
        professionals={professionals}
        isLoading={isLoading}
        hasError={hasError || (!status.isOnline || status.serverReachable === false)}
        onRefresh={refetch}
        onProfessionalClick={handleProfessionalClick}
        onEditClick={handleEditClick}
        onRemoveClick={handleRemoveClick}
      />

      <AddProfessionalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addProfessional}
        onEdit={updateProfessional}
        onDelete={deleteProfessional}
        professional={selectedProfessional}
        mode={modalMode}
      />
    </>
  );
};
