// Case Service for Krishi Mentor (Part 5)
// Manages complete lifecycle of expert verification cases, priority computation, and role access

import {
  AgriculturalCase,
  CasePriority,
  CaseStatus,
  DataQualityFlag,
  ExpertAIFeedback,
  ExpertDecisionType,
  FarmerFeedback,
  InfoRequestType,
  VerificationStatus,
} from '../../types/expert';
import { DiagnosisResult } from '../../types';
import { INITIAL_DEMO_CASES } from '../../data/expert/demoCases';
import { recordAuditEvent } from './auditService';
import { createNotification } from './notificationService';
import { getActiveExpertProfile } from './expertService';
import { generateLocalCaseId, saveLocalCase } from '../../offline/storage/repositories/localCaseRepository';
import { addQueueItem } from '../../offline/storage/repositories/syncQueueRepository';

const CASES_STORAGE_KEY = 'krishi_mentor_expert_cases_v1';
const CASE_COUNTER_KEY = 'krishi_mentor_case_counter_v1';

// Initialize storage with demo cases if not present
function initializeCases(): AgriculturalCase[] {
  try {
    const raw = localStorage.getItem(CASES_STORAGE_KEY);
    if (raw) {
      const parsed: AgriculturalCase[] = JSON.parse(raw);
      if (parsed.length > 0) return parsed;
    }
    localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_CASES));
    return INITIAL_DEMO_CASES;
  } catch (err) {
    console.error('Failed to initialize cases:', err);
    return INITIAL_DEMO_CASES;
  }
}

function saveCases(cases: AgriculturalCase[]): void {
  try {
    localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(cases));
  } catch (err) {
    console.error('Failed to save cases:', err);
  }
}

/**
 * Generates an authoritative, structured Case ID: "KM-2026-000XXX"
 */
export function generateCaseId(): string {
  try {
    const currentYear = new Date().getFullYear();
    const currentCount = parseInt(localStorage.getItem(CASE_COUNTER_KEY) || '120', 10) + 1;
    localStorage.setItem(CASE_COUNTER_KEY, currentCount.toString());
    const padded = currentCount.toString().padStart(6, '0');
    return `KM-${currentYear}-${padded}`;
  } catch {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `KM-${new Date().getFullYear()}-${random}`;
  }
}

/**
 * Configurable priority calculation based on:
 * - Severity level
 * - AI Confidence (low confidence needs priority review)
 * - Rapid progression risk
 * - Farmer description signals
 * - Weather risk factors
 */
export function calculateCasePriority(params: {
  severity: string;
  confidence: number;
  progressionRisk?: string;
  farmerMessage?: string;
  weatherRisk?: string;
  affectedArea?: string;
}): { priority: CasePriority; score: number; reason: string } {
  let score = 30; // base score
  const reasons: string[] = [];

  // Severity contribution
  if (params.severity === 'Critical') {
    score += 40;
    reasons.push('Critical crop damage severity');
  } else if (params.severity === 'High') {
    score += 25;
    reasons.push('High severity symptoms');
  } else if (params.severity === 'Moderate') {
    score += 10;
  }

  // Low confidence AI needs faster human attention
  if (params.confidence < 0.65) {
    score += 18;
    reasons.push('Low AI confidence (<65%) requires rapid human assessment');
  }

  // Rapid progression risk
  if (params.progressionRisk === 'Rapid' || params.progressionRisk === 'Aggressive') {
    score += 20;
    reasons.push('Rapid disease progression potential');
  }

  // Weather risk
  if (params.weatherRisk && (params.weatherRisk.includes('High') || params.weatherRisk.includes('Severe'))) {
    score += 12;
    reasons.push('Unfavorable high-humidity/rain incubation weather');
  }

  // Farmer urgent keywords in Hindi / English
  if (params.farmerMessage) {
    const text = params.farmerMessage.toLowerCase();
    if (
      text.includes('urgent') ||
      text.includes('quick') ||
      text.includes('dying') ||
      text.includes('fast') ||
      text.includes('जल्दी') ||
      text.includes('खराब') ||
      text.includes('बर्बाद')
    ) {
      score += 15;
      reasons.push('Farmer indicated rapid spreading or crop loss danger');
    }
  }

  let priority: CasePriority = 'MEDIUM';
  if (score >= 80) {
    priority = 'URGENT';
  } else if (score >= 65) {
    priority = 'HIGH';
  } else if (score <= 40) {
    priority = 'LOW';
  }

  return {
    priority,
    score,
    reason: reasons.length > 0 ? reasons.join('; ') : 'Standard agricultural review prioritization',
  };
}

