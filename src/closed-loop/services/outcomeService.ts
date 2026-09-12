// Outcome Tracking & Verification Service (Part 7)
// Captures farmer follow-up reports, enables before-and-after comparison, and agronomist verification

import {
  CropOutcomeCondition,
  OutcomeReport,
  OutcomeVerification,
  OutcomeVerificationStatus,
} from '../types';

export function createFarmerOutcomeReport(params: {
  caseId: string;
  farmerName: string;
  cropCondition: CropOutcomeCondition;
  initialSeverity: string;
  currentSeverity: string;
  symptomChange: string;
  treatmentFollowed: string;
  followUpImageUri?: string;
  farmerComments?: string;
  pestCount?: string;
}): OutcomeReport {
  const now = Date.now();
  return {
    id: `out-${now}`,
    caseId: params.caseId,
    reportedBy: 'FARMER',
    reportedByName: params.farmerName,
    reportedAt: now,
    cropCondition: params.cropCondition,
    initialSeverity: params.initialSeverity,
    currentSeverity: params.currentSeverity,
    symptomChange: params.symptomChange,
    treatmentFollowed: params.treatmentFollowed,
    followUpImageUri: params.followUpImageUri,
    farmerComments: params.farmerComments,
    pestCount: params.pestCount,
    verificationStatus: 'REPORTED_BY_FARMER',
  };
}

export function verifyCropOutcome(params: {
  caseId: string;
  verifiedBy: string;
  verifiedByName: string;
  verifiedByRole: 'EXPERT' | 'EXTENSION_OFFICER';
  status: OutcomeVerificationStatus;
  notes: string;
  cropConditionReported: CropOutcomeCondition;
}): OutcomeVerification {
  const now = Date.now();

  // Strict objective wording rule:
  // "Reported crop condition improved after the recorded intervention" instead of claiming "cured"
  let objectiveSummary = '';
  if (
    params.cropConditionReported === 'IMPROVED' ||
    params.cropConditionReported === 'FULLY_RECOVERED'
  ) {
    objectiveSummary =
      'Reported crop condition improved after the recorded intervention. Foliar recovery observed in follow-up assessment.';
  } else if (params.cropConditionReported === 'NO_CHANGE') {
    objectiveSummary =
      'Crop condition showed no observable change post-intervention. Secondary monitoring advised.';
  } else if (params.cropConditionReported === 'WORSE') {
    objectiveSummary =
      'Crop condition deteriorated post-intervention. Field scouting and alternative IPM strategy required.';
  } else {
    objectiveSummary =
      'Field assessment pending or evidence inconclusive for definitive outcome rating.';
  }

  return {
    verifiedBy: params.verifiedBy,
    verifiedByName: params.verifiedByName,
    verifiedByRole: params.verifiedByRole,
    verifiedAt: now,
    status: params.status,
    notes: params.notes,
    objectiveSummary,
  };
}
