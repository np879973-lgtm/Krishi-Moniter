// Field Types for Krishi Mentor

import { LatLngTuple, AreaUnit, BighaRegion } from './geospatial';

export type FieldHealthStatus =
  | 'HEALTHY'
  | 'MONITOR'
  | 'AT_RISK'
  | 'HIGH_RISK'
  | 'UNKNOWN';

export type FieldOperationalStatus = 'ACTIVE' | 'FALLOW' | 'HARVESTED';

export interface Field {
  id: string;
  farmId: string;
  name: string;
  crop: string;
  cropHindi?: string;
  area?: number;
  areaUnit?: AreaUnit;
  bighaRegion?: BighaRegion;
  boundary?: LatLngTuple[];
  plantingDate?: string;
  status: FieldOperationalStatus;
  healthStatus: FieldHealthStatus;
  healthExplanation?: string;
  healthExplanationHi?: string;
  diseaseRisk?: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'UNKNOWN';
  pestRisk?: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'UNKNOWN';
  weatherStress?: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'UNKNOWN';
  recentDiagnosisId?: string;
  recentDiagnosisTitle?: string;
  recentDiagnosisSeverity?: string;
  recentDiagnosisConfidence?: number;
  recentDiagnosisDate?: number;
  observationsCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface FieldObservation {
  id: string;
  farmId: string;
  fieldId: string;
  fieldName: string;
  reportId?: string;
  latitude?: number;
  longitude?: number;
  timestamp: number;
  crop: string;
  cropHindi?: string;
  problemType: string;
  diagnosis: string;
  diagnosisHindi?: string;
  severity: string;
  confidence: number;
  pestCount?: number | null;
  weatherSummary?: string;
  riskOutlook?: string;
  status: FieldHealthStatus;
  notes?: string;
  imageUri?: string;
}

export type TimelineEventType =
  | 'DIAGNOSIS'
  | 'WEATHER_ALERT'
  | 'RISK_UPDATE'
  | 'CROP_ROTATION'
  | 'TREATMENT_APPLIED'
  | 'SCOUTING';

export interface FieldTimelineEvent {
  id: string;
  fieldId: string;
  timestamp: number;
  type: TimelineEventType;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  severity?: string;
  healthStatus?: FieldHealthStatus;
}
