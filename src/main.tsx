
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import './styles/print.css'
import { BrowserRouter } from 'react-router-dom'
import { toast } from "@/hooks/use-toast"
import { isOfflineError } from "@/integrations/supabase/client"

// Setup global error handlers
window.addEventListener('error', (event) => {
  console.error('Unhandled error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;
  console.error('Unhandled promise rejection:', error);
  
  // Don't show offline errors if they're already being handled by components
  if (isOfflineError(error) && !navigator.onLine) {
    event.preventDefault();
    return;
  }
});

// Configure network status monitoring
let hasReconnected = false;
window.addEventListener('online', () => {
  if (hasReconnected) return;
  hasReconnected = true;
  
  toast({
    title: "Conexão restabelecida",
    description: "Sua conexão com a internet foi restabelecida.",
  });
  
  // Reset flag after a delay to prevent spam
  setTimeout(() => {
    hasReconnected = false;
  }, 5000);
});

// Configure React Query for better caching and retries
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: (failureCount, error) => {
        // Don't retry if we're offline
        if (isOfflineError(error) || !navigator.onLine) {
          return false;
        }
        return failureCount < 2; // Only retry twice for other errors
      },
      refetchOnWindowFocus: false, // Prevent excessive refetches
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
