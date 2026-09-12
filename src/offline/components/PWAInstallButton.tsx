// PWA Install Button & In-App Prompt for Krishi Mentor (Part 8)
import React, { useState, useEffect } from 'react';
import { Download, Share, X, Check } from 'lucide-react';
import { Language } from '../../types';

interface PWAInstallButtonProps {
  language: Language;
  variant?: 'banner' | 'button';
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  language,
  variant = 'button',
}) => {
  const isHi = language === 'hi';
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isAppleMobile = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isAppleMobile);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) {
      // If prompt not available, display instructions
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || dismissed) return null;

  // Don't show button if neither deferredPrompt nor iOS is available
  if (!deferredPrompt && !isIOS) return null;

  if (variant === 'button') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700/80 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          title={isHi ? 'फोन में ऐप इंस्टॉल करें' : 'Install Krishi Mentor app'}
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isHi ? 'ऐप इंस्टॉल करें' : 'Install App'}</span>
        </button>

        {/* iOS Install Instructions Modal */}
        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-stone-900">
                  {isHi ? 'iPhone / iPad में इंस्टॉल करें' : 'Install on iPhone / iPad'}
                </h4>
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-stone-600">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                    1
                  </span>
                  <span>
                    {isHi
                      ? 'Safari ब्राउज़र में नीचे शेयर बटन (Share) दबाएं'
                      : 'Tap the Share icon at the bottom of Safari'}
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                    2
                  </span>
                  <span>
                    {isHi
                      ? 'सूची में नीचे स्क्रॉल करें और "Add to Home Screen" चुनें'
                      : 'Scroll down and tap "Add to Home Screen"'}
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                    3
                  </span>
                  <span>
                    {isHi
                      ? 'ऊपर दाईं ओर "Add" दबाएं। ऐप आपकी होम स्क्रीन पर दिखाई देगा।'
                      : 'Tap "Add" in the top right corner.'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2.5 bg-emerald-700 text-white font-bold rounded-xl text-xs"
              >
                {isHi ? 'समझ गया' : 'Got it'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Variant === 'banner'
  return (
    <div className="bg-emerald-900 text-white px-4 py-2 text-xs flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Download className="w-4 h-4 text-emerald-300 shrink-0" />
        <span>
          {isHi
            ? 'कृषि मेंटर को अपने फोन पर ऑफलाइन उपयोग के लिए इंस्टॉल करें।'
            : 'Install Krishi Mentor for faster offline access.'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="px-2.5 py-1 bg-white text-emerald-950 font-bold rounded-lg text-xs"
        >
          {isHi ? 'इंस्टॉल' : 'Install'}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-emerald-300 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
