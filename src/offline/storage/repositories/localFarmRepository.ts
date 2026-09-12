// Local Farm Repository for Krishi Mentor (Part 8)
import { Farm } from '../../../types/farm';
import { EntitySyncStatus } from '../../types';
import {
  getAllItems,
  getItem,
  putItem,
  deleteItem,
  countItems,
} from '../offlineStorage';

const STORE = 'farms';

export interface LocalFarmRecord extends Farm {
  syncStatus?: EntitySyncStatus;
  lastSyncedAt?: number;
}

export async function saveLocalFarm(farm: LocalFarmRecord): Promise<void> {
  await putItem<LocalFarmRecord>(STORE, farm);
}

export async function getLocalFarm(farmId: string): Promise<LocalFarmRecord | null> {
  return getItem<LocalFarmRecord>(STORE, farmId);
}

export async function getAllLocalFarms(): Promise<LocalFarmRecord[]> {
  return getAllItems<LocalFarmRecord>(STORE);
}

export async function deleteLocalFarm(farmId: string): Promise<void> {
  await deleteItem(STORE, farmId);
}

export async function countLocalFarms(): Promise<number> {
  return countItems(STORE);
}
