import React, { useState } from 'react';
import {
  PhoneCall,
  X,
  ExternalLink,
  ShieldCheck,
  Check,
  Building2,
  Info,
  Send,
  Sparkles,
  AlertCircle,
  FileCheck,
  ArrowRight,
} from 'lucide-react';
import { DiagnosisResult, Language } from '../types';
import { translations } from '../i18n/translations';
import { createCaseFromDiagnosis, calculateCasePriority } from '../services/expert/caseService';
import { AgriculturalCase } from '../types/expert';
import { useNetworkStatus } from '../offline/hooks/useNetworkStatus';
import { OfflineStatusBadge } from '../offline/components/OfflineStatusBadge';

interface AskExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentDiagnosis?: DiagnosisResult | null;
  onCaseCreated?: (newCase: AgriculturalCase) => void;
  farmName?: string;
  fieldName?: string;
  fieldId?: string;
  weatherSummary?: {
    temperature?: number;
    humidity?: number;
    condition?: string;
    rainfall?: number;
    riskSummary?: string;
  };
  fieldRisk?: {
    diseaseRisk?: string;
    pestRisk?: string;
    weatherStress?: string;
  };
}

export const AskExpertModal: React.FC<AskExpertModalProps> = ({
  isOpen,
  onClose,
  language,
  currentDiagnosis,
  onCaseCreated,
  farmName,
  fieldName,
  fieldId,
  weatherSummary,
  fieldRisk,
}) => {
  const isHi = language === 'hi';
  const t = translations[language];
  const { isOffline, isWeak } = useNetworkStatus(language);

  // States
  const [problemDescription, setProblemDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCase, setCreatedCase] = useState<AgriculturalCase | null>(null);

  if (!isOpen) return null;

  // Compute live priority estimate
  const priorityEstimate = currentDiagnosis
    ? calculateCasePriority({
        severity: currentDiagnosis.severity,
        confidence: currentDiagnosis.confidence,
        progressionRisk: currentDiagnosis.progressionRisk,
        farmerMessage: problemDescription,
        weatherRisk: weatherSummary?.riskSummary,
      })
    : null;

  const handleSubmitToExpert = () => {
    if (!currentDiagnosis) return;
    setIsSubmitting(true);

    try {
      const newCase = createCaseFromDiagnosis({
        diagnosis: currentDiagnosis,
        farmerName: isHi ? 'किसान भाई' : 'Kisan Farmer',
        farmerId: 'farmer-primary',
        farmName: farmName || 'My Farm',
        fieldName: fieldName || 'Field A',
        fieldId: fieldId,
        farmerMessage: problemDescription.trim() || undefined,
        weatherSummary,
        fieldRisk,
        isOffline,
      });

      setCreatedCase(newCase);
      if (onCaseCreated) {
        onCaseCreated(newCase);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit case');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/80 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {isHi ? 'कृषि विशेषज्ञ से परामर्श लें' : 'Consult Agricultural Expert'}
              </h3>
              <p className="text-xs text-blue-200">
                {isHi
                  ? 'ICAR व कृषि विज्ञान केंद्र (KVK) वैज्ञानिकों द्वारा आधिकारिक सत्यापन'
                  : 'Direct verification by ICAR & KVK Agronomists'}
              </p>
            </div>
          </div>

          <button
            id="expert-modal-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {/* If case has been created, show success card */}
          {createdCase ? (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-800 flex items-center justify-center mx-auto">
                <FileCheck className="w-7 h-7" />
              </div>

              <div>
                <div className="flex items-center justify-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[11px] font-black uppercase">
                    {createdCase.id.startsWith('LOCAL-')
                      ? (isHi ? 'फोन में सुरक्षित' : 'Saved Locally on Device')
                      : (isHi ? 'मामला दर्ज हुआ' : 'Case Submitted Successfully')}
                  </span>
                  {createdCase.id.startsWith('LOCAL-') && (
                    <OfflineStatusBadge status="PENDING_SYNC" language={language} />
                  )}
                </div>

                <h4 className="text-xl font-black text-emerald-950 mt-1">
                  Case #{createdCase.id}
                </h4>
                <p className="text-xs text-emerald-800 max-w-md mx-auto mt-1 leading-relaxed">
                  {createdCase.id.startsWith('LOCAL-')
                    ? (isHi
                        ? 'आपकी फसल का विवरण और फोटो फोन में सुरक्षित रख ली गई है। इंटरनेट कनेक्शन मिलते ही यह स्वतः कृषि वैज्ञानिकों के पास सबमिट हो जाएगी और आधिकारिक केस नंबर प्राप्त होगा।'
                        : 'Your consultation is securely stored on your phone with local ID. It will automatically synchronize to agronomists once internet is restored, receiving an authoritative Server ID.')
                    : (isHi
                        ? 'आपकी फसल का विवरण व AI परिणाम कृषि वैज्ञानिकों के समीक्षा डेस्क पर भेज दिया गया है। जैसे ही वैज्ञानिक समीक्षा पूरी होगी, आपको सूचित किया जाएगा।'
                        : 'Your crop details, image, and AI diagnosis have been queued for agronomist examination. You will be notified once verified guidance is issued.')}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  id="view-my-cases-after-create-btn"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  {isHi ? 'मेरे परामर्श (My Cases) देखें' : 'View My Consultations'}
                </button>
              </div>
            </div>
          ) : currentDiagnosis ? (
            /* ACTIVE DIAGNOSIS CONSULTATION FORM */
            <div className="space-y-4">
              {isOffline && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0 animate-pulse" />
                  <span>
                    {isHi
                      ? 'आप ऑफलाइन हैं: आपका परामर्श फोन में सुरक्षित सहेज लिया जाएगा और इंटरनेट बहाल होने पर स्वतः कृषि वैज्ञानिकों को भेज दिया जाएगा।'
                      : 'Offline Mode: Your consultation will be safely stored on your phone and automatically queued for agronomist review once internet returns.'}
                  </span>
                </div>
              )}
              {/* Diagnosis Summary Card */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                    {isHi ? 'प्रस्तुत की जाने वाली जांच' : 'AI Diagnosis Attached to Case'}
                  </span>
                  <span className="text-xs font-bold text-blue-900">
                    {currentDiagnosis.crop} • {Math.round(currentDiagnosis.confidence * 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={currentDiagnosis.imageUri}
                    alt={currentDiagnosis.crop}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover border border-blue-200 shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-black text-stone-900">
                      {currentDiagnosis.diagnosis}
                    </h4>
                    <p className="text-xs text-stone-500">
                      Severity: <strong>{currentDiagnosis.severity}</strong> • Area:{' '}
                      {currentDiagnosis.affectedAreaEstimate}
                    </p>
                  </div>
                </div>

                {priorityEstimate && (
                  <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-xs">
                    <span className="text-stone-500">
                      {isHi ? 'समीक्षा प्राथमिकता:' : 'Queue Priority:'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-black text-[10px] uppercase ${
                        priorityEstimate.priority === 'URGENT'
                          ? 'bg-red-600 text-white'
                          : priorityEstimate.priority === 'HIGH'
                          ? 'bg-amber-400 text-stone-950 font-bold'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {priorityEstimate.priority} Priority
                    </span>
                  </div>
                )}
              </div>

              {/* Farmer Problem Description input */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1.5">
                  {isHi
                    ? 'समस्या का विवरण दें (वैकल्पिक परंतु उपयोगी):'
                    : 'Describe the problem (Optional but helpful):'}
                </label>
                <textarea
                  rows={3}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder={
                    isHi
                      ? 'उदा. पिछले 2 दिनों में बारिश के बाद पत्तियों पर पीले-भूरे धब्बे तेजी से फैल रहे हैं...'
                      : 'e.g., Spots appeared after heavy rainfall 3 days ago; spreading rapidly along row...'
                  }
                  className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-blue-600 bg-stone-50/50"
                />
              </div>

              {/* Submit to Expert Button */}
              <button
                id="submit-case-to-expert-btn"
                onClick={handleSubmitToExpert}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-blue-800 hover:bg-blue-900 text-white font-black text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? isHi
                      ? 'भेजा जा रहा है...'
                      : 'Submitting Case...'
                    : isHi
                    ? 'विशेषज्ञ को भेजें (Send to Expert)'
                    : 'Send to Agricultural Expert'}
                </span>
              </button>
            </div>
          ) : (
            <div className="text-center p-6 bg-stone-50 rounded-2xl border border-stone-200 text-stone-600 text-xs">
              {isHi
                ? 'विशेषज्ञ परामर्श हेतु पहले अपनी फसल की फोटो स्कैन करें।'
                : 'Please scan a crop photo first to attach diagnostic evidence for the agronomist.'}
            </div>
          )}

          {/* Direct Government Helpline and KVK Section (Always available) */}
          <div className="pt-3 border-t border-stone-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {isHi ? 'तत्काल फोन परामर्श (निःशुल्क)' : 'Direct Phone Assistance (Toll-Free)'}
            </h4>

            {/* Kisan Call Center Card */}
            <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-3.5 text-stone-900 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-900 bg-amber-200/80 px-1.5 py-0.5 rounded">
                  {isHi ? 'भारत सरकार निःशुल्क सेवा' : 'Govt of India Free Helpline'}
                </span>
                <h5 className="font-bold text-xs text-amber-950 mt-1">
                  Kisan Call Center (1800-180-1551)
                </h5>
                <p className="text-[11px] text-stone-600">
                  {isHi
                    ? 'कृषि वैज्ञानिकों से 22 भारतीय भाषाओं में सीधे बात करें'
                    : 'Speak directly with agronomists in 22 regional languages'}
                </p>
              </div>

              <a
                href="tel:18001801551"
                className="shrink-0 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
            </div>

            {/* Krishi Vigyan Kendra */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 text-xs text-stone-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{isHi ? 'नजदीकी जिला KVK केंद्र खोजें' : 'Locate Nearest District KVK'}</span>
              </div>
              <a
                href="https://kvk.icar.gov.in"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-emerald-700 hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>icar.gov.in</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-5 py-3 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition"
          >
            {isHi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
