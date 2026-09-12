// Master Closed-Loop Service for Krishi Mentor (Part 7)
// Coordinates Farmer → AI → Expert → Extension/Government → Action → Outcome → Verification → Learning Loop

import {
  ClosedLoopCase,
  ClosedLoopCaseStatus,
  CropOutcomeCondition,
  DataConsent,
  DisputeType,
  EscalationReason,
  ExtensionAction,
  ExtensionActionType,
  FieldVisit,
  OutcomeVerificationStatus,
  SampleRequestType,
  UserRole,
} from '../types';
import { INITIAL_CLOSED_LOOP_DEMO_CASES } from '../demo/demoClosedLoopCases';
import { createEscalationRecord } from './escalationService';
import {
  createExtensionAction as makeAction,
  scheduleFieldVisit as makeFieldVisit,
  completeFieldVisit as finishFieldVisit,
  createSampleRequest as makeSampleRequest,
} from './extensionService';
import { createFarmerOutcomeReport, verifyCropOutcome as makeVerifyOutcome } from './outcomeService';
import { createCaseDispute, submitSecondExpertReview as makeSecondReview } from './disputeService';
import { evaluateTrainingCandidateEligibility } from './provenanceService';
import { recordAuditEvent } from '../../services/expert/auditService';
import { createNotification } from '../../services/expert/notificationService';
import { getActiveExpertProfile } from '../../services/expert/expertService';

const CLOSED_LOOP_STORAGE_KEY = 'krishi_mentor_closed_loop_cases_v2';

function initializeClosedLoopCases(): ClosedLoopCase[] {
  try {
    const raw = localStorage.getItem(CLOSED_LOOP_STORAGE_KEY);
    if (raw) {
      const parsed: ClosedLoopCase[] = JSON.parse(raw);
      if (parsed && parsed.length > 0) return parsed;
    }
    localStorage.setItem(CLOSED_LOOP_STORAGE_KEY, JSON.stringify(INITIAL_CLOSED_LOOP_DEMO_CASES));
    return INITIAL_CLOSED_LOOP_DEMO_CASES;
  } catch (err) {
    console.error('Failed to initialize closed loop cases:', err);
    return INITIAL_CLOSED_LOOP_DEMO_CASES;
  }
}

function saveClosedLoopCases(cases: ClosedLoopCase[]): void {
  try {
    localStorage.setItem(CLOSED_LOOP_STORAGE_KEY, JSON.stringify(cases));
  } catch (err) {
    console.error('Failed to save closed loop cases:', err);
  }
}

// ==========================================
// ROLE-BASED ACCESS CONTROL QUERIES
// ==========================================

/**
 * 1. FARMER VIEW: Strictly filtered by farmerId (Privacy Boundary)
 */
export function getCasesForFarmer(farmerId: string = 'farmer-primary'): ClosedLoopCase[] {
  const all = initializeClosedLoopCases();
  return all.filter((c) => c.farmerId === farmerId || c.farmerId === 'farmer-primary');
}

/**
 * 2. EXPERT VIEW: Cases queued, under review, or escalated
 */
export function getCasesForExpert(): ClosedLoopCase[] {
  return initializeClosedLoopCases();
}

/**
 * 3. EXTENSION OFFICER VIEW: Cases requiring regional support or field action
 */
export function getCasesForExtensionOfficer(): ClosedLoopCase[] {
  const all = initializeClosedLoopCases();
  return all.filter(
    (c) =>
      c.status === 'ESCALATED_TO_EXTENSION' ||
      c.status === 'GOVERNMENT_REVIEW' ||
      c.status === 'ACTION_RECOMMENDED' ||
      c.status === 'ACTION_IN_PROGRESS' ||
      c.status === 'OUTCOME_PENDING' ||
      c.status === 'OUTCOME_REPORTED' ||
      c.status === 'OUTCOME_VERIFIED' ||
      c.escalation !== undefined
  );
}

/**
 * 4. GOVERNMENT ADMIN VIEW: Complete system records for policy & analytics
 */
export function getCasesForGovernmentAdmin(): ClosedLoopCase[] {
  return initializeClosedLoopCases();
}

/**
 * Fetch case by ID
 */
export function getClosedLoopCaseById(caseId: string): ClosedLoopCase | null {
  const all = initializeClosedLoopCases();
  return all.find((c) => c.id === caseId) || null;
}

// ==========================================
// WORKFLOW ACTIONS & TRANSITIONS
// ==========================================

