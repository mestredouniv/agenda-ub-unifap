
import { toast } from "@/hooks/use-toast";

// Types for our cached data structure
interface CachedData<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class OfflineService {
  private static instance: OfflineService;
  private isOnline: boolean = navigator.onLine;
  private listeners: Set<(status: boolean) => void> = new Set();
  private LOCAL_STORAGE_PREFIX = 'unifap_offline_';
  private reconnectionAttempts: number = 0;
  private reconnectionTimer: number | null = null;

  // Cache expiration times in milliseconds
  private CACHE_EXPIRY = {
    PROFESSIONALS: 24 * 60 * 60 * 1000, // 24 hours
    ANNOUNCEMENTS: 30 * 60 * 1000, // 30 minutes
    APPOINTMENTS: 15 * 60 * 1000, // 15 minutes
  };

  // Singleton pattern
  public static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  constructor() {
    // Initialize network listeners
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    // Set initial state
    this.isOnline = navigator.onLine;
  }

  private handleOnline = () => {
    console.log('[OfflineService] Browser reports online');
    this.isOnline = true;
    this.reconnectionAttempts = 0;
    this.notifyListeners();
    
    toast({
      title: "Conexão restabelecida",
      description: "Sua conexão com a internet foi restabelecida.",
    });
  };

  private handleOffline = () => {
    console.log('[OfflineService] Browser reports offline');
    this.isOnline = false;
    this.notifyListeners();
    
    toast({
      title: "Sem conexão",
      description: "Você está offline. Alguns recursos podem não estar disponíveis.",
      variant: "destructive",
    });
  };

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.isOnline);
      } catch (error) {
        console.error('[OfflineService] Error notifying listener:', error);
      }
    });
  }

  public addListener(listener: (status: boolean) => void): () => void {
    this.listeners.add(listener);
    
    // Immediately notify the new listener of the current status
    try {
      listener(this.isOnline);
    } catch (error) {
      console.error('[OfflineService] Error in new listener:', error);
    }
    
    // Return a function to remove the listener
    return () => {
      this.listeners.delete(listener);
    };
  }

  public isNetworkOnline(): boolean {
    return this.isOnline;
  }

  // Store data in local cache with expiry
  public cacheData<T>(key: string, data: T, expiryMs: number = 3600000): void {
    const cachedData: CachedData<T> = {
      data,
      timestamp: Date.now(),
      expiry: expiryMs,
    };
    
    try {
      localStorage.setItem(
        this.LOCAL_STORAGE_PREFIX + key,
        JSON.stringify(cachedData)
      );
      console.log(`[OfflineService] Data cached for key: ${key}`);
    } catch (error) {
      console.error(`[OfflineService] Error caching data for key: ${key}`, error);
    }
  }

  // Get data from cache if available and not expired
  public getCachedData<T>(key: string): T | null {
    try {
      const cachedDataString = localStorage.getItem(this.LOCAL_STORAGE_PREFIX + key);
      if (!cachedDataString) return null;
      
      const cachedData = JSON.parse(cachedDataString) as CachedData<T>;
      const now = Date.now();
      const isExpired = now > (cachedData.timestamp + cachedData.expiry);
      
      if (isExpired) {
        console.log(`[OfflineService] Cache expired for key: ${key}`);
        localStorage.removeItem(this.LOCAL_STORAGE_PREFIX + key);
        return null;
      }
      
      console.log(`[OfflineService] Using cached data for key: ${key}`);
      return cachedData.data;
    } catch (error) {
      console.error(`[OfflineService] Error retrieving cached data for key: ${key}`, error);
      return null;
    }
  }

  // Check if there's cached data available
  public hasCachedData(key: string): boolean {
    return this.getCachedData(key) !== null;
  }

  // Clear all cached data
  public clearCache(): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.LOCAL_STORAGE_PREFIX))
        .forEach(key => localStorage.removeItem(key));
      console.log('[OfflineService] Cache cleared');
    } catch (error) {
      console.error('[OfflineService] Error clearing cache', error);
    }
  }

  // Specialized cache methods for common data types
  public cacheProfessionals(professionals: any[]): void {
    this.cacheData('professionals', professionals, this.CACHE_EXPIRY.PROFESSIONALS);
  }

  public getCachedProfessionals(): any[] | null {
    return this.getCachedData<any[]>('professionals');
  }

  public cacheAnnouncements(announcements: any[]): void {
    this.cacheData('announcements', announcements, this.CACHE_EXPIRY.ANNOUNCEMENTS);
  }

  public getCachedAnnouncements(): any[] | null {
    return this.getCachedData<any[]>('announcements');
  }

  public cacheAppointments(professionalId: string, date: string, appointments: any[]): void {
    this.cacheData(`appointments_${professionalId}_${date}`, appointments, this.CACHE_EXPIRY.APPOINTMENTS);
  }

  public getCachedAppointments(professionalId: string, date: string): any[] | null {
    return this.getCachedData<any[]>(`appointments_${professionalId}_${date}`);
  }
}

// Export singleton instance
export const offlineService = OfflineService.getInstance();

// Helper functions for retry logic with built-in offline awareness
export const retryWithFallback = async <T>(
  onlineAction: () => Promise<T>,
  offlineFallback: () => T | null,
  maxRetries: number = 2,
  retryDelay: number = 1000
): Promise<T> => {
  // If offline, return fallback immediately
  if (!offlineService.isNetworkOnline()) {
    const fallbackData = offlineFallback();
    if (fallbackData !== null) {
      return fallbackData;
    }
    throw new Error('Você está offline e não há dados em cache disponíveis.');
  }

  // Online - try with retries
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const data = await onlineAction();
      return data;
    } catch (error) {
      console.error(`Attempt ${attempt + 1}/${maxRetries + 1} failed:`, error);
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        // Wait with exponential backoff
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        
        // Check if we went offline during retry
        if (!offlineService.isNetworkOnline()) {
          const fallbackData = offlineFallback();
          if (fallbackData !== null) {
            return fallbackData;
          }
          throw new Error('A conexão foi perdida e não há dados em cache disponíveis.');
        }
      }
    }
  }

  // All retries failed, try fallback
  const fallbackData = offlineFallback();
  if (fallbackData !== null) {
    return fallbackData;
  }
  
  throw lastError || new Error('Falha na operação após várias tentativas.');
};