/**
 * Fetch all cases (expert view)
 */
export function getAllCases(): AgriculturalCase[] {
  return initializeCases();
}

/**
 * Fetch cases for a specific farmer (privacy boundary)
 */
export function getFarmerCases(farmerId?: string): AgriculturalCase[] {
  const all = getAllCases();
  // If specific farmerId provided, filter. Otherwise return demo-relevant cases or newly created cases
  if (farmerId) {
    return all.filter((c) => c.farmerId === farmerId || c.farmerId.startsWith('farmer-demo'));
  }
  return all;
}

/**
 * Fetch single case by ID
 */
export function getCaseById(caseId: string): AgriculturalCase | null {
  const all = getAllCases();
  return all.find((c) => c.id === caseId) || null;
}

/**
 * Create a new Case from an existing Diagnosis Result (from Ask an Expert flow)
 */
export function createCaseFromDiagnosis(params: {
  diagnosis: DiagnosisResult;
  farmerId?: string;
  farmerName?: string;
  farmId?: string;
  farmName?: string;
  fieldId?: string;
  fieldName?: string;
  farmerMessage?: string;
  weatherSummary?: {
    temperature?: number;
    humidity?: number;
    condition?: string;
    rainfall?: number;
    riskSummary?: string;
  };
  fieldRisk?: {
    diseaseRisk?: string;
    pestRisk?: string;
    weatherStress?: string;
  };
  isOffline?: boolean;
}): AgriculturalCase {
  const { diagnosis } = params;
  const isOffline = Boolean(params.isOffline);
  const caseId = isOffline ? generateLocalCaseId() : generateCaseId();
  const farmerName = params.farmerName || 'Farmer';
  const farmerId = params.farmerId || 'current-farmer';

  const priorityCalc = calculateCasePriority({
    severity: diagnosis.severity,
    confidence: diagnosis.confidence,
    progressionRisk: diagnosis.progressionRisk,
    farmerMessage: params.farmerMessage,
    weatherRisk: params.weatherSummary?.riskSummary,
    affectedArea: diagnosis.affectedAreaEstimate,
  });

  const now = Date.now();
  const newCase: AgriculturalCase = {
    id: caseId,
    farmerId,
    farmerName,
    farmId: params.farmId,
    farmName: params.farmName,
    fieldId: params.fieldId,
    fieldName: params.fieldName,
    crop: diagnosis.crop,
    cropHindi: diagnosis.cropHindi,
    primaryImageUri: diagnosis.imageUri,
    farmerMessage: params.farmerMessage,
    priority: priorityCalc.priority,
    priorityScore: priorityCalc.score,
    priorityReason: priorityCalc.reason,
    status: params.isOffline ? 'DRAFT' : 'QUEUED',
    verificationStatus: 'EXPERT_REVIEW_REQUESTED',
    createdAt: now,
    updatedAt: now,
    submittedAt: now,
    isDemo: false,
    offlineSyncStatus: params.isOffline ? 'WAITING_FOR_CONNECTION' : 'SYNCED',
    aiAssessment: {
      diagnosisId: diagnosis.id,
      crop: diagnosis.crop,
      cropHindi: diagnosis.cropHindi,
      problemType: diagnosis.problemType,
      diagnosis: diagnosis.diagnosis,
      diagnosisHindi: diagnosis.diagnosisHindi,
      confidence: diagnosis.confidence,
      severity: diagnosis.severity,
      affectedAreaEstimate: diagnosis.affectedAreaEstimate,
      symptoms: diagnosis.symptoms || [],
      possibleCauses: diagnosis.possibleCauses,
      secondaryConditions: diagnosis.secondaryConditions?.map((sc) => ({
        name: sc.name,
        confidence: sc.confidence,
      })),
      imageQualityScore: diagnosis.evidence ? 85 : 75,
      ipmAdvisory: {
        immediateAction: diagnosis.ipmAdvisory?.immediateAction || [],
        monitoring: diagnosis.ipmAdvisory?.monitoring || [],
        prevention: diagnosis.ipmAdvisory?.prevention || [],
        biologicalCulturalControls: diagnosis.ipmAdvisory?.biologicalCulturalControls || [],
        chemicalControlNotice:
          diagnosis.ipmAdvisory?.chemicalControlNotice ||
          'Chemical guidance requires verified local agricultural information.',
        whenToContactExpert:
          diagnosis.ipmAdvisory?.whenToContactExpert || 'When symptoms spread rapidly.',
      },
    },
    weatherContextSummary: params.weatherSummary,
    fieldRiskContext: params.fieldRisk,
    timeline: [
      {
        id: `tl-${now}-1`,
        timestamp: now,
        actor: 'farmer',
        actorName: farmerName,
        type: 'CASE_CREATED',
        title: 'Case Created & Submitted',
        titleHi: 'मामला बनाया गया व भेजा गया',
        description: `Submitted ${diagnosis.crop} case for agronomist verification.`,
      },
      {
        id: `tl-${now}-2`,
        timestamp: now,
        actor: 'ai',
        actorName: 'Krishi Mentor AI',
        type: 'AI_ANALYZED',
        title: `AI Assessment: ${diagnosis.diagnosis} (${Math.round(diagnosis.confidence * 100)}%)`,
        titleHi: `AI निष्कर्ष: ${diagnosis.diagnosisHindi || diagnosis.diagnosis}`,
        description: `Identified with ${diagnosis.severity} severity. Priority: ${priorityCalc.priority}.`,
      },
    ],
    auditTrail: [
      {
        id: `aud-${now}-1`,
        caseId,
        timestamp: now,
        action: 'CASE_CREATED',
        actor: farmerName,
        actorRole: 'FARMER',
        details: { crop: diagnosis.crop, priority: priorityCalc.priority },
      },
    ],
  };

  const all = getAllCases();
  all.unshift(newCase);
  saveCases(all);

  // If created while offline, save to local IndexedDB repository and enqueue for sync
  if (isOffline) {
    saveLocalCase({
      ...newCase,
      localId: caseId,
      syncStatus: 'PENDING_SYNC',
      isOfflineDraft: true,
    }).catch(console.error);

    addQueueItem({
      queueId: `queue-${Date.now()}-${caseId}`,
      entityType: 'CASE',
      entityId: caseId,
      localId: caseId,
      operation: 'CREATE',
      priority: priorityCalc.priority === 'URGENT' ? 'CRITICAL' : 'HIGH',
      clientRequestId: `req-case-${caseId}`,
      payload: newCase,
      createdAt: now,
      updatedAt: now,
      retryCount: 0,
      maxRetries: 4,
      status: 'PENDING',
    }).catch(console.error);
  }

  recordAuditEvent(caseId, 'CASE_SUBMITTED', farmerName, 'FARMER', {
    crop: diagnosis.crop,
    priority: priorityCalc.priority,
  });

  // Create notifications for agronomists
  createNotification({
    recipientRole: 'EXPERT',
    recipientId: 'all-experts',
    caseId,
    title: `New Case: ${diagnosis.crop} (${priorityCalc.priority})`,
    titleHi: `नया मामला: ${diagnosis.cropHindi || diagnosis.crop} (${priorityCalc.priority})`,
    message: `${farmerName} requested verification for ${diagnosis.diagnosis}.`,
    messageHi: `${farmerName} ने ${diagnosis.diagnosisHindi || diagnosis.diagnosis} के सत्यापन हेतु अनुरोध किया है।`,
    type: 'NEW_CASE',
  });

  return newCase;
}

