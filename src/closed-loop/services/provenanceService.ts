// Data Provenance & Learning Loop Eligibility Service (Part 7)
// Enforces full traceability ("Where did this come from?") and strict criteria for Training Candidate eligibility

import { ClosedLoopCase, ProvenanceMetadata } from '../types';

export function createInitialProvenance(params: {
  sourceId: string;
  createdBy: string;
  modelVersion?: string;
  imageUri: string;
}): ProvenanceMetadata {
  return {
    sourceType: 'FARMER',
    sourceId: params.sourceId,
    createdBy: params.createdBy,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    modelVersion: params.modelVersion || 'krishi-vision-v2.1',
    predictionVersion: 'pred-gemini-flash-1.5',
    evidenceReferences: [params.imageUri],
  };
}

/**
 * Checks whether a closed-loop case qualifies as a VERIFIED TRAINING CANDIDATE.
 * NO automatic model retraining! Only designates candidates for offline governance pipelines.
 */
export function evaluateTrainingCandidateEligibility(c: ClosedLoopCase): {
  isEligible: boolean;
  reason: string;
} {
  // 1. Consent check
  if (!c.consent?.trainingCandidate) {
    return {
      isEligible: false,
      reason: 'Farmer has not granted consent for machine learning evaluation/training.',
    };
  }

  // 2. Expert verification check (Must not be UNCERTAIN or UNVERIFIED)
  if (!c.expertAssessment || c.expertAssessment.decision === 'UNCERTAIN') {
    return {
      isEligible: false,
      reason: 'Case lacks definitive agronomist verification (Expert status is pending or uncertain).',
    };
  }

  // 3. Dispute check (Must not have unresolved dispute)
  if (c.dispute && c.dispute.status !== 'RESOLVED') {
    return {
      isEligible: false,
      reason: 'Active farmer dispute is pending resolution.',
    };
  }

  // 4. Outcome check (Must have verified outcome)
  if (!c.outcomeReport) {
    return {
      isEligible: false,
      reason: 'Field outcome has not been reported by the farmer.',
    };
  }

  if (
    c.outcomeVerification?.status !== 'EXPERT_VERIFIED' &&
    c.outcomeVerification?.status !== 'EXTENSION_VERIFIED'
  ) {
    return {
      isEligible: false,
      reason: 'Field recovery outcome has not been verified by an agronomist or extension officer.',
    };
  }

  // 5. Image quality score check
  const imageQuality = c.aiAssessment.imageQualityScore ?? 80;
  if (imageQuality < 70) {
    return {
      isEligible: false,
      reason: `Image quality score (${imageQuality}/100) is below the minimum threshold (70).`,
    };
  }

  return {
    isEligible: true,
    reason:
      'High-quality verified record: Agronomist confirmed diagnosis, outcome verified post-intervention, image score >= 70, explicit data consent granted.',
  };
}
