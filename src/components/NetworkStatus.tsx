
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { RefreshCcw, Loader2, WifiOff, ServerOff, CheckCircle2 } from "lucide-react";
import { useNetworkStatus } from "@/contexts/NetworkStatusContext";
import { useToast } from "@/hooks/use-toast";

export interface NetworkStatusProps {
  onRefresh?: () => void;
  showSuccessAlert?: boolean;
  className?: string;
}

export const NetworkStatus = ({ 
  onRefresh, 
  showSuccessAlert = false,
  className = "mb-6"
}: NetworkStatusProps) => {
  const { status, checkConnection, isLoading } = useNetworkStatus();
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (showSuccessAlert && status.isOnline && status.serverReachable) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [status.isOnline, status.serverReachable, showSuccessAlert]);

  const handleRefresh = async () => {
    const isConnected = await checkConnection();
    
    if (onRefresh && isConnected) {
      onRefresh();
    }
    
    if (isConnected) {
      toast({
        title: "Conexão restabelecida",
        description: "A conexão com o servidor foi restabelecida com sucesso.",
      });
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

  if (!status.isOnline) {
    return (
      <Alert variant="destructive" className={className}>
        <WifiOff className="h-4 w-4 mr-2" />
        <AlertTitle>Sem conexão</AlertTitle>
        <AlertDescription>
          Você está offline. Verifique sua conexão com a internet.
        </AlertDescription>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm" 
          className="mt-2 border-red-300 text-red-700"
          disabled={isLoading}
        >
          {isLoading ? (
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
      <Alert variant="destructive" className={className}>
        <ServerOff className="h-4 w-4 mr-2" />
        <AlertTitle>Erro de conexão</AlertTitle>
        <AlertDescription>
          Não foi possível conectar ao servidor. O servidor pode estar indisponível.
        </AlertDescription>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm" 
          className="mt-2 border-red-300 text-red-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4 mr-2" />
          )}
          Verificar conexão
        </Button>
      </Alert>
    );
  }

  if (showSuccess && showSuccessAlert) {
    return (
      <Alert variant="default" className={className + " bg-green-50 border-green-200"}>
        <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
        <AlertTitle className="text-green-700">Conectado</AlertTitle>
        <AlertDescription className="text-green-600">
          Você está conectado ao servidor.
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};
