// Geospatial & Map Types for Krishi Mentor

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export type LatLngTuple = [number, number]; // [latitude, longitude]

export type AreaUnit = 'acre' | 'hectare' | 'bigha' | 'sqm';

export type BighaRegion =
  | 'punjab_haryana' // ~1,008 sq yards (~842.8 m², ~0.208 acres)
  | 'up_west' // Pucca Bigha ~3,025 sq yards (~2,529 m², ~0.625 acres)
  | 'up_east_bihar' // ~2,500 - 3,000 m² (~0.62 - 0.74 acres)
  | 'rajasthan' // Standard Bigha ~1,618.7 m² (~0.4 acres)
  | 'bengal' // ~1,333.3 m² (14,400 sq ft, ~0.33 acres)
  | 'assam' // ~1,337.8 m² (~0.33 acres)
  | 'central_mp'; // ~1,336 m² (~0.33 acres)

export interface BighaConversionConfig {
  region: BighaRegion;
  label: string;
  labelHi: string;
  sqMeters: number;
  acresEquivalent: number;
  description: string;
  descriptionHi: string;
}

export interface AreaCalculationResult {
  sqMeters: number;
  acres: number;
  hectares: number;
  bighas: number;
  bighaRegion: BighaRegion;
  formattedPrimary: string;
  formattedSecondary: string;
}

export type MapTileProvider = 'osm_standard' | 'satellite_hybrid' | 'topo_terrain';

export interface MapMarkerData {
  id: string;
  type: 'farm' | 'field_center' | 'observation_point';
  latitude: number;
  longitude: number;
  title: string;
  titleHi?: string;
  subtitle?: string;
  subtitleHi?: string;
  crop?: string;
  cropHindi?: string;
  status?: string;
  severity?: string;
  riskLevel?: string;
  iconType?: string;
  fieldId?: string;
  farmId?: string;
  reportId?: string;
  timestamp?: number;
}

export interface RiskZone {
  id: string;
  fieldId: string;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  driver: string;
  driverHi: string;
  boundary?: LatLngTuple[];
}

export interface AreaLevelIntelligence {
  scope: 'field' | 'farm' | 'village' | 'block' | 'district' | 'state';
  scopeName: string;
  crop: string;
  isDataSufficient: boolean;
  message: string;
  messageHi: string;
  verifiedAlertsCount: number;
  lastUpdated?: number;
}
