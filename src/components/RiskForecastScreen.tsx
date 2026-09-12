// Agricultural Risk Forecasting Screen for Krishi Mentor
// Comprehensive intelligence combining: CROP + AI DIAGNOSIS + WEATHER + LOCATION

import React, { useState } from 'react';
import {
  ShieldAlert,
  ArrowLeft,
  MapPin,
  Calendar,
  AlertTriangle,
  Bug,
  Activity,
  CloudLightning,
  CheckCircle2,
  Bookmark,
  Share2,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Layers,
  History,
  Info,
  PhoneCall,
  Camera,
  Droplets,
  Wind,
  Check,
} from 'lucide-react';
import { RiskAssessment, RiskLevel, FarmerRiskHistoryItem } from '../types/risk';
import { Language } from '../types';
import { saveRiskAssessment, getRiskHistory, deleteRiskHistoryItem } from '../services/risk/riskStorageService';

interface RiskForecastScreenProps {
  assessment: RiskAssessment | null;
  onBack: () => void;
  onNavigateToCheckCrop: () => void;
  onChangeLocation: () => void;
  language: Language;
}

export const RiskForecastScreen: React.FC<RiskForecastScreenProps> = ({
  assessment,
  onBack,
  onNavigateToCheckCrop,
  onChangeLocation,
  language,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyItems, setHistoryItems] = useState<FarmerRiskHistoryItem[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<FarmerRiskHistoryItem | null>(null);

  const isHi = language === 'hi';

  if (!assessment) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p className="text-stone-600">{isHi ? 'कोई जोखिम डेटा उपलब्ध नहीं है' : 'No risk forecast available.'}</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-stone-900 text-white rounded-xl text-sm">
          {isHi ? 'डैशबोर्ड पर लौटें' : 'Back to Dashboard'}
        </button>
      </div>
    );
  }

  const activeAssessment = selectedHistoryItem ? selectedHistoryItem.assessment : assessment;

  const handleSaveAssessment = () => {
    saveRiskAssessment(activeAssessment);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleOpenHistory = () => {
    setHistoryItems(getRiskHistory());
    setShowHistoryModal(true);
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteRiskHistoryItem(id);
    setHistoryItems(getRiskHistory());
    if (selectedHistoryItem?.id === id) {
      setSelectedHistoryItem(null);
    }
  };

  const getRiskStyle = (level: RiskLevel) => {
    switch (level) {
      case 'VERY_HIGH':
        return {
          badge: 'bg-rose-100 border-rose-300 text-rose-900',
          indicator: 'bg-rose-600',
          text: 'text-rose-600',
          label: isHi ? 'अति-गंभीर जोखिम' : 'Very High Risk',
        };
      case 'HIGH':
        return {
          badge: 'bg-amber-100 border-amber-300 text-amber-900',
          indicator: 'bg-amber-600',
          text: 'text-amber-600',
          label: isHi ? 'उच्च जोखिम' : 'High Risk',
        };
      case 'MODERATE':
        return {
          badge: 'bg-yellow-100 border-yellow-300 text-yellow-900',
          indicator: 'bg-yellow-500',
          text: 'text-yellow-600',
          label: isHi ? 'मध्यम जोखिम' : 'Moderate Risk',
        };
      case 'LOW':
        return {
          badge: 'bg-emerald-100 border-emerald-300 text-emerald-900',
          indicator: 'bg-emerald-600',
          text: 'text-emerald-600',
          label: isHi ? 'कम जोखिम (सामान्य)' : 'Low Risk (Safe)',
        };
      default:
        return {
          badge: 'bg-stone-100 border-stone-300 text-stone-700',
          indicator: 'bg-stone-400',
          text: 'text-stone-500',
          label: isHi ? 'अज्ञात' : 'Unknown',
        };
    }
  };

  const overallStyle = getRiskStyle(activeAssessment.riskLevel);
  const diseaseStyle = getRiskStyle(activeAssessment.diseaseRisk);
  const pestStyle = getRiskStyle(activeAssessment.pestRisk);
  const weatherStyle = getRiskStyle(activeAssessment.weatherStress);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Top Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          id="risk-screen-back-btn"
          onClick={() => {
            if (selectedHistoryItem) {
              setSelectedHistoryItem(null);
            } else {
              onBack();
            }
          }}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-stone-600 hover:text-stone-900 px-3 py-2 rounded-xl hover:bg-stone-100 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>
            {selectedHistoryItem
              ? isHi ? 'वर्तमान पूर्वानुमान पर लौटें' : 'Return to Current Forecast'
              : isHi ? 'डैशबोर्ड पर वापस' : 'Back to Dashboard'}
          </span>
        </button>

        <div className="flex items-center space-x-2">
          {/* History Button */}
          <button
            id="open-risk-history-btn"
            onClick={handleOpenHistory}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 transition flex items-center space-x-1.5 cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-stone-500" />
            <span>{isHi ? 'पिछला इतिहास' : 'Risk History'}</span>
          </button>

          {/* Save Button */}
          <button
            id="save-risk-assessment-btn"
            onClick={handleSaveAssessment}
            className={`text-xs font-bold px-3.5 py-2 rounded-xl border flex items-center space-x-1.5 transition cursor-pointer ${
              isSaved
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                : 'bg-stone-900 text-white border-stone-900 hover:bg-stone-800'
            }`}
          >
            {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{isSaved ? (isHi ? 'सहेज लिया गया!' : 'Saved to History!') : (isHi ? 'पूर्वानुमान सहेजें' : 'Save Forecast')}</span>
          </button>
        </div>
      </div>

      {selectedHistoryItem && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
          <p>
            {isHi ? 'सहेजा गया ऐतिहासिक रिकॉर्ड देख रहे हैं:' : 'Viewing historical saved assessment from:'}{' '}
            <strong>{selectedHistoryItem.dateFormatted}</strong>
          </p>
          <button
            onClick={() => setSelectedHistoryItem(null)}
            className="font-bold underline cursor-pointer"
          >
            {isHi ? 'वर्तमान पर जाएं' : 'View Current'}
          </button>
        </div>
      )}

      {/* Main Score Hero Card */}
      <div className="bg-gradient-to-br from-stone-950 via-stone-900 to-stone-800 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-stone-300 font-medium">{activeAssessment.location.displayName}</span>
            <button
              onClick={onChangeLocation}
              className="text-[11px] text-emerald-300 underline hover:text-emerald-200 ml-1"
            >
              ({isHi ? 'बदलें' : 'Change'})
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs text-stone-300">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span>{isHi ? activeAssessment.timeWindowHi : activeAssessment.timeWindow}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {isHi ? 'कृषि जोखिम पूर्वानुमान' : 'Agricultural Risk Outlook'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {activeAssessment.crop} {activeAssessment.cropHindi && `(${activeAssessment.cropHindi})`}
            </h1>

            <div className="mt-4 flex items-center space-x-3">
              <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-black border ${overallStyle.badge}`}>
                <span className={`w-2.5 h-2.5 rounded-full mr-2 ${overallStyle.indicator}`}></span>
                {overallStyle.label}
              </span>

              <div className="text-xs text-stone-300">
                {isHi ? 'सटीकता विश्वास:' : 'Confidence:'}{' '}
                <strong className="text-white">{activeAssessment.confidence}%</strong>
              </div>
            </div>
          </div>

          <div className="flex sm:justify-end">
            <div className="bg-white/10 border border-white/15 rounded-3xl p-5 sm:p-6 text-center w-full sm:w-auto min-w-[200px] backdrop-blur-xs">
              <p className="text-xs uppercase tracking-wider text-stone-300 font-bold mb-1">
                {isHi ? 'समग्र जोखिम स्कोर' : 'Overall Risk Score'}
              </p>
              <div className="text-5xl font-black text-emerald-400 tracking-tight">
                {activeAssessment.riskScore}
                <span className="text-lg text-stone-400 font-normal">/100</span>
              </div>
              <p className="text-[11px] text-stone-300 mt-1">
                {activeAssessment.riskScore <= 20
                  ? isHi ? 'फसल परिस्थितियां स्थिर' : 'Favorable crop conditions'
                  : activeAssessment.riskScore <= 40
                  ? isHi ? 'नियमित निगरानी रखें' : 'Scouting recommended'
                  : activeAssessment.riskScore <= 70
                  ? isHi ? 'सतर्कता व प्रबंधन आवश्यक' : 'Active management needed'
                  : isHi ? 'तत्काल खेत हस्तक्षेप जरूरी' : 'Urgent field action needed'}
              </p>
            </div>
          </div>
        </div>

        {/* 3 Pillar Summary Badges */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-6 pt-6 border-t border-white/10 text-center">
          <div className="bg-black/20 p-3 rounded-2xl border border-white/10">
            <div className="flex items-center justify-center space-x-1.5 text-stone-300 text-xs font-semibold mb-1">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              <span>{isHi ? 'रोग जोखिम' : 'Disease'}</span>
            </div>
            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${diseaseStyle.badge}`}>
              {diseaseStyle.label.split(' ')[0]}
            </span>
          </div>

          <div className="bg-black/20 p-3 rounded-2xl border border-white/10">
            <div className="flex items-center justify-center space-x-1.5 text-stone-300 text-xs font-semibold mb-1">
              <Bug className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHi ? 'कीट जोखिम' : 'Pest'}</span>
            </div>
            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${pestStyle.badge}`}>
              {pestStyle.label.split(' ')[0]}
            </span>
          </div>

          <div className="bg-black/20 p-3 rounded-2xl border border-white/10">
            <div className="flex items-center justify-center space-x-1.5 text-stone-300 text-xs font-semibold mb-1">
              <CloudLightning className="w-3.5 h-3.5 text-sky-400" />
              <span>{isHi ? 'मौसम तनाव' : 'Stress'}</span>
            </div>
            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${weatherStyle.badge}`}>
              {weatherStyle.label.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>

      {/* AI Diagnosis Integration Card */}
      {activeAssessment.isDiagnosisConnected ? (
        <div className="bg-emerald-50/90 border border-emerald-300 rounded-3xl p-5 sm:p-6 flex items-start space-x-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs text-emerald-950">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md">
                {isHi ? 'AI जांच से सम्बद्ध' : 'Integrated with AI Crop Scan'}
              </span>
              <span className="font-bold text-sm text-emerald-900">
                {activeAssessment.diagnosisTitle}
              </span>
            </div>
            <p className="text-sm">
              {isHi ? activeAssessment.explanationHi : activeAssessment.explanation}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-stone-50 border border-stone-200 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start space-x-3 max-w-xl">
            <Info className="w-5 h-5 text-stone-500 shrink-0 mt-0.5" />
            <div className="text-xs text-stone-700 space-y-0.5">
              <p className="font-bold text-stone-900 text-sm">
                {isHi ? 'सामान्य मौसमी जोखिम अनुमान (फोटो स्कैन नहीं है)' : 'Weather-Based Baseline Risk (No scan attached)'}
              </p>
              <p>
                {isHi
                  ? 'अपनी फसल की फोटो खींचकर जांच करें, ताकि बीमारी व कीट के वर्तमान लक्षणों के आधार पर यह जोखिम और अधिक सटीक हो सके।'
                  : 'Capture a photo of your crop to integrate detected symptoms with weather signals for higher precision.'}
              </p>
            </div>
          </div>

          <button
            id="risk-screen-scan-crop-btn"
            onClick={onNavigateToCheckCrop}
            className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center space-x-2 shadow-xs transition cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>{isHi ? 'फसल की फोटो जांचें' : 'Scan Crop with Camera'}</span>
          </button>
        </div>
      )}

      {/* What Farmer Should Do Now */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-2">
        <div className="flex items-center space-x-2 text-stone-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          <h3 className="font-bold text-base">
            {isHi ? 'किसान तुरंत क्या करें (WHAT TO DO NOW)' : 'What Farmer Should Do Now'}
          </h3>
        </div>
        <p className="text-base sm:text-lg font-bold text-stone-900 bg-stone-50 p-4 rounded-2xl border border-stone-200">
          "{isHi ? activeAssessment.whatToDoNowHi : activeAssessment.whatToDoNow}"
        </p>
      </div>

      {/* Disease Risk Forecast Card & Pest Risk Forecast Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Disease Specific Forecast */}
        {activeAssessment.diseaseRiskForecast && (
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-rose-600" />
                <h4 className="font-bold text-sm text-stone-900">
                  {isHi ? 'रोग जोखिम पूर्वानुमान' : 'Disease Risk Forecast'}
                </h4>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${diseaseStyle.badge}`}>
                {diseaseStyle.label}
              </span>
            </div>

            <div>
              <p className="font-bold text-base text-stone-900">
                {isHi
                  ? activeAssessment.diseaseRiskForecast.problemNameHi
                  : activeAssessment.diseaseRiskForecast.problemName}
              </p>
              <p className="text-xs text-stone-600 mt-1">
                {isHi
                  ? activeAssessment.diseaseRiskForecast.summaryHi
                  : activeAssessment.diseaseRiskForecast.summary}
              </p>
            </div>

            <div className="pt-2 border-t border-stone-100 space-y-1">
              <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                {isHi ? 'मुख्य प्रेरक मौसम कारक:' : 'Key Contributing Factors:'}
              </p>
              <ul className="text-xs text-stone-700 space-y-1 list-disc pl-4">
                {(isHi
                  ? activeAssessment.diseaseRiskForecast.reasonsHi
                  : activeAssessment.diseaseRiskForecast.reasons
                ).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Pest Specific Forecast */}
        {activeAssessment.pestRiskForecast && (
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bug className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-sm text-stone-900">
                  {isHi ? 'कीट जोखिम पूर्वानुमान' : 'Pest Risk Forecast'}
                </h4>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${pestStyle.badge}`}>
                {pestStyle.label}
              </span>
            </div>

            <div>
              <p className="font-bold text-base text-stone-900">
                {isHi
                  ? activeAssessment.pestRiskForecast.problemNameHi
                  : activeAssessment.pestRiskForecast.problemName}
              </p>
              <p className="text-xs text-stone-600 mt-1">
                {isHi
                  ? activeAssessment.pestRiskForecast.summaryHi
                  : activeAssessment.pestRiskForecast.summary}
              </p>
            </div>

            <div className="pt-2 border-t border-stone-100 space-y-1">
              <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                {isHi ? 'मुख्य प्रेरक मौसम कारक:' : 'Key Contributing Factors:'}
              </p>
              <ul className="text-xs text-stone-700 space-y-1 list-disc pl-4">
                {(isHi
                  ? activeAssessment.pestRiskForecast.reasonsHi
                  : activeAssessment.pestRiskForecast.reasons
                ).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Transparent Why We Think This (Explainable Risk Checklist) */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-emerald-700" />
          <h3 className="font-bold text-base text-stone-900">
            {isHi ? 'AI ने यह जोखिम क्यों आंका (पारदर्शी कारक सूची)' : 'Why This Risk Was Calculated (Explainable Risk Factors)'}
          </h3>
        </div>

        <div className="space-y-2.5">
          {activeAssessment.riskFactors.map((factor) => (
            <div
              key={factor.id}
              className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start space-x-3 text-xs"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 mt-1"></span>
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-stone-900 text-sm">
                    {isHi ? factor.nameHi : factor.name}
                  </p>
                  <span className="text-[10px] uppercase font-bold text-stone-500 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                    {factor.category.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-stone-600">{isHi ? factor.detailHi : factor.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Risk Timeline Projection */}
      {activeAssessment.timeline.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-base text-stone-900">
                {isHi ? '7-दिवसीय जोखिम समयरेखा (Risk Timeline)' : '7-Day Projected Risk Timeline'}
              </h3>
            </div>
            <span className="text-xs text-stone-500 font-medium">
              {isHi ? 'मौसम व फसल रोग फैलाव की प्रवृत्ति' : 'Projected disease & pest progression'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {activeAssessment.timeline.map((point) => {
              const pointStyle = getRiskStyle(point.overallRisk);
              return (
                <div
                  key={point.date}
                  className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-center flex flex-col justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-stone-900">
                      {isHi ? point.dayLabelHi : point.dayLabel}
                    </p>
                    <p className="text-[10px] text-stone-500">{point.date.slice(5)}</p>
                  </div>

                  <div className="my-2.5">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${pointStyle.badge}`}>
                      {pointStyle.label.split(' ')[0]}
                    </span>
                    <p className="text-[10px] text-stone-600 mt-1 truncate">
                      {isHi ? point.dominantConditionHi : point.dominantCondition}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-200 text-[10px] text-stone-600 space-y-0.5">
                    <div>
                      {isHi ? 'रोग:' : 'Dis:'} <strong className="text-rose-700">{point.diseaseRisk[0]}</strong>
                    </div>
                    <div>
                      {isHi ? 'कीट:' : 'Pest:'} <strong className="text-amber-700">{point.pestRisk[0]}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Urgent Agricultural Alerts */}
      {activeAssessment.alerts.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-base text-stone-900 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>{isHi ? 'सक्रिय कृषि चेतावनियां व सलाह (Alerts)' : 'Active Agricultural Alerts'}</span>
          </h3>

          {activeAssessment.alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-3xl p-6 border space-y-4 ${
                alert.severity === 'critical'
                  ? 'bg-rose-50/90 border-rose-300'
                  : 'bg-amber-50/90 border-amber-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      alert.severity === 'critical' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-stone-900">
                      {isHi ? alert.titleHi : alert.title}
                    </h4>
                    <p className="text-xs text-stone-600">{alert.crop && `Crop: ${alert.crop}`}</p>
                  </div>
                </div>

                <span
                  className={`text-xs font-black uppercase px-2.5 py-1 rounded-full ${
                    alert.severity === 'critical' ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                  }`}
                >
                  {alert.severity}
                </span>
              </div>

              {/* What is happening / Why it matters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white/70 p-4 rounded-2xl border border-current/10">
                <div>
                  <p className="font-bold text-stone-900 uppercase text-[10px] tracking-wider mb-0.5">
                    {isHi ? 'क्या हो रहा है (What is happening):' : 'What is happening:'}
                  </p>
                  <p className="text-stone-700">{isHi ? alert.whatIsHappeningHi : alert.whatIsHappening}</p>
                </div>
                <div>
                  <p className="font-bold text-stone-900 uppercase text-[10px] tracking-wider mb-0.5">
                    {isHi ? 'यह क्यों महत्वपूर्ण है (Why it matters):' : 'Why it matters:'}
                  </p>
                  <p className="text-stone-700">{isHi ? alert.whyItMattersHi : alert.whyItMatters}</p>
                </div>
              </div>

              {/* Farmer Checklist */}
              <div className="space-y-2">
                <p className="font-bold text-xs text-stone-900 uppercase tracking-wider">
                  {isHi ? 'किसान क्या कदम उठाएं (Action Checklist):' : 'Farmer Action Checklist:'}
                </p>
                <div className="space-y-1.5">
                  {(isHi ? alert.whatFarmerShouldDoHi : alert.whatFarmerShouldDo).map((action, i) => (
                    <div key={i} className="flex items-start space-x-2 text-xs text-stone-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* IPM Recommendations Card */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-stone-900 flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-emerald-700" />
          <span>{isHi ? 'एकीकृत नाशीजीव प्रबंधन (IPM) अनुशंसाएं' : 'Integrated Pest & Disease Management (IPM)'}</span>
        </h3>

        <div className="space-y-4 text-xs">
          {/* Immediate Action */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
            <p className="font-bold text-sm text-emerald-950">
              {isHi ? '1. तत्काल गैर-रासायनिक कदम:' : '1. Immediate Non-Chemical Actions:'}
            </p>
            <ul className="space-y-1 list-disc pl-4 text-emerald-900">
              {(isHi
                ? activeAssessment.recommendedActions.immediateHi
                : activeAssessment.recommendedActions.immediate
              ).map((act, i) => (
                <li key={i}>{act}</li>
              ))}
            </ul>
          </div>

          {/* Cultural & Biological */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
            <p className="font-bold text-sm text-stone-900">
              {isHi ? '2. जैविक व कृषि क्रियाएं (Cultural & Biological Controls):' : '2. Cultural & Biological Controls:'}
            </p>
            <ul className="space-y-1 list-disc pl-4 text-stone-700">
              {(isHi
                ? activeAssessment.recommendedActions.culturalBiologicalHi
                : activeAssessment.recommendedActions.culturalBiological
              ).map((act, i) => (
                <li key={i}>{act}</li>
              ))}
            </ul>
          </div>

          {/* Chemical Notice with KVK */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
            <p className="font-bold text-xs text-amber-900 uppercase tracking-wider">
              {isHi ? 'रासायनिक नियंत्रण सावधानी:' : 'Chemical Control Notice:'}
            </p>
            <p className="text-amber-950 font-medium leading-relaxed">
              {isHi
                ? activeAssessment.recommendedActions.chemicalNoticeHi
                : activeAssessment.recommendedActions.chemicalNotice}
            </p>

            <div className="pt-2 border-t border-amber-200/60 flex items-center space-x-2 text-emerald-900 font-bold">
              <PhoneCall className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                {isHi
                  ? activeAssessment.recommendedActions.kvkRecommendationHi
                  : activeAssessment.recommendedActions.kvkRecommendation}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
            <div className="p-5 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">{isHi ? 'सहेजे गए जोखिम रिकॉर्ड' : 'Saved Risk History'}</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-stone-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {historyItems.length === 0 ? (
                <p className="text-center text-xs text-stone-500 py-8">
                  {isHi ? 'कोई सहेजा गया इतिहास नहीं है।' : 'No saved risk assessments found.'}
                </p>
              ) : (
                historyItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedHistoryItem(item);
                      setShowHistoryModal(false);
                    }}
                    className="p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 flex items-center justify-between cursor-pointer transition"
                  >
                    <div>
                      <p className="font-bold text-sm text-stone-900">{item.crop}</p>
                      <p className="text-[11px] text-stone-500">{item.dateFormatted} • {item.locationName}</p>
                      <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${getRiskStyle(item.overallRisk).badge}`}>
                        {item.overallRisk} ({item.riskScore}/100)
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteHistory(item.id, e)}
                      className="text-xs text-rose-600 hover:text-rose-800 p-2"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
