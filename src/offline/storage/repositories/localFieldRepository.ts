// Local Field Repository for Krishi Mentor (Part 8)
import { Field, FieldObservation } from '../../../types/field';
import { EntitySyncStatus } from '../../types';
import {
  getAllItems,
  getItem,
  putItem,
  deleteItem,
  countItems,
} from '../offlineStorage';

const STORE = 'fields';

export interface LocalFieldRecord extends Field {
  syncStatus?: EntitySyncStatus;
  lastSyncedAt?: number;
  pendingObservations?: FieldObservation[];
}

export async function saveLocalField(field: LocalFieldRecord): Promise<void> {
  await putItem<LocalFieldRecord>(STORE, field);
}

export async function getLocalField(fieldId: string): Promise<LocalFieldRecord | null> {
  return getItem<LocalFieldRecord>(STORE, fieldId);
}

export async function getAllLocalFields(): Promise<LocalFieldRecord[]> {
  return getAllItems<LocalFieldRecord>(STORE);
}

export async function deleteLocalField(fieldId: string): Promise<void> {
  await deleteItem(STORE, fieldId);
}

export async function countLocalFields(): Promise<number> {
  return countItems(STORE);
}
