// Reusable Offline & Sync Status Badge for Krishi Mentor (Part 8)
import React from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertTriangle, HardDrive } from 'lucide-react';
import { EntitySyncStatus } from '../types';
import { Language } from '../../types';

interface OfflineStatusBadgeProps {
  status: EntitySyncStatus | 'OFFLINE_DRAFT';
  language?: Language;
  size?: 'sm' | 'md';
}

export const OfflineStatusBadge: React.FC<OfflineStatusBadgeProps> = ({
  status,
  language = 'en',
  size = 'sm',
}) => {
  const isHi = language === 'hi';
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  switch (status) {
    case 'LOCAL_ONLY':
    case 'OFFLINE_DRAFT':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-300 ${sizeClasses}`}
        >
          <HardDrive className="w-3 h-3 text-amber-700" />
          <span>{isHi ? 'फोन में सुरक्षित' : 'Saved on phone'}</span>
        </span>
      );

    case 'PENDING_SYNC':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-bold bg-sky-100 text-sky-900 border border-sky-300 ${sizeClasses}`}
        >
          <CloudOff className="w-3 h-3 text-sky-700" />
          <span>{isHi ? 'सिंक की प्रतीक्षा' : 'Waiting to sync'}</span>
        </span>
      );

    case 'SYNCING':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 ${sizeClasses}`}
        >
          <RefreshCw className="w-3 h-3 animate-spin text-indigo-700" />
          <span>{isHi ? 'सिंक हो रहा है...' : 'Syncing…'}</span>
        </span>
      );

    case 'SYNCED':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
          <span>{isHi ? 'सत्यापित सिंक' : 'Synced'}</span>
        </span>
      );

    case 'SYNC_FAILED':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-bold bg-rose-100 text-rose-900 border border-rose-300 ${sizeClasses}`}
        >
          <AlertTriangle className="w-3 h-3 text-rose-700" />
          <span>{isHi ? 'सिंक नहीं हुआ' : 'Could not sync yet'}</span>
        </span>
      );

    case 'CONFLICT':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-bold bg-purple-100 text-purple-900 border border-purple-300 ${sizeClasses}`}
        >
          <AlertTriangle className="w-3 h-3 text-purple-700" />
          <span>{isHi ? 'पुनरीक्षण आवश्यक' : 'Needs review'}</span>
        </span>
      );

    default:
      return null;
  }
};
