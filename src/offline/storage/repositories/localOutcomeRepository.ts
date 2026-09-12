// Local Outcome Report Repository for Krishi Mentor (Part 8)
import { FarmerOutcome } from '../../../closed-loop/types';
import { EntitySyncStatus } from '../../types';
import {
  getAllItems,
  getItem,
  putItem,
  deleteItem,
} from '../offlineStorage';

const STORE = 'outcomes';

export interface LocalOutcomeRecord extends FarmerOutcome {
  syncStatus: EntitySyncStatus;
  localSavedAt: number;
}

export async function saveLocalOutcome(outcome: LocalOutcomeRecord): Promise<void> {
  await putItem<LocalOutcomeRecord>(STORE, outcome);
}

export async function getLocalOutcome(id: string): Promise<LocalOutcomeRecord | null> {
  return getItem<LocalOutcomeRecord>(STORE, id);
}

export async function getAllLocalOutcomes(): Promise<LocalOutcomeRecord[]> {
  return getAllItems<LocalOutcomeRecord>(STORE);
}