/**
 * 1. EXPERT CONFIRMS AI DIAGNOSIS
 */
export function expertConfirmDiagnosis(params: {
  caseId: string;
  expertId?: string;
  additionalObservations?: string;
  internalNotes?: string;
  customRecommendedActions?: string[];
  followUpInstructions?: string;
  aiFeedback?: ExpertAIFeedback;
  dataQualityFlag?: DataQualityFlag;
}): AgriculturalCase {
  const all = getAllCases();
  const current = all.find((c) => c.id === params.caseId);
  if (!current) throw new Error('Case not found');

  const expert = getActiveExpertProfile();
  const now = Date.now();

  const recommended =
    params.customRecommendedActions && params.customRecommendedActions.length > 0
      ? params.customRecommendedActions
      : current.aiAssessment.ipmAdvisory.immediateAction;

  current.expertAssessment = {
    expertId: expert.id,
    expertName: expert.name,
    expertTitle: expert.title,
    decision: 'CONFIRM',
    verifiedDiagnosis: current.aiAssessment.diagnosis,
    verifiedDiagnosisHindi: current.aiAssessment.diagnosisHindi,
    verifiedProblemType: current.aiAssessment.problemType,
    verifiedSeverity: current.aiAssessment.severity,
    expertConfidence: 'DEFINITIVE',
    isCorrected: false,
    originalAIDiagnosis: current.aiAssessment.diagnosis,
    additionalObservations: params.additionalObservations,
    internalNotes: params.internalNotes,
    farmerVisibleResponse: {
      assessmentSummary: `Verified by Expert: ${current.aiAssessment.diagnosis}`,
      explanation:
        params.additionalObservations ||
        `Verified by ${expert.name} (${expert.title}). Symptoms match the identified condition.`,
      recommendedActions: recommended,
      followUpInstructions:
        params.followUpInstructions || 'Observe crop response in 3-5 days. Continue preventative IPM measures.',
      chemicalGuidanceNotice:
        'Chemical protection requires verified application protocols as prescribed by your local KVK or extension officer.',
    },
    aiFeedback: params.aiFeedback || 'AI_CORRECT',
    dataQualityFlag: params.dataQualityFlag || 'VERIFIED_HIGH_QUALITY',
    reviewedAt: now,
  };

  current.status = 'VERIFIED';
  current.verificationStatus = 'EXPERT_VERIFIED';
  current.assignedExpertId = expert.id;
  current.assignedExpertName = expert.name;
  current.reviewedAt = now;
  current.updatedAt = now;

  current.timeline.push({
    id: `tl-${now}-conf`,
    timestamp: now,
    actor: 'expert',
    actorName: expert.name,
    type: 'EXPERT_CONFIRMED',
    title: `Expert Verified: ${current.aiAssessment.diagnosis}`,
    titleHi: `विशेषज्ञ सत्यापन: ${current.aiAssessment.diagnosisHindi || current.aiAssessment.diagnosis} प्रमाणित`,
    description: `${expert.name} confirmed the AI assessment and issued verified guidance.`,
  });

  saveCases(all);

  recordAuditEvent(params.caseId, 'EXPERT_VERIFIED', expert.name, 'EXPERT', {
    decision: 'CONFIRM',
    qualityFlag: current.expertAssessment.dataQualityFlag,
  });

  createNotification({
    recipientRole: 'FARMER',
    recipientId: current.farmerId,
    caseId: current.id,
    title: `Case Verified: ${current.crop}`,
    titleHi: `मामला सत्यापित: ${current.cropHindi || current.crop}`,
    message: `${expert.name} has verified your diagnosis. Tap to see verified guidance.`,
    messageHi: `${expert.name} ने आपकी जांच को सत्यापित कर दिया है। मार्गदर्शिका देखें।`,
    type: 'EXPERT_VERIFIED',
  });

  return current;
}

