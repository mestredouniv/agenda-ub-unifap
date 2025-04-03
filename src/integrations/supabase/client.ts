
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Credenciais do banco de dados
const SUPABASE_URL = "https://bjtipxxqabntdfynzokr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdGlweHhxYWJudGRmeW56b2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MDU3OTEsImV4cCI6MjA1NDA4MTc5MX0.xIHQY_Omf6E0qYXObN9sFF2mwVuwgAZHv0QVSCKdKqs";

// Cache local para modo offline
const localCache = new Map<string, any>();
const CACHE_KEY_PREFIX = 'supabase_cache_';

// Erro padrão para modo offline
export class OfflineError extends Error {
  constructor() {
    super('A aplicação está offline');
    this.name = 'OfflineError';
  }
}

// Função auxiliar para tentativas com backoff exponencial
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
        throw new OfflineError();
      }
      
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Se estamos offline, não precisa tentar novamente
      if (isOfflineError(error) || !navigator.onLine) {
        console.log(`Dispositivo está offline, abortando tentativas`);
        break;
      }
      
      if (attempt < maxRetries) {
        console.log(`Operação falhou, tentando novamente em ${delay}ms (tentativa ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Backoff exponencial
      }
    }
  }
  
  throw lastError;
};

// Cliente Supabase com melhor gerenciamento de cache e erros
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  global: {
    headers: { 
      'x-application-name': 'unifap-app',
    },
    // Implementa fetch personalizado para gerenciar estado offline
    fetch: (url, options = {}) => {
      const cacheKey = `${CACHE_KEY_PREFIX}${url}_${JSON.stringify(options)}`;
      
      // Se estiver offline, usa dados em cache se disponíveis
      if (!navigator.onLine) {
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          console.log('Dispositivo offline, usando dados em cache', { url });
          return Promise.resolve(new Response(cachedData, {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
        return Promise.reject(new OfflineError());
      }
      
      // Configuração de timeout para evitar solicitações lentas
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort('Tempo limite de solicitação atingido');
      }, 10000);
      
      // Implementa solicitação de rede com timeout estrito
      const fetchPromise = fetch(url, {
        ...options,
        signal: controller.signal,
      }).then(async (response) => {
        if (response.ok) {
          // Armazena em cache para uso offline
          try {
            const clonedResponse = response.clone();
            const data = await clonedResponse.text();
            localStorage.setItem(cacheKey, data);
          } catch (err) {
            console.warn('Erro ao armazenar em cache:', err);
          }
        }
        return response;
      });
      
      // Limpa timeout quando a resposta/erro ocorrer
      fetchPromise.finally(() => clearTimeout(timeoutId));
      
      return fetchPromise;
    }
  },
});

// Verifica se o servidor está acessível
export const checkServerConnection = async (): Promise<boolean> => {
  try {
    if (!navigator.onLine) {
      return false;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const { error } = await supabase
      .from('professionals')
      .select('id')
      .limit(1)
      .abortSignal(controller.signal)
      .maybeSingle();
    
    clearTimeout(timeoutId);
    return !error;
  } catch (err) {
    return false;
  }
};

// Determina se um erro é devido a estar offline
export const isOfflineError = (error: any): boolean => {
  if (!error) return false;
  
  if (!navigator.onLine) return true;
  
  return (
    error instanceof OfflineError ||
    error.message?.includes('Failed to fetch') ||
    error.message?.includes('offline') ||
    error.message?.includes('network') ||
    error.message?.includes('connection') ||
    error.name === 'AbortError' ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ETIMEDOUT'
  );
};

// Serviço para monitoramento de rede
export class NetworkMonitor {
  private static instance: NetworkMonitor;
  private listeners: Set<() => void>;
  private isOnline: boolean;
  private serverReachable: boolean | null;
  private lastCheck: number;
  private checkingPromise: Promise<boolean> | null;

  private constructor() {
    this.listeners = new Set();
    this.isOnline = navigator.onLine;
    this.serverReachable = null;
    this.lastCheck = 0;
    this.checkingPromise = null;

    // Configuração de listeners para eventos online/offline
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Verifica o estado inicial
    this.checkServerConnection();
  }

  public static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  private handleOnline(): void {
    this.isOnline = true;
    this.checkServerConnection();
  }

  private handleOffline(): void {
    this.isOnline = false;
    this.serverReachable = false;
    this.notifyListeners();
  }

  public async checkServerConnection(): Promise<boolean> {
    if (!this.isOnline) {
      this.serverReachable = false;
      this.notifyListeners();
      return false;
    }

    // Evita múltiplas verificações simultâneas
    if (this.checkingPromise) {
      return this.checkingPromise;
    }

    this.checkingPromise = checkServerConnection()
      .then(reachable => {
        this.serverReachable = reachable;
        this.lastCheck = Date.now();
        this.notifyListeners();
        this.checkingPromise = null;
        return reachable;
      })
      .catch(() => {
        this.serverReachable = false;
        this.lastCheck = Date.now();
        this.notifyListeners();
        this.checkingPromise = null;
        return false;
      });

    return this.checkingPromise;
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (err) {
        console.error('Erro em listener de status de rede:', err);
      }
    });
  }

  public getStatus(): { isOnline: boolean; serverReachable: boolean | null; lastCheck: number } {
    return {
      isOnline: this.isOnline,
      serverReachable: this.serverReachable,
      lastCheck: this.lastCheck
    };
  }

  public addListener(listener: () => void): void {
    this.listeners.add(listener);
  }

  public removeListener(listener: () => void): void {
    this.listeners.delete(listener);
  }

  // Iniciar verificação periódica
  public startPeriodicChecks(interval = 60000): void {
    setInterval(() => {
      if (this.isOnline) {
        this.checkServerConnection();
      }
    }, interval);
  }
}

export const networkMonitor = NetworkMonitor.getInstance();
networkMonitor.startPeriodicChecks();
