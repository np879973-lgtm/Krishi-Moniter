import React from 'react';
import { X, Bell, CheckCircle2, MessageSquare, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { InAppNotification, UserRole } from '../../types/expert';
import {
  getNotificationsForRole,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../../services/expert/notificationService';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  language: 'en' | 'hi';
  onSelectCase: (caseId: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  language,
  onSelectCase,
}) => {
  const isHi = language === 'hi';
  const notifications = getNotificationsForRole(currentRole);

  if (!isOpen) return null;

  const handleNotificationClick = (item: InAppNotification) => {
    markNotificationAsRead(item.id);
    onClose();
    if (item.caseId) {
      onSelectCase(item.caseId);
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead(currentRole);
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {isHi ? 'सूचनाएं' : 'Notifications'}
              </h3>
              <p className="text-[11px] text-stone-400">
                {currentRole === 'EXPERT' ? 'Expert Diagnostic Alerts' : 'Farmer Advisory Updates'}
              </p>
            </div>
          </div>

          <button
            id="notifications-close-btn"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center p-8 text-stone-500 text-xs space-y-2">
              <Bell className="w-8 h-8 text-stone-300 mx-auto" />
              <p>{isHi ? 'कोई नई सूचना नहीं है' : 'No notifications yet'}</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  !item.read
                    ? 'bg-blue-50/70 border-blue-200 ring-1 ring-blue-300'
                    : 'bg-stone-50/50 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {item.type === 'EXPERT_VERIFIED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : item.type === 'INFO_REQUESTED' ? (
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                  )}
                </div>

                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-stone-900">
                      {isHi && item.titleHi ? item.titleHi : item.title}
                    </h4>
                    <span className="text-[10px] text-stone-400">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-snug">
                    {isHi && item.messageHi ? item.messageHi : item.message}
                  </p>
                  {item.caseId && (
                    <span className="text-[10px] font-mono font-bold text-blue-700 flex items-center gap-1 pt-1">
                      <span>Case {item.caseId}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="bg-stone-50 px-5 py-3 border-t border-stone-200 flex items-center justify-between text-xs">
            <button
              onClick={handleMarkAllRead}
              className="text-stone-500 hover:text-stone-800 font-semibold text-[11px]"
            >
              {isHi ? 'सभी को पढ़ा हुआ चिह्नित करें' : 'Mark all as read'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-stone-900 text-white rounded-xl font-semibold"
            >
              {isHi ? 'बंद करें' : 'Close'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
