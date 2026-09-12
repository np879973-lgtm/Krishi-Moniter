// Location Service for Krishi Mentor
// Supports privacy-first operational farm locations, GPS detection with fallback, and administrative Indian hierarchy

import { LocationContext, LocationSetupInput, LocationServiceError } from '../../types/location';

const STORAGE_KEY = 'krishi_mentor_farm_location_v2';
const LEGACY_STORAGE_KEY = 'krishi_mentor_farm_location';

export interface PresetLocation {
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  region: string;
}

export const PRESET_AGRICULTURAL_DISTRICTS: PresetLocation[] = [
  { district: 'Ludhiana', state: 'Punjab', latitude: 30.9010, longitude: 75.8573, region: 'North Plains' },
  { district: 'Bathinda', state: 'Punjab', latitude: 30.2110, longitude: 74.9455, region: 'North Plains' },
  { district: 'Karnal', state: 'Haryana', latitude: 29.6857, longitude: 76.9905, region: 'North Plains' },
  { district: 'Hisar', state: 'Haryana', latitude: 29.1492, longitude: 75.7217, region: 'North Plains' },
  { district: 'Meerut', state: 'Uttar Pradesh', latitude: 28.9845, longitude: 77.7064, region: 'Upper Gangetic' },
  { district: 'Varanasi', state: 'Uttar Pradesh', latitude: 25.3176, longitude: 82.9739, region: 'Eastern Plains' },
  { district: 'Indore', state: 'Madhya Pradesh', latitude: 22.7196, longitude: 75.8577, region: 'Central Malwa' },
  { district: 'Hoshangabad (Narmadapuram)', state: 'Madhya Pradesh', latitude: 22.7523, longitude: 77.7275, region: 'Narmada Valley' },
  { district: 'Nashik', state: 'Maharashtra', latitude: 19.9975, longitude: 73.7898, region: 'Western Ghats / Deccan' },
  { district: 'Nagpur', state: 'Maharashtra', latitude: 21.1458, longitude: 79.0882, region: 'Vidarbha' },
  { district: 'Kolhapur', state: 'Maharashtra', latitude: 16.7050, longitude: 74.2433, region: 'South Maharashtra' },
  { district: 'Kota', state: 'Rajasthan', latitude: 25.2138, longitude: 75.8648, region: 'Hadoti' },
  { district: 'Sri Ganganagar', state: 'Rajasthan', latitude: 29.9038, longitude: 73.8772, region: 'Canal Zone' },
  { district: 'Anand', state: 'Gujarat', latitude: 22.5645, longitude: 72.9289, region: 'Charotar' },
  { district: 'Rajkot', state: 'Gujarat', latitude: 22.3039, longitude: 70.8022, region: 'Saurashtra' },
  { district: 'Patna', state: 'Bihar', latitude: 25.5941, longitude: 85.1376, region: 'Middle Gangetic' },
  { district: 'Muzaffarpur', state: 'Bihar', latitude: 26.1209, longitude: 85.3647, region: 'North Bihar' },
  { district: 'Guntur', state: 'Andhra Pradesh', latitude: 16.3067, longitude: 80.4365, region: 'Krishna Delta' },
  { district: 'Warangal', state: 'Telangana', latitude: 17.9784, longitude: 79.5941, region: 'Telangana Plateau' },
  { district: 'Belagavi', state: 'Karnataka', latitude: 15.8497, longitude: 74.4977, region: 'North Karnataka' },
  { district: 'Shimoga (Shivamogga)', state: 'Karnataka', latitude: 13.9299, longitude: 75.5681, region: 'Malnad' },
  { district: 'Thanjavur', state: 'Tamil Nadu', latitude: 10.7870, longitude: 79.1378, region: 'Cauvery Delta' },
  { district: 'Coimbatore', state: 'Tamil Nadu', latitude: 11.0168, longitude: 76.9558, region: 'Western Zone' },
  { district: 'Bardhaman', state: 'West Bengal', latitude: 23.2324, longitude: 87.8615, region: 'Burdwan Rice Bowl' },
  { district: 'Cuttack', state: 'Odisha', latitude: 20.4625, longitude: 85.8828, region: 'Mahanadi Delta' },
];

export const DEFAULT_FARM_LOCATION: LocationContext = {
  village: 'Gill Kalan',
  district: 'Ludhiana',
  state: 'Punjab',
  country: 'India',
  latitude: 30.9010,
  longitude: 75.8573,
  displayName: 'Gill Kalan, Ludhiana, Punjab',
  isGps: false,
  privacyProtected: true,
};

/**
 * Returns human-readable location string preserving farmer privacy
 * Format: "Village, District, State" or "District, State"
 */
export function formatPrivacyLocation(location?: Partial<LocationContext> | null): string {
  if (!location) return 'Location Not Set';
  const parts: string[] = [];
  if (location.village && location.village.trim().length > 0) {
    parts.push(location.village.trim());
  }
  if (location.district && location.district.trim().length > 0) {
    parts.push(location.district.trim());
  }
  if (location.state && location.state.trim().length > 0) {
    parts.push(location.state.trim());
  }
  return parts.length > 0 ? parts.join(', ') : location.displayName || 'My Farm Location';
}

