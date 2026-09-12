// Data Consent & Governance Component (Part 7)
// Explicit transparency for Farmer permissions and Training Candidate designation

import React from 'react';
import { ShieldCheck, Database, Check, X, Info } from 'lucide-react';
import { ClosedLoopCase, DataConsent } from '../types';

interface DataConsentBadgeProps {
  caseData: ClosedLoopCase;
  onUpdateConsent?: (consent: Partial<DataConsent>) => void;
  language?: 'en' | 'hi';
  compact?: boolean;
}

export const DataConsentBadge: React.FC<DataConsentBadgeProps> = ({
  caseData,
  onUpdateConsent,
  language = 'en',
  compact = false,
}) => {
  const isHi = language === 'hi';
  const consent = caseData.consent;

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-100 border border-stone-200 text-[11px] text-stone-700">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>
          {isHi ? 'डेटा सहमति:' : 'Consent:'}{' '}
          <strong>{consent?.trainingCandidate ? (isHi ? 'अनुमत' : 'Granted') : (isHi ? 'अस्वीकृत' : 'Opted Out')}</strong>
        </span>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
            {isHi ? 'डेटा सहमति व एआई लर्निंग गवर्नेंस' : 'Data Governance & Learning Consent'}
          </h4>
        </div>

        {caseData.isTrainingCandidate ? (
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300 flex items-center gap-1">
            <Database className="w-3 h-3 text-indigo-700" />
            {isHi ? 'सत्यापित प्रशिक्षण उम्मीदवार' : 'Verified Training Candidate'}
          </span>
        ) : (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
            {isHi ? 'प्रशिक्षण हेतु अपात्र' : 'Not for Model Training'}
          </span>
        )}
      </div>

      <p className="text-[11px] text-stone-600 leading-relaxed">
        {caseData.trainingCandidateReason ||
          (isHi
            ? 'किसान की पूर्व सहमति एवं वैज्ञानिक सत्यापन के बिना डेटा का उपयोग मॉडल प्रशिक्षण में नहीं किया जाता।'
            : 'Data is strictly governed by farmer permissions and agronomist verification criteria.')}
      </p>

      {/* Consent Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200">
          <span className="text-[11px] text-stone-600">
            {isHi ? 'केस प्रोसेसिंग' : 'Case Processing'}
          </span>
          <span className="text-emerald-700 font-bold flex items-center gap-0.5 text-[11px]">
            <Check className="w-3 h-3" /> {isHi ? 'हाँ' : 'Yes'}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200">
          <span className="text-[11px] text-stone-600">
            {isHi ? 'विशेषज्ञ समीक्षा' : 'Agronomist Review'}
          </span>
          <span className="text-emerald-700 font-bold flex items-center gap-0.5 text-[11px]">
            <Check className="w-3 h-3" /> {isHi ? 'हाँ' : 'Yes'}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200">
          <span className="text-[11px] text-stone-600">
            {isHi ? 'एआई लर्निंग पाइपलाइन' : 'Training Candidate'}
          </span>
          {onUpdateConsent ? (
            <button
              type="button"
              onClick={() =>
                onUpdateConsent({ trainingCandidate: !consent?.trainingCandidate })
              }
              className={`text-[10px] font-black px-2 py-0.5 rounded-lg transition ${
                consent?.trainingCandidate
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-stone-200 text-stone-600'
              }`}
            >
              {consent?.trainingCandidate ? 'Opted In' : 'Opted Out'}
            </button>
          ) : (
            <span
              className={`font-bold flex items-center gap-0.5 text-[11px] ${
                consent?.trainingCandidate ? 'text-emerald-700' : 'text-stone-400'
              }`}
            >
              {consent?.trainingCandidate ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              {consent?.trainingCandidate ? (isHi ? 'हाँ' : 'Yes') : (isHi ? 'नहीं' : 'No')}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2 text-[10px] text-stone-500 bg-white/80 p-2.5 rounded-xl border border-stone-200/80">
        <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
        <span>
          {isHi
            ? 'महत्वपूर्ण: सिस्टम में कोई स्वचालित मॉडल पुनर्प्रशिक्षण नहीं होता। उम्मीदवार रिकॉर्ड केवल मानव-नियंत्रित भविष्य के मूल्यांकन चक्र हेतु चिन्हित किए जाते हैं।'
            : 'Governance Mandate: No automatic model retraining occurs. Verified records are designated for human-governed offline evaluation only.'}
        </span>
      </div>
    </div>
  );
};
