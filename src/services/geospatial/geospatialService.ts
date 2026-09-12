// Geospatial Calculations & Agricultural Area Conversions for Krishi Mentor
// Handles geodesic polygon area calculation, regional Indian Bigha conversions, and centroid determination

import {
  LatLngTuple,
  AreaUnit,
  BighaRegion,
  BighaConversionConfig,
  AreaCalculationResult,
} from '../../types/geospatial';

const EARTH_RADIUS_METERS = 6378137; // WGS84 equatorial radius

export const REGIONAL_BIGHA_CONFIGS: Record<BighaRegion, BighaConversionConfig> = {
  punjab_haryana: {
    region: 'punjab_haryana',
    label: 'Punjab & Haryana (1 Bigha = ~0.21 Acre)',
    labelHi: 'पंजाब व हरियाणा (1 बीघा = ~0.21 एकड़ / 1008 वर्ग गज)',
    sqMeters: 842.8,
    acresEquivalent: 0.20825,
    description: 'Traditional standard in Punjab/Haryana (approx. 4.8 Bighas per Acre, 1008 sq. yards)',
    descriptionHi: 'पंजाब व हरियाणा में प्रचलित माप (लगभग 4.8 बीघा प्रति एकड़)',
  },
  up_west: {
    region: 'up_west',
    label: 'Western UP / Delhi (Pucca Bigha = 0.625 Acre)',
    labelHi: 'पश्चिमी उत्तर प्रदेश (पक्का बीघा = 0.625 एकड़ / 3025 वर्ग गज)',
    sqMeters: 2529.3,
    acresEquivalent: 0.625,
    description: 'Pucca Bigha standard in Western UP (1.6 Bighas per Acre, 3025 sq. yards)',
    descriptionHi: 'पश्चिमी उप्र में 1 बीघा = 3025 वर्ग गज (1 एकड़ = 1.6 बीघा)',
  },
  up_east_bihar: {
    region: 'up_east_bihar',
    label: 'Eastern UP & Bihar (20 Katha = ~0.62 Acre)',
    labelHi: 'पूर्वी उत्तर प्रदेश व बिहार (20 कट्ठा = ~0.62 एकड़)',
    sqMeters: 2508.4,
    acresEquivalent: 0.62,
    description: 'Eastern Gangetic plains (20 Katha = 1 Bigha, approx 27,000 sq. ft)',
    descriptionHi: 'पूर्वी उत्तर प्रदेश व बिहार में 20 कट्ठा = 1 बीघा',
  },
  rajasthan: {
    region: 'rajasthan',
    label: 'Rajasthan (1 Bigha = 0.40 Acre)',
    labelHi: 'राजस्थान (1 बीघा = 0.40 एकड़ / 2.5 बीघा प्रति एकड़)',
    sqMeters: 1618.7,
    acresEquivalent: 0.4,
    description: 'Standard Rajasthan Revenue Bigha (2.5 Bighas per Acre, 1618.7 m²)',
    descriptionHi: 'राजस्थान राजस्व मानक (1 एकड़ = 2.5 बीघा)',
  },
  bengal: {
    region: 'bengal',
    label: 'West Bengal (1 Bigha = ~0.33 Acre)',
    labelHi: 'पश्चिम बंगाल (1 बीघा = 14,400 वर्ग फुट / ~0.33 एकड़)',
    sqMeters: 1333.33,
    acresEquivalent: 0.3306,
    description: 'Standard Bengal Bigha (14,400 sq. ft, 3 Bighas per Acre)',
    descriptionHi: 'पश्चिम बंगाल में 14,400 वर्ग फुट (3 बीघा प्रति एकड़)',
  },
  assam: {
    region: 'assam',
    label: 'Assam & NE (1 Bigha = ~0.33 Acre)',
    labelHi: 'असम व पूर्वोत्तर (1 बीघा = ~0.33 एकड़ / 5 कट्ठा)',
    sqMeters: 1337.8,
    acresEquivalent: 0.3306,
    description: 'Assam standard (5 Katha = 1 Bigha)',
    descriptionHi: 'असम में 5 कट्ठा = 1 बीघा',
  },
  central_mp: {
    region: 'central_mp',
    label: 'Madhya Pradesh (Central Malwa = ~0.33 Acre)',
    labelHi: 'मध्य प्रदेश (मालवा/मध्य क्षेत्र = ~0.33 एकड़)',
    sqMeters: 1336.0,
    acresEquivalent: 0.33,
    description: 'Central India standard Bigha (approx 3 Bighas per Acre)',
    descriptionHi: 'मध्य प्रदेश में सामान्यतः 3 बीघा प्रति एकड़',
  },
};

/**
 * Calculates the geodesic surface area of a polygon using planar tangent projection.
 * For agricultural fields (< 500 hectares), this is accurate to within 0.05% of spherical calculus.
 */
