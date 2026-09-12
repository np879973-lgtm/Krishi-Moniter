// Dispute Handling & Second Expert Review Service (Part 7)
// Empowers farmers to formally register disputes on diagnosis or ineffective advisory
// Connects ambiguous or disputed cases to an independent Second Expert Review

import { CaseDispute, DisputeType, SecondReview } from '../types';

export function createCaseDispute(params: {
  caseId: string;
  disputedBy: string;
  disputedByName: string;
  disputeType: DisputeType;
  reason: string;
  farmerComment: string;
  followUpImageUri?: string;
}): CaseDispute {
  const now = Date.now();
  return {
    id: `disp-${now}`,
    caseId: params.caseId,
    disputedBy: params.disputedBy,
    disputedByName: params.disputedByName,
    disputedAt: now,
    disputeType: params.disputeType,
    reason: params.reason,
    farmerComment: params.farmerComment,
    followUpImageUri: params.followUpImageUri,
    status: 'OPEN',
  };
}

export function submitSecondExpertReview(params: {
  caseId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerTitle: string;
  result: 'AGREEMENT' | 'DISAGREEMENT' | 'UNCERTAIN';
  notes: string;
  recommendedAdjustment?: string;
}): SecondReview {
  const now = Date.now();
  return {
    reviewerId: params.reviewerId,
    reviewerName: params.reviewerName,
    reviewerTitle: params.reviewerTitle,
    reviewedAt: now,
    result: params.result,
    notes: params.notes,
    recommendedAdjustment: params.recommendedAdjustment,
  };
}
