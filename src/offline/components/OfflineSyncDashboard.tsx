// Offline & Synchronization Dashboard Modal for Krishi Mentor (Part 8)
import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  Wifi,
  WifiOff,
  Database,
  Camera,
  FileCheck,
  AlertCircle,
  HardDrive,
  Trash2,
  Sliders,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useSyncQueue } from '../hooks/useSyncQueue';
import { useOfflineStorage } from '../hooks/useOfflineStorage';
import { useOfflineDrafts } from '../hooks/useOfflineDrafts';
import { OfflineStatusBadge } from './OfflineStatusBadge';
import { Language } from '../../types';
import { SimulationMode } from '../services/networkService';

interface OfflineSyncDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSelectDraft?: (draft: any) => void;
}

export const OfflineSyncDashboard: React.FC<OfflineSyncDashboardProps> = ({
  isOpen,
  onClose,
  language,
  onSelectDraft,
}) => {
  const isHi = language === 'hi';
  const {
    state: netState,
    isOnline,
    isWeak,
    simulationMode,
    setSimulationMode,
    title: netTitle,
    subtitle: netSubtitle,
  } = useNetworkStatus(language);

  const {
    isSyncing,
    counts,
    items: queueItems,
    lastSyncAt,
    syncNow,
    clearCompleted,
    createSampleItem,
  } = useSyncQueue();

  const { stats, clearNonEssentialCache, refreshStats } = useOfflineStorage();
  const { drafts, deleteDraft } = useOfflineDrafts();

  const [activeTab, setActiveTab] = useState<'queue' | 'drafts' | 'storage' | 'simulation'>('queue');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [lowDataMode, setLowDataMode] = useState<boolean>(() => {
    return localStorage.getItem('krishi_mentor_low_data_mode') === 'true';
  });

  if (!isOpen) return null;

  const handleManualSync = async () => {
    setSyncFeedback(isHi ? 'सिंक किया जा रहा है...' : 'Syncing your updates…');
    try {
      const res = await syncNow();
      if (res.failed === 0) {
        setSyncFeedback(
          isHi
            ? `${res.synced} अपडेट सफलतापूर्वक सिंक किए गए।`
            : `${res.synced} updates synced successfully.`
        );
      } else {
        setSyncFeedback(
          isHi
            ? `${res.synced} सिंक हुए, ${res.failed} में समस्या आई। पुनः प्रयास करें।`
            : `${res.synced} synced, ${res.failed} could not sync yet.`
        );
      }
      setTimeout(() => setSyncFeedback(null), 5000);
    } catch {
      setSyncFeedback(isHi ? 'सिंक में त्रुटि हुई।' : 'Synchronization failed.');
    }
  };

  const handleToggleLowData = (val: boolean) => {
    setLowDataMode(val);
    localStorage.setItem('krishi_mentor_low_data_mode', val ? 'true' : 'false');
  };

  const formatTime = (ts: number | null) => {
    if (!ts) return isHi ? 'कभी नहीं' : 'Never';
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700/80 border border-emerald-600 flex items-center justify-center text-amber-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {isHi ? 'ऑफलाइन एवं डेटा सिंक्रोनाइज़ेशन' : 'Offline & Synchronization'}
              </h3>
              <p className="text-xs text-stone-400">
                {isHi
                  ? 'स्थानीय डेटा संग्रहण और नेटवर्क सिंक स्थिति'
                  : 'Local data resilience & network status'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Network Status Banner inside modal */}
        <div
          className={`px-6 py-3.5 flex items-center justify-between border-b ${
            !isOnline
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : isWeak
              ? 'bg-amber-50/70 border-amber-100 text-amber-900'
              : 'bg-emerald-50 border-emerald-100 text-emerald-950'
          }`}
        >
          <div className="flex items-center gap-3">
            {!isOnline ? (
              <WifiOff className="w-5 h-5 text-amber-700 shrink-0" />
            ) : isWeak ? (
              <Wifi className="w-5 h-5 text-amber-600 shrink-0" />
            ) : (
              <Wifi className="w-5 h-5 text-emerald-700 shrink-0" />
            )}
            <div>
              <span className="font-bold text-sm block">{netTitle}</span>
              <span className="text-xs opacity-90">{netSubtitle}</span>
            </div>
          </div>

          <button
            onClick={handleManualSync}
            disabled={isSyncing || !isOnline}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs ${
              isSyncing || !isOnline
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isHi ? 'अभी सिंक करें' : 'Sync Now'}</span>
          </button>
        </div>

        {/* Feedback message */}
        {syncFeedback && (
          <div className="px-6 py-2.5 bg-emerald-100 text-emerald-950 border-b border-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>{syncFeedback}</span>
          </div>
        )}

        {/* Summary Metric Strip */}
        <div className="grid grid-cols-4 border-b border-stone-200 bg-stone-50/90 text-center py-3">
          <div className="border-r border-stone-200 px-2">
            <span className="text-[11px] font-semibold text-stone-500 block uppercase tracking-wider">
              {isHi ? 'प्रतीक्षारत' : 'Pending'}
            </span>
            <span className="text-lg font-bold text-stone-800">{counts.pending}</span>
          </div>
          <div className="border-r border-stone-200 px-2">
            <span className="text-[11px] font-semibold text-stone-500 block uppercase tracking-wider">
              {isHi ? 'फोटो' : 'Photos'}
            </span>
            <span className="text-lg font-bold text-stone-800">{stats.itemCounts.photos}</span>
          </div>
          <div className="border-r border-stone-200 px-2">
            <span className="text-[11px] font-semibold text-stone-500 block uppercase tracking-wider">
              {isHi ? 'ड्राफ्ट' : 'Drafts'}
            </span>
            <span className="text-lg font-bold text-stone-800">{drafts.length}</span>
          </div>
          <div className="px-2">
            <span className="text-[11px] font-semibold text-stone-500 block uppercase tracking-wider">
              {isHi ? 'विफल' : 'Failed'}
            </span>
            <span className={`text-lg font-bold ${counts.failed > 0 ? 'text-rose-600' : 'text-stone-800'}`}>
              {counts.failed}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 px-6 bg-white">
          <button
            onClick={() => setActiveTab('queue')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
              activeTab === 'queue'
                ? 'border-emerald-700 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {isHi ? 'सिंक कतार (Queue)' : 'Sync Queue'} ({counts.total})
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
              activeTab === 'drafts'
                ? 'border-emerald-700 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {isHi ? 'सहेजे गए ड्राफ्ट' : 'Offline Drafts'} ({drafts.length})
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
              activeTab === 'storage'
                ? 'border-emerald-700 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {isHi ? 'स्टोरेज प्रबंधन' : 'Storage'}
          </button>
          <button
            onClick={() => setActiveTab('simulation')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
              activeTab === 'simulation'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {isHi ? 'डेमो नेटवर्क' : 'Network Demo'}
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 max-h-[380px] overflow-y-auto space-y-4">
          {/* TAB 1: SYNC QUEUE */}
          {activeTab === 'queue' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>
                  {isHi ? 'अंतिम सफल सिंक:' : 'Last successful sync:'}{' '}
                  <strong className="text-stone-800">{formatTime(lastSyncAt)}</strong>
                </span>
                {counts.synced > 0 && (
                  <button
                    onClick={clearCompleted}
                    className="text-emerald-700 hover:underline font-semibold"
                  >
                    {isHi ? 'पूर्ण किए गए हटाएं' : 'Clear synced'}
                  </button>
                )}
              </div>

              {queueItems.length === 0 ? (
                <div className="text-center py-10 bg-stone-50 rounded-2xl border border-stone-200">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-80" />
                  <p className="font-bold text-stone-800 text-sm">
                    {isHi ? 'सभी अपडेट सिंक हैं!' : 'All updates are synced!'}
                  </p>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    {isHi
                      ? 'कोई भी लंबित केस या फोटो कतार में नहीं है। नई प्रविष्टियां स्वतः कतारबद्ध होंगी।'
                      : 'No pending cases or photos in queue. New actions will queue automatically.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {queueItems.map((item) => (
                    <div
                      key={item.queueId}
                      className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-800 truncate">
                            {item.entityType}: {item.entityId}
                          </span>
                          <span className="px-1.5 py-0.5 bg-stone-200 text-stone-700 rounded text-[10px] font-semibold">
                            {item.priority}
                          </span>
                        </div>
                        <p className="text-stone-500 text-[11px]">
                          {isHi ? 'बनाया गया:' : 'Created:'} {new Date(item.createdAt).toLocaleTimeString()}
                          {item.retryCount > 0 && ` • Retries: ${item.retryCount}`}
                        </p>
                        {item.errorMessage && (
                          <p className="text-rose-600 text-[11px] font-medium">
                            {item.errorMessage}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        <OfflineStatusBadge
                          status={
                            item.status === 'PENDING'
                              ? 'PENDING_SYNC'
                              : item.status === 'PROCESSING'
                              ? 'SYNCING'
                              : item.status === 'FAILED'
                              ? 'SYNC_FAILED'
                              : 'SYNCED'
                          }
                          language={language}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OFFLINE DRAFTS */}
          {activeTab === 'drafts' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-600">
                {isHi
                  ? 'ऑफलाइन रहते समय तैयार किए गए ड्राफ्ट। इंटरनेट आने पर इन्हें जारी रखें या सबमिट करें।'
                  : 'Drafts created locally. Continue editing or submit when internet returns.'}
              </p>

              {drafts.length === 0 ? (
                <div className="text-center py-10 bg-stone-50 rounded-2xl border border-stone-200">
                  <p className="text-stone-500 text-xs font-medium">
                    {isHi ? 'कोई ऑफलाइन ड्राफ्ट नहीं है।' : 'No offline drafts currently saved.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {drafts.map((d) => (
                    <div
                      key={d.draftId}
                      className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                            {d.title}
                          </span>
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md text-[10px] font-bold">
                            {d.draftType}
                          </span>
                        </div>
                        <p className="text-stone-600 text-xs line-clamp-1">
                          {d.content || (isHi ? 'फोटो सहेजी गई' : 'Photo draft saved')}
                        </p>
                        <p className="text-stone-400 text-[10px] mt-1">
                          {new Date(d.updatedAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {onSelectDraft && (
                          <button
                            onClick={() => {
                              onSelectDraft(d);
                              onClose();
                            }}
                            className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold"
                          >
                            {isHi ? 'जारी रखें' : 'Continue'}
                          </button>
                        )}
                        <button
                          onClick={() => deleteDraft(d.draftId)}
                          className="p-1.5 hover:bg-stone-200 rounded-xl text-stone-500 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STORAGE MANAGEMENT */}
          {activeTab === 'storage' && (
            <div className="space-y-4">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-emerald-700" />
                    {isHi ? 'स्थानीय IndexedDB संग्रहण उपयोग' : 'Device Storage Usage'}
                  </span>
                  <span className="font-semibold text-stone-600">
                    {(stats.usageBytes / (1024 * 1024)).toFixed(2)} MB / {(stats.quotaBytes / (1024 * 1024)).toFixed(0)} MB ({stats.percentUsed}%)
                  </span>
                </div>

                <div className="w-full bg-stone-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      stats.isNearLimit ? 'bg-rose-600' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.max(4, stats.percentUsed)}%` }}
                  />
                </div>

                {stats.isNearLimit && (
                  <p className="text-xs font-bold text-rose-700 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {isHi ? 'फोन का स्टोरेज भर रहा है।' : 'Phone storage is almost full.'}
                  </p>
                )}
              </div>

              {/* Low Data Mode Setting */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-stone-900 text-xs sm:text-sm block">
                    {isHi ? 'कम डेटा मोड (Low Data Mode)' : 'Low Data Mode'}
                  </span>
                  <span className="text-xs text-stone-500">
                    {isHi
                      ? 'तस्वीरों को अधिक कंप्रेस करता है और केवल महत्वपूर्ण केस सिंक करता है।'
                      : 'Compresses photos higher and prioritizes emergency cases on 2G/3G.'}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleLowData(!lowDataMode)}
                  className={`w-12 h-6 rounded-full transition p-1 flex items-center ${
                    lowDataMode ? 'bg-emerald-700 justify-end' : 'bg-stone-300 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </button>
              </div>

              {/* Safe Cache Cleanup Button */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-stone-900 text-xs sm:text-sm block">
                    {isHi ? 'अनावश्यक कैशे हटाएं' : 'Safe Cache Cleanup'}
                  </span>
                  <span className="text-xs text-stone-500">
                    {isHi
                      ? 'पुराने मौसम कैशे और ऑडिट लॉग हटाता है। आपके अनसिंक केस सुरक्षित रहेंगे।'
                      : 'Clears stale weather cache and audit logs. Unsynced farmer data is NEVER deleted.'}
                  </span>
                </div>
                <button
                  onClick={clearNonEssentialCache}
                  className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isHi ? 'साफ करें' : 'Clean'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: SIMULATION CONTROLS */}
          {activeTab === 'simulation' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 text-xs space-y-1">
                <span className="font-bold block text-sm">
                  {isHi ? 'नेटवर्क सिमुलेशन (डेमो एवं परीक्षण)' : 'Network Simulation (Field Demo)'}
                </span>
                <p>
                  {isHi
                    ? 'कृषि क्षेत्रों में इंटरनेट की कमी का परीक्षण करने के लिए नेटवर्क स्थिति को बदलें:'
                    : 'Switch network behavior to demonstrate offline case queueing and auto-sync recovery:'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs font-bold">
                <button
                  onClick={() => setSimulationMode('AUTO')}
                  className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                    simulationMode === 'AUTO'
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                      : 'bg-stone-50 text-stone-800 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <span>1. Auto (Live Browser)</span>
                  {simulationMode === 'AUTO' && <CheckCircle2 className="w-4 h-4 text-amber-300" />}
                </button>

                <button
                  onClick={() => setSimulationMode('FORCE_OFFLINE')}
                  className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                    simulationMode === 'FORCE_OFFLINE'
                      ? 'bg-amber-800 text-white border-amber-900 shadow-sm'
                      : 'bg-stone-50 text-stone-800 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <span>2. Force Offline</span>
                  {simulationMode === 'FORCE_OFFLINE' && <CheckCircle2 className="w-4 h-4 text-amber-300" />}
                </button>

                <button
                  onClick={() => setSimulationMode('FORCE_WEAK')}
                  className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                    simulationMode === 'FORCE_WEAK'
                      ? 'bg-stone-800 text-white border-stone-900 shadow-sm'
                      : 'bg-stone-50 text-stone-800 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <span>3. Force Weak Network</span>
                  {simulationMode === 'FORCE_WEAK' && <CheckCircle2 className="w-4 h-4 text-amber-300" />}
                </button>

                <button
                  onClick={() => setSimulationMode('FORCE_ONLINE')}
                  className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                    simulationMode === 'FORCE_ONLINE'
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                      : 'bg-stone-50 text-stone-800 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <span>4. Force Online</span>
                  {simulationMode === 'FORCE_ONLINE' && <CheckCircle2 className="w-4 h-4 text-amber-300" />}
                </button>
              </div>

              {/* Guided Offline Demo Walkthrough */}
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-stone-50 border-2 border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="font-black text-xs uppercase tracking-wider text-emerald-900">
                    {isHi ? 'ऑफलाइन डेमो परिदृश्य (Live Scenario Test)' : 'Offline Demo Scenario Workflow'}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {isHi
                    ? 'खेत में नेटवर्क न होने पर केस को फोन में सुरक्षित रखने और नेटवर्क वापस आने पर स्वतः सर्वर पुष्टि का सीधा परीक्षण करें:'
                    : 'Experience how the application guarantees zero data loss in disconnected fields and syncs automatically with server confirmation:'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    id="demo-step-go-offline-btn"
                    onClick={async () => {
                      setSimulationMode('FORCE_OFFLINE');
                      await createSampleItem('Cotton (Pink Bollworm Alert)');
                      setActiveTab('queue');
                      setSyncFeedback(
                        isHi
                          ? 'ऑफलाइन मोड सक्रिय: कपास का केस स्थानीय कतार में जोड़ा गया।'
                          : 'Offline mode active: Sample crop case enqueued locally (Waiting to Sync).'
                      );
                      setTimeout(() => setSyncFeedback(null), 5000);
                    }}
                    className="p-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                  >
                    <CloudOff className="w-4 h-4 text-amber-200" />
                    <span>{isHi ? 'चरण 1: ऑफलाइन जाएं और केस बनाएं' : 'Step 1: Go Offline & Queue Case'}</span>
                  </button>

                  <button
                    id="demo-step-reconnect-btn"
                    onClick={async () => {
                      setSimulationMode('FORCE_ONLINE');
                      setSyncFeedback(
                        isHi
                          ? 'इंटरनेट वापस आया! सर्वर के साथ स्वचालित सिंक प्रारंभ...'
                          : 'Internet restored! Triggering auto-sync to server...'
                      );
                      setTimeout(async () => {
                        await handleManualSync();
                      }, 500);
                    }}
                    className="p-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Wifi className="w-4 h-4 text-emerald-200" />
                    <span>{isHi ? 'चरण 2: इंटरनेट जोड़ें और सिंक करें' : 'Step 2: Restore Internet & Sync'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            {isHi ? 'डेटा फोन में सुरक्षित एनक्रिप्टेड है' : 'Data is protected in local client storage'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-xl transition"
          >
            {isHi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
