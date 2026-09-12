import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  HelpCircle,
  MessageSquare,
  Upload,
  ArrowRight,
  ChevronLeft,
  Camera,
  Send,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Info,
  Calendar,
  Check,
  UserCheck,
  Activity,
  Briefcase,
  AlertOctagon,
} from 'lucide-react';
import { ClosedLoopCase, DataConsent } from '../closed-loop/types';
import {
  getCasesForFarmer,
  submitFarmerOutcome,
  fileCaseDispute,
  updateCaseConsent,
} from '../closed-loop/services/closedLoopService';
import {
  farmerSubmitResponse,
  submitFarmerFeedback,
} from '../services/expert/caseService';
import { ClosedLoopVisualizer } from '../closed-loop/components/ClosedLoopVisualizer';
import { BeforeAfterComparison } from '../closed-loop/components/BeforeAfterComparison';
import { OutcomeReportModal } from '../closed-loop/components/OutcomeReportModal';
import { DisputeCaseModal } from '../closed-loop/components/DisputeCaseModal';
import { DataConsentBadge } from '../closed-loop/components/DataConsentBadge';

interface FarmerCasesScreenProps {
  language: 'en' | 'hi';
  onNavigateHome: () => void;
  onOpenCheckCrop: () => void;
  selectedCaseId?: string;
}

