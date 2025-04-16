
import { Professional } from "@/types/professional";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { Button } from "@/components/ui/button";
import { BarChart3, Trash2, RefreshCcw, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfessionalListProps {
  professionals: Professional[];
  isLoading?: boolean;
  hasError?: boolean;
  onRefresh?: () => void;
  onProfessionalClick: (professional: Professional) => void;
  onEditClick: (professional: Professional) => void;
  onRemoveClick: (professional: Professional) => void;
}

export const ProfessionalList = ({
  professionals,
  isLoading = false,
  hasError = false,
  onRefresh,
  onProfessionalClick,
  onEditClick,
  onRemoveClick,
}: ProfessionalListProps) => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Profissionais</h2>
        <div className="flex gap-2">
          {hasError && onRefresh && (
            <Button
              variant="outline"
              onClick={onRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Recarregar
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate("/relatorios")}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Relatórios
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : hasError ? (
        <div className="p-8 text-center border rounded-md bg-gray-50">
          <p className="text-red-500 mb-2 font-medium">Erro ao carregar profissionais</p>
          <p className="text-sm text-muted-foreground mb-4">
            Não foi possível conectar ao servidor. Verifique sua conexão com a internet.
          </p>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline" className="mx-auto">
              <RefreshCcw className="h-4 w-4 mr-2" /> Tentar novamente
            </Button>
          )}
        </div>
      ) : professionals.length === 0 ? (
        <div className="p-8 text-center border rounded-md bg-gray-50">
          <p className="text-muted-foreground">
            Nenhum profissional cadastrado ainda.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {professionals.map((professional) => (
            <div key={professional.id} className="relative group">
              <ProfessionalCard
                professional={professional}
                onClick={onProfessionalClick}
                onEditClick={() => onEditClick(professional)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveClick(professional);
                }}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
