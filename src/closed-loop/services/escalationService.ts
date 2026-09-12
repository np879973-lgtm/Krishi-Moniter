// Escalation Service to Government / Extension (Part 7)
// Empowers agronomists to escalate high-risk or community-impacting cases to district extension officers

import {
  ClosedLoopCase,
  EscalationReason,
  EscalationRecord,
  CasePriority,
} from '../types';

export function createEscalationRecord(params: {
  caseId: string;
  escalatedBy: string;
  escalatedByName: string;
  reason: EscalationReason;
  priority: CasePriority;
  problemCategory: string;
  recommendedAction: string;
  additionalNotes: string;
  supportingEvidence?: string[];
}): EscalationRecord {
  const now = Date.now();
  return {
    id: `esc-${now}`,
    caseId: params.caseId,
    escalatedBy: params.escalatedBy,
    escalatedByName: params.escalatedByName,
    escalatedByRole: 'EXPERT',
    escalatedAt: now,
    reason: params.reason,
    priority: params.priority,
    problemCategory: params.problemCategory,
    recommendedAction: params.recommendedAction,
    additionalNotes: params.additionalNotes,
    supportingEvidence: params.supportingEvidence || [],
    status: 'SUBMITTED',
  };
}

export function getEscalationReasonLabel(reason: EscalationReason, language: string = 'en'): string {
  const isHi = language === 'hi';
  switch (reason) {
    case 'SERIOUS_CROP_DAMAGE':
      return isHi ? 'फसल का गंभीर नुकसान (>40%)' : 'Serious Crop Damage (>40%)';
    case 'HIGH_RISK_OUTBREAK':
      return isHi ? 'संभावित क्षेत्रीय फैलाव (सत्यापन आवश्यक)' : 'Potential Cluster Requiring Verification';
    case 'COMMUNITY_IMPACT':
      return isHi ? 'सामुदायिक / बहु-खेत प्रभाव' : 'Community / Multi-Farm Impact';
    case 'REPEATED_FAILURE':
      return isHi ? 'उपचार की विफलता' : 'Repeated Treatment Inefficacy';
    case 'UNUSUAL_SYMPTOMS':
      return isHi ? 'असामान्य / अज्ञात लक्षण' : 'Unusual / Atypical Symptoms';
    case 'POSSIBLE_EMERGING_PEST':
      return isHi ? 'संभावित नया कीट / खरपतवार' : 'Possible Emerging Pest / Pathogen';
    case 'FARMER_NEEDS_FIELD_SUPPORT':
      return isHi ? 'किसान को प्रत्यक्ष खेत सहायता चाहिए' : 'Farmer Needs Direct In-Field Support';
    case 'OTHER':
      return isHi ? 'अन्य विशेष कारण' : 'Other Extension Assistance';
  }
}
