// Synchronization Manager for Krishi Mentor (Part 8)
// Orchestrates offline queue processing, concurrency locks, idempotency, and server confirmation

import {
  SyncQueueItem,
  SyncAuditEvent,
  SyncPriority,
  EntitySyncStatus,
} from '../types';
import {
  getPendingQueueItems,
  getAllQueueItems,
  updateQueueItemStatus,
  removeQueueItem,
  addQueueItem,
} from '../storage/repositories/syncQueueRepository';
import {
  confirmCaseSynced,
  getLocalCase,
  saveLocalCase,
} from '../storage/repositories/localCaseRepository';
import {
  updateAttachmentStatus,
  getAttachment,
} from '../storage/repositories/attachmentRepository';
import { networkService } from '../services/networkService';
import { prepareItemRetry } from './retryManager';
import { resolveEntityConflict } from './conflictResolver';
import { putItem, getAllItems } from '../storage/offlineStorage';
import { generateCaseId } from '../../services/expert/caseService';
import { AgriculturalCase } from '../../types/expert';

const IDEMPOTENCY_STORAGE_KEY = 'krishi_mentor_idempotency_keys_v1';
const LAST_SYNC_KEY = 'krishi_mentor_last_successful_sync';

type SyncListener = (event: {
  isSyncing: boolean;
  syncedCount: number;
  failedCount: number;
  pendingCount: number;
  lastError?: string;
}) => void;

class SyncManager {
  private isSyncing = false;
  private listeners: Set<SyncListener> = new Set();
  private autoSyncBound = false;

  constructor() {
    this.initAutoSync();
  }

  private initAutoSync(): void {
    if (this.autoSyncBound) return;
    this.autoSyncBound = true;

    networkService.subscribe((state) => {
      if (state === 'ONLINE' || state === 'WEAK_CONNECTION') {
        // Debounce auto-sync on connection return
        setTimeout(() => {
          this.syncPendingItems().catch((err) => {
            console.error('Auto-sync execution failed:', err);
          });
        }, 1200);
      }
    });
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getIsSyncing(): boolean {
    return this.isSyncing;
  }

  public getLastSyncTimestamp(): number | null {
    try {
      const val = localStorage.getItem(LAST_SYNC_KEY);
      return val ? parseInt(val, 10) : null;
    } catch {
      return null;
    }
  }

  /**
   * Main synchronization entry point.
   * Acquired sync-lock prevents concurrent race conditions.
   */
  public async syncPendingItems(): Promise<{
    synced: number;
    failed: number;
    pending: number;
  }> {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping concurrent trigger.');
      return { synced: 0, failed: 0, pending: 0 };
    }

    if (!networkService.isOnline()) {
      console.log('Cannot sync: device is currently offline.');
      return { synced: 0, failed: 0, pending: 0 };
    }

    this.isSyncing = true;
    networkService.setSyncing(true);
    this.notify({ isSyncing: true, syncedCount: 0, failedCount: 0, pendingCount: 0 });
    await this.recordAudit('SYNC_STARTED', 'Synchronization batch started');

    let synced = 0;
    let failed = 0;

    try {
      const pendingItems = await getPendingQueueItems();

      for (const item of pendingItems) {
        // Abort if network dropped mid-sync
        if (!networkService.isOnline()) {
          console.log('Network dropped during sync, pausing queue processing.');
          break;
        }

        await updateQueueItemStatus(item.queueId, 'PROCESSING');

        try {
          // Process item through idempotent processor
          const serverResult = await this.processItem(item);

          // Mark item as SYNCED
          await updateQueueItemStatus(item.queueId, 'SYNCED', {
            serverId: serverResult.serverId,
            errorMessage: undefined,
          });

          await this.recordAudit(
            'ITEM_SYNCED',
            `Item ${item.queueId} (${item.entityType}) synced successfully.`,
            item.queueId,
            item.entityType,
            item.entityId
          );

          synced++;
        } catch (err: any) {
          failed++;
          console.error(`Sync error on item ${item.queueId}:`, err);

          const retriedItem = prepareItemRetry(item, err.message || 'Server sync error');
          await updateQueueItemStatus(item.queueId, retriedItem.status, {
            retryCount: retriedItem.retryCount,
            lastAttemptAt: retriedItem.lastAttemptAt,
            nextRetryAt: retriedItem.nextRetryAt,
            errorCode: retriedItem.errorCode,
            errorMessage: retriedItem.errorMessage,
          });

          await this.recordAudit(
            'ITEM_FAILED',
            `Item ${item.queueId} failed: ${err.message}`,
            item.queueId,
            item.entityType,
            item.entityId,
            false
          );
        }
      }

      if (synced > 0) {
        localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
      }

      await this.recordAudit(
        failed === 0 ? 'SYNC_COMPLETED' : 'SYNC_FAILED',
        `Sync finished. Synced: ${synced}, Failed: ${failed}`,
        undefined,
        undefined,
        undefined,
        failed === 0
      );
    } catch (globalErr: any) {
      console.error('Fatal sync cycle error:', globalErr);
      networkService.setSyncing(false, true);
    } finally {
      this.isSyncing = false;
      networkService.setSyncing(false, failed > 0);
      const remaining = await getPendingQueueItems();
      this.notify({
        isSyncing: false,
        syncedCount: synced,
        failedCount: failed,
        pendingCount: remaining.length,
      });
    }

    const remaining = await getPendingQueueItems();
    return { synced, failed, pending: remaining.length };
  }

