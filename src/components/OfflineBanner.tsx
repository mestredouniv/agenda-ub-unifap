
import { useEffect, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { WifiOff } from "lucide-react";
import { offlineService } from "@/services/OfflineService";

export const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const unsubscribe = offlineService.addListener(setIsOnline);
    return unsubscribe;
  }, []);
  
  if (isOnline) {
    return null;
  }
  
  return (
    <div className="sticky top-0 z-50 w-full animate-in fade-in zoom-in">
      <Alert variant="destructive" className="rounded-none border-b mb-0">
        <WifiOff className="h-4 w-4" />
        <AlertTitle>Modo offline</AlertTitle>
        <AlertDescription>
          Você está usando o aplicativo no modo offline. Algumas funcionalidades podem estar limitadas.
        </AlertDescription>
      </Alert>
    </div>
  );
};