/**
 * 2. EXPERT CORRECTS AI DIAGNOSIS
 * Stores both AI Assessment and Expert Correction. NEVER overwrites original AI result.
 */
export function expertCorrectDiagnosis(params: {
  caseId: string;
  expertId?: string;
  correctedProblemType: string;
  correctedDiagnosis: string;
  correctedDiagnosisHindi?: string;
  correctedSeverity: string;
  expertConfidence: 'LOW' | 'MODERATE' | 'HIGH' | 'DEFINITIVE';
  correctionReason: string;
  recommendedActions: string[];
  followUpInstructions?: string;
  internalNotes?: string;
  aiFeedback?: ExpertAIFeedback;
  dataQualityFlag?: DataQualityFlag;
}): AgriculturalCase {
  const all = getAllCases();
  const current = all.find((c) => c.id === params.caseId);
  if (!current) throw new Error('Case not found');

  const expert = getActiveExpertProfile();
  const now = Date.now();

  current.expertAssessment = {
    expertId: expert.id,
    expertName: expert.name,
    expertTitle: expert.title,
    decision: 'CORRECT',
    verifiedDiagnosis: params.correctedDiagnosis,
    verifiedDiagnosisHindi: params.correctedDiagnosisHindi,
    verifiedProblemType: params.correctedProblemType,
    verifiedSeverity: params.correctedSeverity,
    expertConfidence: params.expertConfidence,
    isCorrected: true,
    originalAIDiagnosis: current.aiAssessment.diagnosis,
    correctionReason: params.correctionReason,
    internalNotes: params.internalNotes,
    farmerVisibleResponse: {
      assessmentSummary: `Expert Correction: ${params.correctedDiagnosis}`,
      explanation: params.correctionReason,
      recommendedActions: params.recommendedActions,
      followUpInstructions:
        params.followUpInstructions ||
        'Follow corrected intervention steps and monitor new shoots after 72 hours.',
      chemicalGuidanceNotice:
        'Chemical intervention: Consult your local KVK or extension officer for registered spray recommendations.',
    },
    aiFeedback: params.aiFeedback || 'AI_INCORRECT',
    dataQualityFlag: params.dataQualityFlag || 'VERIFIED_HIGH_QUALITY',
    reviewedAt: now,
  };

  current.status = 'CORRECTED';
  current.verificationStatus = 'EXPERT_CORRECTED';
  current.assignedExpertId = expert.id;
  current.assignedExpertName = expert.name;
  current.reviewedAt = now;
  current.updatedAt = now;

  current.timeline.push({
    id: `tl-${now}-corr`,
    timestamp: now,
    actor: 'expert',
    actorName: expert.name,
    type: 'EXPERT_CORRECTED',
    title: `Expert Corrected: ${params.correctedDiagnosis}`,
    titleHi: `विशेषज्ञ सुधार: ${params.correctedDiagnosisHindi || params.correctedDiagnosis} निर्धारित`,
    description: `Corrected from AI assessment (${current.aiAssessment.diagnosis}). Reason: ${params.correctionReason}`,
  });

  saveCases(all);

  recordAuditEvent(params.caseId, 'EXPERT_CORRECTED', expert.name, 'EXPERT', {
    originalAI: current.aiAssessment.diagnosis,
    correctedTo: params.correctedDiagnosis,
    reason: params.correctionReason,
  });

  createNotification({
    recipientRole: 'FARMER',
    recipientId: current.farmerId,
    caseId: current.id,
    title: `Diagnosis Corrected: ${current.crop}`,
    titleHi: `सटीक पहचान: ${current.cropHindi || current.crop}`,
    message: `${expert.name} identified ${params.correctedDiagnosis}. Tap to view updated instructions.`,
    messageHi: `${expert.name} ने सही रोग की पहचान कर नई सलाह जारी की है।`,
    type: 'EXPERT_VERIFIED',
  });

  return current;
}

