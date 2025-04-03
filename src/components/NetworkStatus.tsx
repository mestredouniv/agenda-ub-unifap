
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { RefreshCcw, Loader2, WifiOff, ServerOff, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { offlineService } from "@/services/OfflineService";

export interface NetworkStatusProps {
  onRefresh?: () => void;
  showSuccessAlert?: boolean;
  className?: string;
  showRefreshButton?: boolean;
}

export const NetworkStatus = ({
  onRefresh,
  showSuccessAlert = false,
  className = "mb-6",
  showRefreshButton = true
}: NetworkStatusProps) => {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Subscribe to offline service
    const unsubscribe = offlineService.addListener((status) => {
      setIsOnline(status);
      
      // Show success message briefly when coming back online
      if (status && showSuccessAlert) {
        setShowSuccess(true);
        const timer = setTimeout(() => setShowSuccess(false), 3000);
        return () => clearTimeout(timer);
      }
    });
    
    return unsubscribe;
  }, [showSuccessAlert]);

  const handleRefresh = async () => {
    setIsLoading(true);
    
    try {
      // Wait a moment to give impression of checking
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const isConnected = navigator.onLine;
      
      if (isConnected && onRefresh) {
        onRefresh();
      }
      
      if (isConnected) {
        toast({
          title: "Verificação concluída",
          description: "Sua conexão com a internet está ativa.",
        });
      } else {
        toast({
          title: "Sem conexão",
          description: "Você está offline. Verifique sua conexão com a internet.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOnline) {
    return (
      <Alert variant="destructive" className={className}>
        <WifiOff className="h-4 w-4 mr-2" />
        <AlertTitle>Sem conexão</AlertTitle>
        <AlertDescription>
          Você está offline. Verifique sua conexão com a internet.
        </AlertDescription>
        {showRefreshButton && (
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
        )}
      </Alert>
    );
  }
  
  if (showSuccess && showSuccessAlert) {
    return (
      <Alert variant="default" className={className + " bg-green-50 border-green-200"}>
        <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
        <AlertTitle className="text-green-700">Conectado</AlertTitle>
        <AlertDescription className="text-green-600">
          Você está conectado à internet.
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};
