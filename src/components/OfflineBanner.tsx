
import { useEffect, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { WifiOff } from "lucide-react";
import { offlineService } from "@/services/OfflineService";

export const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(!navigator.onLine);
  
  // Listen to network status changes more robustly
  useEffect(() => {
    // Initial state
    setIsOnline(navigator.onLine);
    setShowBanner(!navigator.onLine);
    
    // Subscribe to offline service for more reliable status updates
    const unsubscribe = offlineService.addListener((status) => {
      setIsOnline(status);
      // If we go offline, show the banner immediately
      if (!status) {
        setShowBanner(true);
      } else {
        // If we come online, delay hiding the banner to ensure connection is stable
        setTimeout(() => setShowBanner(false), 2000);
      }
    });
    
    return unsubscribe;
  }, []);
  
  if (isOnline && !showBanner) {
    return null;
  }
  
  return (
    <div className="sticky top-0 z-[100] w-full animate-in fade-in zoom-in">
      <Alert variant="destructive" className="rounded-none border-b mb-0">
        <WifiOff className="h-4 w-4" />
        <AlertTitle>Modo offline</AlertTitle>
        <AlertDescription>
          Você está usando o aplicativo no modo offline. Algumas funcionalidades estão limitadas.
          {isOnline && <span className="block mt-1 text-sm opacity-80">Reconectando...</span>}
        </AlertDescription>
      </Alert>
    </div>
  );
};
