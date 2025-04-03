
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster"

// Configuração do React Query com suporte offline
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 60 * 24, // Cache por 24 horas para suporte offline
      retry: (failureCount, error) => {
        // Não tenta novamente se estamos offline
        if (!navigator.onLine) {
          return false;
        }
        return failureCount < 2; // Apenas tenta novamente duas vezes para outros erros
      },
      refetchOnWindowFocus: false,
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
