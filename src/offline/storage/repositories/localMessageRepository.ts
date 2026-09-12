// Local Message & Outcome Repositories for Krishi Mentor (Part 8)
import { EntitySyncStatus } from '../../types';
import {
  getAllItems,
  getItem,
  putItem,
  deleteItem,
} from '../offlineStorage';

export interface LocalMessageRecord {
  id: string;
  caseId: string;
  senderId: string;
  senderName: string;
  senderRole: 'FARMER' | 'EXPERT' | 'EXTENSION_OFFICER';
  message: string;
  timestamp: number;
  syncStatus: EntitySyncStatus;
}

const MESSAGE_STORE = 'messages';

export async function saveLocalMessage(msg: LocalMessageRecord): Promise<void> {
  await putItem<LocalMessageRecord>(MESSAGE_STORE, msg);
}

export async function getLocalMessagesForCase(caseId: string): Promise<LocalMessageRecord[]> {
  const all = await getAllItems<LocalMessageRecord>(MESSAGE_STORE);
  return all.filter((m) => m.caseId === caseId).sort((a, b) => a.timestamp - b.timestamp);
}
