
import { useState, useCallback } from 'react';

interface CacheOptions {
  expireIn?: number; // Tempo em milissegundos para expirar o cache
  prefix?: string; // Prefixo para as chaves no localStorage
}

export function useOfflineCache<T>(options: CacheOptions = {}) {
  const { expireIn = 24 * 60 * 60 * 1000, prefix = 'app_cache_' } = options;
  const [isLoading, setIsLoading] = useState(false);

  // Salvar dados no cache
  const saveToCache = useCallback(
    (key: string, data: T) => {
      try {
        const cacheItem = {
          data,
          timestamp: Date.now(),
          expiry: Date.now() + expireIn,
        };
        localStorage.setItem(`${prefix}${key}`, JSON.stringify(cacheItem));
        return true;
      } catch (error) {
        console.error('Erro ao salvar no cache:', error);
        return false;
      }
    },
    [expireIn, prefix]
  );

  // Carregar dados do cache
  const loadFromCache = useCallback(
    <R = T>(key: string): R | null => {
      try {
        const cachedItem = localStorage.getItem(`${prefix}${key}`);
        if (!cachedItem) return null;

        const { data, expiry } = JSON.parse(cachedItem);
        
        // Verifica se o cache expirou
        if (expiry && Date.now() > expiry) {
          localStorage.removeItem(`${prefix}${key}`);
          return null;
        }
        
        return data as R;
      } catch (error) {
        console.error('Erro ao carregar do cache:', error);
        return null;
      }
    },
    [prefix]
  );

  // Remover item do cache
  const removeFromCache = useCallback(
    (key: string) => {
      try {
        localStorage.removeItem(`${prefix}${key}`);
        return true;
      } catch (error) {
        console.error('Erro ao remover do cache:', error);
        return false;
      }
    },
    [prefix]
  );

  // Limpar todo o cache com este prefixo
  const clearCache = useCallback(() => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      return false;
    }
  }, [prefix]);

  // Função para buscar dados, primeiro tentando online e caindo para o cache
  const fetchWithOfflineSupport = useCallback(
    async <R = T>(
      key: string,
      fetchFn: () => Promise<R>,
      options: { forceRefresh?: boolean } = {}
    ): Promise<R> => {
      const { forceRefresh = false } = options;
      
      setIsLoading(true);
      
      try {
        // Se estamos online e não forçando refresh, tentamos buscar novos dados
        if (navigator.onLine && !forceRefresh) {
          try {
            const data = await fetchFn();
            saveToCache(key, data as unknown as T);
            return data;
          } catch (err) {
            console.warn('Erro ao buscar dados online, tentando cache:', err);
            // Se falhar, caímos para o cache
          }
        }
        
        // Tentamos obter do cache
        const cachedData = loadFromCache<R>(key);
        if (cachedData !== null) {
          return cachedData;
        }
        
        // Se estamos offline e não há cache, tentamos novamente online
        if (!navigator.onLine) {
          throw new Error('Dispositivo está offline e não há dados em cache');
        }
        
        // Última tentativa online
        const data = await fetchFn();
        saveToCache(key, data as unknown as T);
        return data;
      } finally {
        setIsLoading(false);
      }
    },
    [loadFromCache, saveToCache]
  );

  return {
    saveToCache,
    loadFromCache,
    removeFromCache,
    clearCache,
    fetchWithOfflineSupport,
    isLoading,
  };
}
