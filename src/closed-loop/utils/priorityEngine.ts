// Configurable Priority Calculation Engine for Closed-Loop Cases (Part 7)
// Objective multi-factor weighting without arbitrary scientific assumptions

import { CasePriority } from '../../types/expert';

export interface PriorityEvaluationParams {
  severity: string; // 'Critical' | 'High' | 'Moderate' | 'Low'
  aiConfidence?: number;
  cropImportance?: 'STAPLE' | 'COMMERCIAL' | 'HIGH_VALUE' | 'STANDARD';
  progressionRisk?: string;
  affectedFieldsCount?: number;
  isRepeatedInVillage?: boolean;
  isFarmerDisputed?: boolean;
  isExpertUncertain?: boolean;
  hasRegionalSignal?: boolean;
  farmerUrgencyText?: string;
}

export interface PriorityResult {
  priority: CasePriority;
  score: number;
  reasons: string[];
}

export function evaluateCasePriority(params: PriorityEvaluationParams): PriorityResult {
  let score = 25; // baseline
  const reasons: string[] = [];

  // 1. Severity weight
  if (params.severity === 'Critical') {
    score += 35;
    reasons.push('Critical visual damage severity on foliage/fruit');
  } else if (params.severity === 'High') {
    score += 22;
    reasons.push('High symptom severity');
  } else if (params.severity === 'Moderate') {
    score += 10;
  }

  // 2. Crop economic importance
  if (params.cropImportance === 'HIGH_VALUE' || params.cropImportance === 'COMMERCIAL') {
    score += 8;
    reasons.push('High-value commercial crop investment');
  }

  // 3. AI Uncertainty - low confidence AI needs human agronomist attention
  if (params.aiConfidence !== undefined && params.aiConfidence < 0.65) {
    score += 15;
    reasons.push('Low AI confidence (<65%) requires prompt human verification');
  }

  // 4. Spread & progression dynamics
  if (params.progressionRisk === 'Rapid' || params.progressionRisk === 'Aggressive') {
    score += 15;
    reasons.push('High potential for rapid canopy spread');
  }

  // 5. Cluster & Multi-field signals
  if (params.affectedFieldsCount && params.affectedFieldsCount > 1) {
    score += 12;
    reasons.push(`Multiple affected plots (${params.affectedFieldsCount} fields)`);
  }

  if (params.isRepeatedInVillage || params.hasRegionalSignal) {
    score += 15;
    reasons.push('Potential area-level cluster requires verification');
  }

  // 6. Escalation triggers: Farmer dispute or Expert uncertainty
  if (params.isFarmerDisputed) {
    score += 18;
    reasons.push('Farmer filed formal dispute / treatment inefficacy notice');
  }

  if (params.isExpertUncertain) {
    score += 12;
    reasons.push('First reviewer indicated in-field ambiguity');
  }

  // 7. Farmer text distress keywords (Hindi & English)
  if (params.farmerUrgencyText) {
    const txt = params.farmerUrgencyText.toLowerCase();
    if (
      txt.includes('urgent') ||
      txt.includes('dying') ||
      txt.includes('ruined') ||
      txt.includes('जल्दी') ||
      txt.includes('बर्बाद') ||
      txt.includes('खराब')
    ) {
      score += 12;
      reasons.push('Farmer urgency statement detected');
    }
  }

  // Thresholds
  let priority: CasePriority = 'MEDIUM';
  if (score >= 80) {
    priority = 'URGENT';
  } else if (score >= 60) {
    priority = 'HIGH';
  } else if (score <= 35) {
    priority = 'LOW';
  }

  return {
    priority,
    score: Math.min(100, score),
    reasons: reasons.length > 0 ? reasons : ['Standard agricultural support priority'],
  };
}