export const FarmerCasesScreen: React.FC<FarmerCasesScreenProps> = ({
  language,
  onNavigateHome,
  onOpenCheckCrop,
  selectedCaseId,
}) => {
  const isHi = language === 'hi';

  const [cases, setCases] = useState<ClosedLoopCase[]>([]);
  const [activeCase, setActiveCase] = useState<ClosedLoopCase | null>(null);

  // Farmer Response states
  const [responseText, setResponseText] = useState('');
  const [responseImage, setResponseImage] = useState<string | null>(null);
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  // Closed Loop Modals
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

  // Farmer Feedback states
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    loadCases();
  }, [selectedCaseId]);

  const loadCases = () => {
    const list = getCasesForFarmer('farmer-primary');
    setCases(list);
    if (selectedCaseId) {
      const found = list.find((c) => c.id === selectedCaseId);
      if (found) setActiveCase(found);
    }
  };

  const handleSelectCase = (c: ClosedLoopCase) => {
    setActiveCase(c);
    setResponseText('');
    setResponseImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setResponseImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitResponse = () => {
    if (!activeCase) return;
    if (!responseText.trim() && !responseImage) {
      alert(isHi ? 'कृपया कोई संदेश या फोटो जोड़ें' : 'Please enter text or upload a photo');
      return;
    }

    setIsSubmittingResponse(true);
    try {
      const updated = farmerSubmitResponse({
        caseId: activeCase.id,
        message: responseText.trim() || 'Uploaded additional requested photo',
        imageUri: responseImage || undefined,
      });
      // reload
      loadCases();
      setActiveCase((prev) => (prev ? ({ ...prev, ...updated } as ClosedLoopCase) : null));
      setResponseText('');
      setResponseImage(null);
    } catch (err: any) {
      alert(err.message || 'Failed to submit response');
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const handleFeedback = (helpful: boolean, solvedProblem?: 'YES' | 'PARTIALLY' | 'NO') => {
    if (!activeCase) return;
    submitFarmerFeedback({
      caseId: activeCase.id,
      helpful,
      solvedProblem,
    });
    setFeedbackSuccess(true);
    setTimeout(() => setFeedbackSuccess(false), 3000);
    loadCases();
  };

  const handleOutcomeReported = () => {
    loadCases();
    if (activeCase) {
      const refreshed = getCasesForFarmer('farmer-primary').find((c) => c.id === activeCase.id);
      if (refreshed) setActiveCase(refreshed);
    }
  };

  const handleDisputeSubmitted = () => {
    loadCases();
    if (activeCase) {
      const refreshed = getCasesForFarmer('farmer-primary').find((c) => c.id === activeCase.id);
      if (refreshed) setActiveCase(refreshed);
    }
  };

  const handleUpdateConsent = (consent: Partial<DataConsent>) => {
    if (!activeCase) return;
    const updated = updateCaseConsent(activeCase.id, consent);
    if (updated) {
      setActiveCase(updated);
      loadCases();
    }
  };

  // Helper for status badge
  const renderStatusBadge = (c: ClosedLoopCase) => {
    if (c.status === 'OUTCOME_VERIFIED') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-black flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isHi ? '✓ सुधार सत्यापित' : '✓ Recovery Verified'}</span>
        </span>
      );
    }
    if (c.status === 'OUTCOME_REPORTED') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-teal-100 border border-teal-300 text-teal-900 text-[11px] font-black flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-teal-600" />
          <span>{isHi ? 'परिणाम दर्ज (समीक्षाधीन)' : 'Outcome Reported'}</span>
        </span>
      );
    }
    if (c.status === 'ESCALATED_TO_EXTENSION' || c.status === 'ACTION_IN_PROGRESS') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-purple-100 border border-purple-300 text-purple-900 text-[11px] font-black flex items-center gap-1">
          <Briefcase className="w-3.5 h-3.5 text-purple-600" />
          <span>{isHi ? 'प्रसार सहायता सक्रिय' : 'Extension Support Active'}</span>
        </span>
      );
    }
    if (c.status === 'DISPUTED' || c.dispute?.status === 'IN_SECOND_REVIEW') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-900 text-[11px] font-black flex items-center gap-1">
          <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
          <span>{isHi ? 'पुनः समीक्षाधीन (आपत्ति)' : 'Second Review Active'}</span>
        </span>
      );
    }
    if (c.verificationStatus === 'EXPERT_VERIFIED') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-black flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isHi ? '✓ विशेषज्ञ सत्यापित' : '✓ Expert Verified'}</span>
        </span>
      );
    }
    if (c.verificationStatus === 'EXPERT_CORRECTED') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-black flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>{isHi ? '✓ विशेषज्ञ द्वारा संशोधित' : '✓ Expert Corrected AI'}</span>
        </span>
      );
    }
    if (c.status === 'WAITING_FOR_FARMER') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-blue-100 border border-blue-300 text-blue-900 text-[11px] font-black flex items-center gap-1 animate-pulse">
          <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
          <span>{isHi ? 'जानकारी की प्रतीक्षा' : 'Action Needed (Info Requested)'}</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full bg-stone-100 border border-stone-300 text-stone-700 text-[11px] font-bold flex items-center gap-1">
        <Clock className="w-3.5 h-3.5 text-stone-500" />
        <span>{isHi ? 'विशेषज्ञ समीक्षाधीन' : 'Pending Expert Review'}</span>
      </span>
    );
  };

  // IF AN ACTIVE CASE IS SELECTED, SHOW THE DETAIL TIMELINE
  if (activeCase) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 pb-24">
        {/* Back button */}
        <button
          onClick={() => setActiveCase(null)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white border border-stone-200 text-stone-800 text-xs font-bold shadow-xs hover:bg-stone-50 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{isHi ? 'सभी परामर्श मामलों पर लौटें' : 'Back to My Consultations'}</span>
        </button>

        {/* Closed Loop Visualizer */}
        <ClosedLoopVisualizer currentStatus={activeCase.status} language={language} />

        {/* Case Header Card */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                  {activeCase.id}
                </span>
                {activeCase.isDemo && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                    DEMO DATA
                  </span>
                )}
                {renderStatusBadge(activeCase)}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900">
                {activeCase.crop} {activeCase.cropHindi ? `(${activeCase.cropHindi})` : ''}
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                {activeCase.fieldName || 'Field Plot'} • Submitted on{' '}
                {new Date(activeCase.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
              <img
                src={activeCase.primaryImageUri}
                alt={activeCase.crop}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Action Buttons for Closed Loop */}
          <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsOutcomeModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-xs flex items-center gap-1.5 transition"
            >
              <Activity className="w-4 h-4 text-emerald-300" />
              <span>
                {activeCase.outcomeReport
                  ? isHi
                    ? 'अपडेट परिणाम रिपोर्ट'
                    : 'Update Outcome Report'
                  : isHi
                  ? 'फसल परिणाम रिपोर्ट करें'
                  : 'Report Crop Outcome'}
              </span>
            </button>

            <button
              onClick={() => setIsDisputeModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <AlertOctagon className="w-4 h-4 text-amber-600" />
              <span>{isHi ? 'उपचार से लाभ नहीं हुआ?' : 'Treatment Did Not Help?'}</span>
            </button>
          </div>
        </div>

        {/* Extension Support Banner if Escalated */}
        {activeCase.escalation && (
          <div className="bg-purple-50 border-2 border-purple-300 rounded-3xl p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-purple-950 font-black text-sm">
              <Briefcase className="w-5 h-5 text-purple-700" />
              <span>
                {isHi
                  ? 'कृषि प्रसार सहायता प्रेषित (Extension Support Escalated)'
                  : 'Government Agricultural Extension Escalation'}
              </span>
            </div>
            <p className="text-xs text-purple-900 leading-relaxed">
              {isHi
                ? `यह मामला जिला प्रसार अधिकारियों को प्राथमिकता सहायता हेतु प्रेषित किया गया है। अनुशंसित कदम: ${activeCase.escalation.recommendedAction}`
                : `This case was escalated to district authorities for intervention. Recommended: ${activeCase.escalation.recommendedAction}`}
            </p>
          </div>
        )}

        {/* Before vs After Outcome Comparison Card if Outcome Report Exists */}
        {activeCase.outcomeReport && (
          <BeforeAfterComparison
            crop={activeCase.crop}
            initialImageUri={activeCase.primaryImageUri}
            initialDiagnosis={
              activeCase.expertAssessment?.verifiedDiagnosis || activeCase.aiAssessment.diagnosis
            }
            initialSeverity={
              activeCase.expertAssessment?.verifiedSeverity || activeCase.aiAssessment.severity
            }
            outcomeReport={activeCase.outcomeReport}
            outcomeVerification={activeCase.outcomeVerification}
            language={language}
          />
        )}

        {/* EXPERT REQUESTED MORE INFO BANNER */}
        {activeCase.infoRequest && activeCase.status === 'WAITING_FOR_FARMER' && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-3xl p-6 space-y-4 animate-in fade-in shadow-sm">
            <div className="flex items-center gap-2 text-blue-950 font-black text-sm">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span>
                {isHi ? 'कृषि वैज्ञानिक ने अतिरिक्त जानकारी मांगी है:' : 'Expert Requested More Information:'}
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-blue-200 text-xs text-blue-950 font-medium">
              "{activeCase.infoRequest.message}"
            </div>

            {/* Farmer Response Form */}
            <div className="space-y-3 pt-1">
              <label className="text-xs font-bold text-stone-700 block">
                {isHi ? 'अपना उत्तर या स्पष्टीकरण लिखें:' : 'Add Your Information:'}
              </label>
              <textarea
                rows={2}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder={
                  isHi
                    ? 'उदा. पत्ती के पीछे की नई फोटो संलग्न कर रहा हूँ...'
                    : 'Describe your observation or answer the agronomist questions...'
                }
                className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-blue-600 bg-white"
              />

              {/* Photo Attachment */}
              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-2 border border-stone-300 transition">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span>{responseImage ? 'Change Photo' : 'Attach Closer Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {responseImage && (
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-blue-400">
                    <img
                      src={responseImage}
                      alt="Farmer response"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <button
                id="farmer-send-response-btn"
                onClick={handleSubmitResponse}
                disabled={isSubmittingResponse}
                className="w-full py-3 bg-blue-800 hover:bg-blue-900 text-white font-black text-xs rounded-2xl shadow-xs transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmittingResponse ? 'Sending...' : 'Send Response to Expert'}</span>
              </button>
            </div>
          </div>
        )}

        {/* VERIFIED EXPERT GUIDANCE CARD */}
        {activeCase.expertAssessment && (
          <div className="bg-gradient-to-br from-emerald-50/90 to-teal-50/90 border-2 border-emerald-300 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-200/80 px-2.5 py-0.5 rounded-full">
                  {activeCase.expertAssessment.isCorrected
                    ? 'Expert Corrected Diagnosis'
                    : 'Expert Verified Guidance'}
                </span>
                <h3 className="text-xl font-black text-emerald-950 mt-1">
                  {activeCase.expertAssessment.verifiedDiagnosis}
                </h3>
                <p className="text-xs text-emerald-800 flex items-center gap-1.5 mt-0.5">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  <span>
                    Reviewed by <strong>{activeCase.expertAssessment.expertName}</strong> (
                    {activeCase.expertAssessment.expertTitle})
                  </span>
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-sm shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            {/* Explanation */}
            <div className="p-4 bg-white/90 rounded-2xl border border-emerald-200 text-xs text-stone-800 leading-relaxed space-y-1">
              <span className="font-bold text-emerald-950 block">Scientific Assessment:</span>
              <p>{activeCase.expertAssessment.farmerVisibleResponse.explanation}</p>
            </div>

            {/* IPM Actions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                {isHi ? 'विशेषज्ञ द्वारा अनुशंसित कदम (Recommended Actions):' : 'Recommended IPM Actions:'}
              </h4>
              <ul className="space-y-1.5">
                {activeCase.expertAssessment.farmerVisibleResponse.recommendedActions.map(
                  (action, idx) => (
                    <li
                      key={idx}
                      className="p-3 bg-white/95 rounded-xl border border-emerald-200/80 text-xs font-medium text-stone-900 flex items-start gap-2 shadow-xs"
                    >
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Chemical Notice */}
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-950 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{activeCase.expertAssessment.farmerVisibleResponse.chemicalGuidanceNotice}</span>
            </div>

            {/* FARMER FEEDBACK FORM */}
            <div className="pt-3 border-t border-emerald-200/80 space-y-3">
              <span className="text-xs font-bold text-emerald-950 block">
                {isHi ? 'क्या यह परामर्श आपके लिए उपयोगी रहा?' : 'Was this expert guidance helpful?'}
              </span>

              {feedbackSuccess ? (
                <div className="p-3 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{isHi ? 'आपकी प्रतिक्रिया दर्ज कर ली गई है। धन्यवाद!' : 'Feedback submitted. Thank you!'}</span>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleFeedback(true, 'YES')}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-xs"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isHi ? 'हाँ, बहुत मददगार' : 'Yes, Very Helpful'}</span>
                  </button>

                  <button
                    onClick={() => handleFeedback(true, 'PARTIALLY')}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 text-xs font-medium flex items-center gap-1.5 transition active:scale-95 shadow-xs"
                  >
                    <span>{isHi ? 'आंशिक रूप से' : 'Partially'}</span>
                  </button>

                  <button
                    onClick={() => handleFeedback(false, 'NO')}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-red-50 border border-stone-300 text-stone-700 text-xs font-medium flex items-center gap-1.5 transition active:scale-95 shadow-xs"
                  >
                    <ThumbsDown className="w-3.5 h-3.5 text-stone-500" />
                    <span>{isHi ? 'नहीं' : 'No'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Data Governance & Consent Badge */}
        <DataConsentBadge
          caseData={activeCase}
          onUpdateConsent={handleUpdateConsent}
          language={language}
        />

        {/* CASE CONVERSATION TIMELINE */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs">
          <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-stone-400" />
            <span>{isHi ? 'संवाद एवं केस इतिहास' : 'Case Communication & Timeline'}</span>
          </h3>

          <div className="space-y-4 relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
            {activeCase.timeline.map((entry) => (
              <div key={entry.id} className="relative text-xs space-y-1">
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
                <p className="text-stone-600 text-xs">{entry.description}</p>
                {entry.imageUri && (
                  <img
                    src={entry.imageUri}
                    alt="Timeline attachment"
                    className="w-20 h-20 rounded-xl object-cover border border-stone-300 mt-1"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modals */}
        <OutcomeReportModal
          caseData={activeCase}
          isOpen={isOutcomeModalOpen}
          onClose={() => setIsOutcomeModalOpen(false)}
          onSubmitSuccess={handleOutcomeReported}
          language={language}
        />

        <DisputeCaseModal
          caseData={activeCase}
          isOpen={isDisputeModalOpen}
          onClose={() => setIsDisputeModalOpen(false)}
          onSubmitSuccess={handleDisputeSubmitted}
          language={language}
        />
      </div>
    );
  }

  // DEFAULT VIEW: LIST OF FARMER CASES
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold text-[10px] uppercase tracking-wider">
              Closed Loop Agricultural Support
            </span>
            <span className="text-xs text-stone-500">Farmer → Expert → Government</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900">
            {isHi ? 'मेरे विशेषज्ञ परामर्श (My Consultations)' : 'My Expert Consultations'}
          </h1>
          <p className="text-xs text-stone-500 max-w-lg mt-0.5">
            {isHi
              ? 'कृषि वैज्ञानिकों एवं प्रसार विभाग द्वारा जांची गई आपकी फसलें, सत्यापन रिपोर्ट, खेत निरीक्षण व परिणाम।'
              : 'Track diagnostic cases reviewed by agronomists, district extension visits, and recovery outcomes.'}
          </p>
        </div>

        <button
          onClick={onOpenCheckCrop}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
        >
          <Camera className="w-4 h-4" />
          <span>{isHi ? 'नई फसल की जांच करें' : 'Scan New Crop'}</span>
        </button>
      </div>

      {/* Case List */}
      {cases.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4 shadow-xs">
          <ShieldCheck className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-bold text-stone-800">
            {isHi ? 'कोई सक्रिय परामर्श मामला नहीं है' : 'No Expert Consultations Yet'}
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {isHi
              ? 'जब आप अपनी फसल की AI जांच के बाद "विशेषज्ञ से पूछें" पर क्लिक करेंगे, तो आपका मामला यहां दिखेगा।'
              : 'When you scan a crop and tap "Ask an Expert", your case and verified agronomist guidance will appear here.'}
          </p>
          <button
            onClick={onOpenCheckCrop}
            className="px-5 py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-xl hover:bg-emerald-800"
          >
            {isHi ? 'फसल जांच प्रारंभ करें' : 'Start Crop Diagnosis'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => handleSelectCase(c)}
              className="bg-white rounded-3xl border border-stone-200 p-5 hover:border-blue-300 hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                  <img
                    src={c.primaryImageUri}
                    alt={c.crop}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                      {c.id}
                    </span>
                    {c.isDemo && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                        DEMO
                      </span>
                    )}
                    {renderStatusBadge(c)}
                  </div>

                  <h3 className="text-base font-black text-stone-900">
                    {c.crop} {c.cropHindi ? `(${c.cropHindi})` : ''}
                  </h3>

                  <p className="text-xs text-stone-600">
                    {c.expertAssessment ? (
                      <span className="text-emerald-800 font-semibold">
                        Verified: {c.expertAssessment.verifiedDiagnosis}
                      </span>
                    ) : (
                      <span>AI: {c.aiAssessment.diagnosis}</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100 text-xs gap-1">
                <span className="text-stone-400 text-[11px]">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
                <span className="font-bold text-blue-700 flex items-center gap-1 hover:underline">
                  <span>{isHi ? 'विवरण देखें' : 'View Details'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
