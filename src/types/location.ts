// Location Types for Krishi Mentor
// Supports privacy-first location handling, GPS, manual presets, and Indian administrative hierarchy

export interface LocationContext {
  latitude?: number;
  longitude?: number;
  village?: string;
  district?: string;
  state: string;
  country: string;
  displayName: string;
  isGps?: boolean;
  privacyProtected?: boolean;
}

export interface LocationSetupInput {
  farmName: string;
  village?: string;
  district: string;
  state: string;
  country: string;
  primaryCrop?: string;
  initialFieldName?: string;
  latitude?: number;
  longitude?: number;
  isGps?: boolean;
}

export type LocationPermissionState = 'prompt' | 'granted' | 'denied' | 'unavailable';

export interface LocationServiceError {
  code: 'PERMISSION_DENIED' | 'TIMEOUT' | 'POSITION_UNAVAILABLE' | 'NOT_SUPPORTED' | 'INVALID_COORDINATES';
  farmerMessage: string;
  farmerMessageHi: string;
}