/**
 * 3. EXPERT UNCERTAINTY / UNABLE TO CONFIRM
 */
export function expertMarkUncertain(params: {
  caseId: string;
  uncertaintyReason: string;
  recommendedNextSteps: string[];
  internalNotes?: string;
}): AgriculturalCase {
  const all = getAllCases();
  const current = all.find((c) => c.id === params.caseId);
  if (!current) throw new Error('Case not found');

  const expert = getActiveExpertProfile();
  const now = Date.now();

  current.expertAssessment = {
    expertId: expert.id,
    expertName: expert.name,
    expertTitle: expert.title,
    decision: 'UNCERTAIN',
    verifiedDiagnosis: 'Unable to Confirm without In-Field Inspection',
    verifiedDiagnosisHindi: 'प्रत्यक्ष जांच के बिना पुष्टि संभव नहीं',
    verifiedProblemType: 'Unknown',
    verifiedSeverity: current.aiAssessment.severity,
    expertConfidence: 'MODERATE',
    isCorrected: false,
    originalAIDiagnosis: current.aiAssessment.diagnosis,
    uncertaintyReason: params.uncertaintyReason,
    internalNotes: params.internalNotes,
    farmerVisibleResponse: {
      assessmentSummary: 'Expert Review: In-Field Assessment Required',
      explanation: params.uncertaintyReason,
      recommendedActions: params.recommendedNextSteps,
      followUpInstructions:
        'Please bring a fresh leaf sample to your nearest Block Agricultural Officer or KVK center.',
      chemicalGuidanceNotice:
        'Do not apply synthetic pesticides until the specific pathogen is confirmed by in-field scouting.',
    },
    aiFeedback: 'IMAGE_INSUFFICIENT',
    dataQualityFlag: 'NEEDS_REVIEW',
    reviewedAt: now,
  };

  current.status = 'UNCERTAIN';
  current.verificationStatus = 'EXPERT_UNCERTAIN';
  current.assignedExpertId = expert.id;
  current.assignedExpertName = expert.name;
  current.reviewedAt = now;
  current.updatedAt = now;

  current.timeline.push({
    id: `tl-${now}-uncert`,
    timestamp: now,
    actor: 'expert',
    actorName: expert.name,
    type: 'EXPERT_UNCERTAIN',
    title: 'Expert Verdict: In-Field Inspection Needed',
    titleHi: 'विशेषज्ञ निष्कर्ष: प्रत्यक्ष जांच की आवश्यकता',
    description: params.uncertaintyReason,
  });

  saveCases(all);

  recordAuditEvent(params.caseId, 'EXPERT_UNCERTAIN', expert.name, 'EXPERT', {
    reason: params.uncertaintyReason,
  });

  createNotification({
    recipientRole: 'FARMER',
    recipientId: current.farmerId,
    caseId: current.id,
    title: `Expert Advice on ${current.crop}`,
    titleHi: `${current.cropHindi || current.crop} पर विशेषज्ञ सुझाव`,
    message: `${expert.name} recommends an in-field physical check. Tap to read details.`,
    messageHi: `${expert.name} ने विस्तृत जांच की सलाह दी है।`,
    type: 'STATUS_CHANGED',
  });

  return current;
}

