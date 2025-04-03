
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useNetwork } from "@/contexts/NetworkContext";

interface QueueItem<T> {
  id: string;
  action: 'create' | 'update' | 'delete';
  data: T;
  timestamp: number;
  entityType: string;
}

// Hook para gerenciar fila de sincronização
export function useSyncQueue<T>() {
  const QUEUE_KEY = 'sync_queue_items';
  const { toast } = useToast();
  const { isOnline, serverReachable } = useNetwork();

  // Carregar fila do localStorage
  const loadQueue = useCallback((): QueueItem<T>[] => {
    try {
      const queue = localStorage.getItem(QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Erro ao carregar fila de sincronização:', error);
      return [];
    }
  }, []);

  // Salvar fila no localStorage
  const saveQueue = useCallback((queue: QueueItem<T>[]) => {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Erro ao salvar fila de sincronização:', error);
    }
  }, []);

  // Adicionar item à fila
  const addToQueue = useCallback(
    (entityType: string, action: 'create' | 'update' | 'delete', data: T) => {
      try {
        const queue = loadQueue();
        const newItem: QueueItem<T> = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          action,
          data,
          timestamp: Date.now(),
          entityType
        };
        
        const newQueue = [...queue, newItem];
        saveQueue(newQueue);
        
        toast({
          title: "Item adicionado para sincronização",
          description: `A mudança será sincronizada quando você estiver online.`,
        });
        
        return newItem.id;
      } catch (error) {
        console.error('Erro ao adicionar à fila de sincronização:', error);
        return null;
      }
    },
    [loadQueue, saveQueue, toast]
  );

  // Remover item da fila
  const removeFromQueue = useCallback(
    (itemId: string) => {
      try {
        const queue = loadQueue();
        const newQueue = queue.filter(item => item.id !== itemId);
        saveQueue(newQueue);
      } catch (error) {
        console.error('Erro ao remover item da fila:', error);
      }
    },
    [loadQueue, saveQueue]
  );

  // Processar item da fila com função personalizada
  const processQueueItem = useCallback(
    async (
      itemId: string,
      processFn: (item: QueueItem<T>) => Promise<boolean>
    ) => {
      try {
        const queue = loadQueue();
        const item = queue.find(i => i.id === itemId);
        
        if (!item) return false;
        
        const success = await processFn(item);
        
        if (success) {
          removeFromQueue(itemId);
        }
        
        return success;
      } catch (error) {
        console.error('Erro ao processar item da fila:', error);
        return false;
      }
    },
    [loadQueue, removeFromQueue]
  );

  // Processar toda a fila para um tipo específico
  const processQueueByType = useCallback(
    async (
      entityType: string,
      processFn: (item: QueueItem<T>) => Promise<boolean>
    ) => {
      if (!isOnline || serverReachable === false) {
        toast({
          title: "Sem conexão",
          description: "Não é possível sincronizar agora. Tente novamente quando estiver online.",
          variant: "destructive",
        });
        return { success: false, processed: 0, failed: 0 };
      }
      
      try {
        const queue = loadQueue();
        let processed = 0;
        let failed = 0;
        
        // Filtra apenas os itens do tipo especificado
        const itemsToProcess = queue.filter(item => item.entityType === entityType);
        
        for (const item of itemsToProcess) {
          try {
            const success = await processFn(item);
            if (success) {
              removeFromQueue(item.id);
              processed++;
            } else {
              failed++;
            }
          } catch {
            failed++;
          }
        }
        
        if (processed > 0) {
          toast({
            title: "Sincronização concluída",
            description: `${processed} itens sincronizados com sucesso.`,
          });
        }
        
        if (failed > 0) {
          toast({
            title: "Erros na sincronização",
            description: `${failed} itens não puderam ser sincronizados.`,
            variant: "destructive",
          });
        }
        
        return { success: failed === 0, processed, failed };
      } catch (error) {
        console.error('Erro ao processar fila:', error);
        toast({
          title: "Erro na sincronização",
          description: "Ocorreu um erro ao tentar sincronizar seus dados.",
          variant: "destructive",
        });
        return { success: false, processed: 0, failed: 0 };
      }
    },
    [isOnline, serverReachable, loadQueue, removeFromQueue, toast]
  );

  // Obter quantidade de itens na fila
  const getQueueCount = useCallback(
    (entityType?: string) => {
      const queue = loadQueue();
      if (entityType) {
        return queue.filter(item => item.entityType === entityType).length;
      }
      return queue.length;
    },
    [loadQueue]
  );

  return {
    addToQueue,
    removeFromQueue,
    processQueueItem,
    processQueueByType,
    getQueueCount,
    loadQueue,
  };
}
