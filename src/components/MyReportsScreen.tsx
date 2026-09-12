import React, { useState } from 'react';
import {
  FileText,
  Trash2,
  ChevronRight,
  Calendar,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { FarmerReport, Language, SeverityLevel } from '../types';
import { translations } from '../i18n/translations';

interface MyReportsScreenProps {
  reports: FarmerReport[];
  language: Language;
  onSelectReport: (report: FarmerReport) => void;
  onDeleteReport: (id: string) => void;
  onBackToHome: () => void;
  onStartNewDiagnosis: () => void;
}

export const MyReportsScreen: React.FC<MyReportsScreenProps> = ({
  reports,
  language,
  onSelectReport,
  onDeleteReport,
  onBackToHome,
  onStartNewDiagnosis,
}) => {
  const t = translations[language];
  const [deleteIdConfirm, setDeleteIdConfirm] = useState<string | null>(null);

  const formatReportDate = (timestamp: number) => {
    const reportDate = new Date(timestamp);
    const today = new Date();
    const isToday =
      reportDate.getDate() === today.getDate() &&
      reportDate.getMonth() === today.getMonth() &&
      reportDate.getFullYear() === today.getFullYear();

    if (isToday) return t.today;

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isYesterday =
      reportDate.getDate() === yesterday.getDate() &&
      reportDate.getMonth() === yesterday.getMonth() &&
      reportDate.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return t.yesterday;

    return reportDate.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getSeverityBadge = (severity: SeverityLevel) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Moderate':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          id="reports-back-btn"
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-stone-700 hover:text-stone-900 bg-white border border-stone-200 px-3 py-1.5 rounded-lg text-sm font-medium shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToHome}</span>
        </button>

        <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
          {reports.length} {reports.length === 1 ? 'Report' : 'Reports'}
        </span>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 leading-snug">
          {t.myReports}
        </h2>
        <p className="text-stone-600 text-sm mt-1">
          {language === 'hi'
            ? 'आपके द्वारा जांचे गए पौधों और फसलों का इतिहास'
            : 'Your saved crop health assessments and IPM advisories'}
        </p>
      </div>

      {reports.length === 0 ? (
        /* Empty state */
        <div className="bg-white border-2 border-dashed border-stone-300 rounded-3xl p-8 text-center my-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-1">
            {t.noReportsTitle}
          </h3>
          <p className="text-stone-600 text-sm max-w-md mx-auto mb-6">
            {t.noReportsDesc}
          </p>
          <button
            id="empty-reports-start-btn"
            onClick={onStartNewDiagnosis}
            className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-sm transition inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{t.checkMyCrop}</span>
          </button>
        </div>
      ) : (
        /* Reports list */
        <div className="space-y-3.5">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white border border-stone-200 hover:border-emerald-500 rounded-2xl p-4 shadow-xs transition group relative"
            >
              <div className="flex items-start gap-3.5">
                {/* Thumbnail */}
                <div
                  onClick={() => onSelectReport(report)}
                  className="w-20 h-20 rounded-xl overflow-hidden bg-stone-900 shrink-0 cursor-pointer relative"
                >
                  <img
                    src={report.imageUri}
                    alt={report.crop}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <span className="absolute bottom-1 right-1 text-[9px] bg-stone-950/80 text-white font-bold px-1 rounded">
                    {Math.round(report.confidence * 100)}%
                  </span>
                </div>

                {/* Details */}
                <div
                  onClick={() => onSelectReport(report)}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {report.crop}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getSeverityBadge(
                        report.severity
                      )}`}
                    >
                      {report.severity}
                    </span>
                    <span className="text-[11px] text-stone-400 ml-auto flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatReportDate(report.timestamp)}
                    </span>
                  </div>

                  <h4 className="font-bold text-stone-900 text-base leading-snug group-hover:text-emerald-700 transition truncate">
                    {language === 'hi' && report.diagnosisHindi
                      ? report.diagnosisHindi
                      : `Possible ${report.diagnosis}`}
                  </h4>

                  <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                    {report.ipmAdvisory.immediateAction[0] || 'Field scouting and monitoring recommended.'}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  id={`delete-report-${report.id}`}
                  onClick={() => setDeleteIdConfirm(report.id)}
                  className="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-50 transition shrink-0"
                  title={t.deleteReport}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Confirm Delete Banner */}
              {deleteIdConfirm === report.id && (
                <div className="mt-3 pt-3 border-t border-stone-200 flex items-center justify-between bg-red-50/80 p-2.5 rounded-xl text-xs text-red-900">
                  <span>{t.confirmDelete}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onDeleteReport(report.id);
                        setDeleteIdConfirm(null);
                      }}
                      className="px-2.5 py-1 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition text-[11px]"
                    >
                      {language === 'hi' ? 'हाँ, हटाएं' : 'Yes, Delete'}
                    </button>
                    <button
                      onClick={() => setDeleteIdConfirm(null)}
                      className="px-2 py-1 bg-white text-stone-700 font-medium rounded-lg border border-stone-300 hover:bg-stone-50 transition text-[11px]"
                    >
                      {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
