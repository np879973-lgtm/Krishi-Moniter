// Offline Storage Hook for Krishi Mentor (Part 8)
import { useState, useEffect, useCallback } from 'react';
import { StorageUsageStats } from '../types';
import {
  getStorageEstimate,
  countItems,
  clearStore,
} from '../storage/offlineStorage';

export function useOfflineStorage() {
  const [stats, setStats] = useState<StorageUsageStats>({
    usageBytes: 0,
    quotaBytes: 1024 * 1024 * 100,
    percentUsed: 0,
    isNearLimit: false,
    itemCounts: {
      cases: 0,
      photos: 0,
      farms: 0,
      fields: 0,
      reports: 0,
      drafts: 0,
      queuePending: 0,
      cachedWeather: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshStats = useCallback(async () => {
    try {
      const estimate = await getStorageEstimate();
      const [cases, photos, farms, fields, reports, drafts, queuePending, cachedWeather] =
        await Promise.all([
          countItems('cases'),
          countItems('attachments'),
          countItems('farms'),
          countItems('fields'),
          countItems('reports'),
          countItems('drafts'),
          countItems('syncQueue'),
          countItems('cache'),
        ]);

      setStats({
        usageBytes: estimate.usageBytes,
        quotaBytes: estimate.quotaBytes,
        percentUsed: estimate.percentUsed,
        isNearLimit: estimate.percentUsed > 80,
        itemCounts: {
          cases,
          photos,
          farms,
          fields,
          reports,
          drafts,
          queuePending,
          cachedWeather,
        },
      });
    } catch (err) {
      console.error('Failed to compute storage stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const clearNonEssentialCache = async () => {
    // Clear cached weather and temporary sync audit entries without losing unsynced farmer data!
    await clearStore('cache');
    await clearStore('syncAudit');
    await refreshStats();
  };

  return {
    stats,
    isLoading,
    refreshStats,
    clearNonEssentialCache,
  };
}
