import React, { useState } from 'react';
import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  BookmarkCheck,
  Bookmark,
  Share2,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Info,
  PhoneCall,
  ShieldAlert,
  Flame,
  Activity,
  Layers,
  Sparkles,
  Search,
  CheckCircle,
  Eye,
  Microscope,
  TrendingUp,
  MapPin,
  FileText,
  Camera,
  HelpCircle,
  CloudSun,
} from 'lucide-react';
import { DiagnosisResult, Language, SeverityLevel, ProblemType, ProgressionRisk } from '../types';
import { translations } from '../i18n/translations';
import { getActiveFarm, recordDiagnosisForField } from '../services/farm/farmService';

interface DiagnosisResultScreenProps {
  diagnosis: DiagnosisResult;
  language: Language;
  onAnalyzeAnother: () => void;
  onChangeCrop: () => void;
  onSaveReport: (report: DiagnosisResult) => void;
  isSaved: boolean;
  onOpenExpertModal: () => void;
  onViewRiskOutlook?: () => void;
}

export const DiagnosisResultScreen: React.FC<DiagnosisResultScreenProps> = ({
  diagnosis,
  language,
  onAnalyzeAnother,
  onChangeCrop,
  onSaveReport,
  isSaved,
  onOpenExpertModal,
  onViewRiskOutlook,
}) => {
  const t = translations[language];
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'advisory' | 'evidence'>('diagnosis');

  // Farm and Field Linking (Part 4)
  const [activeFarm] = useState(() => getActiveFarm());
  const [linkedFieldId, setLinkedFieldId] = useState<string | null>(diagnosis.fieldId || null);
  const [isFieldLinked, setIsFieldLinked] = useState(false);

  const handleLinkToField = (fieldId: string) => {
    if (!activeFarm) return;
    recordDiagnosisForField(activeFarm.id, fieldId, diagnosis);
    setLinkedFieldId(fieldId);
    setIsFieldLinked(true);
    onSaveReport(diagnosis);
  };

  const isHi = language === 'hi';

  // Styling based on ProblemType
  const getProblemTypeBadge = (type: ProblemType) => {
    switch (type) {
      case 'Disease':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          icon: <ShieldAlert className="w-4 h-4 text-rose-600" />,
          label: isHi ? 'रोग (Disease)' : 'Disease Pathology',
        };
      case 'Pest':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-300',
          icon: <Bug className="w-4 h-4 text-amber-700" />,
          label: isHi ? 'कीट (Pest)' : 'Pest Infestation',
        };
      case 'Nutrient Deficiency':
        return {
          bg: 'bg-yellow-50 text-yellow-900 border-yellow-300',
          icon: <Activity className="w-4 h-4 text-yellow-700" />,
          label: isHi ? 'पोषक तत्वों की कमी' : 'Nutrient Deficiency',
        };
      case 'Healthy':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          label: isHi ? 'स्वस्थ फसल' : 'Healthy Crop',
        };
      default:
        return {
          bg: 'bg-stone-100 text-stone-800 border-stone-300',
          icon: <AlertTriangle className="w-4 h-4 text-stone-600" />,
          label: type,
        };
    }
  };

  // Severity indicator color & percentage width
  const getSeverityConfig = (sev: SeverityLevel) => {
    switch (sev) {
      case 'Critical':
        return {
          color: 'text-red-700 bg-red-100 border-red-300',
          barColor: 'bg-red-600',
          width: '100%',
          label: isHi ? 'अति गंभीर (Critical)' : 'Critical',
        };
      case 'High':
        return {
          color: 'text-orange-800 bg-orange-100 border-orange-300',
          barColor: 'bg-orange-500',
          width: '75%',
          label: isHi ? 'गंभीर (High)' : 'High',
        };
      case 'Moderate':
        return {
          color: 'text-amber-800 bg-amber-100 border-amber-300',
          barColor: 'bg-amber-500',
          width: '50%',
          label: isHi ? 'मध्यम (Moderate)' : 'Moderate',
        };
      case 'Low':
      default:
        return {
          color: 'text-emerald-800 bg-emerald-100 border-emerald-300',
          barColor: 'bg-emerald-500',
          width: '25%',
          label: isHi ? 'सामान्य / कम (Low)' : 'Low',
        };
    }
  };

  // Progression Risk config
  const getProgressionRiskConfig = (risk?: ProgressionRisk) => {
    switch (risk) {
      case 'Aggressive':
        return {
          color: 'bg-red-50 text-red-900 border-red-300',
          dot: 'bg-red-600',
          text: t.riskAggressive,
          advice: isHi
            ? 'अनुकूल मौसम (उच्च आर्द्रता या गर्मी) में यह समस्या 48–72 घंटों के भीतर पूरे खेत में फैल सकती है।'
            : 'Can spread across entire field canopy in 48–72 hours under favorable heat or humidity.',
        };
      case 'Rapid':
        return {
          color: 'bg-orange-50 text-orange-900 border-orange-300',
          dot: 'bg-orange-500',
          text: t.riskRapid,
          advice: isHi
            ? 'हवा या पानी के छींटों से रोग के जीवाणु/बीजाणु तेजी से एक पौधे से दूसरे पौधे में जा सकते हैं।'
            : 'Airborne spores or multiplying insect colonies spread fast across adjacent rows.',
        };
      case 'Slow':
        return {
          color: 'bg-emerald-50 text-emerald-900 border-emerald-300',
          dot: 'bg-emerald-600',
          text: t.riskSlow,
          advice: isHi
            ? 'फैलाव सीमित है; समय पर रोकथाम से बाकी फसल सुरक्षित रहेगी।'
            : 'Localized to isolated foliage; preventive roguing prevents further transmission.',
        };
      case 'Moderate':
      default:
        return {
          color: 'bg-amber-50 text-amber-900 border-amber-300',
          dot: 'bg-amber-500',
          text: t.riskModerate,
          advice: isHi
            ? 'अगले 3–5 दिनों में लगातार निगरानी रखें और लक्षण बढ़ने पर उपाय करें।'
            : 'Scout foliage every 2–3 days to ensure threshold is not breached.',
        };
    }
  };

  const problemBadge = getProblemTypeBadge(diagnosis.problemType);
  const severityConfig = getSeverityConfig(diagnosis.severity);
  const riskConfig = getProgressionRiskConfig(diagnosis.progressionRisk);
  const confidencePercent = Math.round(diagnosis.confidence * 100);

  // Copy or share diagnosis summary
  const handleShare = () => {
    const summaryText = `[Krishi Mentor AI Assessment]\nCrop: ${diagnosis.crop}\nProblem: ${diagnosis.diagnosis}\nStatus: ${diagnosis.overallStatus || 'problem_detected'}\nConfidence: ${confidencePercent}%\nSeverity: ${diagnosis.severity}\nProgression Risk: ${diagnosis.progressionRisk || 'Moderate'}\nImmediate Action: ${diagnosis.ipmAdvisory?.immediateAction?.[0] || 'Scout and monitor'}\n(AI assessment — field verification recommended)`;

    if (navigator.share) {
      navigator
        .share({
          title: `Krishi Mentor - ${diagnosis.crop} Diagnosis`,
          text: summaryText,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(summaryText);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    }
  };

  const isHealthy = diagnosis.overallStatus === 'healthy' || diagnosis.problemType === 'Healthy';
  const isUncertain = diagnosis.overallStatus === 'uncertain' || diagnosis.isLowConfidence;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
      {/* Top Bar with Navigation & Actions */}
      <div className="flex items-center justify-between mb-4">
        <button
          id="diag-analyze-another-top-btn"
          onClick={onAnalyzeAnother}
          className="flex items-center gap-1.5 text-stone-700 hover:text-stone-900 bg-white border border-stone-200 px-3 py-1.5 rounded-lg text-sm font-medium shadow-2xs hover:bg-stone-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isHi ? 'नई जांच' : 'New Diagnosis'}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Step 4 / 4
          </span>
          <button
            id="diag-share-btn"
            onClick={handleShare}
            className="flex items-center gap-1 text-xs text-stone-600 bg-white border border-stone-200 px-2.5 py-1 rounded-lg hover:bg-stone-50 font-medium"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copyFeedback ? (isHi ? 'कॉपी हुआ!' : 'Copied!') : isHi ? 'शेयर' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Crop & Category Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-100/90 rounded-2xl p-3 px-4 border border-stone-200 mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
            {t.selectedCropLabel}:
          </span>
          <span className="font-bold text-stone-900 text-sm">
            {diagnosis.crop}
            {diagnosis.cropHindi && isHi && ` (${diagnosis.cropHindi})`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${problemBadge.bg}`}
          >
            {problemBadge.icon}
            <span>{problemBadge.label}</span>
          </span>
        </div>
      </div>

      {/* HEALTHY CROP STATE BANNER */}
      {isHealthy && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 mb-6 text-emerald-950 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <CheckCircle className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xl font-extrabold text-emerald-900">
                {t.statusHealthyTitle}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-800 mt-1 leading-relaxed">
                {t.statusHealthyDesc}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-900 bg-emerald-100/80 px-3 py-1.5 rounded-xl border border-emerald-200 w-fit">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Confidence: {confidencePercent}% Vigorous Foliage</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UNCERTAIN / LOW-CONFIDENCE BANNER */}
      {isUncertain && !isHealthy && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 mb-6 text-amber-950 shadow-2xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-amber-900">
                {t.statusUncertainTitle}
              </h3>
              <p className="text-xs sm:text-sm text-amber-800 mt-1">
                {t.lowConfidenceNotice}
              </p>

              {diagnosis.possibleCauses && diagnosis.possibleCauses.length > 0 && (
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1.5">
                    {t.possibleCausesTitle}
                  </h4>
                  <ul className="list-disc list-inside text-xs sm:text-sm text-amber-900 space-y-1">
                    {diagnosis.possibleCauses.map((cause, idx) => (
                      <li key={idx}>{cause}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs font-medium text-amber-900 mt-3 bg-amber-100/70 p-2.5 rounded-xl border border-amber-200">
                {isHi
                  ? 'कृपया अच्छी रोशनी में और पास से दूसरी फोटो लें, या नजदीकी कृषि वैज्ञानिक से संपर्क करें।'
                  : 'Please upload a clearer photo or consult an agronomist before taking chemical action.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Diagnosis Card with Image and Identification */}
      <div className="bg-white border-2 border-stone-200 rounded-2xl overflow-hidden shadow-xs mb-6">
        {/* Photo Container */}
        <div className="relative aspect-16/9 bg-stone-950 overflow-hidden flex items-center justify-center">
          <img
            src={diagnosis.imageUri}
            alt="Analyzed crop sample"
            className="w-full h-full object-contain"
          />
          <div className="absolute bottom-2.5 right-2.5 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-lg border border-white/20 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>{diagnosis.crop}</span>
          </div>

          {diagnosis.imageQuality && (
            <div className="absolute top-2.5 left-2.5 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-lg border border-white/20 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quality Score: {diagnosis.imageQuality.qualityScore}/100</span>
            </div>
          )}
        </div>

        {/* Diagnosis Header */}
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {t.whatWeFound}
            </span>

            {/* Estimated Confidence Badge */}
            <div className="inline-flex items-center gap-1.5 bg-stone-100 text-stone-800 px-2.5 py-1 rounded-full text-xs font-bold border border-stone-200">
              <span>{t.confidenceLabel}:</span>
              <span className={confidencePercent >= 75 ? 'text-emerald-700' : 'text-amber-700'}>
                {confidencePercent}%
              </span>
            </div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
            {isHi && diagnosis.diagnosisHindi
              ? diagnosis.diagnosisHindi
              : diagnosis.diagnosis}
          </h3>

          {diagnosis.diagnosisHindi && !isHi && (
            <p className="text-sm font-medium text-stone-500 mt-1">
              Hindi: {diagnosis.diagnosisHindi}
            </p>
          )}

          {/* Farmer Context tags (if provided) */}
          {(diagnosis.locationContext || diagnosis.farmerNotes) && (
            <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap gap-2 text-xs text-stone-600">
              {diagnosis.locationContext && (
                <span className="inline-flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
                  <MapPin className="w-3 h-3 text-stone-500" />
                  <span>{diagnosis.locationContext}</span>
                </span>
              )}
              {diagnosis.farmerNotes && (
                <span className="inline-flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 max-w-full truncate">
                  <FileText className="w-3 h-3 text-stone-500 shrink-0" />
                  <span className="truncate">"{diagnosis.farmerNotes}"</span>
                </span>
              )}
            </div>
          )}

          {/* AI Responsible Disclaimer */}
          <div className="mt-3 bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
            <span>{diagnosis.disclaimer || t.aiEstimateDisclaimer}</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation for Detailed Sections */}
      <div className="flex border-b border-stone-200 mb-6">
        <button
          onClick={() => setActiveTab('diagnosis')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center justify-center gap-1.5 ${
            activeTab === 'diagnosis'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>{isHi ? 'विश्लेषण एवं जोखिम' : 'Health & Risk'}</span>
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center justify-center gap-1.5 ${
            activeTab === 'evidence'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Microscope className="w-4 h-4" />
          <span>{t.whyWeThinkThis}</span>
        </button>

        <button
          onClick={() => setActiveTab('advisory')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center justify-center gap-1.5 ${
            activeTab === 'advisory'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{isHi ? 'IPM सलाह' : 'IPM Advisory'}</span>
        </button>
      </div>

      {/* TAB 1: HEALTH & RISK (Severity, Progression Risk, Pest Density) */}
      {activeTab === 'diagnosis' && (
        <div className="space-y-6">
          {/* Progression Risk Assessment (Part 2 Engine) */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-800" />
                <h4 className="font-bold text-stone-900 text-base">
                  {t.progressionRiskTitle}
                </h4>
              </div>

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${riskConfig.color}`}
              >
                <span className={`w-2 h-2 rounded-full ${riskConfig.dot}`} />
                <span>{diagnosis.progressionRisk || 'Moderate'}</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-700 bg-stone-50 rounded-xl p-3 border border-stone-200 mb-3">
              {riskConfig.advice}
            </p>

            {/* Severity Meter */}
            <div className="pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-700">
                  {t.severityLabel}: <span className="text-stone-900">{diagnosis.severity}</span>
                </span>
                <span className="text-xs text-stone-500">
                  {t.affectedAreaLabel}: <strong className="text-stone-800">{diagnosis.affectedAreaEstimate}</strong>
                </span>
              </div>

              <div className="w-full bg-stone-100 rounded-full h-2.5 mb-2 overflow-hidden border border-stone-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${severityConfig.barColor}`}
                  style={{ width: severityConfig.width }}
                />
              </div>

              <p className="text-[11px] text-stone-500 italic">
                {t.severityNotice}
              </p>
            </div>
          </div>

          {/* Weather & Spread Risk Outlook Banner (Part 3 Intelligence Engine) */}
          <div className="bg-gradient-to-r from-sky-50 to-emerald-50 border border-sky-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <CloudSun className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h5 className="font-bold text-sm text-sky-950">
                    {isHi ? 'मौसम व रोग प्रसार दृष्टिकोण (अगले 48 घंटे)' : 'Weather & Disease Spread Outlook (48h)'}
                  </h5>
                  {diagnosis.riskOutlookSummary && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      {diagnosis.riskOutlookSummary.overallRisk} RISK
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-700 mt-1">
                  {diagnosis.riskOutlookSummary
                    ? (isHi ? diagnosis.riskOutlookSummary.primaryDriverHi : diagnosis.riskOutlookSummary.primaryDriver)
                    : (isHi
                      ? 'वर्तमान आर्द्रता व स्थानीय मौसम के आधार पर इस रोग के प्रसार का जोखिम आंका गया है।'
                      : 'Calculated by synthesizing detected symptoms with localized agrometeorological signals.')}
                </p>
              </div>
            </div>

            {onViewRiskOutlook && (
              <button
                id="diag-view-risk-outlook-btn"
                onClick={onViewRiskOutlook}
                className="w-full sm:w-auto shrink-0 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
              >
                <span>{isHi ? 'विस्तृत जोखिम रिपोर्ट देखें' : 'View Risk Outlook'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Pest Counting & Density Assessment (Part 2 Engine) */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bug className="w-5 h-5 text-amber-700" />
                <h4 className="font-bold text-stone-900 text-base">
                  {isHi ? 'कीट गणना एवं घनत्व आकलन' : 'Pest Counting & Density Intelligence'}
                </h4>
              </div>

              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider bg-stone-100 px-2 py-0.5 rounded">
                Part 2 Vision
              </span>
            </div>

            {diagnosis.pestCounting && diagnosis.pestCounting.available ? (
              <div className="space-y-3">
                <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-4 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block">
                      {diagnosis.pestCounting.countable ? t.pestCountingReliable : t.pestCountingSwarm}
                    </span>
                    <div className="text-2xl font-black text-amber-950 mt-0.5">
                      {diagnosis.pestCounting.count !== null ? (
                        <>
                          {diagnosis.pestCounting.count}{' '}
                          <span className="text-sm font-medium text-amber-800">
                            {diagnosis.pestCounting.countable ? 'countable insects' : 'estimated in cluster'}
                          </span>
                        </>
                      ) : (
                        'Active Colony Cluster'
                      )}
                    </div>
                  </div>

                  {diagnosis.pestCounting.densityEstimate && (
                    <div className="bg-white/80 border border-amber-300 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-900 shrink-0">
                      <span>{t.pestDensityLabel}: </span>
                      <strong>{diagnosis.pestCounting.densityEstimate}</strong>
                    </div>
                  )}
                </div>

                <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                  {diagnosis.pestCounting.note}
                </p>
              </div>
            ) : diagnosis.pestCountingAvailable && diagnosis.estimatedPestCount !== null ? (
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-amber-950 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-amber-800 block">
                    {t.estimatedPestCount}
                  </span>
                  <span className="text-2xl font-black text-amber-900">
                    {diagnosis.estimatedPestCount}{' '}
                    <span className="text-sm font-medium">insects visible</span>
                  </span>
                </div>
                {diagnosis.pestDetectionConfidence && (
                  <span className="text-xs font-semibold bg-amber-200/80 text-amber-900 px-2.5 py-1 rounded-lg">
                    Confidence: {Math.round(diagnosis.pestDetectionConfidence * 100)}%
                  </span>
                )}
              </div>
            ) : (
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-xs text-stone-600 flex items-center gap-2">
                <Info className="w-4 h-4 text-stone-400 shrink-0" />
                <span>
                  {diagnosis.problemType === 'Pest'
                    ? isHi
                      ? 'कीटों का जमाव अधिक है अथवा वे पत्ती के पीछे छिपे हैं; व्यक्तिगत कीट गणना संभव नहीं।'
                      : 'Pests form dense colonies or remain hidden beneath lamina; individual counting is not applicable.'
                    : t.pestCountingUnavailable}
                </span>
              </div>
            )}
          </div>

          {/* Differential Diagnoses / Secondary Possibilities (Part 2 Engine) */}
          {diagnosis.secondaryConditions && diagnosis.secondaryConditions.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-5 h-5 text-stone-600" />
                <h4 className="font-bold text-stone-900 text-base">
                  {t.differentialDiagnosis}
                </h4>
              </div>
              <p className="text-xs text-stone-500 mb-4">
                {t.differentialDesc}
              </p>

              <div className="space-y-3">
                {diagnosis.secondaryConditions.map((cond, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-stone-900">
                        {isHi && cond.hindiName ? cond.hindiName : cond.name}
                      </span>
                      <span className="text-xs font-semibold text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200">
                        {Math.round(cond.confidence * 100)}% match
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {cond.notes}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Field Verification Recommendation Card */}
          <div className="bg-emerald-900 text-white rounded-2xl p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-base text-amber-300 mb-1">
                  {t.fieldVerificationTitle}
                </h4>
                <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                  {diagnosis.fieldVerificationRecommendation ||
                    (isHi
                      ? 'रासायनिक छिड़काव करने से पूर्व अपने खेत में "W" आकार में चलकर 10 यादृच्छिक पौधों का मुआयना करें।'
                      : 'Before applying chemical treatments, walk your field in a "W" scouting pattern to confirm spread on at least 10 sample plants.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EVIDENCE: "Why We Think This" (Part 2 Engine) */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">
                {isHi ? 'पारदर्शी AI निर्णय प्रक्रिया' : 'Transparent Agricultural AI Reasoning'}
              </span>
              <span>
                {isHi
                  ? 'यह विश्लेषण केवल एक अनुमान नहीं है; यह पत्ती पर पाए गए विशिष्ट लक्षणों और पादप विकृति विज्ञान के नियमों पर आधारित है।'
                  : 'Krishi Mentor isolates identifiable botanical clues and pathology signatures so farmers understand the visual rationale.'}
              </span>
            </div>
          </div>

          {/* 1. Visual Clues */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
            <h4 className="font-bold text-stone-900 text-base mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-700" />
              <span>{t.visualClues}</span>
            </h4>

            {diagnosis.evidence?.visualClues && diagnosis.evidence.visualClues.length > 0 ? (
              <ul className="space-y-2.5">
                {diagnosis.evidence.visualClues.map((clue, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-800 bg-stone-50 p-3 rounded-xl border border-stone-150"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{clue}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-stone-500">
                {isHi ? 'दृश्य संकेत रिकॉर्ड नहीं हुए।' : 'Visual clues recorded during image scan.'}
              </p>
            )}
          </div>

          {/* 2. Affected Plant Anatomy */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
            <h4 className="font-bold text-stone-900 text-base mb-3 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-700" />
              <span>{t.affectedParts}</span>
            </h4>

            <div className="flex flex-wrap gap-2">
              {diagnosis.evidence?.affectedParts && diagnosis.evidence.affectedParts.length > 0 ? (
                diagnosis.evidence.affectedParts.map((part, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-semibold"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    <span>{part}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-stone-500">Foliage canopy</span>
              )}
            </div>
          </div>

          {/* 3. Patterns Identified */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
            <h4 className="font-bold text-stone-900 text-base mb-3 flex items-center gap-2">
              <Microscope className="w-5 h-5 text-teal-700" />
              <span>{t.patternsIdentified}</span>
            </h4>

            <div className="space-y-2">
              {diagnosis.evidence?.patternsIdentified && diagnosis.evidence.patternsIdentified.length > 0 ? (
                diagnosis.evidence.patternsIdentified.map((pattern, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs sm:text-sm font-medium text-teal-950 bg-teal-50/70 p-2.5 px-3 rounded-xl border border-teal-200"
                  >
                    <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                    <span>{pattern}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-500">Characteristic foliar pathology</p>
              )}
            </div>
          </div>

          {/* Observed Symptoms List */}
          {diagnosis.symptoms && diagnosis.symptoms.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <h4 className="font-bold text-stone-900 text-base mb-3 flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-700" />
                <span>{t.symptomsTitle}</span>
              </h4>
              <ul className="space-y-2">
                {diagnosis.symptoms.map((symptom, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Image Quality Score Breakdown */}
          {diagnosis.imageQuality && (
            <div className="bg-stone-100 rounded-2xl p-4 border border-stone-200 text-xs text-stone-700">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-stone-600" />
                  <span>{t.qualityCheckTitle}</span>
                </span>
                <span className="font-extrabold text-stone-900 bg-white px-2.5 py-0.5 rounded-lg border border-stone-200">
                  {diagnosis.imageQuality.qualityScore}%
                </span>
              </div>
              <ul className="space-y-1 text-stone-600">
                {diagnosis.imageQuality.guidanceTips.map((tip, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ACTIONABLE IPM ADVISORY (Integrated Pest Management) */}
      {activeTab === 'advisory' && (
        <div className="space-y-4">
          <div className="bg-emerald-800 text-white rounded-2xl p-4 flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-300 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">
                {t.whatShouldIDo}
              </h4>
              <p className="text-xs text-emerald-200">
                Integrated Pest Management (IPM) prioritizes cultural & biological remedies before chemicals.
              </p>
            </div>
          </div>

          {/* 1. Immediate Action */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
            <h5 className="font-bold text-sm text-stone-900 mb-2.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-800 text-xs font-extrabold flex items-center justify-center">
                1
              </span>
              <span>{t.immediateAction}</span>
            </h5>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-700 pl-8 list-disc">
              {diagnosis.ipmAdvisory?.immediateAction?.map((action, idx) => (
                <li key={idx}>{action}</li>
              ))}
            </ul>
          </div>

          {/* 2. Field Monitoring */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
            <h5 className="font-bold text-sm text-stone-900 mb-2.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs font-extrabold flex items-center justify-center">
                2
              </span>
              <span>{t.monitoringTitle}</span>
            </h5>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-700 pl-8 list-disc">
              {diagnosis.ipmAdvisory?.monitoring?.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>

          {/* 3. Prevention & Cultural */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
            <h5 className="font-bold text-sm text-stone-900 mb-2.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center justify-center">
                3
              </span>
              <span>{t.preventionTitle}</span>
            </h5>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-700 pl-8 list-disc">
              {diagnosis.ipmAdvisory?.prevention?.map((prev, idx) => (
                <li key={idx}>{prev}</li>
              ))}
            </ul>
          </div>

          {/* Biological / Cultural Controls */}
          {diagnosis.ipmAdvisory?.biologicalCulturalControls &&
            diagnosis.ipmAdvisory.biologicalCulturalControls.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
                <h5 className="font-bold text-sm text-stone-900 mb-2.5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 text-xs font-extrabold flex items-center justify-center">
                    🌱
                  </span>
                  <span>{t.biologicalControls}</span>
                </h5>
                <ul className="space-y-2 text-xs sm:text-sm text-stone-700 pl-8 list-disc">
                  {diagnosis.ipmAdvisory.biologicalCulturalControls.map((bio, idx) => (
                    <li key={idx}>{bio}</li>
                  ))}
                </ul>
              </div>
            )}

          {/* Chemical Control Caution Note (Mandatory Responsible AI) */}
          <div className="bg-amber-100/80 border-2 border-amber-300 rounded-2xl p-4 text-xs text-amber-950 leading-relaxed shadow-2xs">
            <span className="font-bold block mb-1 text-amber-950">
              ⚠️ {isHi ? 'रासायनिक कीटनाशक/फफूंदनाशक सावधानी:' : 'Chemical Control Notice & KVK Verification:'}
            </span>
            {diagnosis.ipmAdvisory?.chemicalControlNotice || t.chemicalGuidanceNotice}
          </div>

          {/* When to Contact Expert */}
          <div className="bg-stone-100 rounded-2xl p-4 border border-stone-200 text-xs text-stone-800">
            <span className="font-bold text-stone-900 block mb-1">
              {t.whenToContactExpert}:
            </span>
            {diagnosis.ipmAdvisory?.whenToContactExpert}
          </div>
        </div>
      )}

      {/* Link Observation to Field on My Farm (Part 4) */}
      {activeFarm && activeFarm.fields && activeFarm.fields.length > 0 && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 mt-6 mb-2 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>{isHi ? 'अपने खेत (Field) से जोड़ें:' : 'Log Observation to Farm Field:'}</span>
            </span>
            {isFieldLinked && (
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {isHi ? 'खेत से जोड़ा गया' : 'Linked to Field'}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {activeFarm.fields.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => handleLinkToField(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 cursor-pointer ${
                  linkedFieldId === f.id
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                    : 'bg-white hover:bg-emerald-50 text-stone-800 border-stone-300'
                }`}
              >
                <span>{f.name}</span>
                <span className="text-[10px] opacity-75">({f.crop})</span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-stone-600">
            {isHi
              ? 'खेत से जोड़ने पर यह रिपोर्ट फार्म मैप पर हॉटस्पॉट बिंदु के रूप में दिखेगी और खेत का स्वास्थ्य स्तर अपडेट होगा।'
              : 'Logging this diagnosis updates the field health status and places an observation pin on your Farm Map.'}
          </p>
        </div>
      )}

      {/* RESULT ACTIONS: Save, Ask Expert, New Diagnosis */}
      <div className="grid grid-cols-2 gap-3 mt-4 mb-3">
        {/* Save Report */}
        <button
          id="diag-save-report-btn"
          onClick={() => onSaveReport(diagnosis)}
          className={`py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-xs border ${
            isSaved
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
              : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-300'
          }`}
        >
          {isSaved ? (
            <>
              <BookmarkCheck className="w-5 h-5 text-emerald-700" />
              <span>{t.reportSaved}</span>
            </>
          ) : (
            <>
              <Bookmark className="w-5 h-5 text-stone-600" />
              <span>{t.saveReport}</span>
            </>
          )}
        </button>

        {/* Ask an Expert */}
        <button
          id="diag-ask-expert-btn"
          onClick={onOpenExpertModal}
          className="py-3.5 px-4 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-600 active:scale-98 text-stone-950 flex items-center justify-center gap-2 shadow-xs transition"
        >
          <PhoneCall className="w-5 h-5" />
          <span>{t.askExpert}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Analyze Another Photo */}
        <button
          id="diag-analyze-another-btn"
          onClick={onAnalyzeAnother}
          className="py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center gap-2 shadow-xs transition"
        >
          <RefreshCw className="w-4 h-4 text-amber-300" />
          <span>{t.analyzeAnother}</span>
        </button>

        {/* Change Crop */}
        <button
          id="diag-change-crop-btn"
          onClick={onChangeCrop}
          className="py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 flex items-center justify-center gap-2 shadow-xs transition"
        >
          <Layers className="w-4 h-4 text-stone-600" />
          <span>{t.changeCrop}</span>
        </button>
      </div>
    </div>
  );
};
