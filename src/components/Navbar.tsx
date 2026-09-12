import React from 'react';
import { Sprout, FileText, CloudSun, BookOpen, Activity, Map, ShieldCheck, Wifi, WifiOff, CloudOff, RefreshCw } from 'lucide-react';
import { Language } from '../types';
import { UserRole } from '../types/expert';
import { translations } from '../i18n/translations';
import { RoleSwitcher } from './expert/RoleSwitcher';
import { useNetworkStatus } from '../offline/hooks/useNetworkStatus';
import { useSyncQueue } from '../offline/hooks/useSyncQueue';
import { PWAInstallButton } from '../offline/components/PWAInstallButton';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: 'home' | 'farm' | 'reports' | 'weather' | 'risk' | 'tips' | 'cases';
  onSelectTab: (tab: 'home' | 'farm' | 'reports' | 'weather' | 'risk' | 'tips' | 'cases') => void;
  savedReportsCount: number;
  onOpenExpertModal: () => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenExpertProfile: () => void;
  onOpenNotifications: () => void;
  onOpenSyncDashboard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  activeTab,
  onSelectTab,
  savedReportsCount,
  onOpenExpertModal,
  currentRole,
  onRoleChange,
  onOpenExpertProfile,
  onOpenNotifications,
  onOpenSyncDashboard,
}) => {
  const t = translations[language];
  const isHi = language === 'hi';
  const { status, statusConfig, isOffline, isWeak } = useNetworkStatus(language);
  const { pendingCount, inProgressCount, isSyncing } = useSyncQueue();

  return (
    <header className="sticky top-0 z-40 bg-emerald-800 text-white shadow-md">
      {/* Top Banner / Brand */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        <button
          id="navbar-brand-button"
          onClick={() => {
            if (currentRole === 'EXPERT') {
              onSelectTab('home');
            } else {
              onSelectTab('home');
            }
          }}
          className="flex items-center space-x-2.5 text-left focus:outline-none group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-700/80 border border-emerald-600 flex items-center justify-center text-amber-300 shadow-inner group-hover:bg-emerald-600 transition">
            <Sprout className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-1.5">
              Krishi Mentor
              <span className="text-[10px] uppercase font-semibold tracking-wider bg-emerald-900/80 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-700">
                AI + Human
              </span>
            </h1>
            <p className="text-xs text-emerald-200 font-medium">
              {language === 'hi' ? 'सत्यापित कृषि वैज्ञानिक प्रणाली' : 'Verified Agronomist Platform'}
            </p>
          </div>
        </button>

        {/* Right side controls: Role Switcher, Language Toggle, and Helpline */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Sync & Offline Status Indicator Button */}
          {onOpenSyncDashboard && (
            <button
              id="navbar-sync-dashboard-btn"
              onClick={onOpenSyncDashboard}
              title={statusConfig.description}
              className={`px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg border flex items-center gap-1.5 text-xs font-semibold transition ${
                isOffline
                  ? 'bg-rose-950/80 border-rose-500/70 text-rose-200 hover:bg-rose-900'
                  : isWeak
                  ? 'bg-amber-950/80 border-amber-500/70 text-amber-200 hover:bg-amber-900'
                  : isSyncing
                  ? 'bg-blue-950/80 border-blue-500/70 text-blue-200 hover:bg-blue-900'
                  : pendingCount > 0
                  ? 'bg-amber-950/80 border-amber-400 text-amber-200 hover:bg-amber-900'
                  : 'bg-emerald-900/90 border-emerald-700 text-emerald-100 hover:bg-emerald-700'
              }`}
            >
              {isOffline ? (
                <CloudOff className="w-3.5 h-3.5 text-rose-300 shrink-0" />
              ) : isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 text-blue-300 animate-spin shrink-0" />
              ) : isWeak ? (
                <Wifi className="w-3.5 h-3.5 text-amber-300 opacity-70 shrink-0" />
              ) : (
                <Wifi className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              )}

              <span className="hidden md:inline text-[11px]">
                {statusConfig.label}
              </span>

              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-400 text-stone-900 font-black text-[10px] rounded-full shadow-2xs">
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          <PWAInstallButton language={language} className="hidden lg:flex" />

          {/* Role Switcher Pill */}
          <RoleSwitcher
            currentRole={currentRole}
            onRoleChange={onRoleChange}
            onOpenExpertProfile={onOpenExpertProfile}
            onOpenNotifications={onOpenNotifications}
            language={language}
          />

          {/* Language Toggle Pill */}
          <div className="inline-flex rounded-lg bg-emerald-900/90 p-0.5 border border-emerald-700 shrink-0">
            <button
              id="lang-btn-en"
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition ${
                language === 'en'
                  ? 'bg-amber-400 text-stone-900 shadow-sm'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              id="lang-btn-hi"
              onClick={() => onLanguageChange('hi')}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition ${
                language === 'hi'
                  ? 'bg-amber-400 text-stone-900 shadow-sm'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              हिं
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Nav for quick actions */}
      <nav className="bg-emerald-900/95 border-t border-emerald-800/80 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-2 flex sm:space-x-2 min-w-max">
          <button
            id="nav-tab-home"
            onClick={() => onSelectTab('home')}
            className={`py-2 px-3 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'home'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-emerald-200 hover:text-white'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>{language === 'hi' ? 'होम' : 'Home'}</span>
          </button>

          <button
            id="nav-tab-farm"
            onClick={() => onSelectTab('farm')}
            className={`py-2 px-3 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'farm'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-emerald-200 hover:text-white'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>{language === 'hi' ? 'मेरा खेत' : 'My Farm'}</span>
          </button>

          {/* New My Consultations (Farmer Cases) Tab */}
          <button
            id="nav-tab-cases"
            onClick={() => onSelectTab('cases')}
            className={`py-2 px-3 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'cases'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-emerald-200 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>{language === 'hi' ? 'परामर्श (Cases)' : 'Consultations'}</span>
          </button>

          <button
            id="nav-tab-reports"
            onClick={() => onSelectTab('reports')}
            className={`py-2 px-3 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-1.5 transition relative ${
              activeTab === 'reports'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-emerald-200 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t.myReports}</span>
            {savedReportsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-400 text-stone-900 font-bold text-[10px] rounded-full">
                {savedReportsCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-weather"
            onClick={() => onSelectTab('weather')}
            className={`py-2 px-3 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'weather'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-emerald-200 hover:text-white'
            }`}
          >
            <CloudSun className="w-4 h-4" />
            <span>{t.weather}</span>
          </button>

          <button
            id="nav-tab-risk"
            onClick={() => onSelectTab('risk')}
            className={`py-2 px-3 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'risk'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-emerald-200 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{language === 'hi' ? 'जोखिम' : 'Risk'}</span>
          </button>

          <button
            id="nav-tab-tips"
            onClick={() => onSelectTab('tips')}
            className={`py-2 px-3 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'tips'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-emerald-200 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t.farmingTips}</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
