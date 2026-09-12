// Verification Data Model & Training Candidate Representation (Part 5)
// Formalizes separation between AI assessment and Expert verification

import {
  CaseAIAssessment,
  CaseExpertAssessment,
  DataQualityFlag,
  VerificationStatus,
} from '../expert';

export interface VerificationRecord {
  caseId: string;
  verificationStatus: VerificationStatus;
  aiAssessment: CaseAIAssessment;
  expertAssessment: CaseExpertAssessment;
  expertId: string;
  expertNotesInternal?: string;
  farmerVisibleResponse: CaseExpertAssessment['farmerVisibleResponse'];
  verifiedAt: number;
  correctionReason?: string;
  isCorrected: boolean;
}

/**
 * Structured record for future verified machine learning dataset
 * NEVER automatically trains; marked as training candidate only after validation
 */
export interface VerifiedTrainingCandidateRecord {
  candidateId: string;
  caseId: string;
  originalImageUri: string;
  additionalImages?: string[];
  crop: string;
  aiPrediction: {
    diagnosis: string;
    confidence: number;
    severity: string;
    symptoms: string[];
  };
  expertDiagnosis: {
    diagnosis: string;
    severity: string;
    confidence: string;
    isCorrection: boolean;
    reasoning?: string;
  };
  finalVerifiedDiagnosis: string;
  finalSeverity: string;
  dataQualityFlag: DataQualityFlag;
  weatherSummary?: string;
  verifiedAt: number;
  isTrainingEligible: boolean;
}