/**
 * 4. EXPERT REQUESTS MORE INFORMATION FROM FARMER
 */
export function expertRequestInfo(params: {
  caseId: string;
  requestType: InfoRequestType;
  message: string;
  internalNotes?: string;
}): AgriculturalCase {
  const all = getAllCases();
  const current = all.find((c) => c.id === params.caseId);
  if (!current) throw new Error('Case not found');

  const expert = getActiveExpertProfile();
  const now = Date.now();

  current.infoRequest = {
    id: `req-${now}`,
    requestType: params.requestType,
    message: params.message,
    requestedAt: now,
    status: 'PENDING',
  };

  current.status = 'WAITING_FOR_FARMER';
  current.assignedExpertId = expert.id;
  current.assignedExpertName = expert.name;
  current.updatedAt = now;

  current.timeline.push({
    id: `tl-${now}-inforeq`,
    timestamp: now,
    actor: 'expert',
    actorName: expert.name,
    type: 'INFO_REQUESTED',
    title: 'Expert Requested Additional Details',
    titleHi: 'विशेषज्ञ ने अतिरिक्त जानकारी / फोटो मांगी',
    description: params.message,
  });

  saveCases(all);

  recordAuditEvent(params.caseId, 'INFO_REQUESTED', expert.name, 'EXPERT', {
    requestType: params.requestType,
    message: params.message,
  });

  createNotification({
    recipientRole: 'FARMER',
    recipientId: current.farmerId,
    caseId: current.id,
    title: `Photo / Info Requested: ${current.crop}`,
    titleHi: `फोटो / जानकारी की आवश्यकता: ${current.cropHindi || current.crop}`,
    message: `${expert.name} asked: "${params.message}"`,
    messageHi: `${expert.name} ने पूछा: "${params.message}"`,
    type: 'INFO_REQUESTED',
  });

  return current;
}

