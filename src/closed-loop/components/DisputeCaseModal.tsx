// Farmer Dispute Submission Modal (Part 7)
// Empowers farmers to formally register dissatisfaction with diagnosis or treatment inefficacy

import React, { useState } from 'react';
import { X, AlertCircle, HelpCircle, ShieldAlert } from 'lucide-react';
import { ClosedLoopCase, DisputeType } from '../types';

interface DisputeCaseModalProps {
  caseData: ClosedLoopCase;
  isOpen: boolean;
  onClose: () => void;
  onFileDispute: (params: {
    caseId: string;
    disputeType: DisputeType;
    reason: string;
    farmerComment: string;
    followUpImageUri?: string;
  }) => void;
  language?: 'en' | 'hi';
}

export const DisputeCaseModal: React.FC<DisputeCaseModalProps> = ({
  caseData,
  isOpen,
  onClose,
  onFileDispute,
  language = 'en',
}) => {
  const isHi = language === 'hi';

  const [disputeType, setDisputeType] = useState<DisputeType>('INEFFECTIVE_TREATMENT');
  const [reason, setReason] = useState(
    isHi
      ? 'सलाह अनुसार स्प्रे करने के बाद भी बीमारी का फैलाव रुका नहीं है।'
      : 'The recommended action did not help. Symptoms continue spreading.'
  );
  const [comment, setComment] = useState(
    isHi
      ? 'कृपया वरिष्ठ कृषि विशेषज्ञ से दोबारा समीक्षा करवाएं या दूसरा प्रभावी उपचार बताएं।'
      : 'We sprayed as advised twice, but foliage is still drying out. Requesting second agronomist review.'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFileDispute({
      caseId: caseData.id,
      disputeType,
      reason,
      farmerComment: comment,
      followUpImageUri: caseData.primaryImageUri,
    });
    onClose();
  };

  const disputeTypes: { type: DisputeType; labelEn: string; labelHi: string }[] = [
    {
      type: 'INEFFECTIVE_TREATMENT',
      labelEn: 'The recommended action did not help',
      labelHi: 'सुझाया गया उपचार असरदार नहीं रहा',
    },
    {
      type: 'WRONG_DIAGNOSIS',
      labelEn: 'I disagree with this diagnosis',
      labelHi: 'मुझे लगता है यह रोग का सही निदान नहीं है',
    },
    {
      type: 'WORSE_CONDITION',
      labelEn: 'Crop condition got worse after spraying',
      labelHi: 'स्प्रे के बाद फसल और अधिक खराब हो गई',
    },
    {
      type: 'OTHER',
      labelEn: 'Other specific objection',
      labelHi: 'अन्य आपत्ति / समस्या',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 sm:p-7 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200">
              {isHi ? 'औपचारिक किसान आपत्ति' : 'Farmer Formal Dispute'}
            </span>
            <h2 className="text-xl font-black text-stone-900 mt-1">
              {isHi ? 'आपत्ति दर्ज करें' : 'File a Case Dispute'}
            </h2>
            <p className="text-xs text-stone-500">
              Case #{caseData.id} • {caseData.crop}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-2">
              {isHi ? 'आपत्ति का मुख्य प्रकार' : 'Nature of Dispute'}
            </label>
            <div className="space-y-2">
              {disputeTypes.map((dt) => (
                <button
                  key={dt.type}
                  type="button"
                  onClick={() => setDisputeType(dt.type)}
                  className={`w-full p-3 rounded-2xl border text-left text-xs font-bold transition ${
                    disputeType === dt.type
                      ? 'border-rose-600 bg-rose-50 text-rose-950 ring-1 ring-rose-600'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {isHi ? dt.labelHi : dt.labelEn}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-1.5">
              {isHi ? 'आपत्ति का संक्षिप्त कारण' : 'Summary of Dispute'}
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-rose-600 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-1.5">
              {isHi ? 'आपका विस्तृत अनुभव / टिप्पणी' : 'Detailed Experience / Observations'}
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-rose-600 bg-white"
              required
            />
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600">
            {isHi
              ? 'आपकी आपत्ति दर्ज होते ही मामला स्वतंत्र वरिष्ठ कृषि वैज्ञानिक को पुनर्निरीक्षण हेतु भेजा जाएगा।'
              : 'Submitting a dispute automatically queues this case for an independent Second Expert Review.'}
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
              className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md flex items-center gap-2 transition"
            >
              <ShieldAlert className="w-4 h-4" />
              {isHi ? 'आपत्ति दर्ज करें' : 'Submit Dispute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
