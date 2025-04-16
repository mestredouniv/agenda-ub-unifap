import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import './styles/print.css'
import { BrowserRouter } from 'react-router-dom'
import { toast } from "@/hooks/use-toast"
import { isOfflineError, setupNetworkMonitoring } from "@/integrations/supabase/client"

// Initialize the global network monitor
const networkMonitor = setupNetworkMonitoring();

// Setup global error handlers with better error categorization
window.addEventListener('error', (event) => {
  console.error('Unhandled error:', event.error);
  
  // Don't show errors for network issues when offline
  if (isOfflineError(event.error) && !navigator.onLine) {
    event.preventDefault();
    return;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;
  console.error('Unhandled promise rejection:', error);
  
  // Don't show offline errors if they're already being handled
  if (isOfflineError(error) && !navigator.onLine) {
    event.preventDefault();
    return;
  }
});

// Initialize toast for network status change notifications
let onlineToastShown = false;
let offlineToastShown = false;

// Monitor network status changes to provide user feedback
networkMonitor.addListener(() => {
  const status = networkMonitor.getStatus();
  
  // Show online toast only once
  if (status.isOnline && status.serverReachable && !onlineToastShown) {
    onlineToastShown = true;
    offlineToastShown = false;
    
    toast({
      title: "Conexão restabelecida",
      description: "Sua conexão com a internet foi restabelecida.",
    });
  } 
  // Show offline toast only once
  else if ((!status.isOnline || !status.serverReachable) && !offlineToastShown) {
    offlineToastShown = true;
    onlineToastShown = false;
    
    toast({
      title: "Sem conexão",
      description: "Você está offline. Alguns recursos podem não estar disponíveis.",
      variant: "destructive",
    });
  }
});

// Configure React Query for better caching and retries with offline support
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // Cache for 24 hours for offline support
      retry: (failureCount, error) => {
        // Don't retry if we're offline
        if (isOfflineError(error) || !navigator.onLine) {
          return false;
        }
        return failureCount < 2; // Only retry twice for other errors
      },
      refetchOnWindowFocus: false, // Prevent excessive refetches
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
