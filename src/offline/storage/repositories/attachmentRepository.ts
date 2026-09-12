// Local Attachment Repository for Krishi Mentor (Part 8)
// Stores photos captured offline locally without losing fidelity
import { LocalAttachment, PhotoSyncState } from '../../types';
import {
  getAllItems,
  getItem,
  putItem,
  deleteItem,
} from '../offlineStorage';

const STORE = 'attachments';

export async function saveAttachment(attachment: LocalAttachment): Promise<void> {
  await putItem<LocalAttachment>(STORE, attachment);
}

export async function getAttachment(attachmentId: string): Promise<LocalAttachment | null> {
  return getItem<LocalAttachment>(STORE, attachmentId);
}

export async function updateAttachmentStatus(
  attachmentId: string,
  status: PhotoSyncState,
  remoteUrl?: string,
  error?: string
): Promise<void> {
  const item = await getAttachment(attachmentId);
  if (!item) return;

  await putItem<LocalAttachment>(STORE, {
    ...item,
    status,
    remoteUrl: remoteUrl || item.remoteUrl,
    lastError: error,
  });
}

export async function getAllAttachments(): Promise<LocalAttachment[]> {
  return getAllItems<LocalAttachment>(STORE);
}

export async function deleteAttachment(attachmentId: string): Promise<void> {
  await deleteItem(STORE, attachmentId);
}
