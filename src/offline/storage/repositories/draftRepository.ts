// Offline Drafts Repository for Krishi Mentor (Part 8)
import { OfflineDraft } from '../../types';
import {
  getAllItems,
  getItem,
  putItem,
  deleteItem,
} from '../offlineStorage';

const STORE = 'drafts';

export async function saveDraft(draft: OfflineDraft): Promise<void> {
  await putItem<OfflineDraft>(STORE, {
    ...draft,
    updatedAt: Date.now(),
  });
}

export async function getDraft(draftId: string): Promise<OfflineDraft | null> {
  return getItem<OfflineDraft>(STORE, draftId);
}

export async function getAllDrafts(): Promise<OfflineDraft[]> {
  const drafts = await getAllItems<OfflineDraft>(STORE);
  return drafts.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getDraftsByType(type: OfflineDraft['draftType']): Promise<OfflineDraft[]> {
  const all = await getAllDrafts();
  return all.filter((d) => d.draftType === type);
}

export async function deleteDraft(draftId: string): Promise<void> {
  await deleteItem(STORE, draftId);
}
