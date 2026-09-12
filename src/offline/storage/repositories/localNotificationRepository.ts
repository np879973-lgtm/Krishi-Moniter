// Local Notification Repository for Krishi Mentor (Part 8)
import { ExpertNotification } from '../../../types/expert';
import { EntitySyncStatus } from '../../types';
import {
  getAllItems,
  getItem,
  putItem,
  deleteItem,
  countItems,
} from '../offlineStorage';

const STORE = 'notifications';

export interface LocalNotificationRecord extends ExpertNotification {
  syncStatus?: EntitySyncStatus;
}

export async function saveLocalNotification(notif: LocalNotificationRecord): Promise<void> {
  await putItem<LocalNotificationRecord>(STORE, notif);
}

export async function getLocalNotification(id: string): Promise<LocalNotificationRecord | null> {
  return getItem<LocalNotificationRecord>(STORE, id);
}

export async function getAllLocalNotifications(): Promise<LocalNotificationRecord[]> {
  return getAllItems<LocalNotificationRecord>(STORE);
}

export async function deleteLocalNotification(id: string): Promise<void> {
  await deleteItem(STORE, id);
}

export async function countLocalNotifications(): Promise<number> {
  return countItems(STORE);
}
