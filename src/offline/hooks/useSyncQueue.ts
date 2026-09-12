// Sync Queue Hook for Krishi Mentor (Part 8)
import { useState, useEffect, useCallback } from 'react';
import { SyncQueueItem } from '../types';
import {
  getAllQueueItems,
  getQueueCounts,
  clearCompletedQueueItems,
  addQueueItem,
  deleteQueueItem,
} from '../storage/repositories/syncQueueRepository';
import { syncManager } from '../sync/syncManager';

export function useSyncQueue() {
  const [isSyncing, setIsSyncing] = useState<boolean>(() => syncManager.getIsSyncing());
  const [counts, setCounts] = useState({
    pending: 0,
    processing: 0,
    failed: 0,
    synced: 0,
    conflict: 0,
    total: 0,
  });
  const [items, setItems] = useState<SyncQueueItem[]>([]);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(() =>
    syncManager.getLastSyncTimestamp()
  );

  const refreshQueue = useCallback(async () => {
    try {
      const allItems = await getAllQueueItems();
      const qCounts = await getQueueCounts();
      setItems(allItems);
      setCounts(qCounts);
      setLastSyncAt(syncManager.getLastSyncTimestamp());
    } catch (err) {
      console.error('Failed to load queue items:', err);
    }
  }, []);

  useEffect(() => {
    refreshQueue();

    const unsubscribe = syncManager.subscribe((event) => {
      setIsSyncing(event.isSyncing);
      refreshQueue();
    });

    const interval = setInterval(refreshQueue, 5000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [refreshQueue]);

  const syncNow = async () => {
    const result = await syncManager.syncPendingItems();
    await refreshQueue();
    return result;
  };

  const clearCompleted = async () => {
    await clearCompletedQueueItems();
    await refreshQueue();
  };

  const deleteItem = async (queueId: string) => {
    await deleteQueueItem(queueId);
    await refreshQueue();
  };

  const createSampleItem = async (cropName = 'Wheat', operation: 'CREATE' | 'UPDATE' = 'CREATE') => {
    const id = `demo-${Date.now()}`;
    await addQueueItem({
      queueId: `queue-${id}`,
      entityType: 'CASE',
      entityId: id,
      localId: `LOCAL-DEMO-${Date.now().toString().slice(-4)}`,
      operation,
      priority: 'HIGH',
      clientRequestId: `req-${id}`,
      payload: {
        crop: cropName,
        problemDescription: `Field demo: Symptoms of rust observed on lower foliage in sector 3.`,
        severity: 'HIGH',
        demoMode: true,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      retryCount: 0,
      maxRetries: 4,
      status: 'PENDING',
    });
    await refreshQueue();
  };

  return {
    isSyncing,
    counts,
    items,
    lastSyncAt,
    syncNow,
    clearCompleted,
    deleteItem,
    createSampleItem,
    refreshQueue,
  };
}