/**
 * Expert escalates a case to Extension / Government
 */
export function escalateCaseToExtension(params: {
  caseId: string;
  reason: EscalationReason;
  priority: ClosedLoopCase['priority'];
  problemCategory: string;
  recommendedAction: string;
  additionalNotes: string;
  supportingEvidence?: string[];
}): ClosedLoopCase {
  const all = initializeClosedLoopCases();
  const c = all.find((item) => item.id === params.caseId);
  if (!c) throw new Error('Case not found');

  const expert = getActiveExpertProfile();
  const escalation = createEscalationRecord({
    caseId: c.id,
    escalatedBy: expert.id,
    escalatedByName: expert.name,
    reason: params.reason,
    priority: params.priority,
    problemCategory: params.problemCategory,
    recommendedAction: params.recommendedAction,
    additionalNotes: params.additionalNotes,
    supportingEvidence: params.supportingEvidence,
  });

  c.escalation = escalation;
  c.status = 'ESCALATED_TO_EXTENSION';
  c.updatedAt = Date.now();

  const now = Date.now();
  c.timeline.push({
    id: `tl-${now}-esc`,
    timestamp: now,
    actor: 'expert',
    actorName: expert.name,
    type: 'EXPERT_CONFIRMED',
    title: 'Case Escalated to Agricultural Extension',
    titleHi: 'मामला कृषि प्रसार विभाग को प्रेषित किया गया',
    description: `Escalated for: ${params.problemCategory}. Note: ${params.additionalNotes}`,
  });

  c.auditTrail.push({
    id: `aud-${now}-esc`,
    caseId: c.id,
    timestamp: now,
    action: 'ESCALATED_TO_EXTENSION',
    actor: expert.name,
    actorRole: 'EXPERT',
    details: { reason: params.reason, priority: params.priority },
  });

  saveClosedLoopCases(all);

  // Notify extension officers and farmer
  createNotification({
    recipientRole: 'GOVERNMENT',
    recipientId: 'extension-service',
    caseId: c.id,
    title: `Escalated Case: ${c.crop} in ${c.farmName || 'District'}`,
    titleHi: `नया प्रेषित मामला: ${c.cropHindi || c.crop}`,
    message: `${expert.name} escalated case ${c.id}: ${params.problemCategory}`,
    messageHi: `${expert.name} ने मामला ${c.id} कृषि विभाग को प्रेषित किया।`,
    type: 'STATUS_CHANGED',
  });

  createNotification({
    recipientRole: 'FARMER',
    recipientId: c.farmerId,
    caseId: c.id,
    title: `Extension Support Requested: ${c.crop}`,
    titleHi: `कृषि प्रसार सहायता अनुरोध: ${c.cropHindi || c.crop}`,
    message:
      'Your case has been forwarded to the local agricultural extension team for on-field support.',
    messageHi: 'आपकी फसल की सहायता हेतु मामला स्थानीय कृषि प्रसार टीम को भेजा गया है।',
    type: 'STATUS_CHANGED',
  });

  return c;
}

/**
 * Extension officer creates an action (field visit, advisory, etc.)
 */
export function addExtensionAction(params: {
  caseId: string;
  actionType: ExtensionActionType;
  title: string;
  description: string;
  priority: ClosedLoopCase['priority'];
  assignedTo: string;
  assignedToName: string;
  dueDateDays?: number;
  officerName: string;
}): ClosedLoopCase {
  const all = initializeClosedLoopCases();
  const c = all.find((item) => item.id === params.caseId);
  if (!c) throw new Error('Case not found');

  const action = makeAction({
    caseId: c.id,
    actionType: params.actionType,
    title: params.title,
    description: params.description,
    priority: params.priority,
    assignedTo: params.assignedTo,
    assignedToName: params.assignedToName,
    dueDateDays: params.dueDateDays,
    createdBy: 'extension-officer',
    createdByName: params.officerName,
  });

  if (!c.extensionActions) c.extensionActions = [];
  c.extensionActions.push(action);
  c.status = 'ACTION_IN_PROGRESS';
  c.updatedAt = Date.now();

  const now = Date.now();
  c.timeline.push({
    id: `tl-${now}-act`,
    timestamp: now,
    actor: 'system',
    actorName: params.officerName,
    type: 'EXPERT_CONFIRMED',
    title: `Extension Action: ${params.title}`,
    titleHi: `प्रसार कार्रवाई: ${params.title}`,
    description: params.description,
  });

  saveClosedLoopCases(all);
  return c;
}

