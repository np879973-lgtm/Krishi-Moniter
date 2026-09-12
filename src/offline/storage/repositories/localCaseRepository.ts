// Local Case Repository for Krishi Mentor (Part 8)
// Handles local-first case storage, offline case generation, and server ID mapping

import { AgriculturalCase } from '../../../types/expert';
import { EntitySyncStatus } from '../../types';
import {
  getAllItems,
  getItem,
  putItem,
  deleteItem,
  countItems,
} from '../offlineStorage';

const STORE = 'cases';

export interface LocalCaseRecord extends AgriculturalCase {
  localId?: string;
  serverId?: string;
  syncStatus: EntitySyncStatus;
  lastSyncedAt?: number;
  syncError?: string;
  isOfflineDraft?: boolean;
}

/**
 * Generates an unmistakable, structured Local Case ID: "LOCAL-KM-8F4A2C"
 */
export function generateLocalCaseId(): string {
  const chars = 'ABCDEF0123456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `LOCAL-KM-${rand}`;
}

export async function saveLocalCase(caseItem: LocalCaseRecord): Promise<void> {
  await putItem<LocalCaseRecord>(STORE, {
    ...caseItem,
    updatedAt: Date.now(),
  });
}

export async function getLocalCase(caseId: string): Promise<LocalCaseRecord | null> {
  // First try direct lookup by ID (could be localId or serverId)
  const item = await getItem<LocalCaseRecord>(STORE, caseId);
  if (item) return item;

  // Search if caseId matches localId or serverId
  const all = await getAllItems<LocalCaseRecord>(STORE);
  return all.find((c) => c.localId === caseId || c.serverId === caseId) || null;
}

export async function getAllLocalCases(): Promise<LocalCaseRecord[]> {
  return getAllItems<LocalCaseRecord>(STORE);
}

export async function deleteLocalCase(caseId: string): Promise<void> {
  await deleteItem(STORE, caseId);
}

export async function countLocalCases(): Promise<number> {
  return countItems(STORE);
}

/**
 * Updates a case once server confirms synchronization and assigns official Server ID
 */
export async function confirmCaseSynced(params: {
  localId: string;
  serverId: string;
  serverCase?: Partial<AgriculturalCase>;
}): Promise<LocalCaseRecord | null> {
  const localRecord = await getLocalCase(params.localId);
  if (!localRecord) return null;

  const updated: LocalCaseRecord = {
    ...localRecord,
    ...(params.serverCase || {}),
    id: params.serverId, // Server-assigned ID becomes primary ID
    serverId: params.serverId,
    localId: params.localId,
    syncStatus: 'SYNCED',
    lastSyncedAt: Date.now(),
    isOfflineDraft: false,
    syncError: undefined,
  };

  // If ID changed from localId to serverId, remove old record and put new
  if (params.localId !== params.serverId) {
    await deleteItem(STORE, params.localId);
  }
  await putItem(STORE, updated);
  return updated;
}
