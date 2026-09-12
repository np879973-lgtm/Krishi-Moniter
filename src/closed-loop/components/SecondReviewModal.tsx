// Second Expert Review Modal (Part 7)
// Senior agronomist reviews disputed or uncertain cases without modifying original audit logs

import React, { useState } from 'react';
import { X, UserCheck, ShieldCheck, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { ClosedLoopCase } from '../types';

interface SecondReviewModalProps {
  caseData: ClosedLoopCase;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (params: {
    caseId: string;
    reviewerId: string;
    reviewerName: string;
    reviewerTitle: string;
    result: 'AGREEMENT' | 'DISAGREEMENT' | 'UNCERTAIN';
    notes: string;
    recommendedAdjustment?: string;
  }) => void;
  language?: 'en' | 'hi';
}

export const SecondReviewModal: React.FC<SecondReviewModalProps> = ({
  caseData,
  isOpen,
  onClose,
  onSubmitReview,
  language = 'en',
}) => {
  const isHi = language === 'hi';

  const [result, setResult] = useState<'AGREEMENT' | 'DISAGREEMENT' | 'UNCERTAIN'>('AGREEMENT');
  const [reviewerName, setReviewerName] = useState('Dr. Harpreet Singh');
  const [reviewerTitle, setReviewerTitle] = useState('Senior Plant Pathologist (PAU / ICAR)');
  const [notes, setNotes] = useState(
    isHi
      ? 'मूल निदान सही है। उपचार की विफलता छिड़काव के गलत समय या पानी की कम मात्रा के कारण प्रतीत होती है।'
      : 'Original diagnosis is corroborated. Inefficacy was likely caused by high wind during application and insufficient water volume per acre.'
  );
  const [recommendedAdjustment, setRecommendedAdjustment] = useState(
    isHi
      ? 'सुबह शांत मौसम में सर्फेक्टेंट के साथ दोबारा अनुशंसित खुराक का छिड़काव करें।'
      : 'Recommend re-application during early calm morning using a hollow-cone nozzle with surfactant.'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReview({
      caseId: caseData.id,
      reviewerId: 'exp-second-pau',
      reviewerName,
      reviewerTitle,
      result,
      notes,
      recommendedAdjustment,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 sm:p-7 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-200">
              {isHi ? 'द्वितीय स्वतंत्र विशेषज्ञ समीक्षा' : 'Second Independent Review'}
            </span>
            <h2 className="text-xl font-black text-stone-900 mt-1">
              {isHi ? 'वरिष्ठ समीक्षा दर्ज करें' : 'Record Second Review'}
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

        {caseData.dispute && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950">
            <p className="font-bold">
              {isHi ? 'किसान की दर्ज आपत्ति:' : 'Farmer Dispute Summary:'}
            </p>
            <p className="mt-0.5">{caseData.dispute.reason}</p>
            <p className="text-[11px] text-rose-800 italic mt-1">
              "{caseData.dispute.farmerComment}"
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-2">
              {isHi ? 'समीक्षा का निष्कर्ष' : 'Second Review Verdict'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'AGREEMENT', labelEn: 'Agree', labelHi: 'सहमत', col: 'emerald' },
                { val: 'DISAGREEMENT', labelEn: 'Disagree', labelHi: 'असहमत', col: 'rose' },
                { val: 'UNCERTAIN', labelEn: 'Uncertain', labelHi: 'अनिश्चित', col: 'amber' },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setResult(item.val as any)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition ${
                    result === item.val
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xs'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {isHi ? item.labelHi : item.labelEn}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-1.5">
              {isHi ? 'समीक्षक का नाम व पद' : 'Reviewer Name & Designation'}
            </label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-indigo-600 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-1.5">
              {isHi ? 'तकनीकी अवलोकन एवं कारण' : 'Technical Evaluation & Rationale'}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-indigo-600 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-1.5">
              {isHi ? 'सलाह में सुधारात्मक समायोजन' : 'Recommended Protocol Adjustment'}
            </label>
            <input
              type="text"
              value={recommendedAdjustment}
              onChange={(e) => setRecommendedAdjustment(e.target.value)}
              className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-indigo-600 bg-white"
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
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md flex items-center gap-2 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isHi ? 'समीक्षा जमा करें' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
