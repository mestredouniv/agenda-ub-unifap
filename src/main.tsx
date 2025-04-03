
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import './styles/print.css'
import { BrowserRouter } from 'react-router-dom'
import { toast } from "@/hooks/use-toast"
import { isOfflineError } from "@/integrations/supabase/client"
import { offlineService } from '@/services/OfflineService'
import { Toaster } from '@/components/ui/toaster'

// Setup global error handlers with better error categorization
window.addEventListener('error', (event) => {
  console.error('Unhandled error:', event.error);
  
  // Don't show errors for network issues when offline
  if (isOfflineError(event.error) && !offlineService.isNetworkOnline()) {
    event.preventDefault();
    return;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;
  console.error('Unhandled promise rejection:', error);
  
  // Don't show offline errors if they're already being handled
  if (isOfflineError(error) && !offlineService.isNetworkOnline()) {
    event.preventDefault();
    return;
  }
});

// Configure React Query for better caching and retries with offline support
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // Cache for 24 hours for offline support (replaces old cacheTime)
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
        <Toaster />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
