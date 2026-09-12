// Cluster Detection Foundation Service (Part 7)
// Aggregates verified cases spatio-temporally to detect potential disease/pest clusters
// Strict rule: NEVER claim a confirmed outbreak automatically. Always use "Potential cluster requiring verification".

import { ClosedLoopCase, PotentialCluster } from '../types';

const MIN_CASES_FOR_POTENTIAL_CLUSTER = 3;
const TIME_WINDOW_DAYS = 14;

/**
 * Evaluates verified cases for spatial and temporal proximity
 * Uses privacy-preserving approximate region (District / Block) - NEVER exact coordinates
 */
export function detectPotentialClusters(cases: ClosedLoopCase[]): PotentialCluster[] {
  // Only evaluate verified cases or cases escalated to extension
  const eligibleCases = cases.filter(
    (c) =>
      c.status === 'EXPERT_VERIFIED' ||
      c.status === 'EXPERT_CORRECTED' ||
      c.status === 'ESCALATED_TO_EXTENSION' ||
      c.status === 'ACTION_IN_PROGRESS' ||
      c.verificationStatus === 'EXPERT_VERIFIED' ||
      c.verificationStatus === 'EXPERT_CORRECTED'
  );

  if (eligibleCases.length === 0) {
    return [
      {
        clusterId: 'cluster-none',
        crop: 'All Crops',
        issue: 'No verified clusters',
        approximateRegion: 'Monitored Agricultural Districts',
        caseCount: 0,
        timeWindowDays: TIME_WINDOW_DAYS,
        severitySummary: 'Low',
        confidence: 0,
        evidenceCount: 0,
        status: 'INSUFFICIENT_DATA',
        detectedAt: Date.now(),
        notes: 'Not enough verified data to identify a regional trend.',
      },
    ];
  }

  // Group by: Crop + Verified Diagnosis + Approximate District
  const groups: Record<string, ClosedLoopCase[]> = {};

  for (const c of eligibleCases) {
    const crop = c.crop;
    const diagnosis =
      c.expertAssessment?.verifiedDiagnosis || c.aiAssessment.diagnosis || 'Unknown Condition';
    // Use farmName or general region string as approximate region, preserving farmer privacy
    const region = c.farmName?.includes('Punjab')
      ? 'Ludhiana District, Punjab'
      : c.farmName?.includes('Maharashtra')
      ? 'Nashik District, Maharashtra'
      : 'Northern Agricultural Zone';

    const key = `${crop}|${diagnosis}|${region}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  }

  const clusters: PotentialCluster[] = [];

  for (const key of Object.keys(groups)) {
    const list = groups[key];
    const [crop, issue, approxRegion] = key.split('|');

    // Temporal filter: check cases within TIME_WINDOW_DAYS
    const cutoff = Date.now() - TIME_WINDOW_DAYS * 24 * 3600 * 1000;
    const recentCases = list.filter((c) => c.createdAt >= cutoff);

    if (recentCases.length >= MIN_CASES_FOR_POTENTIAL_CLUSTER) {
      // Calculate severity summary
      const criticalCount = recentCases.filter(
        (c) => c.expertAssessment?.verifiedSeverity === 'Critical' || c.aiAssessment.severity === 'Critical'
      ).length;
      const highCount = recentCases.filter(
        (c) => c.expertAssessment?.verifiedSeverity === 'High' || c.aiAssessment.severity === 'High'
      ).length;

      let severitySummary = 'Moderate';
      if (criticalCount > 0) severitySummary = 'Critical';
      else if (highCount > 1) severitySummary = 'High';

      clusters.push({
        clusterId: `clust-${crop.toLowerCase()}-${recentCases.length}`,
        crop,
        issue,
        approximateRegion: approxRegion,
        caseCount: recentCases.length,
        timeWindowDays: TIME_WINDOW_DAYS,
        severitySummary,
        confidence: Math.min(0.92, 0.65 + recentCases.length * 0.06),
        evidenceCount: recentCases.reduce(
          (acc, c) => acc + 1 + (c.additionalImages?.length || 0),
          0
        ),
        status: 'POTENTIAL_CLUSTER',
        detectedAt: Date.now(),
        notes: `Potential cluster of ${issue} on ${crop} detected across ${recentCases.length} verified fields. In-field scouting verification required before official notification.`,
      });
    } else if (recentCases.length > 0) {
      clusters.push({
        clusterId: `clust-insufficient-${crop.toLowerCase()}`,
        crop,
        issue,
        approximateRegion: approxRegion,
        caseCount: recentCases.length,
        timeWindowDays: TIME_WINDOW_DAYS,
        severitySummary: 'Isolated',
        confidence: 0.4,
        evidenceCount: recentCases.length,
        status: 'INSUFFICIENT_DATA',
        detectedAt: Date.now(),
        notes: 'Not enough verified data to identify a regional trend. Case count is below the cluster detection threshold.',
      });
    }
  }

  return clusters.length > 0
    ? clusters
    : [
        {
          clusterId: 'cluster-none',
          crop: 'All Crops',
          issue: 'No verified clusters',
          approximateRegion: 'All Monitored Districts',
          caseCount: eligibleCases.length,
          timeWindowDays: TIME_WINDOW_DAYS,
          severitySummary: 'Low',
          confidence: 0.3,
          evidenceCount: eligibleCases.length,
          status: 'INSUFFICIENT_DATA',
          detectedAt: Date.now(),
          notes: 'Not enough verified data to identify a regional trend.',
        },
      ];
}
