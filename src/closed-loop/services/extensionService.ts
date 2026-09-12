// Government & Extension Support Service (Part 7)
// Manages Extension Actions, Field Visits, Sample Requests, and Farmer ↔ Government Communication

import {
  ExtensionAction,
  ExtensionActionStatus,
  ExtensionActionType,
  FieldVisit,
  SampleRequest,
  SampleRequestType,
  CasePriority,
} from '../types';

export function createExtensionAction(params: {
  caseId: string;
  actionType: ExtensionActionType;
  title: string;
  description: string;
  priority: CasePriority;
  assignedTo: string;
  assignedToName: string;
  dueDateDays?: number;
  createdBy: string;
  createdByName: string;
}): ExtensionAction {
  const now = Date.now();
  const due = now + (params.dueDateDays || 3) * 24 * 3600 * 1000;
  return {
    id: `act-${now}`,
    caseId: params.caseId,
    actionType: params.actionType,
    title: params.title,
    description: params.description,
    priority: params.priority,
    assignedTo: params.assignedTo,
    assignedToName: params.assignedToName,
    createdBy: params.createdBy,
    createdByName: params.createdByName,
    createdAt: now,
    dueDate: due,
    status: 'ASSIGNED',
  };
}

export function completeExtensionAction(
  action: ExtensionAction,
  completionNotes: string,
  evidencePhotos?: string[]
): ExtensionAction {
  return {
    ...action,
    status: 'COMPLETED',
    completionNotes,
    evidencePhotos: evidencePhotos || [],
    completedAt: Date.now(),
  };
}

export function scheduleFieldVisit(params: {
  caseId: string;
  farmerName: string;
  farmName?: string;
  fieldName?: string;
  purpose: string;
  priority: CasePriority;
  scheduledDate: string;
  notes?: string;
  assignedOfficerId: string;
  assignedOfficerName: string;
}): FieldVisit {
  const now = Date.now();
  return {
    id: `fv-${now}`,
    caseId: params.caseId,
    farmerName: params.farmerName,
    farmName: params.farmName,
    fieldName: params.fieldName,
    purpose: params.purpose,
    priority: params.priority,
    scheduledDate: params.scheduledDate,
    notes: params.notes,
    assignedOfficerId: params.assignedOfficerId,
    assignedOfficerName: params.assignedOfficerName,
    status: 'SCHEDULED',
  };
}

export function completeFieldVisit(
  visit: FieldVisit,
  report: {
    observations: string;
    photographs?: string[];
    symptomsIdentified?: string[];
    pestPresence?: string;
    severity?: string;
    farmerStatement?: string;
    recommendedAction?: string;
    outcome?: string;
  }
): FieldVisit {
  return {
    ...visit,
    status: 'COMPLETED',
    completedAt: Date.now(),
    observations: report.observations,
    photographs: report.photographs || [],
    symptomsIdentified: report.symptomsIdentified || [],
    pestPresence: report.pestPresence,
    severity: report.severity,
    farmerStatement: report.farmerStatement,
    recommendedAction: report.recommendedAction,
    outcome: report.outcome,
  };
}

export function createSampleRequest(params: {
  caseId: string;
  sampleType: SampleRequestType;
  requestedBy: string;
  requestedByName: string;
  labNotes?: string;
}): SampleRequest {
  const now = Date.now();
  return {
    id: `smp-${now}`,
    caseId: params.caseId,
    sampleType: params.sampleType,
    status: 'REQUESTED',
    requestedBy: params.requestedBy,
    requestedByName: params.requestedByName,
    requestedAt: now,
    labResultAvailable: false,
    labResultSummary: 'Laboratory result not available.',
    labNotes: params.labNotes || 'Sent to State Agricultural University / ICAR lab for pathogen culturing.',
  };
}
