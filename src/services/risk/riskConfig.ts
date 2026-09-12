// Centralized Agricultural Risk Configuration for Krishi Mentor
// Thresholds and parameters are kept here to avoid hardcoded numbers scattered across components

import { RiskLevel } from '../../types/risk';

export interface RiskThresholdConfig {
  lowMax: number;
  moderateMax: number;
  highMax: number;
}

export const RISK_SCORE_THRESHOLDS: RiskThresholdConfig = {
  lowMax: 20, // 0 - 20: LOW
  moderateMax: 40, // 21 - 40: MODERATE
  highMax: 70, // 41 - 70: HIGH
  // 71 - 100: VERY HIGH
};

export function mapScoreToRiskLevel(score: number): RiskLevel {
  if (score < 0 || isNaN(score)) return 'UNKNOWN';
  if (score <= RISK_SCORE_THRESHOLDS.lowMax) return 'LOW';
  if (score <= RISK_SCORE_THRESHOLDS.moderateMax) return 'MODERATE';
  if (score <= RISK_SCORE_THRESHOLDS.highMax) return 'HIGH';
  return 'VERY_HIGH';
}

export const RISK_WEIGHTS = {
  // When Diagnosis is present:
  WITH_DIAGNOSIS: {
    diagnosisSeverity: 0.35,
    weatherHumidity: 0.25,
    weatherRainfall: 0.20,
    cropSusceptibility: 0.15,
    temperatureWindow: 0.05,
  },
  // When Weather-only (no image uploaded yet):
  WEATHER_ONLY: {
    weatherHumidity: 0.35,
    weatherRainfall: 0.30,
    cropSusceptibility: 0.25,
    temperatureWindow: 0.10,
  },
};
