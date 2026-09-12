import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Eye,
  ZoomIn,
  ZoomOut,
  Clock,
  User,
  MapPin,
  CloudRain,
  Thermometer,
  Wind,
  FileText,
  Send,
  AlertCircle,
  Tag,
  Lock,
  Calendar,
  Layers,
  ChevronRight,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import {
  AgriculturalCase,
  DataQualityFlag,
  ExpertAIFeedback,
  ExpertDecisionType,
  InfoRequestType,
} from '../../types/expert';
import {
  expertConfirmDiagnosis,
  expertCorrectDiagnosis,
  expertMarkUncertain,
  expertRequestInfo,
  closeCase,
} from '../../services/expert/caseService';
import { getActiveExpertProfile } from '../../services/expert/expertService';
import { EscalateCaseModal } from '../../closed-loop/components/EscalateCaseModal';
import {
  escalateCaseToExtension,
  getClosedLoopCaseById,
} from '../../closed-loop/services/closedLoopService';
import { ClosedLoopCase, EscalationReason } from '../../closed-loop/types';

interface ExpertCaseDetailProps {
  caseItem: AgriculturalCase;
  onBack: () => void;
  onCaseUpdated: (updated: AgriculturalCase) => void;
  language: 'en' | 'hi';
}

export const ExpertCaseDetail: React.FC<ExpertCaseDetailProps> = ({
  caseItem,
  onBack,
  onCaseUpdated,
  language,
}) => {
  const isHi = language === 'hi';
  const activeExpert = getActiveExpertProfile();

  // State
  const [selectedDecision, setSelectedDecision] = useState<ExpertDecisionType | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Form states for CONFIRM
  const [confirmObservations, setConfirmObservations] = useState('');
  const [confirmInternalNotes, setConfirmInternalNotes] = useState('');
  const [confirmActions, setConfirmActions] = useState<string[]>(
    caseItem.aiAssessment.ipmAdvisory.immediateAction || []
  );
  const [newActionInput, setNewActionInput] = useState('');
  const [confirmAiFeedback, setConfirmAiFeedback] = useState<ExpertAIFeedback>('AI_CORRECT');
  const [confirmQualityFlag, setConfirmQualityFlag] =
    useState<DataQualityFlag>('VERIFIED_HIGH_QUALITY');

  // Form states for CORRECT
  const [correctDiagnosis, setCorrectDiagnosis] = useState('');
  const [correctProblemType, setCorrectProblemType] = useState('Disease');
  const [correctSeverity, setCorrectSeverity] = useState('Moderate');
  const [correctConfidence, setCorrectConfidence] = useState<
    'LOW' | 'MODERATE' | 'HIGH' | 'DEFINITIVE'
  >('HIGH');
  const [correctionReason, setCorrectionReason] = useState('');
  const [correctActions, setCorrectActions] = useState<string[]>([
    'Isolate affected plants immediately',
    'Follow university certified spray schedule',
  ]);
  const [newCorrectActionInput, setNewCorrectActionInput] = useState('');
  const [correctInternalNotes, setCorrectInternalNotes] = useState('');
  const [correctAiFeedback, setCorrectAiFeedback] = useState<ExpertAIFeedback>('AI_INCORRECT');
  const [correctQualityFlag, setCorrectQualityFlag] =
    useState<DataQualityFlag>('VERIFIED_HIGH_QUALITY');

  // Form states for UNCERTAIN
  const [uncertaintyPreset, setUncertaintyPreset] = useState('symptoms overlap');
  const [customUncertaintyReason, setCustomUncertaintyReason] = useState('');
  const [uncertaintySteps, setUncertaintySteps] = useState([
    'Bring leaf sample to nearest KVK agronomist for 10x lens scouting',
    'Install monitoring sticky traps in field',
  ]);
  const [uncertainInternalNotes, setUncertainInternalNotes] = useState('');

  // Form states for REQUEST INFO
  const [requestType, setRequestType] = useState<InfoRequestType>('CLOSER_LEAF');
  const [requestMessage, setRequestMessage] = useState(
    'Please upload a closer photo of the leaf lesion in clear daylight.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);

  const currentClosedLoopCase: ClosedLoopCase = (getClosedLoopCaseById(caseItem.id) || {
    ...caseItem,
    dataQuality: 'VERIFIED_HIGH_QUALITY',
    status: (caseItem.status as any),
    consent: {
      caseProcessing: true,
      expertReview: true,
      aggregatedAnalytics: true,
      research: true,
      modelEvaluation: true,
      trainingCandidate: true,
      consentTimestamp: Date.now(),
    },
    provenance: {
      sourceType: 'FARMER',
      sourceId: caseItem.id,
      createdBy: caseItem.farmerName,
      createdAt: caseItem.createdAt,
      updatedAt: Date.now(),
      modelVersion: 'krishi-vision-v2.1',
      predictionVersion: 'pred-gemini-flash-1.5',
      evidenceReferences: [caseItem.primaryImageUri],
    },
  }) as ClosedLoopCase;

  const handleEscalateSubmit = (params: {
    caseId: string;
    reason: EscalationReason;
    priority: any;
    problemCategory: string;
    recommendedAction: string;
    additionalNotes: string;
  }) => {
    try {
      escalateCaseToExtension({
        caseId: params.caseId,
        reason: params.reason,
        priority: params.priority,
        problemCategory: params.problemCategory,
        recommendedAction: params.recommendedAction,
        additionalNotes: params.additionalNotes,
      });
      setActionSuccessMsg(
        isHi
          ? 'मामला कृषि प्रसार अधिकारी (Extension Support) को सफलतापूर्वक प्रेषित कर दिया गया।'
          : 'Case escalated to District Agricultural Extension Officer successfully.'
      );
      setIsEscalateModalOpen(false);
      onCaseUpdated({
        ...caseItem,
        status: 'IN_REVIEW',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to escalate case');
      setIsEscalateModalOpen(false);
    }
  };

  // Handlers
  const handleConfirmSubmit = () => {
    setIsSubmitting(true);
    try {
      const updated = expertConfirmDiagnosis({
        caseId: caseItem.id,
        expertId: activeExpert.id,
        additionalObservations: confirmObservations,
        internalNotes: confirmInternalNotes,
        customRecommendedActions: confirmActions,
        aiFeedback: confirmAiFeedback,
        dataQualityFlag: confirmQualityFlag,
      });
      onCaseUpdated(updated);
      setActionSuccessMsg(
        isHi
          ? 'सफलतापूर्वक पुष्टि की गई व किसान को मार्गदर्शन भेजा गया।'
          : 'AI diagnosis confirmed and verified guidance sent to farmer.'
      );
      setSelectedDecision(null);
    } catch (err: any) {
      alert(err.message || 'Failed to confirm diagnosis');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCorrectSubmit = () => {
    if (!correctDiagnosis.trim()) {
      alert(isHi ? 'कृपया सही रोग/कीट का नाम दर्ज करें' : 'Please enter corrected diagnosis name');
      return;
    }
    if (!correctionReason.trim()) {
      alert(isHi ? 'कृपया सुधार का वैज्ञानिक कारण दर्ज करें' : 'Please provide scientific reasoning for correction');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = expertCorrectDiagnosis({
        caseId: caseItem.id,
        expertId: activeExpert.id,
        correctedDiagnosis: correctDiagnosis.trim(),
        correctedProblemType: correctProblemType,
        correctedSeverity: correctSeverity,
        expertConfidence: correctConfidence,
        correctionReason: correctionReason.trim(),
        recommendedActions: correctActions,
        internalNotes: correctInternalNotes,
        aiFeedback: correctAiFeedback,
        dataQualityFlag: correctQualityFlag,
      });
      onCaseUpdated(updated);
      setActionSuccessMsg(
        isHi
          ? 'सफलतापूर्वक सुधार किया गया और किसान को संशोधित सलाह भेजी गई।'
          : 'Diagnosis corrected. Updated guidance and reasoning sent to farmer.'
      );
      setSelectedDecision(null);
    } catch (err: any) {
      alert(err.message || 'Failed to correct diagnosis');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUncertainSubmit = () => {
    const reasonText = customUncertaintyReason.trim() || `Unable to confirm: ${uncertaintyPreset}. Physical inspection required.`;
    setIsSubmitting(true);
    try {
      const updated = expertMarkUncertain({
        caseId: caseItem.id,
        uncertaintyReason: reasonText,
        recommendedNextSteps: uncertaintySteps,
        internalNotes: uncertainInternalNotes,
      });
      onCaseUpdated(updated);
      setActionSuccessMsg(
        isHi
          ? 'मामले को प्रत्यक्ष निरीक्षण हेतु चिह्नित किया गया।'
          : 'Marked as uncertain. In-field physical verification recommended.'
      );
      setSelectedDecision(null);
    } catch (err: any) {
      alert(err.message || 'Failed to mark uncertain');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestInfoSubmit = () => {
    if (!requestMessage.trim()) {
      alert(isHi ? 'कृपया किसान हेतु संदेश लिखें' : 'Please enter request message');
      return;
    }
    setIsSubmitting(true);
    try {
      const updated = expertRequestInfo({
        caseId: caseItem.id,
        requestType,
        message: requestMessage.trim(),
      });
      onCaseUpdated(updated);
      setActionSuccessMsg(
        isHi
          ? 'किसान को अतिरिक्त फोटो/जानकारी का अनुरोध भेजा गया।'
          : 'Information request sent to farmer.'
      );
      setSelectedDecision(null);
    } catch (err: any) {
      alert(err.message || 'Failed to request information');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseCase = () => {
    if (confirm(isHi ? 'क्या आप इस मामले को बंद करना चाहते हैं?' : 'Close this case?')) {
      const updated = closeCase(caseItem.id, activeExpert.name, 'EXPERT');
      onCaseUpdated(updated);
      setActionSuccessMsg(isHi ? 'मामला सफलतापूर्वक बंद किया गया।' : 'Case closed successfully.');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-24">
      {/* Top Bar with Back button & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            id="expert-detail-back-btn"
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition flex items-center gap-1 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isHi ? 'कतार में वापस जाएं' : 'Back to Queue'}</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-900">
                {caseItem.id}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                  caseItem.priority === 'URGENT'
                    ? 'bg-red-600 text-white animate-pulse'
                    : caseItem.priority === 'HIGH'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                {caseItem.priority} Priority
              </span>
              {caseItem.isDemo && (
                <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold border border-stone-300">
                  Demo Case
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-black text-stone-900 mt-1 flex items-center gap-2">
              <span>{caseItem.crop}</span>
              <span className="text-stone-400 font-normal">|</span>
              <span className="text-stone-700 font-semibold text-base">
                {caseItem.fieldName || caseItem.farmName || 'Field Plot'}
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {caseItem.status !== 'CLOSED' && (
            <button
              onClick={handleCloseCase}
              className="px-3 py-1.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold transition"
            >
              {isHi ? 'मामला बंद करें' : 'Close Case'}
            </button>
          )}

          <div className="px-3 py-1.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs flex items-center gap-1.5 text-stone-700">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>{new Date(caseItem.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Left Column = Case Info, Crop Image, Context. Right Column = AI Analysis & Expert Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Image & Evidence Context (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Crop Image Card with Zoom */}
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-stone-600" />
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  {isHi ? 'फसल की प्राथमिक फोटो' : 'Crop Diagnostic Image'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                  className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono font-bold px-1 text-stone-600">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                  className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="relative h-72 sm:h-80 bg-stone-950 flex items-center justify-center overflow-hidden">
              <img
                src={caseItem.primaryImageUri}
                alt={caseItem.crop}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})` }}
              />
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs px-2 py-1 rounded text-[10px] text-white/90">
                Tap & Zoom to Inspect Lesions
              </div>
            </div>

            {/* Additional Images if available */}
            {caseItem.additionalImages && caseItem.additionalImages.length > 0 && (
              <div className="p-3 bg-stone-50 border-t border-stone-200">
                <span className="text-[10px] uppercase font-bold text-stone-500 block mb-2">
                  {isHi ? 'किसान द्वारा बाद में भेजी गई फोटो' : 'Additional Farmer Photos'}
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {caseItem.additionalImages.map((imgUri, idx) => (
                    <img
                      key={idx}
                      src={imgUri}
                      alt="Additional angle"
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover border border-stone-300 shrink-0"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Farmer & Field Context */}
          <div className="bg-white rounded-3xl border border-stone-200 p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-stone-400" />
              <span>{isHi ? 'किसान एवं खेत विवरण' : 'Farmer & Field Context'}</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">{isHi ? 'किसान का नाम' : 'Farmer Name'}</span>
                <span className="font-bold text-stone-900">{caseItem.farmerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">{isHi ? 'खेत / प्लॉट' : 'Farm / Parcel'}</span>
                <span className="font-semibold text-stone-800">
                  {caseItem.farmName || 'Registered Farm'} - {caseItem.fieldName || 'Field A'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">{isHi ? 'फसल' : 'Crop'}</span>
                <span className="font-bold text-emerald-800">
                  {caseItem.crop} {caseItem.cropHindi ? `(${caseItem.cropHindi})` : ''}
                </span>
              </div>
              {caseItem.farmerMessage && (
                <div className="pt-2">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold mb-1">
                    {isHi ? 'किसान का संदेश / समस्या विवरण' : 'Farmer Note'}
                  </span>
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-stone-800 text-xs italic">
                    "{caseItem.farmerMessage}"
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Weather & Environmental Stress Context (Part 3 integration) */}
          {caseItem.weatherContextSummary && (
            <div className="bg-white rounded-3xl border border-stone-200 p-5 space-y-3 shadow-xs">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-blue-500" />
                <span>{isHi ? 'मौसम एवं पर्यावरण संदर्भ' : 'Weather & Microclimate Context'}</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {caseItem.weatherContextSummary.temperature !== undefined && (
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                    <span className="text-[10px] text-stone-400 block">Temperature</span>
                    <span className="font-bold text-stone-800">
                      {caseItem.weatherContextSummary.temperature}°C
                    </span>
                  </div>
                )}
                {caseItem.weatherContextSummary.humidity !== undefined && (
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                    <span className="text-[10px] text-stone-400 block">Humidity</span>
                    <span className="font-bold text-stone-800">
                      {caseItem.weatherContextSummary.humidity}%
                    </span>
                  </div>
                )}
                {caseItem.weatherContextSummary.rainfall !== undefined && (
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                    <span className="text-[10px] text-stone-400 block">Recent Rain</span>
                    <span className="font-bold text-stone-800">
                      {caseItem.weatherContextSummary.rainfall} mm
                    </span>
                  </div>
                )}
              </div>
              {caseItem.weatherContextSummary.riskSummary && (
                <p className="text-[11px] text-stone-600 bg-blue-50/70 p-2.5 rounded-xl border border-blue-100">
                  {caseItem.weatherContextSummary.riskSummary}
                </p>
              )}
            </div>
          )}

          {/* Case Conversation & Audit Trail */}
          <div className="bg-white rounded-3xl border border-stone-200 p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-stone-400" />
              <span>{isHi ? 'केस टाइमलाइन एवं इतिहास' : 'Case Timeline & Audit History'}</span>
            </h3>

            <div className="space-y-3 relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
              {caseItem.timeline.map((entry) => (
                <div key={entry.id} className="relative text-xs space-y-0.5">
                  <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{entry.title}</span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(entry.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-stone-600 text-[11px]">{entry.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Assessment, AI vs Expert Comparison & Expert Decision Workspace (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* AI Assessment Card */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xs">
                  AI
                </div>
                <div>
                  <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    {isHi ? 'AI प्रारंभिक विश्लेषण' : 'Original AI Vision Assessment'}
                  </h3>
                  <p className="text-[11px] text-stone-400">Preserved verbatim for audit integrity</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-stone-500">Confidence: </span>
                <span className="font-black text-sm text-purple-950">
                  {Math.round(caseItem.aiAssessment.confidence * 100)}%
                </span>
              </div>
            </div>

            {/* AI Diagnosis details */}
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <h4 className="text-base font-black text-purple-950">
                  {caseItem.aiAssessment.diagnosis}
                </h4>
                <span className="px-2 py-0.5 rounded-md bg-purple-200 text-purple-900 text-[11px] font-bold shrink-0">
                  {caseItem.aiAssessment.problemType}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-purple-900">
                <span>
                  Severity: <strong>{caseItem.aiAssessment.severity}</strong>
                </span>
                <span>•</span>
                <span>
                  Area: <strong>{caseItem.aiAssessment.affectedAreaEstimate}</strong>
                </span>
              </div>
            </div>

            {/* AI Symptoms list */}
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                {isHi ? 'AI द्वारा पहचाने गए लक्षण' : 'Observed Symptoms (Vision Evidence)'}
              </span>
              <ul className="space-y-1">
                {caseItem.aiAssessment.symptoms.map((sym, idx) => (
                  <li key={idx} className="text-xs text-stone-700 flex items-start gap-1.5">
                    <span className="text-purple-600 font-bold">•</span>
                    <span>{sym}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Alternative AI diagnoses if available */}
            {caseItem.aiAssessment.secondaryConditions &&
              caseItem.aiAssessment.secondaryConditions.length > 0 && (
                <div className="pt-2 border-t border-stone-100">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                    {isHi ? 'वैकल्पिक AI संभावनाएं' : 'AI Differential Diagnoses Considered'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {caseItem.aiAssessment.secondaryConditions.map((cond, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-stone-100 text-stone-700 text-xs font-medium"
                      >
                        {cond.name} ({Math.round(cond.confidence * 100)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* AI vs Expert Comparison (If Expert has reviewed or is reviewing) */}
          {caseItem.expertAssessment && (
            <div className="bg-gradient-to-br from-blue-50/90 to-emerald-50/90 rounded-3xl border-2 border-blue-300 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-700" />
                  <h3 className="text-sm font-black text-blue-950 uppercase tracking-wider">
                    {isHi ? 'AI बनाम विशेषज्ञ तुलना एवं सत्यापन' : 'AI vs Expert Verification Verdict'}
                  </h3>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                    caseItem.expertAssessment.isCorrected
                      ? 'bg-amber-400 text-stone-950'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {caseItem.expertAssessment.isCorrected
                    ? '✓ Expert Corrected AI'
                    : '✓ Expert Confirmed AI'}
                </span>
              </div>

              {/* Side by side comparison cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* AI side */}
                <div className="p-3.5 bg-white rounded-2xl border border-purple-200">
                  <span className="text-[10px] font-bold text-purple-700 uppercase block mb-1">
                    Original AI Assessment
                  </span>
                  <div className="font-bold text-stone-900 text-sm">
                    {caseItem.aiAssessment.diagnosis}
                  </div>
                  <div className="text-stone-500 mt-1">
                    Confidence: {Math.round(caseItem.aiAssessment.confidence * 100)}% | Severity:{' '}
                    {caseItem.aiAssessment.severity}
                  </div>
                </div>

                {/* Expert side */}
                <div
                  className={`p-3.5 bg-white rounded-2xl border ${
                    caseItem.expertAssessment.isCorrected
                      ? 'border-amber-300 ring-2 ring-amber-200'
                      : 'border-emerald-300 ring-2 ring-emerald-200'
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold uppercase block mb-1 ${
                      caseItem.expertAssessment.isCorrected ? 'text-amber-800' : 'text-emerald-800'
                    }`}
                  >
                    Verified Expert Assessment
                  </span>
                  <div className="font-bold text-stone-950 text-sm">
                    {caseItem.expertAssessment.verifiedDiagnosis}
                  </div>
                  <div className="text-stone-600 mt-1">
                    Confidence: {caseItem.expertAssessment.expertConfidence} | Reviewer:{' '}
                    {caseItem.expertAssessment.expertName}
                  </div>
                </div>
              </div>

              {/* Correction Reasoning */}
              {caseItem.expertAssessment.correctionReason && (
                <div className="p-3.5 bg-white/80 rounded-2xl border border-amber-200 text-xs space-y-1">
                  <span className="font-bold text-amber-950 block">Scientific Reasoning:</span>
                  <p className="text-stone-700 leading-relaxed">
                    {caseItem.expertAssessment.correctionReason}
                  </p>
                </div>
              )}

              {/* Farmer Visible Guidance */}
              <div className="space-y-2 pt-2 border-t border-blue-200 text-xs">
                <span className="font-bold text-blue-950 block">
                  Farmer-Facing Guidance Delivered:
                </span>
                <ul className="space-y-1">
                  {caseItem.expertAssessment.farmerVisibleResponse.recommendedActions.map(
                    (act, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-stone-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Data Quality & Future Learning Flag */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500 border-t border-blue-100">
                <span>
                  Training Candidate Flag:{' '}
                  <strong className="text-blue-900 font-mono">
                    {caseItem.expertAssessment.dataQualityFlag}
                  </strong>
                </span>
                <span>Reviewed: {new Date(caseItem.expertAssessment.reviewedAt).toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* MAIN EXPERT WORKSPACE (Decision Form) */}
          <div className="bg-white rounded-3xl border-2 border-blue-600 p-6 space-y-6 shadow-md">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-base font-black text-stone-950 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-700" />
                  <span>{isHi ? 'विशेषज्ञ कार्यक्षेत्र (Expert Workspace)' : 'Expert Workspace'}</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Reviewing as: <strong>{activeExpert.name}</strong> ({activeExpert.title})
                </p>
              </div>

              <span className="text-xs px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 font-bold border border-blue-200">
                Case Decision Mode
              </span>
            </div>

            {/* Decision Option Buttons */}
            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-3">
                {isHi ? 'समीक्षा निर्णय चुनें' : 'Select Expert Action:'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  id="decision-confirm-btn"
                  onClick={() => setSelectedDecision('CONFIRM')}
                  className={`p-3 rounded-2xl border text-left font-bold text-xs transition-all flex flex-col justify-between ${
                    selectedDecision === 'CONFIRM'
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm ring-2 ring-emerald-500'
                      : 'bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-950 border-emerald-200'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 mb-1 text-emerald-500" />
                  <span>1. Confirm AI Diagnosis</span>
                </button>

                <button
                  type="button"
                  id="decision-correct-btn"
                  onClick={() => setSelectedDecision('CORRECT')}
                  className={`p-3 rounded-2xl border text-left font-bold text-xs transition-all flex flex-col justify-between ${
                    selectedDecision === 'CORRECT'
                      ? 'bg-amber-600 text-white border-amber-700 shadow-sm ring-2 ring-amber-400'
                      : 'bg-amber-50/70 hover:bg-amber-100/70 text-amber-950 border-amber-200'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 mb-1 text-amber-500" />
                  <span>2. Correct Diagnosis</span>
                </button>

                <button
                  type="button"
                  id="decision-uncertain-btn"
                  onClick={() => setSelectedDecision('UNCERTAIN')}
                  className={`p-3 rounded-2xl border text-left font-bold text-xs transition-all flex flex-col justify-between ${
                    selectedDecision === 'UNCERTAIN'
                      ? 'bg-slate-700 text-white border-slate-800 shadow-sm ring-2 ring-slate-500'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border-slate-200'
                  }`}
                >
                  <HelpCircle className="w-5 h-5 mb-1 text-slate-500" />
                  <span>3. Mark Uncertain</span>
                </button>

                <button
                  type="button"
                  id="decision-request-info-btn"
                  onClick={() => setSelectedDecision('REQUEST_INFO')}
                  className={`p-3 rounded-2xl border text-left font-bold text-xs transition-all flex flex-col justify-between ${
                    selectedDecision === 'REQUEST_INFO'
                      ? 'bg-blue-700 text-white border-blue-800 shadow-sm ring-2 ring-blue-500'
                      : 'bg-blue-50/70 hover:bg-blue-100/70 text-blue-950 border-blue-200'
                  }`}
                >
                  <MessageSquare className="w-5 h-5 mb-1 text-blue-500" />
                  <span>4. Request More Info</span>
                </button>

                <button
                  type="button"
                  id="decision-insufficient-btn"
                  onClick={() => {
                    setRequestType('CLOSER_LEAF');
                    setRequestMessage(
                      'The submitted photo is blurry or obscured. Please take a crisp photo in daylight.'
                    );
                    setSelectedDecision('REQUEST_INFO');
                  }}
                  className="p-3 rounded-2xl border text-left font-bold text-xs transition-all flex flex-col justify-between bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200"
                >
                  <Eye className="w-5 h-5 mb-1 text-stone-500" />
                  <span>5. Insufficient Image</span>
                </button>

                <button
                  type="button"
                  id="decision-escalate-btn"
                  onClick={() => setIsEscalateModalOpen(true)}
                  className="p-3 rounded-2xl border text-left font-bold text-xs transition-all flex flex-col justify-between bg-purple-50 hover:bg-purple-100 text-purple-950 border-purple-200 shadow-xs"
                >
                  <ShieldAlert className="w-5 h-5 mb-1 text-purple-600" />
                  <span>6. Escalate to Extension</span>
                </button>
              </div>
            </div>

            {/* CONDITIONAL SUB-FORM: 1. CONFIRM AI */}
            {selectedDecision === 'CONFIRM' && (
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Confirming: {caseItem.aiAssessment.diagnosis}</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    {isHi ? 'विशेषज्ञ अवलोकन व टिप्पणी (किसान को दिखेगी)' : 'Expert Observations (Visible to Farmer):'}
                  </label>
                  <textarea
                    rows={2}
                    value={confirmObservations}
                    onChange={(e) => setConfirmObservations(e.target.value)}
                    placeholder="e.g. Concentric ring patterns and yellow chlorotic margins confirm Alternaria solani..."
                    className="w-full text-xs p-3 rounded-xl border border-emerald-300 focus:outline-emerald-600 bg-white"
                  />
                </div>

                {/* IPM Recommended Actions to Farmer */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    {isHi ? 'अनुशंसित प्रबंधन उपाय (IPM Actions)' : 'Recommended IPM Actions to Farmer:'}
                  </label>
                  <ul className="space-y-1 mb-2">
                    {confirmActions.map((act, idx) => (
                      <li
                        key={idx}
                        className="text-xs flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200"
                      >
                        <span>{act}</span>
                        <button
                          type="button"
                          onClick={() => setConfirmActions(confirmActions.filter((_, i) => i !== idx))}
                          className="text-stone-400 hover:text-red-600 text-[11px] font-bold px-1"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newActionInput}
                      onChange={(e) => setNewActionInput(e.target.value)}
                      placeholder="Add recommended action..."
                      className="text-xs p-2 rounded-lg border border-stone-300 flex-1 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newActionInput.trim()) {
                          setConfirmActions([...confirmActions, newActionInput.trim()]);
                          setNewActionInput('');
                        }
                      }}
                      className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-800"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* AI Feedback & Data Quality */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-200">
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">
                      AI Feedback for Model Retraining:
                    </label>
                    <select
                      value={confirmAiFeedback}
                      onChange={(e) => setConfirmAiFeedback(e.target.value as ExpertAIFeedback)}
                      className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                    >
                      <option value="AI_CORRECT">AI Correct</option>
                      <option value="AI_PARTIALLY_CORRECT">AI Partially Correct</option>
                      <option value="AI_CONFIDENCE_TOO_HIGH">AI Confidence Too High</option>
                      <option value="AI_CONFIDENCE_TOO_LOW">AI Confidence Too Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">
                      Verified Dataset Quality Flag:
                    </label>
                    <select
                      value={confirmQualityFlag}
                      onChange={(e) => setConfirmQualityFlag(e.target.value as DataQualityFlag)}
                      className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                    >
                      <option value="VERIFIED_HIGH_QUALITY">Verified High Quality (Gold)</option>
                      <option value="VERIFIED">Verified Standard</option>
                      <option value="NEEDS_REVIEW">Needs Further Extension Review</option>
                    </select>
                  </div>
                </div>

                {/* Internal Private Notes (Strictly hidden from farmer) */}
                <div className="pt-2 border-t border-emerald-200">
                  <label className="text-[11px] font-bold text-stone-600 flex items-center gap-1 mb-1">
                    <Lock className="w-3.5 h-3.5 text-stone-500" />
                    <span>Internal Agronomist Notes (Strictly Private - Not Visible to Farmer):</span>
                  </label>
                  <input
                    type="text"
                    value={confirmInternalNotes}
                    onChange={(e) => setConfirmInternalNotes(e.target.value)}
                    placeholder="Internal case notes for audit and research logs..."
                    className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-stone-50"
                  />
                </div>

                <button
                  id="submit-confirm-verification-btn"
                  onClick={handleConfirmSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm rounded-2xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isSubmitting ? 'Verifying...' : 'Submit Confirmation & Send Verified Guidance'}
                  </span>
                </button>
              </div>
            )}

            {/* CONDITIONAL SUB-FORM: 2. CORRECT AI */}
            {selectedDecision === 'CORRECT' && (
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span>Correct AI Assessment (Both AI and Expert assessments are preserved)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Correct Problem Type:
                    </label>
                    <select
                      value={correctProblemType}
                      onChange={(e) => setCorrectProblemType(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white font-semibold"
                    >
                      <option value="Disease">Disease</option>
                      <option value="Pest">Pest</option>
                      <option value="Nutrient Deficiency">Nutrient Deficiency</option>
                      <option value="Environmental Stress">Environmental Stress</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Correct Severity:
                    </label>
                    <select
                      value={correctSeverity}
                      onChange={(e) => setCorrectSeverity(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white font-semibold"
                    >
                      <option value="Low">Low</option>
                      <option value="Moderate">Moderate</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Correct Diagnosis (Verified Disease/Pest Name): *
                  </label>
                  <input
                    type="text"
                    value={correctDiagnosis}
                    onChange={(e) => setCorrectDiagnosis(e.target.value)}
                    placeholder="e.g. Septoria Leaf Spot (Septoria lycopersici)"
                    className="w-full text-xs p-3 rounded-xl border border-amber-300 bg-white font-bold text-stone-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Scientific Reasoning for Correction (Visible to Farmer): *
                  </label>
                  <textarea
                    rows={3}
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    placeholder="Describe why AI was mistaken (e.g. Lesions feature distinct grey centers with dark brown borders and pycnidia speckles, characteristic of Septoria rather than Early Blight target rings)..."
                    className="w-full text-xs p-3 rounded-xl border border-amber-300 bg-white"
                  />
                </div>

                {/* Corrected IPM Actions */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Corrected Guidance Actions for Farmer:
                  </label>
                  <ul className="space-y-1 mb-2">
                    {correctActions.map((act, idx) => (
                      <li
                        key={idx}
                        className="text-xs flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200"
                      >
                        <span>{act}</span>
                        <button
                          type="button"
                          onClick={() => setCorrectActions(correctActions.filter((_, i) => i !== idx))}
                          className="text-stone-400 hover:text-red-600 text-[11px] font-bold px-1"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCorrectActionInput}
                      onChange={(e) => setNewCorrectActionInput(e.target.value)}
                      placeholder="Add corrected IPM recommendation..."
                      className="text-xs p-2 rounded-lg border border-stone-300 flex-1 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newCorrectActionInput.trim()) {
                          setCorrectActions([...correctActions, newCorrectActionInput.trim()]);
                          setNewCorrectActionInput('');
                        }
                      }}
                      className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* AI Feedback & Quality */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200">
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">
                      AI Feedback:
                    </label>
                    <select
                      value={correctAiFeedback}
                      onChange={(e) => setCorrectAiFeedback(e.target.value as ExpertAIFeedback)}
                      className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                    >
                      <option value="AI_INCORRECT">AI Incorrect (Misclassification)</option>
                      <option value="AI_PARTIALLY_CORRECT">AI Partially Correct</option>
                      <option value="IMAGE_INSUFFICIENT">Image Quality Misled AI</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">
                      Candidate Flag for Retraining:
                    </label>
                    <select
                      value={correctQualityFlag}
                      onChange={(e) => setCorrectQualityFlag(e.target.value as DataQualityFlag)}
                      className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                    >
                      <option value="VERIFIED_HIGH_QUALITY">
                        High Quality Hard Negative (Essential for Retraining)
                      </option>
                      <option value="VERIFIED">Standard Corrected Sample</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200">
                  <label className="text-[11px] font-bold text-stone-600 flex items-center gap-1 mb-1">
                    <Lock className="w-3.5 h-3.5 text-stone-500" />
                    <span>Internal Agronomist Notes (Strictly Private):</span>
                  </label>
                  <input
                    type="text"
                    value={correctInternalNotes}
                    onChange={(e) => setCorrectInternalNotes(e.target.value)}
                    placeholder="Private notes for diagnostic research team..."
                    className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-stone-50"
                  />
                </div>

                <button
                  id="submit-correct-diagnosis-btn"
                  onClick={handleCorrectSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-stone-950 font-black text-sm rounded-2xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    {isSubmitting ? 'Saving Correction...' : 'Apply Correction & Send to Farmer'}
                  </span>
                </button>
              </div>
            )}

            {/* CONDITIONAL SUB-FORM: 3. MARK UNCERTAIN */}
            {selectedDecision === 'UNCERTAIN' && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-300 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <HelpCircle className="w-5 h-5 text-slate-600" />
                  <span>Mark as Uncertain (Physical In-Field Inspection Required)</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Uncertainty Reason Category:
                  </label>
                  <select
                    value={uncertaintyPreset}
                    onChange={(e) => setUncertaintyPreset(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="symptoms overlap">Symptoms overlap between multiple pathogens</option>
                    <option value="additional field inspection required">
                      Physical leaf-underside lens inspection required
                    </option>
                    <option value="multiple possible causes">
                      Multiple possible causes (virus vs nutrient deficiency)
                    </option>
                    <option value="insufficient information">
                      Insufficient field context and history
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Explanation to Farmer:
                  </label>
                  <textarea
                    rows={3}
                    value={customUncertaintyReason}
                    onChange={(e) => setCustomUncertaintyReason(e.target.value)}
                    placeholder="Explain why an in-person physical check with a 10x lens or soil test is necessary before spraying..."
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-white"
                  />
                </div>

                <button
                  id="submit-uncertainty-verdict-btn"
                  onClick={handleUncertainSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-black text-sm rounded-2xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>
                    {isSubmitting ? 'Submitting...' : 'Mark Uncertain & Recommend Field Inspection'}
                  </span>
                </button>
              </div>
            )}

            {/* CONDITIONAL SUB-FORM: 4. REQUEST MORE INFORMATION */}
            {selectedDecision === 'REQUEST_INFO' && (
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-300 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span>Request Additional Information or Photo from Farmer</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Select Request Type:
                  </label>
                  <select
                    value={requestType}
                    onChange={(e) => {
                      const t = e.target.value as InfoRequestType;
                      setRequestType(t);
                      if (t === 'CLOSER_LEAF')
                        setRequestMessage('Please upload a closer, focused photo of the leaf spot.');
                      else if (t === 'WHOLE_PLANT')
                        setRequestMessage('Please upload a photo of the whole plant showing overall canopy.');
                      else if (t === 'LEAF_UNDERSIDE')
                        setRequestMessage('Please show the underside of the affected leaf.');
                      else if (t === 'AFFECTED_FRUIT')
                        setRequestMessage('Please take a picture of affected fruit/bolls/pods.');
                      else if (t === 'RECENT_RAINFALL')
                        setRequestMessage('Please inform how many days of rainfall occurred recently.');
                    }}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white font-semibold"
                  >
                    <option value="CLOSER_LEAF">Upload closer image of affected leaf</option>
                    <option value="WHOLE_PLANT">Upload image of whole plant canopy</option>
                    <option value="LEAF_UNDERSIDE">Show underside of leaf (mold/spores)</option>
                    <option value="AFFECTED_FRUIT">Upload photo of affected fruit/pods</option>
                    <option value="RECENT_RAINFALL">Provide rainfall & irrigation history</option>
                    <option value="SYMPTOM_DATE">Provide date when symptoms first appeared</option>
                    <option value="CUSTOM">Custom request</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Message to Farmer: *
                  </label>
                  <textarea
                    rows={2}
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-blue-300 bg-white"
                  />
                </div>

                <button
                  id="submit-info-request-btn"
                  onClick={handleRequestInfoSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-black text-sm rounded-2xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sending...' : 'Send Request to Farmer'}</span>
                </button>
              </div>
            )}

            {/* Legal Safety Notice */}
            <div className="text-[11px] text-stone-500 bg-stone-100 p-3 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <span>
                Verified advice is delivered under Indian ICAR / State KVK agricultural extension
                principles. Chemical recommendations require adherence to registered label claims.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Escalate to Government / Extension Modal */}
      <EscalateCaseModal
        caseData={currentClosedLoopCase}
        isOpen={isEscalateModalOpen}
        onClose={() => setIsEscalateModalOpen(false)}
        onEscalate={handleEscalateSubmit}
        language={language}
      />
    </div>
  );
};