/**
 * Schedule a field visit
 */
export function addFieldVisit(params: {
  caseId: string;
  purpose: string;
  priority: ClosedLoopCase['priority'];
  scheduledDate: string;
  notes?: string;
  officerId: string;
  officerName: string;
}): ClosedLoopCase {
  const all = initializeClosedLoopCases();
  const c = all.find((item) => item.id === params.caseId);
  if (!c) throw new Error('Case not found');

  const visit = makeFieldVisit({
    caseId: c.id,
    farmerName: c.farmerName,
    farmName: c.farmName,
    fieldName: c.fieldName,
    purpose: params.purpose,
    priority: params.priority,
    scheduledDate: params.scheduledDate,
    notes: params.notes,
    assignedOfficerId: params.officerId,
    assignedOfficerName: params.officerName,
  });

  if (!c.fieldVisits) c.fieldVisits = [];
  c.fieldVisits.push(visit);
  c.status = 'ACTION_IN_PROGRESS';
  c.updatedAt = Date.now();

  const now = Date.now();
  c.timeline.push({
    id: `tl-${now}-fv`,
    timestamp: now,
    actor: 'system',
    actorName: params.officerName,
    type: 'EXPERT_CONFIRMED',
    title: `Field Visit Scheduled for ${params.scheduledDate}`,
    titleHi: `खेत निरीक्षण निर्धारित (${params.scheduledDate})`,
    description: `Purpose: ${params.purpose}. Officer: ${params.officerName}`,
  });

  saveClosedLoopCases(all);

  createNotification({
    recipientRole: 'FARMER',
    recipientId: c.farmerId,
    caseId: c.id,
    title: `Field Visit Scheduled: ${params.scheduledDate}`,
    titleHi: `खेत निरीक्षण निर्धारित: ${params.scheduledDate}`,
    message: `Extension Officer ${params.officerName} has scheduled a visit to inspect your ${c.crop}.`,
    messageHi: `कृषि प्रसार अधिकारी ${params.officerName} आपकी फसल देखने खेत पर आएंगे।`,
    type: 'STATUS_CHANGED',
  });

  return c;
}

/**
 * Complete a field visit report
 */
export function recordFieldVisitOutcome(params: {
  caseId: string;
  visitId: string;
  observations: string;
  photographs?: string[];
  symptomsIdentified?: string[];
  pestPresence?: string;
  severity?: string;
  farmerStatement?: string;
  recommendedAction?: string;
  outcome?: string;
}): ClosedLoopCase {
  const all = initializeClosedLoopCases();
  const c = all.find((item) => item.id === params.caseId);
  if (!c || !c.fieldVisits) throw new Error('Case or field visits not found');

  const visit = c.fieldVisits.find((v) => v.id === params.visitId);
  if (!visit) throw new Error('Field visit record not found');

  const updatedVisit = finishFieldVisit(visit, params);
  const idx = c.fieldVisits.findIndex((v) => v.id === params.visitId);
  c.fieldVisits[idx] = updatedVisit;

  c.status = 'OUTCOME_PENDING';
  c.updatedAt = Date.now();

  const now = Date.now();
  c.timeline.push({
    id: `tl-${now}-fvr`,
    timestamp: now,
    actor: 'system',
    actorName: visit.assignedOfficerName,
    type: 'EXPERT_CONFIRMED',
    title: 'Field Visit Completed & Observations Recorded',
    titleHi: 'खेत निरीक्षण संपन्न व रिपोर्ट दर्ज',
    description: params.observations,
  });

  saveClosedLoopCases(all);
  return c;
}

/**
 * Farmer submits an outcome report (Before/After)
 */
