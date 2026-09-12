// Audit Service for Krishi Mentor Expert Module (Part 5)
// Records immutable audit trail of actions taken by farmers, AI, and agricultural experts

import { CaseAuditEvent, UserRole } from '../../types/expert';

const AUDIT_STORAGE_KEY = 'krishi_mentor_case_audit_v1';

export function getAuditTrailForCase(caseId: string): CaseAuditEvent[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) return [];
    const all: CaseAuditEvent[] = JSON.parse(raw);
    return all.filter((evt) => evt.caseId === caseId).sort((a, b) => a.timestamp - b.timestamp);
  } catch (err) {
    console.error('Failed to read audit trail:', err);
    return [];
  }
}

export function recordAuditEvent(
  caseId: string,
  action: string,
  actor: string,
  actorRole: UserRole,
  details?: Record<string, any>
): CaseAuditEvent {
  const event: CaseAuditEvent = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    caseId,
    timestamp: Date.now(),
    action,
    actor,
    actorRole,
    details,
  };

  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    const all: CaseAuditEvent[] = raw ? JSON.parse(raw) : [];
    all.push(event);
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to record audit event:', err);
  }

  return event;
}
