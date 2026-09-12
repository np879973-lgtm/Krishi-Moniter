// Offline & Synchronization Types for Krishi Mentor (Part 8)

export type NetworkConnectionState =
  | 'ONLINE'
  | 'OFFLINE'
  | 'WEAK_CONNECTION'
  | 'SYNCING'
  | 'SYNC_ERROR';

export type EntitySyncStatus =
  | 'LOCAL_ONLY'     // Created only on device, not yet in sync queue
  | 'PENDING_SYNC'    // In queue, waiting to be sent to server
  | 'SYNCING'         // Currently in flight to server
  | 'SYNCED'          // Verified confirmed by server
  | 'SYNC_FAILED'     // Failed after retries or blocked
  | 'CONFLICT';       // Conflicting version detected

export type SyncOperationType =
  | 'CREATE'
  | 'UPDATE'
  | 'UPLOAD'
  | 'DELETE_REQUEST';

export type SyncPriority =
  | 'CRITICAL'        // Escalations, emergency outbreak alerts
  | 'HIGH'            // Case creation, outcome reports, expert responses, photos
  | 'NORMAL'          // Farm/field edits, notifications, messages
  | 'LOW';            // Background analytics, cache refreshes

export type SyncQueueItemStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SYNCED'
  | 'FAILED'
  | 'BLOCKED'
  | 'CONFLICT';

export type ConflictResolutionStrategy =
  | 'SERVER_WINS'
  | 'CLIENT_WINS'
  | 'MERGE'
  | 'MANUAL_REVIEW';

export interface SyncQueueItem {
  queueId: string;
  entityType:
    | 'CASE'
    | 'PHOTO'
    | 'FARM'
    | 'FIELD'
    | 'OUTCOME'
    | 'MESSAGE'
    | 'OBSERVATION'
    | 'REPORT'
    | 'DISPUTE';
  entityId: string;          // Target entity identifier
  localId?: string;          // Temporary local client ID (e.g. LOCAL-KM-8F4A2C)
  serverId?: string;         // Authoritative server ID once assigned (e.g. KM-2026-000456)
  operation: SyncOperationType;
  priority: SyncPriority;
  clientRequestId: string;   // Idempotency key to prevent duplicates
  payloadReference?: string; // Pointer to local attachment or record
  payload?: any;             // Serialized entity snapshot
  createdAt: number;
  updatedAt: number;
  retryCount: number;
  maxRetries: number;
  lastAttemptAt?: number;
  nextRetryAt?: number;
  status: SyncQueueItemStatus;
  errorCode?: string;
  errorMessage?: string;
  conflictDetails?: {
    serverVersion?: any;
    clientVersion?: any;
    strategyApplied?: ConflictResolutionStrategy;
    resolvedAt?: number;
  };
}

export type PhotoSyncState =
  | 'LOCAL_ONLY'
  | 'QUEUED'
  | 'UPLOADING'
  | 'UPLOADED'
  | 'SYNCED'
  | 'UPLOAD_FAILED';

export interface LocalAttachment {
  attachmentId: string;
  caseId?: string;
  fileName: string;
  mimeType: string;
  localDataUri: string;      // Original full-resolution image captured locally
  optimizedDataUri?: string; // Compressed version suitable for low-bandwidth upload
  byteSize: number;
  capturedAt: number;
  status: PhotoSyncState;
  remoteUrl?: string;        // Server URL once uploaded
  lastError?: string;
}

export interface OfflineDraft {
  draftId: string;
  id?: string;
  draftType:
    | 'DIAGNOSIS'
    | 'EXPERT_CASE'
    | 'OUTCOME'
    | 'FARMER_MESSAGE'
    | 'FIELD_OBSERVATION'
    | 'FIELD_NOTES';
  title: string;
  titleHi?: string;
  cropName?: string;
  cropId?: string;
  locationName?: string;
  location?: string;
  content?: string;           // Notes / message
  notes?: string;
  imageUri?: string;
  contextData?: any;         // Form state payload
  createdAt: number;
  updatedAt: number;
  status?: string;
}

export interface StorageUsageStats {
  usageBytes: number;
  quotaBytes: number;
  percentUsed: number;
  isNearLimit: boolean;
  itemCounts: {
    cases: number;
    photos: number;
    farms: number;
    fields: number;
    reports: number;
    drafts: number;
    queuePending: number;
    cachedWeather: number;
  };
}

export type SyncEventType =
  | 'SYNC_STARTED'
  | 'SYNC_COMPLETED'
  | 'SYNC_FAILED'
  | 'ITEM_SYNCED'
  | 'ITEM_FAILED'
  | 'CONFLICT_DETECTED'
  | 'CONFLICT_RESOLVED';

export interface SyncAuditEvent {
  id: string;
  eventType: SyncEventType;
  queueId?: string;
  entityType?: string;
  entityId?: string;
  timestamp: number;
  details: string;
  success: boolean;
}

export interface LowDataModeSettings {
  enabled: boolean;
  maxImageDimension: number; // e.g. 1024px instead of 2048px
  jpegQuality: number;        // e.g. 0.65 instead of 0.85
  skipWeatherRefresh: boolean;
  prioritizeCasesOnly: boolean;
}