export function submitFarmerOutcome(params: {
  caseId: string;
  cropCondition: CropOutcomeCondition;
  initialSeverity: string;
  currentSeverity: string;
  symptomChange: string;
  treatmentFollowed: string;
  followUpImageUri?: string;
  farmerComments?: string;
  pestCount?: string;
}): ClosedLoopCase {
  const all = initializeClosedLoopCases();
  const c = all.find((item) => item.id === params.caseId);
  if (!c) throw new Error('Case not found');

  const report = createFarmerOutcomeReport({
    caseId: c.id,
    farmerName: c.farmerName,
    cropCondition: params.cropCondition,
    initialSeverity: params.initialSeverity,
    currentSeverity: params.currentSeverity,
    symptomChange: params.symptomChange,
    treatmentFollowed: params.treatmentFollowed,
    followUpImageUri: params.followUpImageUri,
    farmerComments: params.farmerComments,
    pestCount: params.pestCount,
  });

  c.outcomeReport = report;
  c.status = 'OUTCOME_REPORTED';
  c.updatedAt = Date.now();

  const now = Date.now();
  c.timeline.push({
    id: `tl-${now}-out`,
    timestamp: now,
    actor: 'farmer',
    actorName: c.farmerName,
    type: 'FEEDBACK_SUBMITTED',
    title: `Farmer Outcome Report: ${params.cropCondition}`,
    titleHi: `फसल स्थिति रिपोर्ट: ${params.cropCondition}`,
    description: `Reported: ${params.symptomChange}. Followed: ${params.treatmentFollowed}`,
    imageUri: params.followUpImageUri,
  });

  c.auditTrail.push({
    id: `aud-${now}-out`,
    caseId: c.id,
    timestamp: now,
    action: 'OUTCOME_REPORTED',
    actor: c.farmerName,
    actorRole: 'FARMER',
    details: { condition: params.cropCondition },
  });

  saveClosedLoopCases(all);

  createNotification({
    recipientRole: 'EXPERT',
    recipientId: c.assignedExpertId || 'all-experts',
    caseId: c.id,
    title: `Outcome Reported: ${c.crop} (${c.id})`,
    titleHi: `फसल सुधार रिपोर्ट प्राप्त: ${c.cropHindi || c.crop}`,
    message: `${c.farmerName} submitted post-treatment outcome: ${params.cropCondition}. Ready for verification.`,
    messageHi: `${c.farmerName} ने उपचार के बाद फसल सुधार की रिपोर्ट भेजी है।`,
    type: 'STATUS_CHANGED',
  });

  return c;
}

/**
 * Agronomist or Extension Officer verifies an outcome
 */
export function verifyOutcome(params: {
  caseId: string;
  status: OutcomeVerificationStatus;
  notes: string;
  verifierRole: 'EXPERT' | 'EXTENSION_OFFICER';
  verifierName: string;
}): ClosedLoopCase {
  const all = initializeClosedLoopCases();
  const c = all.find((item) => item.id === params.caseId);
  if (!c || !c.outcomeReport) throw new Error('Case or outcome report not found');

  const verification = makeVerifyOutcome({
    caseId: c.id,
    verifiedBy: 'verifier-id',
    verifiedByName: params.verifierName,
    verifiedByRole: params.verifierRole,
    status: params.status,
    notes: params.notes,
    cropConditionReported: c.outcomeReport.cropCondition,
  });

  c.outcomeVerification = verification;
  c.status = 'OUTCOME_VERIFIED';
  c.updatedAt = Date.now();

  // Evaluate for Responsible Learning Loop (NO AUTOMATIC RETRAINING)
  const learningCheck = evaluateTrainingCandidateEligibility(c);
  c.isTrainingCandidate = learningCheck.isEligible;
  c.trainingCandidateReason = learningCheck.reason;

  const now = Date.now();
  c.timeline.push({
    id: `tl-${now}-outv`,
    timestamp: now,
    actor: 'expert',
    actorName: params.verifierName,
    type: 'EXPERT_CONFIRMED',
    title: 'Crop Outcome Verified by Agronomist',
    titleHi: 'फसल परिणाम कृषि वैज्ञानिक द्वारा सत्यापित',
    description: verification.objectiveSummary,
  });

  c.auditTrail.push({
    id: `aud-${now}-outv`,
    caseId: c.id,
    timestamp: now,
    action: 'OUTCOME_VERIFIED',
    actor: params.verifierName,
    actorRole: params.verifierRole === 'EXPERT' ? 'EXPERT' : 'EXTENSION_OFFICER',
    details: {
      status: params.status,
      isTrainingCandidate: c.isTrainingCandidate,
    },
  });

  saveClosedLoopCases(all);

  createNotification({
    recipientRole: 'FARMER',
    recipientId: c.farmerId,
    caseId: c.id,
    title: `Outcome Verified: ${c.crop}`,
    titleHi: `फसल सुधार परिणाम सत्यापित: ${c.cropHindi || c.crop}`,
    message:
      'The agronomist reviewed your follow-up photo and verified your crop recovery report. Thank you!',
    messageHi: 'कृषि वैज्ञानिक ने आपकी फोटो देखकर सुधार परिणाम को सत्यापित कर लिया है। धन्यवाद!',
    type: 'EXPERT_VERIFIED',
  });

  return c;
}

