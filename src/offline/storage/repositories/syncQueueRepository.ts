// Synchronization Queue Repository (Part 8)
// Handles queue item persistence, retrieval by status and priority, and retry scheduling

import { SyncQueueItem, SyncQueueItemStatus } from '../../types';
import {
  getAllItems,
  getItem,
  putItem,
  deleteItem,
  countItems,
} from '../offlineStorage';

const STORE = 'syncQueue';

export async function addQueueItem(item: SyncQueueItem): Promise<void> {
  await putItem<SyncQueueItem>(STORE, {
    ...item,
    updatedAt: Date.now(),
  });
}

export async function getQueueItem(queueId: string): Promise<SyncQueueItem | null> {
  return getItem<SyncQueueItem>(STORE, queueId);
}

export async function getAllQueueItems(): Promise<SyncQueueItem[]> {
  const items = await getAllItems<SyncQueueItem>(STORE);
  // Sort by priority (CRITICAL -> HIGH -> NORMAL -> LOW) then by createdAt
  const priorityOrder: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 1,
    NORMAL: 2,
    LOW: 3,
  };

  return items.sort((a, b) => {
    const pA = priorityOrder[a.priority] ?? 2;
    const pB = priorityOrder[b.priority] ?? 2;
    if (pA !== pB) return pA - pB;
    return a.createdAt - b.createdAt;
  });
}

export async function getPendingQueueItems(): Promise<SyncQueueItem[]> {
  const all = await getAllQueueItems();
  const now = Date.now();
  return all.filter(
    (item) =>
      item.status === 'PENDING' &&
      (!item.nextRetryAt || item.nextRetryAt <= now)
  );
}

export async function updateQueueItemStatus(
  queueId: string,
  status: SyncQueueItemStatus,
  updates?: Partial<SyncQueueItem>
): Promise<void> {
  const item = await getQueueItem(queueId);
  if (!item) return;

  await putItem<SyncQueueItem>(STORE, {
    ...item,
    ...updates,
    status,
    updatedAt: Date.now(),
  });
}

export async function removeQueueItem(queueId: string): Promise<void> {
  await deleteItem(STORE, queueId);
}

export async function getQueueCounts(): Promise<{
  pending: number;
  processing: number;
  failed: number;
  synced: number;
  conflict: number;
  total: number;
}> {
  const items = await getAllQueueItems();
  const counts = {
    pending: 0,
    processing: 0,
    failed: 0,
    synced: 0,
    conflict: 0,
    total: items.length,
  };

  items.forEach((item) => {
    if (item.status === 'PENDING') counts.pending++;
    else if (item.status === 'PROCESSING') counts.processing++;
    else if (item.status === 'FAILED') counts.failed++;
    else if (item.status === 'SYNCED') counts.synced++;
    else if (item.status === 'CONFLICT') counts.conflict++;
  });

  return counts;
}

export async function clearCompletedQueueItems(): Promise<number> {
  const items = await getAllQueueItems();
  let cleared = 0;
  for (const item of items) {
    if (item.status === 'SYNCED') {
      await deleteItem(STORE, item.queueId);
      cleared++;
    }
  }
  return cleared;
}
