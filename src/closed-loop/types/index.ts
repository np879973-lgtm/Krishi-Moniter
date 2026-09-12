// Krishi Mentor Closed-Loop Architecture Types (Part 7)
// Farmer → AI → Expert → Government / Extension → Action → Outcome → Verification → Learning Loop

import {
  CaseAIAssessment,
  CaseAuditEvent,
  CaseExpertAssessment,
  CasePriority,
  CaseTimelineEntry,
  DataQualityFlag,
  FarmerFeedback,
  FarmerInfoResponse,
  StructuredInfoRequest,
  VerificationStatus,
} from '../../types/expert';

export type { CasePriority };

export type UserRole =
  | 'FARMER'
  | 'EXPERT'
  | 'EXTENSION_OFFICER'
  | 'GOVERNMENT_ADMIN'
  | 'SUPER_ADMIN';

export type ClosedLoopActor =
  | 'FARMER'
  | 'AI'
  | 'EXPERT'
  | 'EXTENSION_OFFICER'
  | 'GOVERNMENT'
  | 'LAB'
  | 'SYSTEM';

export type ClosedLoopCaseStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'AI_ANALYZED'
  | 'QUEUED_FOR_EXPERT'
  | 'IN_EXPERT_REVIEW'
  | 'WAITING_FOR_FARMER'
  | 'EXPERT_VERIFIED'
  | 'EXPERT_CORRECTED'
  | 'UNCERTAIN'
  | 'ESCALATED_TO_EXTENSION'
  | 'GOVERNMENT_REVIEW'
  | 'ACTION_RECOMMENDED'
  | 'ACTION_IN_PROGRESS'
  | 'OUTCOME_PENDING'
  | 'OUTCOME_REPORTED'
  | 'OUTCOME_VERIFIED'
  | 'DISPUTED'
  | 'CLOSED';

// ==========================================
// 1. DATA GOVERNANCE & CONSENT
// ==========================================
export interface DataConsent {
  caseProcessing: boolean;
  expertReview: boolean;
  aggregatedAnalytics: boolean;
  research: boolean;
  modelEvaluation: boolean;
  trainingCandidate: boolean;
  consentTimestamp: number;
}

// ==========================================
// 2. DATA PROVENANCE
// ==========================================
export interface ProvenanceMetadata {
  sourceType: ClosedLoopActor;
  sourceId: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  verifiedBy?: string;
  verifiedAt?: number;
  modelVersion: string;
  predictionVersion: string;
  expertReviewVersion?: string;
  evidenceReferences: string[];
}

// ==========================================
// 3. ESCALATION TO GOVERNMENT / EXTENSION
// ==========================================
export type EscalationReason =
  | 'SERIOUS_CROP_DAMAGE'
  | 'HIGH_RISK_OUTBREAK'
  | 'COMMUNITY_IMPACT'
  | 'REPEATED_FAILURE'
  | 'UNUSUAL_SYMPTOMS'
  | 'POSSIBLE_EMERGING_PEST'
  | 'FARMER_NEEDS_FIELD_SUPPORT'
  | 'OTHER';

export interface EscalationRecord {
  id: string;
  caseId: string;
  escalatedBy: string;
  escalatedByName: string;
  escalatedByRole: 'EXPERT' | 'EXTENSION_OFFICER';
  escalatedAt: number;
  reason: EscalationReason;
  priority: CasePriority;
  problemCategory: string;
  recommendedAction: string;
  additionalNotes: string;
  supportingEvidence?: string[];
  status: 'SUBMITTED' | 'ACKNOWLEDGED' | 'UNDER_INVESTIGATION' | 'RESOLVED';
  assignedOfficerId?: string;
  assignedOfficerName?: string;
}

// ==========================================
// 4. EXTENSION ACTIONS
// ==========================================
export type ExtensionActionType =
  | 'FIELD_VISIT'
  | 'FARMER_CONTACT'
  | 'ADVISORY_CAMPAIGN'
  | 'SAMPLING_REQUEST'
  | 'LAB_TEST_REQUEST'
  | 'PEST_MONITORING'
  | 'DISEASE_MONITORING'
  | 'AWARENESS_CAMPAIGN'
  | 'OTHER';

export type ExtensionActionStatus =
  | 'PLANNED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'VERIFICATION_REQUIRED';