export function calculatePolygonArea(
  points: LatLngTuple[],
  bighaRegion: BighaRegion = 'punjab_haryana'
): AreaCalculationResult {
  if (!points || points.length < 3) {
    return {
      sqMeters: 0,
      acres: 0,
      hectares: 0,
      bighas: 0,
      bighaRegion,
      formattedPrimary: '0.00 Acres',
      formattedSecondary: '0.00 Bigha',
    };
  }

  // Find center point for local tangent plane projection
  let latSum = 0;
  let lngSum = 0;
  for (const [lat, lng] of points) {
    latSum += lat;
    lngSum += lng;
  }
  const lat0 = (latSum / points.length) * (Math.PI / 180);
  const lng0 = (lngSum / points.length) * (Math.PI / 180);

  // Project points to local cartesian coordinates in meters
  const cartesian: [number, number][] = points.map(([lat, lng]) => {
    const phi = lat * (Math.PI / 180);
    const lam = lng * (Math.PI / 180);
    const x = (lam - lng0) * Math.cos(lat0) * EARTH_RADIUS_METERS;
    const y = (phi - lat0) * EARTH_RADIUS_METERS;
    return [x, y];
  });

  // Shoelace formula
  let areaSum = 0;
  const n = cartesian.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    areaSum += cartesian[i][0] * cartesian[j][1];
    areaSum -= cartesian[j][0] * cartesian[i][1];
  }

  const sqMeters = Math.abs(areaSum) / 2;
  const acres = sqMeters / 4046.8564224;
  const hectares = sqMeters / 10000;

  const bighaConfig = REGIONAL_BIGHA_CONFIGS[bighaRegion] || REGIONAL_BIGHA_CONFIGS.punjab_haryana;
  const bighas = sqMeters / bighaConfig.sqMeters;

  return {
    sqMeters: Math.round(sqMeters * 10) / 10,
    acres: Math.round(acres * 100) / 100,
    hectares: Math.round(hectares * 100) / 100,
    bighas: Math.round(bighas * 100) / 100,
    bighaRegion,
    formattedPrimary: `${(Math.round(acres * 100) / 100).toFixed(2)} Acres`,
    formattedSecondary: `${(Math.round(bighas * 100) / 100).toFixed(2)} Bigha`,
  };
}

/**
 * Convert area between agricultural units
 */
export function convertArea(
  value: number,
  from: AreaUnit,
  to: AreaUnit,
  bighaRegion: BighaRegion = 'punjab_haryana'
): number {
  if (from === to || value <= 0) return value;

  const bighaConfig = REGIONAL_BIGHA_CONFIGS[bighaRegion] || REGIONAL_BIGHA_CONFIGS.punjab_haryana;

  // Convert to square meters first
  let sqMeters = 0;
  switch (from) {
    case 'sqm':
      sqMeters = value;
      break;
    case 'acre':
      sqMeters = value * 4046.8564224;
      break;
    case 'hectare':
      sqMeters = value * 10000;
      break;
    case 'bigha':
      sqMeters = value * bighaConfig.sqMeters;
      break;
  }

  // Convert from square meters to target unit
  switch (to) {
    case 'sqm':
      return Math.round(sqMeters * 10) / 10;
    case 'acre':
      return Math.round((sqMeters / 4046.8564224) * 100) / 100;
    case 'hectare':
      return Math.round((sqMeters / 10000) * 100) / 100;
    case 'bigha':
      return Math.round((sqMeters / bighaConfig.sqMeters) * 100) / 100;
  }
}

/**
 * Formats an area with unit and optional Hindi localization
 */
export function formatArea(
  area: number,
  unit: AreaUnit = 'acre',
  bighaRegion: BighaRegion = 'punjab_haryana',
  language: 'en' | 'hi' = 'en'
): string {
  if (area === undefined || area === null || isNaN(area)) return '—';

  const valStr = area.toFixed(2);
  const isHi = language === 'hi';

  switch (unit) {
    case 'acre':
      return `${valStr} ${isHi ? 'एकड़' : 'Acres'}`;
    case 'hectare':
      return `${valStr} ${isHi ? 'हेक्टेयर' : 'Hectares'}`;
    case 'bigha': {
      const label = bighaRegion === 'punjab_haryana' ? 'PB/HR' : bighaRegion === 'up_west' ? 'UP' : '';
      return `${valStr} ${isHi ? 'बीघा' : 'Bigha'}${label ? ` (${label})` : ''}`;
    }
    case 'sqm':
      return `${Math.round(area)} ${isHi ? 'वर्ग मीटर' : 'sq. m'}`;
    default:
      return `${valStr} ${unit}`;
  }
}

/**
 * Calculates geometric center (centroid) of a field boundary polygon
 */
export function calculatePolygonCentroid(points: LatLngTuple[]): LatLngTuple {
  if (!points || points.length === 0) {
    return [30.901, 75.8573]; // fallback center
  }
  if (points.length === 1) return points[0];
  if (points.length === 2) {
    return [(points[0][0] + points[1][0]) / 2, (points[0][1] + points[1][1]) / 2];
  }

  let latSum = 0;
  let lngSum = 0;
  for (const [lat, lng] of points) {
    latSum += lat;
    lngSum += lng;
  }
  return [latSum / points.length, lngSum / points.length];
}

/**
 * Calculates distance in meters between two coordinates via Haversine formula
 */
export function calculateDistanceMeters(p1: LatLngTuple, p2: LatLngTuple): number {
  const [lat1, lon1] = p1;
  const [lat2, lon2] = p2;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_METERS * c);
}

/**
 * Validates whether boundary points form a plausible agricultural field
 */
export function validateBoundary(points: LatLngTuple[]): { isValid: boolean; message?: string } {
  if (!points || points.length < 3) {
    return { isValid: false, message: 'A field boundary requires at least 3 points.' };
  }
  if (points.length > 50) {
    return { isValid: false, message: 'Too many boundary points. Keep it simplified.' };
  }

  // Check valid coordinates range for India / globe
  for (const [lat, lng] of points) {
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return { isValid: false, message: 'Invalid latitude or longitude values.' };
    }
  }

  // Check area isn't zero or absurdly huge (> 50,000 hectares for a single farm field)
  const calc = calculatePolygonArea(points);
  if (calc.sqMeters < 10) {
    return { isValid: false, message: 'Field area is too small (< 10 m²).' };
  }
  if (calc.hectares > 5000) {
    return { isValid: false, message: 'Field area exceeds realistic farm plot size (> 5,000 ha).' };
  }

  return { isValid: true };
}
