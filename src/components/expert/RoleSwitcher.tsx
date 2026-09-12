import React, { useState, useEffect } from 'react';
import { UserCheck, Sprout, Bell, ChevronDown } from 'lucide-react';
import { UserRole } from '../../types/expert';
import { getUnreadNotificationCount } from '../../services/expert/notificationService';
import { getActiveExpertProfile } from '../../services/expert/expertService';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenExpertProfile?: () => void;
  onOpenNotifications?: () => void;
  language: 'en' | 'hi';
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentRole,
  onRoleChange,
  onOpenExpertProfile,
  onOpenNotifications,
  language,
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const activeExpert = getActiveExpertProfile();

  useEffect(() => {
    const updateCount = () => {
      setUnreadCount(getUnreadNotificationCount(currentRole));
    };
    updateCount();
    const interval = setInterval(updateCount, 4000);
    return () => clearInterval(interval);
  }, [currentRole]);

  return (
    <div className="flex items-center gap-2">
      {/* Notifications bell button */}
      {onOpenNotifications && (
        <button
          id="role-switcher-notif-btn"
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
          title={language === 'hi' ? 'सूचनाएं' : 'Notifications'}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Role Switcher Pill */}
      <div className="inline-flex p-1 bg-stone-200/90 rounded-2xl border border-stone-300/80 shadow-xs">
        <button
          id="switch-to-farmer-btn"
          onClick={() => onRoleChange('FARMER')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            currentRole === 'FARMER'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-stone-700 hover:text-stone-900 hover:bg-stone-300/50'
          }`}
        >
          <Sprout className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'किसान' : 'Farmer'}</span>
        </button>

        <button
          id="switch-to-expert-btn"
          onClick={() => onRoleChange('EXPERT')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            currentRole === 'EXPERT'
              ? 'bg-blue-800 text-white shadow-xs'
              : 'text-stone-700 hover:text-stone-900 hover:bg-stone-300/50'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-amber-300" />
          <span>{language === 'hi' ? 'विशेषज्ञ' : 'Expert'}</span>
        </button>

        <button
          id="switch-to-govt-btn"
          onClick={() => onRoleChange('GOVERNMENT')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            currentRole === 'GOVERNMENT'
              ? 'bg-purple-800 text-white shadow-xs'
              : 'text-stone-700 hover:text-stone-900 hover:bg-stone-300/50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          <span>{language === 'hi' ? 'कृषि प्रसार' : 'Extension'}</span>
          <span className="text-[10px] px-1 py-0.2 rounded bg-amber-400 text-stone-950 font-black uppercase">
            Demo
          </span>
        </button>
      </div>

      {/* If Expert mode active, show profile launcher */}
      {currentRole === 'EXPERT' && onOpenExpertProfile && (
        <button
          id="open-expert-profile-badge-btn"
          onClick={onOpenExpertProfile}
          className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs text-blue-900 font-semibold transition"
          title="View Expert Profile"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="truncate max-w-[120px]">{activeExpert.name}</span>
          <ChevronDown className="w-3 h-3 text-blue-600" />
        </button>
      )}
    </div>
  );
};