/**
 * 5. FARMER SUBMITS REQUESTED INFORMATION OR PHOTO
 */
export function farmerSubmitResponse(params: {
  caseId: string;
  message: string;
  imageUri?: string;
}): AgriculturalCase {
  const all = getAllCases();
  const current = all.find((c) => c.id === params.caseId);
  if (!current) throw new Error('Case not found');

  const now = Date.now();
  if (!current.farmerResponses) {
    current.farmerResponses = [];
  }

  current.farmerResponses.push({
    id: `resp-${now}`,
    requestId: current.infoRequest?.id,
    message: params.message,
    imageUri: params.imageUri,
    respondedAt: now,
  });

  if (current.infoRequest) {
    current.infoRequest.status = 'RESPONDED';
  }

  if (params.imageUri) {
    if (!current.additionalImages) current.additionalImages = [];
    current.additionalImages.push(params.imageUri);
  }

  current.status = 'IN_REVIEW';
  current.updatedAt = now;

  current.timeline.push({
    id: `tl-${now}-resp`,
    timestamp: now,
    actor: 'farmer',
    actorName: current.farmerName,
    type: 'FARMER_RESPONDED',
    title: 'Farmer Provided Requested Information',
    titleHi: 'किसान द्वारा जानकारी / फोटो भेजी गई',
    description: params.message,
    imageUri: params.imageUri,
  });

  saveCases(all);

  recordAuditEvent(params.caseId, 'FARMER_RESPONDED', current.farmerName, 'FARMER', {
    hasImage: !!params.imageUri,
  });

  createNotification({
    recipientRole: 'EXPERT',
    recipientId: current.assignedExpertId || 'all-experts',
    caseId: current.id,
    title: `Farmer Responded: ${current.crop} (${current.id})`,
    titleHi: `किसान का उत्तर प्राप्त: ${current.cropHindi || current.crop}`,
    message: `${current.farmerName} uploaded additional details for review.`,
    messageHi: `${current.farmerName} ने मांगी गई अतिरिक्त जानकारी भेजी है।`,
    type: 'FARMER_RESPONDED',
  });

  return current;
}

