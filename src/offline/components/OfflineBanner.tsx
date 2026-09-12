// Offline & Network Status Banner for Krishi Mentor (Part 8)
// Farmer-friendly, dismissible, non-distracting indicator

import React, { useState, useEffect } from 'react';
import {
  WifiOff,
  Wifi,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  Database,
} from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useSyncQueue } from '../hooks/useSyncQueue';
import { Language } from '../../types';

interface OfflineBannerProps {
  language: Language;
  onOpenSyncDashboard: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  language,
  onOpenSyncDashboard,
}) => {
  const isHi = language === 'hi';
  const { state, isOnline, isOffline, isWeak, isSyncing } = useNetworkStatus(language);
  const { counts, lastSyncAt, syncNow } = useSyncQueue();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showRestoredNotice, setShowRestoredNotice] = useState(false);
  const [prevOffline, setPrevOffline] = useState(false);

  // Detect transition from offline -> online to show brief "Connection restored" notice
  useEffect(() => {
    if (isOffline) {
      setPrevOffline(true);
      setIsDismissed(false);
    } else if (prevOffline && isOnline) {
      setShowRestoredNotice(true);
      setPrevOffline(false);
      const timer = setTimeout(() => setShowRestoredNotice(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOffline, isOnline, prevOffline]);

  // Reset dismissal if status shifts to error or offline
  useEffect(() => {
    if (state === 'OFFLINE' || state === 'SYNC_ERROR') {
      setIsDismissed(false);
    }
  }, [state]);

  if (isDismissed && !isOffline && state !== 'SYNC_ERROR') {
    return null;
  }

  // Case 1: Restored notice (temporary green notification)
  if (showRestoredNotice) {
    return (
      <div className="bg-emerald-700 text-white px-4 py-2.5 shadow-sm border-b border-emerald-800 transition">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>
              {isHi ? 'इंटरनेट कनेक्शन बहाल हुआ — सिंक शुरू हो रहा है' : 'Connection restored — Syncing updates'}
            </span>
            {counts.pending > 0 && (
              <span className="bg-emerald-900/80 px-2 py-0.5 rounded text-[11px] font-bold">
                {counts.pending} {isHi ? 'अपडेट प्रतीक्षारत' : 'waiting'}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowRestoredNotice(false)}
            className="p-1 hover:bg-emerald-600 rounded text-emerald-200 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Case 2: Offline Mode (Persistent but calm amber banner)
  if (isOffline) {
    return (
      <aside
        aria-label="Offline status banner"
        className="bg-amber-800 text-amber-50 px-4 py-2.5 shadow-sm border-b border-amber-900"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="font-bold">
              {isHi ? 'ऑफलाइन मोड' : 'Offline mode'}
            </span>
            <span className="hidden sm:inline text-amber-200">
              — {isHi ? 'सहेजी गई जानकारी उपलब्ध है। नए बदलाव फोन में सुरक्षित रहेंगे।' : 'Your saved information is still available.'}
            </span>
            {counts.pending > 0 && (
              <span className="bg-amber-900/90 text-amber-200 text-[11px] font-bold px-2 py-0.5 rounded border border-amber-700">
                {counts.pending} {isHi ? 'अपडेट कतार में' : 'waiting to sync'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenSyncDashboard}
              className="px-2.5 py-1 rounded-lg bg-amber-700 hover:bg-amber-600 text-white font-semibold text-xs transition flex items-center gap-1"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isHi ? 'सिंक विवरण' : 'Offline Status'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // Case 3: Weak Network
  if (isWeak) {
    return (
      <div className="bg-stone-800 text-stone-200 px-4 py-2 border-b border-stone-700 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-amber-400" />
            <span>
              {isHi
                ? 'कमजोर नेटवर्क: कुछ सुविधाएं धीमी हो सकती हैं।'
                : 'Poor connection. Some features may be limited.'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSyncDashboard}
              className="text-amber-300 hover:text-amber-200 font-semibold underline text-xs"
            >
              {isHi ? 'स्थिति देखें' : 'Details'}
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-stone-400 hover:text-stone-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 4: Actively Syncing
  if (isSyncing) {
    return (
      <div className="bg-indigo-800 text-indigo-50 px-4 py-2 border-b border-indigo-900 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-300 shrink-0" />
            <span>
              {isHi ? 'आपके अपडेट सिंक हो रहे हैं...' : 'Syncing your updates…'}
            </span>
            {counts.pending > 0 && (
              <span className="text-indigo-200 text-xs">
                ({counts.pending} {isHi ? 'बाकी' : 'pending'})
              </span>
            )}
          </div>
          <button
            onClick={onOpenSyncDashboard}
            className="text-indigo-200 hover:text-white underline text-xs"
          >
            {isHi ? 'विवरण' : 'View'}
          </button>
        </div>
      </div>
    );
  }

  // Case 5: Sync Error
  if (state === 'SYNC_ERROR' || counts.failed > 0) {
    return (
      <div className="bg-rose-900 text-rose-50 px-4 py-2.5 border-b border-rose-950 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
            <span>
              {isHi
                ? 'कुछ अपडेट सिंक नहीं हो सके। आप पुनः प्रयास कर सकते हैं।'
                : 'Some updates could not be synchronized.'}
            </span>
            <span className="bg-rose-950 px-1.5 py-0.5 rounded text-[11px] font-bold text-rose-300">
              {counts.failed} {isHi ? 'विफल' : 'failed'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => syncNow()}
              className="px-2.5 py-1 bg-rose-700 hover:bg-rose-600 rounded text-xs font-bold text-white transition"
            >
              {isHi ? 'पुनः प्रयास करें' : 'Retry'}
            </button>
            <button
              onClick={onOpenSyncDashboard}
              className="text-rose-200 hover:text-white underline text-xs"
            >
              {isHi ? 'विवरण' : 'Details'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 6: When online with pending items
  if (counts.pending > 0) {
    return (
      <div className="bg-emerald-800 text-emerald-50 px-4 py-2 border-b border-emerald-900 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>
              {isHi
                ? `${counts.pending} अपडेट सिंक के लिए तैयार हैं`
                : `${counts.pending} update${counts.pending > 1 ? 's' : ''} waiting to sync`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => syncNow()}
              className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold rounded text-xs transition"
            >
              {isHi ? 'अभी सिंक करें' : 'Sync Now'}
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-emerald-300 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
