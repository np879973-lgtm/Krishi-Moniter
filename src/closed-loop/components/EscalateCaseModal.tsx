// Escalation to Extension / Government Modal (Part 7)
// Agronomist can trigger district extension intervention for high-risk, epidemic, or complex cases

import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck, Send, Info } from 'lucide-react';
import { ClosedLoopCase, EscalationReason, CasePriority } from '../types';
import { getEscalationReasonLabel } from '../services/escalationService';

interface EscalateCaseModalProps {
  caseData: ClosedLoopCase;
  isOpen: boolean;
  onClose: () => void;
  onEscalate: (params: {
    caseId: string;
    reason: EscalationReason;
    priority: CasePriority;
    problemCategory: string;
    recommendedAction: string;
    additionalNotes: string;
  }) => void;
  language?: 'en' | 'hi';
}

export const EscalateCaseModal: React.FC<EscalateCaseModalProps> = ({
  caseData,
  isOpen,
  onClose,
  onEscalate,
  language = 'en',
}) => {
  const isHi = language === 'hi';

  const [reason, setReason] = useState<EscalationReason>('HIGH_RISK_OUTBREAK');
  const [priority, setPriority] = useState<CasePriority>('HIGH');
  const [problemCategory, setProblemCategory] = useState(
    `${caseData.crop} ${caseData.expertAssessment?.verifiedDiagnosis || caseData.aiAssessment.diagnosis}`
  );
  const [recommendedAction, setRecommendedAction] = useState(
    isHi
      ? 'प्रखंड कृषि अधिकारी खेत का भौतिक निरीक्षण करें और नजदीकी खेतों में निवारक परामर्श जारी करें।'
      : 'Block Agricultural Officer to conduct on-site canopy inspection and alert adjacent plots.'
  );
  const [additionalNotes, setAdditionalNotes] = useState(
    'Potential cluster requiring verification in accordance with current weather conditions.'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEscalate({
      caseId: caseData.id,
      reason,
      priority,
      problemCategory,
      recommendedAction,
      additionalNotes,
    });
    onClose();
  };

  const reasons: EscalationReason[] = [
    'HIGH_RISK_OUTBREAK',
    'SERIOUS_CROP_DAMAGE',
    'COMMUNITY_IMPACT',
    'REPEATED_FAILURE',
    'POSSIBLE_EMERGING_PEST',
    'FARMER_NEEDS_FIELD_SUPPORT',
    'UNUSUAL_SYMPTOMS',
    'OTHER',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 sm:p-7 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-200">
              {isHi ? 'कृषि प्रसार को प्रेषण' : 'Escalate to Government Extension'}
            </span>
            <h2 className="text-xl font-black text-stone-900 mt-1">
              {isHi ? 'मामला कृषि विभाग को भेजें' : 'Escalate Case to Extension'}
            </h2>
            <p className="text-xs text-stone-500">
              Case #{caseData.id} • {caseData.crop} • {caseData.farmerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scientific Humility & Anti-Hallucination Warning (Strict Requirement 9) */}
        <div className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>{isHi ? 'महत्वपूर्ण दिशानिर्देश:' : 'Objective Standard:'}</strong>{' '}
            {isHi
              ? 'बिना भौतिक परीक्षण के सीधे महामारी घोषित न करें। स्थिति को "संभावित क्लस्टर (सत्यापन आवश्यक)" के रूप में ही दर्ज करें।'
              : 'Never label an unverified signal as a confirmed outbreak. Use phrasing: "Potential cluster requiring verification" pending on-field scouting.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Reason Selection */}
          <div>
            <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-2">
              {isHi ? 'प्रेषण का मुख्य कारण' : 'Primary Escalation Reason'}
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as EscalationReason)}
              className="w-full text-xs font-medium p-3 rounded-2xl border border-stone-300 focus:outline-purple-600 bg-white"
            >
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {getEscalationReasonLabel(r, language)}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-2">
              {isHi ? 'प्राथमिकता स्तर' : 'Extension Priority'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as CasePriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition ${
                    priority === p
                      ? p === 'URGENT'
                        ? 'border-red-600 bg-red-600 text-white'
                        : 'border-purple-600 bg-purple-600 text-white'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Problem Category */}
          <div>
            <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-1.5">
              {isHi ? 'समस्या श्रेणी' : 'Problem Category'}
            </label>
            <input
              type="text"
              value={problemCategory}
              onChange={(e) => setProblemCategory(e.target.value)}
              className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-purple-600 bg-white font-medium"
              required
            />
          </div>

          {/* Recommended Action */}
          <div>
            <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-1.5">
              {isHi ? 'प्रसार टीम हेतु अनुशंसित कार्रवाई' : 'Recommended Extension Action'}
            </label>
            <textarea
              rows={2}
              value={recommendedAction}
              onChange={(e) => setRecommendedAction(e.target.value)}
              className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-purple-600 bg-white"
              required
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-1.5">
              {isHi ? 'अतिरिक्त तकनीकी टिप्पणी' : 'Technical Notes & Cluster Context'}
            </label>
            <textarea
              rows={2}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-purple-600 bg-white"
              placeholder="E.g., Potential cluster requiring verification across block..."
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 transition"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md flex items-center gap-2 transition"
            >
              <Send className="w-4 h-4" />
              {isHi ? 'प्रसार विभाग को प्रेषित करें' : 'Escalate to Extension'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
