// Expert & Verification Types for Krishi Mentor (Part 5)
// Supports Farmer, Expert, and future Admin/Government roles

export type UserRole = 'FARMER' | 'EXPERT' | 'ADMIN' | 'GOVERNMENT' | 'EXTENSION_OFFICER';

export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type CaseStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'QUEUED'
  | 'IN_REVIEW'
  | 'WAITING_FOR_FARMER'
  | 'REVIEWED'
  | 'VERIFIED'
  | 'CORRECTED'
  | 'UNCERTAIN'
  | 'CLOSED';

export type VerificationStatus =
  | 'AI_ASSESSMENT'
  | 'EXPERT_REVIEW_REQUESTED'
  | 'IN_REVIEW'
  | 'EXPERT_VERIFIED'
  | 'EXPERT_CORRECTED'
  | 'EXPERT_UNCERTAIN'
  | 'INSUFFICIENT_IMAGE';

export type ExpertDecisionType =
  | 'CONFIRM'
  | 'CORRECT'
  | 'UNCERTAIN'
  | 'REQUEST_INFO'
  | 'INSUFFICIENT_IMAGE';

export type InfoRequestType =
  | 'CLOSER_LEAF'
  | 'WHOLE_PLANT'
  | 'LEAF_UNDERSIDE'
  | 'AFFECTED_FRUIT'
  | 'RECENT_RAINFALL'
  | 'SYMPTOM_DATE'
  | 'CUSTOM';

export type DataQualityFlag =
  | 'VERIFIED_HIGH_QUALITY'
  | 'VERIFIED'
  | 'NEEDS_REVIEW'
  | 'CONFLICTING'
  | 'INSUFFICIENT_IMAGE'
  | 'NOT_FOR_TRAINING';

export type ExpertAIFeedback =
  | 'AI_CORRECT'
  | 'AI_PARTIALLY_CORRECT'
  | 'AI_INCORRECT'
  | 'AI_CONFIDENCE_TOO_HIGH'
  | 'AI_CONFIDENCE_TOO_LOW'
  | 'IMAGE_INSUFFICIENT';

export interface ExpertProfile {
  id: string;
  name: string;
  title: string;
  institution: string;
  expertise: string[];
  crops: string[];
  languages: string[];
  region: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'SUSPENDED';
  experience: string;
  isDemo: boolean;
  avatar?: string;
  casesReviewedCount: number;
}

export interface StructuredInfoRequest {
  id: string;
  requestType: InfoRequestType;
  message: string;
  requestedAt: number;
  status: 'PENDING' | 'RESPONDED' | 'CLOSED';
}

export interface FarmerInfoResponse {
  id: string;
  requestId?: string;
  message: string;
  imageUri?: string;
  respondedAt: number;
}

export interface CaseTimelineEntry {
  id: string;
  timestamp: number;
  actor: 'farmer' | 'ai' | 'expert' | 'system';
  actorName: string;
  type:
    | 'CASE_CREATED'
    | 'AI_ANALYZED'
    | 'SUBMITTED'
    | 'EXPERT_ASSIGNED'
    | 'INFO_REQUESTED'
    | 'FARMER_RESPONDED'
    | 'EXPERT_CONFIRMED'
    | 'EXPERT_CORRECTED'
    | 'EXPERT_UNCERTAIN'
    | 'FEEDBACK_SUBMITTED'
    | 'CASE_CLOSED';
  title: string;
  titleHi?: string;
  description: string;
  descriptionHi?: string;
  imageUri?: string;
}

export interface CaseAuditEvent {
  id: string;
  caseId: string;
  timestamp: number;
  action: string;
  actor: string;
  actorRole: UserRole;
  details?: Record<string, any>;
}

export interface FarmerFeedback {
  helpful: boolean;
  solvedProblem?: 'YES' | 'PARTIALLY' | 'NO' | 'NOT_SURE';
  comment?: string;
  submittedAt: number;
}

export interface CaseAIAssessment {
  diagnosisId: string;
  crop: string;
  cropHindi?: string;
  problemType: string;
  diagnosis: string;
  diagnosisHindi?: string;
  confidence: number;
  severity: string;
  affectedAreaEstimate: string;
  symptoms: string[];
  possibleCauses?: string[];
  secondaryConditions?: Array<{ name: string; confidence: number }>;
  imageQualityScore?: number;
  imageFlags?: string[];
  ipmAdvisory: {
    immediateAction: string[];
    monitoring: string[];
    prevention: string[];
    biologicalCulturalControls: string[];
    chemicalControlNotice: string;
    whenToContactExpert: string;
  };
}

export interface CaseExpertAssessment {
  expertId: string;
  expertName: string;
  expertTitle: string;
  decision: ExpertDecisionType;
  verifiedDiagnosis: string;
  verifiedDiagnosisHindi?: string;
  verifiedProblemType: string;
  verifiedSeverity: string;
  expertConfidence: 'LOW' | 'MODERATE' | 'HIGH' | 'DEFINITIVE';
  isCorrected: boolean;
  originalAIDiagnosis: string;
  correctionReason?: string;
  uncertaintyReason?: string;
  additionalObservations?: string;
  internalNotes?: string; // Strictly hidden from farmers
  farmerVisibleResponse: {
    assessmentSummary: string;
    explanation: string;
    recommendedActions: string[];
    followUpInstructions: string;
    chemicalGuidanceNotice: string;
  };
  aiFeedback?: ExpertAIFeedback;
  dataQualityFlag: DataQualityFlag;
  reviewedAt: number;
}

export interface AgriculturalCase {
  id: string; // e.g. "KM-2026-000123"
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
  status: CaseStatus;
  verificationStatus: VerificationStatus;
  createdAt: number;
  updatedAt: number;
  submittedAt?: number;
  reviewedAt?: number;
  closedAt?: number;
  assignedExpertId?: string;
  assignedExpertName?: string;
  aiAssessment: CaseAIAssessment;
  expertAssessment?: CaseExpertAssessment;
  infoRequest?: StructuredInfoRequest;
  farmerResponses?: FarmerInfoResponse[];
  timeline: CaseTimelineEntry[];
  auditTrail: CaseAuditEvent[];
  farmerFeedback?: FarmerFeedback;
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

export interface CaseFilterOptions {
  searchQuery?: string;
  crop?: string;
  problemType?: string;
  severity?: string;
  priority?: CasePriority | 'ALL';
  status?: CaseStatus | 'ALL';
  verificationStatus?: VerificationStatus | 'ALL';
  onlyDemo?: boolean;
}

export interface InAppNotification {
  id: string;
  recipientRole: UserRole;
  recipientId: string;
  caseId: string;
  title: string;
  titleHi: string;
  message: string;
  messageHi: string;
  timestamp: number;
  read: boolean;
  type: 'NEW_CASE' | 'CASE_ASSIGNED' | 'INFO_REQUESTED' | 'FARMER_RESPONDED' | 'EXPERT_VERIFIED' | 'STATUS_CHANGED';
}