/**
 * 6. FARMER SUBMITS HELPFULNESS FEEDBACK
 */
export function submitFarmerFeedback(params: {
  caseId: string;
  helpful: boolean;
  solvedProblem?: 'YES' | 'PARTIALLY' | 'NO' | 'NOT_SURE';
  comment?: string;
}): AgriculturalCase {
  const all = getAllCases();
  const current = all.find((c) => c.id === params.caseId);
  if (!current) throw new Error('Case not found');

  const now = Date.now();
  current.farmerFeedback = {
    helpful: params.helpful,
    solvedProblem: params.solvedProblem,
    comment: params.comment,
    submittedAt: now,
  };
  current.updatedAt = now;

  current.timeline.push({
    id: `tl-${now}-fb`,
    timestamp: now,
    actor: 'farmer',
    actorName: current.farmerName,
    type: 'FEEDBACK_SUBMITTED',
    title: `Farmer Feedback: ${params.helpful ? 'Helpful' : 'Not Helpful'}`,
    titleHi: `किसान प्रतिक्रिया दर्ज: ${params.helpful ? 'मददगार' : 'असंतोषजनक'}`,
    description: params.comment || (params.helpful ? 'Guidance was helpful.' : 'Needs more clarity.'),
  });

  saveCases(all);

  recordAuditEvent(params.caseId, 'FEEDBACK_SUBMITTED', current.farmerName, 'FARMER', {
    helpful: params.helpful,
    solvedProblem: params.solvedProblem,
  });

  return current;
}

/**
 * 7. CASE CLOSURE
 */
export function closeCase(caseId: string, actorName: string, role: 'FARMER' | 'EXPERT'): AgriculturalCase {
  const all = getAllCases();
  const current = all.find((c) => c.id === caseId);
  if (!current) throw new Error('Case not found');

  const now = Date.now();
  current.status = 'CLOSED';
  current.closedAt = now;
  current.updatedAt = now;

  current.timeline.push({
    id: `tl-${now}-close`,
    timestamp: now,
    actor: role === 'FARMER' ? 'farmer' : 'expert',
    actorName,
    type: 'CASE_CLOSED',
    title: 'Case Closed',
    titleHi: 'मामला संपन्न व बंद किया गया',
    description: `Consultation concluded by ${actorName}.`,
  });

  saveCases(all);
  recordAuditEvent(caseId, 'CASE_CLOSED', actorName, role);

  return current;
}

/**
 * CALCULATE REAL EXPERT DASHBOARD STATS
 * Calculates from actual case data (no hardcoding)
 */
export function getExpertCaseStats(): {
  pendingReviews: number;
  activeCases: number;
  reviewedToday: number;
  highPriority: number;
  totalCases: number;
} {
  const all = getAllCases();
  const now = Date.now();
  const startOfToday = new Date().setHours(0, 0, 0, 0);

  const pendingReviews = all.filter(
    (c) =>
      c.status === 'QUEUED' ||
      c.status === 'SUBMITTED' ||
      c.verificationStatus === 'EXPERT_REVIEW_REQUESTED'
  ).length;

  const activeCases = all.filter(
    (c) => c.status === 'IN_REVIEW' || c.status === 'WAITING_FOR_FARMER'
  ).length;

  const reviewedToday = all.filter(
    (c) =>
      c.reviewedAt &&
      c.reviewedAt >= startOfToday &&
      (c.status === 'VERIFIED' || c.status === 'CORRECTED' || c.status === 'UNCERTAIN' || c.status === 'CLOSED')
  ).length;

  const highPriority = all.filter(
    (c) =>
      (c.priority === 'HIGH' || c.priority === 'URGENT') &&
      c.status !== 'CLOSED' &&
      c.status !== 'VERIFIED'
  ).length;

  return {
    pendingReviews,
    activeCases,
    reviewedToday,
    highPriority,
    totalCases: all.length,
  };
}
