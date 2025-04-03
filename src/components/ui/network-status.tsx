
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { RefreshCcw, Loader2, WifiOff, ServerOff, CheckCircle2 } from "lucide-react";
import { useNetwork } from "@/contexts/NetworkContext";

export interface NetworkStatusProps {
  onRefresh?: () => void;
  showSuccessAlert?: boolean;
  className?: string;
  hideWhenConnected?: boolean;
}

export function NetworkStatus({
  onRefresh,
  showSuccessAlert = false,
  className = "mb-6",
  hideWhenConnected = false,
}: NetworkStatusProps) {
  const { isOnline, serverReachable, checkConnection, isChecking } = useNetwork();
  const [showSuccess, setShowSuccess] = useState(false);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (showSuccessAlert && isOnline && serverReachable) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOnline, serverReachable, showSuccessAlert]);

  const handleRefresh = async () => {
    const isConnected = await checkConnection();
    
    if (onRefresh && isConnected) {
      onRefresh();
    }
  };

  // Se estamos conectados e não queremos mostrar alerta de sucesso ou o hideWhenConnected está ativo
  if (isOnline && serverReachable && (hideWhenConnected || !showSuccess || !showSuccessAlert)) {
    return null;
  }

  // Sem conexão com a internet
  if (!isOnline) {
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
          disabled={isChecking}
        >
          {isChecking ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4 mr-2" />
          )}
          Verificar conexão
        </Button>
      </Alert>
    );
  }
  
  // Online mas servidor não acessível
  if (serverReachable === false) {
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
          disabled={isChecking}
        >
          {isChecking ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4 mr-2" />
          )}
          Verificar conexão
        </Button>
      </Alert>
    );
  }

  // Alerta de sucesso
  if (showSuccess && showSuccessAlert) {
    return (
      <Alert variant="default" className={`${className} bg-green-50 border-green-200`}>
        <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
        <AlertTitle className="text-green-700">Conectado</AlertTitle>
        <AlertDescription className="text-green-600">
          Você está conectado ao servidor.
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
}
