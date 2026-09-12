// Agricultural Risk Forecasting Types for Krishi Mentor

import { CurrentWeather, DailyForecast, LocationContext, AgriculturalWeatherSignal } from './weather';
import { DiagnosisResult } from './index';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'UNKNOWN';

export interface RiskFactor {
  id: string;
  name: string;
  nameHi: string;
  category: 'weather' | 'crop_susceptibility' | 'prior_diagnosis' | 'seasonal';
  detail: string;
  detailHi: string;
  isFavorableForProblem: boolean;
}

export interface RiskTimelinePoint {
  date: string;
  dayLabel: string; // "Today", "Tomorrow", "+2 Days", etc.
  dayLabelHi: string;
  diseaseRisk: RiskLevel;
  pestRisk: RiskLevel;
  weatherStress: RiskLevel;
  overallRisk: RiskLevel;
  riskScore: number; // 0-100
  dominantCondition: string;
  dominantConditionHi: string;
}

export interface AgriculturalAlert {
  id: string;
  type: 'weather' | 'disease_risk' | 'pest_risk' | 'advisory';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  titleHi: string;
  message: string;
  messageHi: string;
  whatIsHappening: string;
  whatIsHappeningHi: string;
  whyItMatters: string;
  whyItMattersHi: string;
  whatFarmerShouldDo: string[];
  whatFarmerShouldDoHi: string[];
  crop?: string;
  createdAt: number;
  expiresAt?: number;
  read?: boolean;
}

export interface SpecificProblemRisk {
  problemName: string;
  problemNameHi: string;
  problemType: 'Disease' | 'Pest' | 'Nutrient' | 'Weather Stress';
  riskLevel: RiskLevel;
  likelihoodTrend: 'increasing' | 'stable' | 'decreasing';
  summary: string;
  summaryHi: string;
  reasons: string[];
  reasonsHi: string[];
}

export interface RiskRecommendedActions {
  immediate: string[];
  immediateHi: string[];
  monitoring: string[];
  monitoringHi: string[];
  culturalBiological: string[];
  culturalBiologicalHi: string[];
  chemicalNotice: string;
  chemicalNoticeHi: string;
  kvkRecommendation: string;
  kvkRecommendationHi: string;
}

export interface RiskAssessment {
  id: string;
  timestamp: number;
  crop: string;
  cropHindi: string;
  location: LocationContext;
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100 normalized
  confidence: number; // 0 - 100%
  timeWindow: string; // "Next 48–72 hours"
  timeWindowHi: string;
  diseaseRisk: RiskLevel;
  pestRisk: RiskLevel;
  weatherStress: RiskLevel;
  diseaseRiskForecast?: SpecificProblemRisk;
  pestRiskForecast?: SpecificProblemRisk;
  riskFactors: RiskFactor[];
  explanation: string;
  explanationHi: string;
  whatToDoNow: string;
  whatToDoNowHi: string;
  recommendedActions: RiskRecommendedActions;
  weatherSnapshot: CurrentWeather;
  weatherSignals: AgriculturalWeatherSignal[];
  timeline: RiskTimelinePoint[];
  alerts: AgriculturalAlert[];
  basedOnDiagnosisId?: string;
  diagnosisTitle?: string;
  diagnosisSeverity?: string;
  isDiagnosisConnected: boolean;
}

export interface FarmerRiskHistoryItem {
  id: string;
  dateFormatted: string;
  timestamp: number;
  crop: string;
  cropHindi: string;
  locationName: string;
  diseaseRisk: RiskLevel;
  pestRisk: RiskLevel;
  weatherStress: RiskLevel;
  overallRisk: RiskLevel;
  riskScore: number;
  confidence: number;
  diagnosisTitle?: string;
  primaryAlert?: string;
  whatToDoNow: string;
  whatToDoNowHi: string;
  assessment: RiskAssessment;
}

export interface RiskEngineInput {
  cropName: string;
  cropHindi?: string;
  currentWeather: CurrentWeather;
  forecast: DailyForecast[];
  location: LocationContext;
  currentDiagnosis?: DiagnosisResult | null;
  previousReports?: DiagnosisResult[];
}
