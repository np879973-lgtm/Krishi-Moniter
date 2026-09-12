// Local Storage Service for Farmer Risk History
// Safely stores past risk assessments so farmers can review progression and trends

import { RiskAssessment, FarmerRiskHistoryItem } from '../../types/risk';

const STORAGE_KEY = 'krishi_mentor_risk_history';
const MAX_SAVED_ITEMS = 25;

export function getRiskHistory(): FarmerRiskHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw) as FarmerRiskHistoryItem[];
    return Array.isArray(items) ? items : [];
  } catch (err) {
    console.warn('Error reading risk history:', err);
    return [];
  }
}

export function saveRiskAssessment(assessment: RiskAssessment): FarmerRiskHistoryItem {
  const history = getRiskHistory();

  const formattedDate = new Date(assessment.timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const historyItem: FarmerRiskHistoryItem = {
    id: assessment.id,
    dateFormatted: formattedDate,
    timestamp: assessment.timestamp,
    crop: assessment.crop,
    cropHindi: assessment.cropHindi,
    locationName: assessment.location.displayName || `${assessment.location.district}, ${assessment.location.state}`,
    diseaseRisk: assessment.diseaseRisk,
    pestRisk: assessment.pestRisk,
    weatherStress: assessment.weatherStress,
    overallRisk: assessment.riskLevel,
    riskScore: assessment.riskScore,
    confidence: assessment.confidence,
    diagnosisTitle: assessment.diagnosisTitle,
    primaryAlert: assessment.alerts[0]?.title,
    whatToDoNow: assessment.whatToDoNow,
    whatToDoNowHi: assessment.whatToDoNowHi,
    assessment,
  };

  // Prepend new item and trim to MAX_SAVED_ITEMS
  const updated = [historyItem, ...history.filter((h) => h.id !== assessment.id)].slice(0, MAX_SAVED_ITEMS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Error saving risk assessment to localStorage:', err);
  }

  return historyItem;
}

export function deleteRiskHistoryItem(id: string): void {
  try {
    const history = getRiskHistory();
    const updated = history.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Error deleting risk history item:', err);
  }
}

export function clearRiskHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Error clearing risk history:', err);
  }
}
