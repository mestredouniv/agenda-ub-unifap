
import { useEffect, useState } from "react";
import { useNetwork } from "@/contexts/NetworkContext";
import { WifiOff, ServerOff, Wifi } from "lucide-react";

interface OfflineIndicatorProps {
  showOnlineStatus?: boolean;
  className?: string;
}

export function OfflineIndicator({ 
  showOnlineStatus = false, 
  className = "" 
}: OfflineIndicatorProps) {
  const { isOnline, serverReachable } = useNetwork();
  const [isVisible, setIsVisible] = useState(true);

  // Auto-esconder o indicador de online após alguns segundos
  useEffect(() => {
    if (isOnline && serverReachable && showOnlineStatus) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
    return undefined;
  }, [isOnline, serverReachable, showOnlineStatus]);

  if (!isVisible) {
    return null;
  }

  // Sem conexão
  if (!isOnline) {
    return (
      <div className={`flex items-center text-red-600 ${className}`}>
        <WifiOff size={16} className="mr-1" />
        <span className="text-xs font-medium">Offline</span>
      </div>
    );
  }

  // Online mas servidor inacessível
  if (serverReachable === false) {
    return (
      <div className={`flex items-center text-amber-600 ${className}`}>
        <ServerOff size={16} className="mr-1" />
        <span className="text-xs font-medium">Servidor indisponível</span>
      </div>
    );
  }

  // Completamente online e exibir status
  if (showOnlineStatus && serverReachable === true) {
    return (
      <div className={`flex items-center text-green-600 ${className}`}>
        <Wifi size={16} className="mr-1" />
        <span className="text-xs font-medium">Online</span>
      </div>
    );
  }

  return null;
}
