
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Update these with your new database credentials
const SUPABASE_URL = "https://bjtipxxqabntdfynzokr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdGlweHhxYWJudGRmeW56b2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MDU3OTEsImV4cCI6MjA1NDA4MTc5MX0.xIHQY_Omf6E0qYXObN9sFF2mwVuwgAZHv0QVSCKdKqs";

// Define a fallback response for offline mode
const OFFLINE_ERROR = new Error('You are currently offline');

// Create a simple offline cache
const offlineCache = new Map<string, any>();

// Helper function for retrying operations with exponential backoff
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> => {
  let lastError: any;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (!navigator.onLine) {
        throw OFFLINE_ERROR;
      }
      
      return await operation();
    } catch (error) {
      lastError = error;
      
      // If we're offline, no need to retry
      if (isOfflineError(error) || !navigator.onLine) {
        console.log(`Device is offline, aborting retry`);
        break;
      }
      
      if (attempt < maxRetries) {
        console.log(`Operation failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }
  
  throw lastError;
};

// Create a more robust client with retries and extended timeouts
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: { 
      'x-application-name': 'unifap-app',
      'Cache-Control': 'no-cache',
    },
    // Implement robust offline-first approach
    fetch: (url: string, options: RequestInit = {}) => {
      // First check if the device is online at all
      if (!navigator.onLine) {
        console.log('Device is offline, using cached data if available');
        return Promise.reject(OFFLINE_ERROR);
      }
      
      // Implement a more aggressive timeout strategy
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('Request timeout reached, aborting');
        controller.abort('Request timeout reached');
      }, 8000); // 8 second timeout - more aggressive
      
      // Handle original signal if provided
      const originalSignal = options.signal;
      
      if (originalSignal) {
        originalSignal.addEventListener('abort', () => controller.abort());
      }
      
      // Implement network request with strict timeout
      const fetchPromise = fetch(url, {
        ...options,
        signal: controller.signal,
        cache: 'no-store', // Force fresh data
        headers: {
          ...options.headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        }
      });
      
      // Clear timeout on response/error
      fetchPromise.finally(() => clearTimeout(timeoutId));
      
      return fetchPromise;
    }
  },
});

// Helper function to check if the Supabase service is online
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    if (!navigator.onLine) {
      console.log('Device is offline, skipping connection check');
      return false;
    }
    
    // Simple query with short timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Simple query to check if the connection works
    const { error } = await supabase
      .from('professionals')
      .select('id')
      .limit(1)
      .abortSignal(controller.signal)
      .maybeSingle();
    
    clearTimeout(timeoutId);
    
    const isConnected = !error;
    console.log('Supabase connection check:', isConnected ? 'SUCCESS' : 'FAILED', error ? error.message : '');
    return isConnected;
  } catch (err) {
    console.error('Supabase connection check failed:', err);
    return false;
  }
};

// Helper to determine if an error is due to being offline
export const isOfflineError = (error: any): boolean => {
  if (!error) return false;
  
  if (!navigator.onLine) return true;
  
  // Check various signals that might indicate an offline state
  return (
    error === OFFLINE_ERROR ||
    error.message?.includes('Failed to fetch') ||
    error.message?.includes('offline') ||
    error.message?.includes('network') ||
    error.message?.includes('connection') ||
    error.name === 'AbortError' ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ETIMEDOUT'
  );
};

// Add a global network status monitor to the window
export const setupNetworkMonitoring = () => {
  // Create a singleton for network status
  if (!(window as any).networkStatus) {
    (window as any).networkStatus = {
      isOnline: navigator.onLine,
      serverReachable: null as boolean | null,
      lastCheck: Date.now(),
      listeners: new Set<() => void>(),
    };

    // Set up event listeners for online/offline events
    window.addEventListener('online', () => {
      console.log('Browser reports online');
      (window as any).networkStatus.isOnline = true;
      checkServerAndNotify();
    });

    window.addEventListener('offline', () => {
      console.log('Browser reports offline');
      (window as any).networkStatus.isOnline = false;
      (window as any).networkStatus.serverReachable = false;
      notifyListeners();
    });
  }

  // Function to check server and notify listeners
  const checkServerAndNotify = async () => {
    if ((window as any).networkStatus.isOnline) {
      try {
        (window as any).networkStatus.serverReachable = await checkSupabaseConnection();
      } catch (err) {
        (window as any).networkStatus.serverReachable = false;
      }
    } else {
      (window as any).networkStatus.serverReachable = false;
    }
    
    (window as any).networkStatus.lastCheck = Date.now();
    notifyListeners();
  };

  // Notify all registered listeners
  const notifyListeners = () => {
    (window as any).networkStatus.listeners.forEach((listener: () => void) => {
      try {
        listener();
      } catch (err) {
        console.error('Error in network status listener:', err);
      }
    });
  };

  // Check server status every minute when online
  setInterval(() => {
    if ((window as any).networkStatus.isOnline) {
      checkServerAndNotify();
    }
  }, 60000);

  // Initial check
  checkServerAndNotify();

  return {
    addListener: (listener: () => void) => {
      (window as any).networkStatus.listeners.add(listener);
    },
    removeListener: (listener: () => void) => {
      (window as any).networkStatus.listeners.delete(listener);
    },
    getStatus: () => {
      return {
        isOnline: (window as any).networkStatus.isOnline,
        serverReachable: (window as any).networkStatus.serverReachable,
        lastCheck: (window as any).networkStatus.lastCheck
      };
    }
  };
};
