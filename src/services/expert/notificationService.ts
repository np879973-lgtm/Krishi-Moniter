// Notification Service for Krishi Mentor (Part 5)
// In-app notifications for both Farmers and Agronomists

import { InAppNotification, UserRole } from '../../types/expert';

const NOTIFICATIONS_STORAGE_KEY = 'krishi_mentor_notifications_v1';

export function getNotificationsForRole(role: UserRole): InAppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return [];
    const all: InAppNotification[] = JSON.parse(raw);
    return all
      .filter((n) => n.recipientRole === role)
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch (err) {
    console.error('Failed to get notifications:', err);
    return [];
  }
}

export function getUnreadNotificationCount(role: UserRole): number {
  const list = getNotificationsForRole(role);
  return list.filter((n) => !n.read).length;
}

export function markNotificationAsRead(id: string): void {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return;
    const all: InAppNotification[] = JSON.parse(raw);
    const updated = all.map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to mark notification read:', err);
  }
}

export function markAllNotificationsAsRead(role: UserRole): void {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return;
    const all: InAppNotification[] = JSON.parse(raw);
    const updated = all.map((n) => (n.recipientRole === role ? { ...n, read: true } : n));
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to mark all read:', err);
  }
}

export function createNotification(
  notification: Omit<InAppNotification, 'id' | 'timestamp' | 'read'>
): InAppNotification {
  const item: InAppNotification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    read: false,
  };

  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const all: InAppNotification[] = raw ? JSON.parse(raw) : [];
    all.push(item);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to save notification:', err);
  }

  return item;
}
