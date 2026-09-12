// Network Status Hook for Krishi Mentor (Part 8)
import { useState, useEffect } from 'react';
import {
  networkService,
  SimulationMode,
  getNetworkStatusMessage,
} from '../services/networkService';
import { NetworkConnectionState } from '../types';
import { Language } from '../../types';

export function useNetworkStatus(language: Language = 'en') {
  const [state, setState] = useState<NetworkConnectionState>(() => networkService.getState());
  const [simulationMode, setSimulationModeState] = useState<SimulationMode>(() =>
    networkService.getSimulationMode()
  );

  useEffect(() => {
    const unsubscribe = networkService.subscribe((newState, newMode) => {
      setState(newState);
      setSimulationModeState(newMode);
    });
    return unsubscribe;
  }, []);

  const setSimulationMode = (mode: SimulationMode) => {
    networkService.setSimulationMode(mode);
  };

  const message = getNetworkStatusMessage(state, language === 'hi' ? 'hi' : 'en');

  return {
    state,
    isOnline: state !== 'OFFLINE',
    isOffline: state === 'OFFLINE',
    isWeak: state === 'WEAK_CONNECTION',
    isSyncing: state === 'SYNCING',
    simulationMode,
    setSimulationMode,
    title: message.title,
    subtitle: message.subtitle,
  };
}