  /**
   * Processes a single queue item idempotently
   */
  private async processItem(item: SyncQueueItem): Promise<{ serverId: string }> {
    // 1. Check idempotency cache
    const processedId = this.getIdempotentResult(item.clientRequestId);
    if (processedId) {
      return { serverId: processedId };
    }

    // 2. Perform operation based on entityType
    let assignedServerId = item.serverId || item.entityId;

    switch (item.entityType) {
      case 'CASE': {
        const localCase = await getLocalCase(item.entityId);
        if (!localCase) {
          throw new Error(`Local case record ${item.entityId} not found`);
        }

        // Generate authoritative server ID
        assignedServerId = generateCaseId();

        // Simulate server network latency
        await new Promise((r) => setTimeout(r, 600));

        // Confirm local record synchronization
        await confirmCaseSynced({
          localId: item.entityId,
          serverId: assignedServerId,
          serverCase: {
            farmerId: localCase.farmerId,
          },
        });

        // Mirror into main expert case storage so all views and closed-loop components update
        this.mirrorCaseToServerStorage({
          ...localCase,
          id: assignedServerId,
        });

        break;
      }

      case 'PHOTO': {
        const attachment = await getAttachment(item.entityId);
        if (!attachment) {
          throw new Error(`Attachment ${item.entityId} not found`);
        }

        await updateAttachmentStatus(item.entityId, 'UPLOADING');
        // Simulate upload delay
        await new Promise((r) => setTimeout(r, 800));

        // Generate remote URL for confirmed image
        const remoteUrl = attachment.localDataUri;
        await updateAttachmentStatus(item.entityId, 'SYNCED', remoteUrl);
        assignedServerId = item.entityId;
        break;
      }

      case 'OUTCOME': {
        // Simulate outcome sync
        await new Promise((r) => setTimeout(r, 400));
        assignedServerId = item.entityId;
        break;
      }

      case 'MESSAGE':
      case 'DISPUTE':
      case 'FIELD':
      case 'REPORT':
      default: {
        await new Promise((r) => setTimeout(r, 400));
        assignedServerId = item.entityId;
        break;
      }
    }

    // 3. Save idempotency key
    this.saveIdempotentResult(item.clientRequestId, assignedServerId);
    return { serverId: assignedServerId };
  }

  private mirrorCaseToServerStorage(caseItem: AgriculturalCase): void {
    try {
      const raw = localStorage.getItem('krishi_mentor_expert_cases_v1');
      const list: AgriculturalCase[] = raw ? JSON.parse(raw) : [];
      const filtered = list.filter((c) => c.id !== caseItem.id);
      localStorage.setItem(
        'krishi_mentor_expert_cases_v1',
        JSON.stringify([caseItem, ...filtered])
      );
    } catch (err) {
      console.error('Failed to mirror synced case into storage:', err);
    }
  }

  private getIdempotentResult(requestId: string): string | null {
    try {
      const raw = localStorage.getItem(IDEMPOTENCY_STORAGE_KEY);
      if (!raw) return null;
      const map = JSON.parse(raw);
      return map[requestId] || null;
    } catch {
      return null;
    }
  }

  private saveIdempotentResult(requestId: string, serverId: string): void {
    try {
      const raw = localStorage.getItem(IDEMPOTENCY_STORAGE_KEY);
      const map = raw ? JSON.parse(raw) : {};
      map[requestId] = serverId;
      localStorage.setItem(IDEMPOTENCY_STORAGE_KEY, JSON.stringify(map));
    } catch {
      // Ignore
    }
  }

  private async recordAudit(
    eventType: SyncAuditEvent['eventType'],
    details: string,
    queueId?: string,
    entityType?: string,
    entityId?: string,
    success = true
  ): Promise<void> {
    const event: SyncAuditEvent = {
      id: `sync-audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      eventType,
      queueId,
      entityType,
      entityId,
      timestamp: Date.now(),
      details,
      success,
    };
    await putItem('syncAudit', event);
  }

  private notify(data: {
    isSyncing: boolean;
    syncedCount: number;
    failedCount: number;
    pendingCount: number;
    lastError?: string;
  }): void {
    this.listeners.forEach((l) => l(data));
  }
}

export const syncManager = new SyncManager();
