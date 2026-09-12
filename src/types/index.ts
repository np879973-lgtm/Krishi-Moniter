export type Language = 'en' | 'hi';

export type ProblemType =
  | 'Disease'
  | 'Pest'
  | 'Nutrient Deficiency'
  | 'Environmental Stress'
  | 'Healthy'
  | 'Unknown';

export type OverallStatus = 'healthy' | 'problem_detected' | 'uncertain';

export type SeverityLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export type ProgressionRisk = 'Slow' | 'Moderate' | 'Rapid' | 'Aggressive';

export interface CropInfo {
  id: string;
  name: string;
  hindiName: string;
  category: 'Cereal' | 'Vegetable' | 'Cash Crop' | 'Pulse / Oilseed' | 'Other';
  icon: string; // lucide icon identifier or emoji
  popularInIndia: boolean;
  commonProblems: {
    name: string;
    type: ProblemType;
  }[];
}

export interface IPMAdvisory {
  immediateAction: string[];
  monitoring: string[];
  prevention: string[];
  biologicalCulturalControls: string[];
  chemicalControlNotice: string;
  whenToContactExpert: string;
}

export interface VisualEvidence {
  visualClues: string[];
  affectedParts: string[];
  patternsIdentified: string[];
}

export interface SecondaryCondition {
  name: string;
  hindiName?: string;
  type: ProblemType;
  confidence: number;
  notes?: string;
}

export interface PestCountingInfo {
  available: boolean;
  countable: boolean;
  count?: number | null;
  confidence?: number;
  densityEstimate?: string;
  note?: string;
}

export interface ImageQualityAssessment {
  isGoodQuality: boolean;
  qualityScore?: number; // 0 - 100
  flags?: string[];
  guidance?: string;
  guidanceTips?: string[];
}

export interface DiagnosisRiskOutlookSummary {
  overallRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'UNKNOWN';
  primaryDriver: string;
  primaryDriverHi: string;
  confidence: number;
}

export interface DiagnosisResult {
  id: string;
  timestamp: number;
  crop: string;
  cropHindi?: string;
  overallStatus?: OverallStatus;
  problemType: ProblemType;
  diagnosis: string;
  diagnosisHindi?: string;
  confidence: number; // 0.0 - 1.0 (e.g. 0.87)
  isLowConfidence: boolean;
  possibleCauses?: string[];
  secondaryConditions?: SecondaryCondition[];
  severity: SeverityLevel;
  affectedAreaEstimate: string; // e.g. "20-40%"
  progressionRisk?: ProgressionRisk;
  symptoms: string[];
  evidence?: VisualEvidence;
  pestCounting?: PestCountingInfo;
  pestCountingAvailable: boolean;
  estimatedPestCount?: number | null;
  pestDetectionConfidence?: number;
  ipmAdvisory: IPMAdvisory;
  imageUri: string;
  imageQuality?: ImageQualityAssessment;
  disclaimer: string;
  farmerNotes?: string;
  locationContext?: string;
  weatherContext?: string;
  farmId?: string;
  fieldId?: string;
  fieldName?: string;
  geoPoint?: { latitude: number; longitude: number };
  riskOutlookSummary?: DiagnosisRiskOutlookSummary;
  fieldVerificationRecommendation?: string;
  expertVerificationStatus?: 'Unverified' | 'Under Review' | 'Verified by Agronomist';
}

export * from './weather';
export * from './risk';
export * from './location';
export * from './geospatial';
export * from './field';
export * from './farm';

export interface ImageValidationResult {
  isValid: boolean;
  warningOnly?: boolean;
  errorCode?:
    | 'NO_IMAGE'
    | 'TOO_DARK'
    | 'OVEREXPOSED'
    | 'BLURRY'
    | 'LOW_RESOLUTION'
    | 'LOW_CONTRAST'
    | 'TOO_LARGE'
    | 'UNSUPPORTED'
    | 'NON_AGRICULTURAL';
  farmerMessage?: string;
  qualityScore?: number;
  guidanceTips?: string[];
}

export interface FarmerReport extends DiagnosisResult {
  notes?: string;
}

