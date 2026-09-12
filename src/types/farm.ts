// Farm Model & Profile Types for Krishi Mentor

import { LocationContext } from './location';
import { Field } from './field';

export interface Farm {
  id: string;
  name: string;
  village?: string;
  district: string;
  state: string;
  country: string;
  location: LocationContext;
  fields: Field[];
  crops: string[];
  primaryCrop: string;
  primaryCropHindi?: string;
  createdAt: number;
  updatedAt: number;
  isDemo?: boolean;
  notes?: string;
}

export interface FarmProfileSummary {
  farmName: string;
  locationDisplay: string;
  village?: string;
  district: string;
  state: string;
  primaryCrop: string;
  primaryCropHindi?: string;
  fieldCount: number;
  activeCropNames: string[];
  currentOverallRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'UNKNOWN';
  weatherTemp?: number;
  isDemo?: boolean;
}

export interface FarmCreateInput {
  name: string;
  village?: string;
  district: string;
  state: string;
  country?: string;
  primaryCrop: string;
  primaryCropHindi?: string;
  initialFieldName?: string;
  initialFieldArea?: number;
  initialFieldAreaUnit?: 'acre' | 'hectare' | 'bigha' | 'sqm';
  latitude?: number;
  longitude?: number;
  isGps?: boolean;
}