export interface ExtensionAction {
  id: string;
  caseId: string;
  actionType: ExtensionActionType;
  createdBy: string;
  createdByName: string;
  assignedTo: string;
  assignedToName: string;
  priority: CasePriority;
  title: string;
  description: string;
  createdAt: number;
  dueDate: number;
  status: ExtensionActionStatus;
  completionNotes?: string;
  evidencePhotos?: string[];
  completedAt?: number;
}

// ==========================================
// 5. FIELD VISIT
// ==========================================
export type FieldVisitStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface FieldVisit {
  id: string;
  caseId: string;
  farmerName: string;
  farmName?: string;
  fieldName?: string;
  purpose: string;
  priority: CasePriority;
  scheduledDate: string; // ISO date string
  notes?: string;
  assignedOfficerId: string;
  assignedOfficerName: string;
  status: FieldVisitStatus;
  completedAt?: number;
  // Post-visit observations:
  observations?: string;
  photographs?: string[];
  symptomsIdentified?: string[];
  pestPresence?: string;
  severity?: string;
  farmerStatement?: string;
  recommendedAction?: string;
  outcome?: string;
}

// ==========================================
// 6. LAB / SAMPLE REQUEST
// ==========================================
export type SampleRequestType =
  | 'DISEASE_SAMPLE'
  | 'PEST_SAMPLE'
  | 'SOIL_SAMPLE'
  | 'WATER_SAMPLE'
  | 'OTHER';

export type SampleStatus =
  | 'REQUESTED'
  | 'COLLECTED'
  | 'SUBMITTED'
  | 'RESULT_AVAILABLE'
  | 'VERIFIED'
  | 'CANCELLED';

export interface SampleRequest {
  id: string;
  caseId: string;
  sampleType: SampleRequestType;
  status: SampleStatus;
  requestedBy: string;
  requestedByName: string;
  requestedAt: number;
  collectedAt?: number;
  labResultAvailable: boolean; // Must be false if no lab integration
  labResultSummary?: string; // "Laboratory result not available."
  labNotes?: string;
}

// ==========================================
// 7. OUTCOME TRACKING & VERIFICATION
// ==========================================
export type CropOutcomeCondition =
  | 'IMPROVED'
  | 'NO_CHANGE'
  | 'WORSE'
  | 'FULLY_RECOVERED'
  | 'UNCERTAIN';

export type OutcomeVerificationStatus =
  | 'REPORTED_BY_FARMER'
  | 'UNDER_REVIEW'
  | 'EXPERT_VERIFIED'
  | 'EXTENSION_VERIFIED'
  | 'DISPUTED'
  | 'INSUFFICIENT_EVIDENCE';

export interface OutcomeReport {
  id: string;
  caseId: string;
  reportedBy: 'FARMER' | 'EXTENSION_OFFICER';
  reportedByName: string;
  reportedAt: number;
  cropCondition: CropOutcomeCondition;
  initialSeverity: string;
  currentSeverity: string;
  symptomChange: string;
  treatmentFollowed: string;
  followUpImageUri?: string;
  farmerComments?: string;
  pestCount?: string;
  verificationStatus: OutcomeVerificationStatus;
}

export interface OutcomeVerification {
  verifiedBy: string;
  verifiedByName: string;
  verifiedByRole: 'EXPERT' | 'EXTENSION_OFFICER';
  verifiedAt: number;
  status: OutcomeVerificationStatus;
  notes: string;
  objectiveSummary: string; // E.g. "Reported crop condition improved after the recorded intervention."
}

// ==========================================
// 8. DISPUTE & SECOND EXPERT REVIEW
// ==========================================
export type DisputeType =
  | 'DIAGNOSIS_DISPUTE'
  | 'INEFFECTIVE_TREATMENT'
  | 'WRONG_DIAGNOSIS'
  | 'WORSE_CONDITION'
  | 'OTHER';

export interface CaseDispute {
  id: string;
  caseId: string;
  disputedBy: string;
  disputedByName: string;
  disputedAt: number;
  disputeType: DisputeType;
  reason: string;
  farmerComment: string;
  followUpImageUri?: string;
  status: 'OPEN' | 'IN_SECOND_REVIEW' | 'RESOLVED';
  secondReviewResult?: 'AGREEMENT' | 'DISAGREEMENT' | 'UNCERTAIN';
  resolutionNotes?: string;
}

export interface SecondReview {
  reviewerId: string;
  reviewerName: string;
  reviewerTitle: string;
  reviewedAt: number;
  result: 'AGREEMENT' | 'DISAGREEMENT' | 'UNCERTAIN';
  notes: string;
  recommendedAdjustment?: string;
}

