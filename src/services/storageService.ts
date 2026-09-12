import { FarmerReport } from '../types';

const STORAGE_KEY = 'krishi_mentor_saved_reports_v1';

export function getSavedReports(): FarmerReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse saved reports:', err);
    return [];
  }
}

export function saveFarmerReport(report: FarmerReport): boolean {
  try {
    const reports = getSavedReports();
    // Avoid duplicate if same id exists
    const filtered = reports.filter((r) => r.id !== report.id);
    const updated = [report, ...filtered];
    // Keep up to 50 recent reports
    const capped = updated.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
    return true;
  } catch (err) {
    console.error('Failed to save farmer report:', err);
    return false;
  }
}

export function deleteFarmerReport(id: string): boolean {
  try {
    const reports = getSavedReports();
    const updated = reports.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error('Failed to delete report:', err);
    return false;
  }
}
