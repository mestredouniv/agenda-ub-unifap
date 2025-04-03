
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { networkMonitor } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface NetworkContextState {
  isOnline: boolean;
  serverReachable: boolean | null;
  lastCheck: number;
  checkConnection: () => Promise<boolean>;
  isChecking: boolean;
}

const NetworkContext = createContext<NetworkContextState>({
  isOnline: true,
  serverReachable: null,
  lastCheck: 0,
  checkConnection: async () => false,
  isChecking: false,
});

export const useNetwork = () => useContext(NetworkContext);

interface NetworkProviderProps {
  children: ReactNode;
  showToasts?: boolean;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ 
  children, 
  showToasts = true 
}) => {
  const [status, setStatus] = useState(() => networkMonitor.getStatus());
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();
  
  // Estados para controlar exibição dos toasts
  const [onlineToastShown, setOnlineToastShown] = useState(false);
  const [offlineToastShown, setOfflineToastShown] = useState(false);

  useEffect(() => {
    const handleStatusChange = () => {
      const currentStatus = networkMonitor.getStatus();
      setStatus(currentStatus);
      
      if (showToasts) {
        // Mostra toast online apenas uma vez
        if (currentStatus.isOnline && currentStatus.serverReachable && !onlineToastShown) {
          setOnlineToastShown(true);
          setOfflineToastShown(false);
          toast({
            title: "Conexão restabelecida",
            description: "Sua conexão com a internet foi restabelecida.",
          });
        } 
        // Mostra toast offline apenas uma vez
        else if ((!currentStatus.isOnline || currentStatus.serverReachable === false) && !offlineToastShown) {
          setOfflineToastShown(true);
          setOnlineToastShown(false);
          toast({
            title: "Sem conexão",
            description: "Você está offline. Alguns recursos podem não estar disponíveis.",
            variant: "destructive",
          });
        }
      }
    };

    networkMonitor.addListener(handleStatusChange);
    handleStatusChange(); // Estado inicial

    return () => {
      networkMonitor.removeListener(handleStatusChange);
    };
  }, [toast, showToasts, onlineToastShown, offlineToastShown]);

  const checkConnection = async (): Promise<boolean> => {
    setIsChecking(true);
    try {
      const result = await networkMonitor.checkServerConnection();
      return result;
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <NetworkContext.Provider 
      value={{ 
        ...status, 
        checkConnection,
        isChecking
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};