/**
 * Reads saved farm location from localStorage with legacy fallback
 */
export function getSavedFarmLocation(): LocationContext {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.state) {
        return {
          ...parsed,
          privacyProtected: true,
        };
      }
    }
  } catch (err) {
    console.warn('Could not read saved farm location:', err);
  }
  return DEFAULT_FARM_LOCATION;
}

/**
 * Saves farm location locally in browser
 */
export function saveFarmLocation(location: LocationContext): void {
  try {
    const safeLoc: LocationContext = {
      ...location,
      privacyProtected: true,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeLoc));
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(safeLoc));
  } catch (err) {
    console.warn('Could not save farm location:', err);
  }
}

/**
 * Requests browser GPS location with privacy coarsening and graceful error handling.
 * Does NOT break if permission is denied.
 */
export async function requestBrowserGeolocation(): Promise<
  { success: true; location: LocationContext } | { success: false; error: LocationServiceError }
> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve({
        success: false,
        error: {
          code: 'NOT_SUPPORTED',
          farmerMessage: 'Geolocation is not supported on this device. Please select your location manually.',
          farmerMessageHi: 'इस डिवाइस पर लोकेशन सेवा उपलब्ध नहीं है। कृपया अपना स्थान मैन्युअल रूप से चुनें।',
        },
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const rawLat = position.coords.latitude;
        const rawLng = position.coords.longitude;

        // Approximate coordinates to 3 decimal places (~100m) for farmer privacy and weather cell resolution
        const lat = Math.round(rawLat * 1000) / 1000;
        const lng = Math.round(rawLng * 1000) / 1000;

        // Identify closest agricultural preset district
        let closest = PRESET_AGRICULTURAL_DISTRICTS[0];
        let minDistance = Infinity;

        for (const preset of PRESET_AGRICULTURAL_DISTRICTS) {
          const d = Math.hypot(preset.latitude - lat, preset.longitude - lng);
          if (d < minDistance) {
            minDistance = d;
            closest = preset;
          }
        }

        const isNearPreset = minDistance < 1.2; // roughly within 120km
        const districtName = isNearPreset ? closest.district : 'Farm Location';
        const stateName = isNearPreset ? closest.state : 'India';

        const location: LocationContext = {
          latitude: lat,
          longitude: lng,
          district: districtName,
          state: stateName,
          country: 'India',
          displayName: isNearPreset
            ? `${districtName}, ${stateName} (GPS)`
            : `My Farm Location (GPS)`,
          isGps: true,
          privacyProtected: true,
        };

        saveFarmLocation(location);
        resolve({ success: true, location });
      },
      (error) => {
        let code: LocationServiceError['code'] = 'POSITION_UNAVAILABLE';
        let farmerMessage = 'We could not determine your location. You can select your farm manually.';
        let farmerMessageHi = 'हम आपके स्थान का पता नहीं लगा सके। आप अपने खेत का स्थान मैन्युअल रूप से चुन सकते हैं।';

        if (error.code === error.PERMISSION_DENIED) {
          code = 'PERMISSION_DENIED';
          farmerMessage = 'Location permission was not provided. You can select your farm manually.';
          farmerMessageHi = 'स्थान अनुमति नहीं दी गई। आप अपने खेत का स्थान मैन्युअल रूप से चुन सकते हैं।';
        } else if (error.code === error.TIMEOUT) {
          code = 'TIMEOUT';
          farmerMessage = 'Location request timed out. You can select your farm manually.';
          farmerMessageHi = 'स्थान अनुरोध का समय समाप्त हो गया। कृपया अपना स्थान मैन्युअल रूप से चुनें।';
        }

        resolve({
          success: false,
          error: {
            code,
            farmerMessage,
            farmerMessageHi,
          },
        });
      },
      {
        timeout: 10000,
        maximumAge: 600000, // 10 minutes cache
        enableHighAccuracy: false, // gentle battery consumption
      }
    );
  });
}

/**
 * Builds a LocationContext from manual form entry
 */
export function createManualLocation(input: {
  village?: string;
  district: string;
  state: string;
  country?: string;
}): LocationContext {
  // Check if district matches preset coordinates
  const match = PRESET_AGRICULTURAL_DISTRICTS.find(
    (p) => p.district.toLowerCase() === input.district.toLowerCase()
  );

  const lat = match ? match.latitude : 28.6139;
  const lng = match ? match.longitude : 77.2090;

  const village = input.village?.trim();
  const district = input.district.trim();
  const state = input.state.trim();
  const country = input.country || 'India';

  const parts = [];
  if (village) parts.push(village);
  parts.push(district);
  parts.push(state);

  return {
    village,
    district,
    state,
    country,
    latitude: lat,
    longitude: lng,
    displayName: parts.join(', '),
    isGps: false,
    privacyProtected: true,
  };
}
