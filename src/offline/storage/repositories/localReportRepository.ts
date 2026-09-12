// Local Report Repository for Krishi Mentor (Part 8)
import { FarmerReport } from '../../../types';
import { EntitySyncStatus } from '../../types';
import {
  getAllItems,
  getItem,
  putItem,
  deleteItem,
  countItems,
} from '../offlineStorage';

const STORE = 'reports';

export interface LocalReportRecord extends FarmerReport {
  syncStatus?: EntitySyncStatus;
  lastSyncedAt?: number;
}

export async function saveLocalReport(report: LocalReportRecord): Promise<void> {
  await putItem<LocalReportRecord>(STORE, report);
}

export async function getLocalReport(reportId: string): Promise<LocalReportRecord | null> {
  return getItem<LocalReportRecord>(STORE, reportId);
}

export async function getAllLocalReports(): Promise<LocalReportRecord[]> {
  return getAllItems<LocalReportRecord>(STORE);
}

export async function deleteLocalReport(reportId: string): Promise<void> {
  await deleteItem(STORE, reportId);
}

export async function countLocalReports(): Promise<number> {
  return countItems(STORE);
}
