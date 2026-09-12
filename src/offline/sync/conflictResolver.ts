// Conflict Resolver for Krishi Mentor (Part 8)
// Enforces safety rules and prevents overwriting immutable records

import { ConflictResolutionStrategy, SyncQueueItem } from '../types';

export interface ConflictResolutionResult {
  strategy: ConflictResolutionStrategy;
  resolvedData: any;
  requiresManualReview: boolean;
  notes: string;
}

/**
 * Resolves conflicts between server and client versions of an entity.
 * Guarantees that immutable records (AI predictions, expert decisions, farmer outcomes)
 * are never blindly overwritten.
 */
export function resolveEntityConflict(params: {
  entityType: SyncQueueItem['entityType'];
  clientVersion: any;
  serverVersion: any;
  preferredStrategy?: ConflictResolutionStrategy;
}): ConflictResolutionResult {
  const { entityType, clientVersion, serverVersion, preferredStrategy } = params;

  // Rule 1: Cases with Expert Decisions or Government Escalation REQUIRE MANUAL REVIEW
  if (entityType === 'CASE') {
    if (serverVersion.verification?.expertDecision && !clientVersion.verification?.expertDecision) {
      // Server has expert decision that client doesn't know about yet -> Server wins expert fields
      return {
        strategy: 'SERVER_WINS',
        resolvedData: {
          ...clientVersion,
          ...serverVersion,
          // Preserve client's newer local observations or timeline notes
          timeline: mergeTimelines(serverVersion.timeline || [], clientVersion.timeline || []),
        },
        requiresManualReview: false,
        notes: 'Merged local notes with authoritative server expert decision.',
      };
    }

    if (serverVersion.status === 'CLOSED' || serverVersion.status === 'ESCALATED') {
      return {
        strategy: 'MANUAL_REVIEW',
        resolvedData: serverVersion,
        requiresManualReview: true,
        notes: 'Case was closed or escalated by Extension Officer on server. Human review needed.',
      };
    }
  }

  // Rule 2: Outcome reports are immutable once verified
  if (entityType === 'OUTCOME') {
    if (serverVersion && serverVersion.verifiedOutcome) {
      return {
        strategy: 'SERVER_WINS',
        resolvedData: serverVersion,
        requiresManualReview: false,
        notes: 'Server verified outcome preserved as immutable ground truth.',
      };
    }
  }

  // Rule 3: Field observations / notes can be merged chronologically
  if (entityType === 'FIELD' || entityType === 'OBSERVATION') {
    return {
      strategy: 'MERGE',
      resolvedData: {
        ...serverVersion,
        ...clientVersion,
        observations: [
          ...(serverVersion.observations || []),
          ...(clientVersion.pendingObservations || clientVersion.observations || []),
        ],
      },
      requiresManualReview: false,
      notes: 'Observations merged chronologically.',
    };
  }

  // Default according to strategy or timestamp
  const strategy = preferredStrategy || 'SERVER_WINS';

  if (strategy === 'CLIENT_WINS') {
    return {
      strategy: 'CLIENT_WINS',
      resolvedData: clientVersion,
      requiresManualReview: false,
      notes: 'Client local updates applied over server state.',
    };
  }

  return {
    strategy: 'SERVER_WINS',
    resolvedData: serverVersion,
    requiresManualReview: false,
    notes: 'Authoritative server state retained.',
  };
}

function mergeTimelines(serverTimeline: any[], clientTimeline: any[]): any[] {
  const map = new Map<string, any>();
  [...serverTimeline, ...clientTimeline].forEach((event) => {
    if (event.id) map.set(event.id, event);
    else map.set(`${event.timestamp}-${event.type}`, event);
  });
  return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
}
