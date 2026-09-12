// Network Status & Connectivity Service for Krishi Mentor (Part 8)
// Detects ONLINE, OFFLINE, WEAK_CONNECTION, SYNCING, SYNC_ERROR
// Supports manual demo simulation toggle for developer/field-testing

import { NetworkConnectionState } from '../types';

export type SimulationMode = 'AUTO' | 'FORCE_OFFLINE' | 'FORCE_WEAK' | 'FORCE_ONLINE';

type NetworkListener = (state: NetworkConnectionState, simMode: SimulationMode) => void;

class NetworkService {
  private currentState: NetworkConnectionState = 'ONLINE';
  private simulationMode: SimulationMode = 'AUTO';
  private listeners: Set<NetworkListener> = new Set();
  private pingIntervalId: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.currentState = navigator.onLine ? 'ONLINE' : 'OFFLINE';

      window.addEventListener('online', () => this.handleNativeChange());
      window.addEventListener('offline', () => this.handleNativeChange());

      // Listen for network quality changes if NetworkInformation API is supported
      const navConn = (navigator as any).connection;
      if (navConn) {
        navConn.addEventListener('change', () => this.handleNativeChange());
      }

      // Initial check
      this.handleNativeChange();
    }
  }

  public getState(): NetworkConnectionState {
    if (this.simulationMode === 'FORCE_OFFLINE') return 'OFFLINE';
    if (this.simulationMode === 'FORCE_WEAK') return 'WEAK_CONNECTION';
    if (this.simulationMode === 'FORCE_ONLINE') return 'ONLINE';
    return this.currentState;
  }

  public isOnline(): boolean {
    const state = this.getState();
    return state !== 'OFFLINE';
  }

  public isWeak(): boolean {
    return this.getState() === 'WEAK_CONNECTION';
  }

  public getSimulationMode(): SimulationMode {
    return this.simulationMode;
  }

  public setSimulationMode(mode: SimulationMode): void {
    this.simulationMode = mode;
    this.notify();
  }

  public setSyncing(isSyncing: boolean, hasError = false): void {
    if (this.simulationMode === 'FORCE_OFFLINE') return;

    if (isSyncing) {
      this.currentState = 'SYNCING';
    } else if (hasError) {
      this.currentState = 'SYNC_ERROR';
    } else {
      this.currentState = this.detectConnectionState();
    }
    this.notify();
  }

  public subscribe(listener: NetworkListener): () => void {
    this.listeners.add(listener);
    listener(this.getState(), this.simulationMode);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private handleNativeChange(): void {
    if (this.simulationMode !== 'AUTO') return;

    const newState = this.detectConnectionState();
    if (newState !== this.currentState) {
      this.currentState = newState;
      this.notify();
    }
  }

  private detectConnectionState(): NetworkConnectionState {
    if (typeof navigator === 'undefined' || !navigator.onLine) {
      return 'OFFLINE';
    }

    // Check for weak network using Network Information API
    const navConn = (navigator as any).connection;
    if (navConn) {
      if (
        navConn.effectiveType === '2g' ||
        navConn.effectiveType === 'slow-2g' ||
        navConn.rtt > 1500 ||
        (navConn.downlink && navConn.downlink < 0.4)
      ) {
        return 'WEAK_CONNECTION';
      }
    }

    return 'ONLINE';
  }

  private notify(): void {
    const state = this.getState();
    this.listeners.forEach((l) => l(state, this.simulationMode));
  }
}

export const networkService = new NetworkService();

/**
 * Returns clean farmer-friendly descriptions in EN and HI
 */
export function getNetworkStatusMessage(
  state: NetworkConnectionState,
  lang: 'en' | 'hi'
): { title: string; subtitle: string } {
  switch (state) {
    case 'OFFLINE':
      return {
        title: lang === 'hi' ? 'ऑफलाइन मोड' : 'Offline mode',
        subtitle:
          lang === 'hi'
            ? 'आप ऑफलाइन हैं। आपकी सहेजी गई जानकारी उपलब्ध है और नए बदलाव इंटरनेट आने पर सिंक होंगे।'
            : 'You are offline. Your saved information is still available and will sync when connected.',
      };
    case 'WEAK_CONNECTION':
      return {
        title: lang === 'hi' ? 'कमजोर नेटवर्क' : 'Poor connection',
        subtitle:
          lang === 'hi'
            ? 'नेटवर्क की गति धीमी है। कुछ सुविधाओं में समय लग सकता है।'
            : 'Slow network detected. Some features may take longer or be limited.',
      };
    case 'SYNCING':
      return {
        title: lang === 'hi' ? 'सिंक हो रहा है...' : 'Syncing updates…',
        subtitle:
          lang === 'hi'
            ? 'आपके सहेजे गए अपडेट सर्वर पर भेजे जा रहे हैं...'
            : 'Sending your saved updates to the agricultural server...',
      };
    case 'SYNC_ERROR':
      return {
        title: lang === 'hi' ? 'सिंक में रुकावट' : 'Sync error',
        subtitle:
          lang === 'hi'
            ? 'कुछ अपडेट सिंक नहीं हो सके। इंटरनेट ठीक होने पर पुनः प्रयास किया जाएगा।'
            : 'Some updates could not be synchronized. You can retry now.',
      };
    case 'ONLINE':
    default:
      return {
        title: lang === 'hi' ? 'कनेक्टेड' : 'Connected',
        subtitle:
          lang === 'hi'
            ? 'आप ऑनलाइन हैं। सभी लाइव सेवाएं सक्रिय हैं।'
            : 'You are online. Real-time agricultural services active.',
      };
  }
}