// ==========================================
// 9. REGIONAL SIGNALS & CLUSTER DETECTION
// ==========================================
export type ClusterStatus =
  | 'INSUFFICIENT_DATA'
  | 'POTENTIAL_CLUSTER'
  | 'UNDER_REVIEW'
  | 'VERIFIED_SIGNAL'
  | 'DISMISSED';

export interface PotentialCluster {
  clusterId: string;
  crop: string;
  issue: string;
  approximateRegion: string; // e.g. "Ludhiana District, Punjab"
  caseCount: number;
  timeWindowDays: number;
  severitySummary: string;
  confidence: number;
  evidenceCount: number;
  status: ClusterStatus;
  detectedAt: number;
  notes: string;
}

export interface RegionalSignal {
  signalId: string;
  crop: string;
  problemType: string;
  diagnosis: string;
  approximateRegion: {
    state: string;
    district: string;
    block?: string;
  };
  totalCases: number;
  verifiedCases: number;
  timePeriod: string;
  severityDistribution: {
    low: number;
    moderate: number;
    high: number;
    critical: number;
  };
  confidence: number;
  status: 'INSUFFICIENT_DATA' | 'POTENTIAL_SIGNAL' | 'VERIFIED_SIGNAL';
  summaryText: string;
}

// ==========================================
// 10. GOVERNMENT & EXTENSION REPORTING
// ==========================================
export interface ClosedLoopGovernmentStats {
  openCasesCount: number;
  highPriorityCount: number;
  awaitingActionCount: number;
  activeInterventionsCount: number;
  verifiedOutcomesCount: number;
  escalatedToExtensionCount: number;
  cropBreakdown: Array<{ crop: string; count: number; verifiedCount: number }>;
  issueBreakdown: Array<{ issue: string; count: number }>;
  regionalSignalsCount: number;
  averageResolutionDays: number;
  farmerImprovementRate: number; // percentage
  dataQualityCandidateCount: number;
}

// ==========================================
// 11. COMPLETE CLOSED-LOOP CASE MODEL
// ==========================================
export interface ClosedLoopCase {
  id: string; // "KM-2026-000123"
  farmerId: string;
  farmerName: string;
  farmId?: string;
  farmName?: string;
  fieldId?: string;
  fieldName?: string;
  crop: string;
  cropHindi?: string;
  primaryImageUri: string;
  additionalImages?: string[];
  farmerMessage?: string;
  priority: CasePriority;
  priorityScore: number;
  priorityReason: string;
  status: ClosedLoopCaseStatus;
  verificationStatus: VerificationStatus;
  createdAt: number;
  updatedAt: number;
  submittedAt?: number;
  reviewedAt?: number;
  closedAt?: number;
  assignedExpertId?: string;
  assignedExpertName?: string;

  // AI Assessment (IMMUTABLE)
  aiAssessment: CaseAIAssessment;

  // Expert Assessment (IMMUTABLE when filed)
  expertAssessment?: CaseExpertAssessment;

  // Extension Escalation
  escalation?: EscalationRecord;

  // Extension Actions & Field Visits
  extensionActions?: ExtensionAction[];
  fieldVisits?: FieldVisit[];
  sampleRequests?: SampleRequest[];

  // Outcome Tracking & Verification (Closed Loop)
  outcomeReport?: OutcomeReport;
  outcomeVerification?: OutcomeVerification;

  // Dispute & Second Review
  dispute?: CaseDispute;
  secondReview?: SecondReview;

  // Information requests & farmer responses
  infoRequest?: StructuredInfoRequest;
  farmerResponses?: FarmerInfoResponse[];

  // Timeline & Auditing (Full History)
  timeline: CaseTimelineEntry[];
  auditTrail: CaseAuditEvent[];
  farmerFeedback?: FarmerFeedback;

  // Provenance & Consent
  provenance: ProvenanceMetadata;
  consent: DataConsent;

  // Learning Loop Qualification
  isTrainingCandidate: boolean;
  trainingCandidateReason?: string;

  // Environmental context
  weatherContextSummary?: {
    temperature?: number;
    humidity?: number;
    condition?: string;
    rainfall?: number;
    riskSummary?: string;
  };
  fieldRiskContext?: {
    diseaseRisk?: string;
    pestRisk?: string;
    weatherStress?: string;
  };

  isDemo?: boolean;
  offlineSyncStatus?: 'SYNCED' | 'WAITING_FOR_CONNECTION' | 'DRAFT';
}