/**
 * Farmer files a dispute
 */
export function fileCaseDispute(params: {
  caseId: string;
  disputeType: DisputeType;
  reason: string;
  farmerComment: string;
  followUpImageUri?: string;
}): ClosedLoopCase {
  const all = initializeClosedLoopCases();
  const c = all.find((item) => item.id === params.caseId);
  if (!c) throw new Error('Case not found');

  const dispute = createCaseDispute({
    caseId: c.id,
    disputedBy: c.farmerId,
    disputedByName: c.farmerName,
    disputeType: params.disputeType,
    reason: params.reason,
    farmerComment: params.farmerComment,
    followUpImageUri: params.followUpImageUri,
  });

  c.dispute = dispute;
  c.status = 'DISPUTED';
  c.updatedAt = Date.now();
  // Disputed cases are disqualified from training data
  c.isTrainingCandidate = false;
  c.trainingCandidateReason = 'Farmer filed formal dispute; disqualified from training candidate.';

  const now = Date.now();
  c.timeline.push({
    id: `tl-${now}-disp`,
    timestamp: now,
    actor: 'farmer',
    actorName: c.farmerName,
    type: 'FEEDBACK_SUBMITTED',
    title: 'Farmer Filed Formal Dispute',
    titleHi: 'किसान द्वारा औपचारिक आपत्ति दर्ज',
    description: `Reason: ${params.reason}. Comment: ${params.farmerComment}`,
    imageUri: params.followUpImageUri,
  });

  saveClosedLoopCases(all);

  createNotification({
    recipientRole: 'EXPERT',
    recipientId: 'all-experts',
    caseId: c.id,
    title: `Dispute Filed: ${c.crop} (${c.id})`,
    titleHi: `आपत्ति दर्ज: ${c.cropHindi || c.crop}`,
    message: `${c.farmerName} filed a dispute: "${params.reason}". Requires second review.`,
    messageHi: `${c.farmerName} ने आपत्ति दर्ज की है। द्वितीय समीक्षा आवश्यक है।`,
    type: 'STATUS_CHANGED',
  });

  return c;
}

/**
 * Submit second expert review on disputed or uncertain case
 */
export function recordSecondReview(params: {
  caseId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerTitle: string;
  result: 'AGREEMENT' | 'DISAGREEMENT' | 'UNCERTAIN';
  notes: string;
  recommendedAdjustment?: string;
}): ClosedLoopCase {
  const all = initializeClosedLoopCases();
  const c = all.find((item) => item.id === params.caseId);
  if (!c) throw new Error('Case not found');

  const review = makeSecondReview({
    caseId: c.id,
    reviewerId: params.reviewerId,
    reviewerName: params.reviewerName,
    reviewerTitle: params.reviewerTitle,
    result: params.result,
    notes: params.notes,
    recommendedAdjustment: params.recommendedAdjustment,
  });

  c.secondReview = review;
  if (c.dispute) {
    c.dispute.status = 'RESOLVED';
    c.dispute.secondReviewResult = params.result;
    c.dispute.resolutionNotes = params.notes;
  }
  c.updatedAt = Date.now();

  const now = Date.now();
  c.timeline.push({
    id: `tl-${now}-2rev`,
    timestamp: now,
    actor: 'expert',
    actorName: params.reviewerName,
    type: 'EXPERT_CONFIRMED',
    title: `Second Expert Review: ${params.result}`,
    titleHi: `द्वितीय विशेषज्ञ समीक्षा: ${params.result}`,
    description: `${params.notes} ${params.recommendedAdjustment ? `Adjustment: ${params.recommendedAdjustment}` : ''}`,
  });

  saveClosedLoopCases(all);
  return c;
}

/**
 * Update Data Consent preference
 */
export function updateCaseConsent(
  caseId: string,
  consentUpdates: Partial<DataConsent>
): ClosedLoopCase {
  const all = initializeClosedLoopCases();
  const c = all.find((item) => item.id === caseId);
  if (!c) throw new Error('Case not found');

  c.consent = {
    ...c.consent,
    ...consentUpdates,
    consentTimestamp: Date.now(),
  };

  // Re-evaluate training candidate
  const check = evaluateTrainingCandidateEligibility(c);
  c.isTrainingCandidate = check.isEligible;
  c.trainingCandidateReason = check.reason;

  saveClosedLoopCases(all);
  return c;
}
