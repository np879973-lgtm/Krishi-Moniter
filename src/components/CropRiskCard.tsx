// Crop Risk Outlook Card for Krishi Mentor Dashboard
// Provides an immediate, glanceable summary of agricultural risk over the next 48-72 hours

import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Bug,
  Activity,
  CloudLightning,
  ArrowRight,
  Droplets,
  CheckCircle2,
  Info,
  Calendar,
} from 'lucide-react';
import { RiskAssessment, RiskLevel } from '../types/risk';
import { Language } from '../types';

interface CropRiskCardProps {
  assessment: RiskAssessment | null;
  onViewDetails: () => void;
  language: Language;
}

export const CropRiskCard: React.FC<CropRiskCardProps> = ({
  assessment,
  onViewDetails,
  language,
}) => {
  const isHi = language === 'hi';

  if (!assessment) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm animate-pulse">
        <div className="h-4 bg-stone-200 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-stone-200 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-stone-200 rounded w-1/2"></div>
      </div>
    );
  }

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'VERY_HIGH':
        return {
          bg: 'bg-rose-100 border-rose-300 text-rose-900',
          indicator: 'bg-rose-600',
          label: isHi ? 'अति-गंभीर जोखिम' : 'Very High Risk',
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-100 border-amber-300 text-amber-900',
          indicator: 'bg-amber-600',
          label: isHi ? 'उच्च जोखिम' : 'High Risk',
        };
      case 'MODERATE':
        return {
          bg: 'bg-yellow-100 border-yellow-300 text-yellow-900',
          indicator: 'bg-yellow-500',
          label: isHi ? 'मध्यम जोखिम' : 'Moderate Risk',
        };
      case 'LOW':
        return {
          bg: 'bg-emerald-100 border-emerald-300 text-emerald-900',
          indicator: 'bg-emerald-600',
          label: isHi ? 'कम जोखिम (अनुकूल)' : 'Low Risk (Safe)',
        };
      default:
        return {
          bg: 'bg-stone-100 border-stone-300 text-stone-700',
          indicator: 'bg-stone-400',
          label: isHi ? 'अज्ञात' : 'Unknown',
        };
    }
  };

  const overallBadge = getRiskBadge(assessment.riskLevel);
  const diseaseBadge = getRiskBadge(assessment.diseaseRisk);
  const pestBadge = getRiskBadge(assessment.pestRisk);
  const weatherBadge = getRiskBadge(assessment.weatherStress);

  const primaryAlert = assessment.alerts[0];

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden transition hover:shadow-md">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-stone-900 to-stone-800 text-white">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-300">
              {isHi ? 'फसल जोखिम दृष्टिकोण (अगले 48–72 घंटे)' : 'Crop Risk Outlook (Next 48–72 Hours)'}
            </span>
          </div>

          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${overallBadge.bg}`}
          >
            <span className={`w-2 h-2 rounded-full mr-1.5 ${overallBadge.indicator}`}></span>
            {overallBadge.label}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {assessment.crop} {assessment.cropHindi && `(${assessment.cropHindi})`}
            </h3>
            <p className="text-xs text-stone-300 mt-0.5">
              {isHi ? 'स्थान:' : 'Location:'} {assessment.location.displayName}
            </p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black text-emerald-400 leading-none">
              {assessment.riskScore}
              <span className="text-xs font-normal text-stone-400">/100</span>
            </div>
            <p className="text-[10px] text-stone-400 mt-0.5">
              {isHi ? 'जोखिम सूचकांक' : 'Risk Index'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 sm:p-6 space-y-5">
        {/* Urgent Alert if available */}
        {primaryAlert && (
          <div
            className={`p-3.5 rounded-2xl border flex items-start space-x-3 ${
              primaryAlert.severity === 'critical'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
            <div className="text-xs">
              <p className="font-bold text-sm">
                {isHi ? primaryAlert.titleHi : primaryAlert.title}
              </p>
              <p className="mt-0.5 opacity-90">
                {isHi ? primaryAlert.messageHi : primaryAlert.message}
              </p>
            </div>
          </div>
        )}

        {/* 3 Core Factors Grid */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
          {/* Disease Risk */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
            <div className="w-8 h-8 mx-auto rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-1.5">
              <Activity className="w-4 h-4 text-rose-700" />
            </div>
            <p className="text-[11px] font-bold text-stone-600 uppercase tracking-tight">
              {isHi ? 'रोग जोखिम' : 'Disease Risk'}
            </p>
            <p className={`text-xs font-black mt-1 ${diseaseBadge.indicator.replace('bg-', 'text-')}`}>
              {diseaseBadge.label.split(' ')[0]}
            </p>
          </div>

          {/* Pest Risk */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
            <div className="w-8 h-8 mx-auto rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-1.5">
              <Bug className="w-4 h-4 text-amber-700" />
            </div>
            <p className="text-[11px] font-bold text-stone-600 uppercase tracking-tight">
              {isHi ? 'कीट जोखिम' : 'Pest Risk'}
            </p>
            <p className={`text-xs font-black mt-1 ${pestBadge.indicator.replace('bg-', 'text-')}`}>
              {pestBadge.label.split(' ')[0]}
            </p>
          </div>

          {/* Weather Stress */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
            <div className="w-8 h-8 mx-auto rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center mb-1.5">
              <CloudLightning className="w-4 h-4 text-sky-700" />
            </div>
            <p className="text-[11px] font-bold text-stone-600 uppercase tracking-tight">
              {isHi ? 'मौसम तनाव' : 'Weather Stress'}
            </p>
            <p className={`text-xs font-black mt-1 ${weatherBadge.indicator.replace('bg-', 'text-')}`}>
              {weatherBadge.label.split(' ')[0]}
            </p>
          </div>
        </div>

        {/* What To Do Now */}
        <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200">
          <div className="flex items-center space-x-2 text-emerald-900 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {isHi ? 'किसान तुरंत क्या करें (WHAT TO DO NOW):' : 'What To Do Now:'}
            </span>
          </div>
          <p className="text-sm font-semibold text-emerald-950 pl-6">
            "{isHi ? assessment.whatToDoNowHi : assessment.whatToDoNow}"
          </p>
        </div>

        {/* Diagnosis link banner if connected */}
        {assessment.isDiagnosisConnected && (
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs text-stone-600">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                {isHi ? 'सक्रिय निदान से जुड़ा:' : 'Integrated with diagnosis:'}{' '}
                <strong className="text-stone-800">{assessment.diagnosisTitle}</strong>
              </span>
            </div>
            <span className="text-[11px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded-md font-medium">
              {assessment.diagnosisSeverity}
            </span>
          </div>
        )}

        {/* Action Button */}
        <button
          id="view-full-risk-forecast-btn"
          onClick={onViewDetails}
          className="w-full py-3.5 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-sm transition group cursor-pointer"
        >
          <span>{isHi ? 'विस्तृत जोखिम पूर्वानुमान व सलाह देखें' : 'View Full Risk Forecast & Timeline'}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
