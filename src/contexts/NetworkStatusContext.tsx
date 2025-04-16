
import React, { createContext, useContext, useEffect, useState } from 'react';
import { setupNetworkMonitoring } from '@/integrations/supabase/client';

interface NetworkStatus {
  isOnline: boolean;
  serverReachable: boolean | null;
  lastCheck: number;
}

interface NetworkContextValue {
  status: NetworkStatus;
  checkConnection: () => Promise<boolean>;
  isLoading: boolean;
}

const NetworkStatusContext = createContext<NetworkContextValue>({
  status: {
    isOnline: true,
    serverReachable: null,
    lastCheck: 0
  },
  checkConnection: async () => false,
  isLoading: false
});

export const useNetworkStatus = () => useContext(NetworkStatusContext);

export const NetworkStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    serverReachable: null,
    lastCheck: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [networkMonitor, setNetworkMonitor] = useState<any>(null);

  useEffect(() => {
    // Initialize the network monitor
    const monitor = setupNetworkMonitoring();
    setNetworkMonitor(monitor);

    // Listen for status changes
    const handleStatusChange = () => {
      const currentStatus = monitor.getStatus();
      setStatus(currentStatus);
    };

    // Add listener and get initial status
    monitor.addListener(handleStatusChange);
    handleStatusChange();

    // Cleanup
    return () => {
      monitor.removeListener(handleStatusChange);
    };
  }, []);

  const checkConnection = async (): Promise<boolean> => {
    if (!networkMonitor) return false;
    
    setIsLoading(true);
    try {
      // Trigger a check and wait for it
      const currentStatus = networkMonitor.getStatus();
      setStatus(currentStatus);
      setIsLoading(false);
      return currentStatus.isOnline && currentStatus.serverReachable;
    } catch (error) {
      console.error('Error checking connection:', error);
      setIsLoading(false);
      return false;
    }
  };

  return (
    <NetworkStatusContext.Provider value={{ status, checkConnection, isLoading }}>
      {children}
    </NetworkStatusContext.Provider>
  );
};
