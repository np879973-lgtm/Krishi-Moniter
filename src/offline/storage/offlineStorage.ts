// IndexedDB Durable Local Storage for Krishi Mentor (Part 8)
// Stores cases, photos, farms, reports, drafts, and the sync queue locally

const DB_NAME = 'krishi_mentor_offline_db';
const DB_VERSION = 1;

export type StoreName =
  | 'cases'
  | 'farms'
  | 'fields'
  | 'reports'
  | 'notifications'
  | 'messages'
  | 'outcomes'
  | 'syncQueue'
  | 'drafts'
  | 'attachments'
  | 'cache'
  | 'syncAudit';

const STORE_KEYS: Record<StoreName, string> = {
  cases: 'id',
  farms: 'id',
  fields: 'id',
  reports: 'id',
  notifications: 'id',
  messages: 'id',
  outcomes: 'id',
  syncQueue: 'queueId',
  drafts: 'draftId',
  attachments: 'attachmentId',
  cache: 'key',
  syncAudit: 'id',
};

// Fallback in-memory storage for environments where IndexedDB is blocked or unavailable
const memoryFallback = new Map<StoreName, Map<string, any>>();
Object.keys(STORE_KEYS).forEach((k) => memoryFallback.set(k as StoreName, new Map()));

let dbPromise: Promise<IDBDatabase> | null = null;

function isIndexedDBSupported(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
}

export function getIndexedDB(): Promise<IDBDatabase> {
  if (!isIndexedDBSupported()) {
    return Promise.reject(new Error('IndexedDB is not supported'));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        Object.entries(STORE_KEYS).forEach(([storeName, keyPath]) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath });
          }
        });
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.warn('IndexedDB failed to open, using memory fallback:', request.error);
        reject(request.error || new Error('Unknown IndexedDB error'));
      };
    } catch (err) {
      reject(err);
    }
  });

  return dbPromise;
}

export async function putItem<T>(storeName: StoreName, item: T): Promise<void> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback to in-memory
    const keyPath = STORE_KEYS[storeName];
    const key = (item as any)[keyPath];
    if (key) {
      memoryFallback.get(storeName)?.set(key, item);
    }
  }
}

export async function getItem<T>(storeName: StoreName, key: string): Promise<T | null> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as T) || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return (memoryFallback.get(storeName)?.get(key) as T) || null;
  }
}

export async function getAllItems<T>(storeName: StoreName): Promise<T[]> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as T[]) || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    const map = memoryFallback.get(storeName);
    return map ? Array.from(map.values()) : [];
  }
}

export async function deleteItem(storeName: StoreName, key: string): Promise<void> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    memoryFallback.get(storeName)?.delete(key);
  }
}

export async function countItems(storeName: StoreName): Promise<number> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return memoryFallback.get(storeName)?.size || 0;
  }
}

export async function clearStore(storeName: StoreName): Promise<void> {
  try {
    const db = await getIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    memoryFallback.get(storeName)?.clear();
  }
}

/**
 * Checks storage estimation using navigator.storage.estimate()
 */
export async function getStorageEstimate(): Promise<{
  usageBytes: number;
  quotaBytes: number;
  percentUsed: number;
}> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 1024 * 1024 * 100; // default 100MB
      const percent = quota > 0 ? (usage / quota) * 100 : 0;
      return {
        usageBytes: usage,
        quotaBytes: quota,
        percentUsed: Math.min(100, Math.round(percent * 10) / 10),
      };
    } catch {
      // Fall through
    }
  }

  return {
    usageBytes: 1024 * 1024 * 2, // Estimated 2MB
    quotaBytes: 1024 * 1024 * 100,
    percentUsed: 2,
  };
}
