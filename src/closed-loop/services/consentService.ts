// Data Consent & Governance Foundation (Part 7)
// Explicit tracking of permissions for processing, research, and machine learning candidates

import { DataConsent } from '../types';

export function createDefaultFarmerConsent(): DataConsent {
  return {
    caseProcessing: true,
    expertReview: true,
    aggregatedAnalytics: true,
    research: true,
    modelEvaluation: true,
    trainingCandidate: true, // farmer explicitly opts in or out
    consentTimestamp: Date.now(),
  };
}

export function updateConsentPreference(
  current: DataConsent,
  updates: Partial<DataConsent>
): DataConsent {
  return {
    ...current,
    ...updates,
    consentTimestamp: Date.now(),
  };
}

/**
 * Validates whether an action is permitted under the record's consent
 */
export function isPermitted(consent: DataConsent | undefined, purpose: keyof Omit<DataConsent, 'consentTimestamp'>): boolean {
  if (!consent) return false;
  return !!consent[purpose];
}
