// Location Service for Krishi Mentor
// Supports: "Use My Location" (GPS), "Select Location" (Indian Districts), "Enter Village/City"
// Respects farmer privacy: stores only locally in browser, coordinates not exposed unnecessarily

import { LocationContext } from '../../types/weather';

const STORAGE_KEY = 'krishi_mentor_farm_location';

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

export const DEFAULT_LOCATION: LocationContext = {
  district: 'Ludhiana',
  state: 'Punjab',
  country: 'India',
  latitude: 30.9010,
  longitude: 75.8573,
  displayName: 'Ludhiana, Punjab',
  isGps: false,
};

export function getSavedLocation(): LocationContext {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.state) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read saved farm location:', err);
  }
  return DEFAULT_LOCATION;
}

export function saveFarmLocation(location: LocationContext): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  } catch (err) {
    console.warn('Could not save farm location:', err);
  }
}

export function clearSavedLocation(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Could not clear farm location:', err);
  }
}

/**
 * Attempt to obtain location via browser geolocation
 * Privacy-friendly: only keeps latitude/longitude to 3 decimal places (~100m, no exact pinpoint)
 */
export async function requestBrowserGeolocation(): Promise<LocationContext> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const rawLat = position.coords.latitude;
        const rawLng = position.coords.longitude;
        // Approximate to 3 decimal places for privacy and weather cell resolution
        const lat = Math.round(rawLat * 1000) / 1000;
        const lng = Math.round(rawLng * 1000) / 1000;

        // Find nearest preset district to give a friendly Indian district name
        let closest = PRESET_AGRICULTURAL_DISTRICTS[0];
        let minDistance = Infinity;

        for (const preset of PRESET_AGRICULTURAL_DISTRICTS) {
          const d = Math.hypot(preset.latitude - lat, preset.longitude - lng);
          if (d < minDistance) {
            minDistance = d;
            closest = preset;
          }
        }

        const isNearPreset = minDistance < 1.2; // approx within 120km
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
        };

        saveFarmLocation(location);
        resolve(location);
      },
      (error) => {
        let msg = 'Unable to retrieve location';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can choose your district manually.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please choose your district manually.';
        }
        reject(new Error(msg));
      },
      {
        timeout: 10000,
        maximumAge: 600000, // 10 minutes cache
        enableHighAccuracy: false, // low battery, coarse accuracy adequate for weather
      }
    );
  });
}

export const getSavedFarmLocation = getSavedLocation;

