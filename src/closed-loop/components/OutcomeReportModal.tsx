// Farmer Outcome Submission Modal (Part 7)
// Farmer reports on post-intervention recovery: "How is your crop now?"

import React, { useState } from 'react';
import { X, Camera, CheckCircle2, AlertCircle, HelpCircle, ArrowUpRight } from 'lucide-react';
import { CropOutcomeCondition, ClosedLoopCase } from '../types';

interface OutcomeReportModalProps {
  caseData: ClosedLoopCase;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: {
    caseId: string;
    cropCondition: CropOutcomeCondition;
    initialSeverity: string;
    currentSeverity: string;
    symptomChange: string;
    treatmentFollowed: string;
    followUpImageUri?: string;
    farmerComments?: string;
  }) => void;
  language?: 'en' | 'hi';
}

export const OutcomeReportModal: React.FC<OutcomeReportModalProps> = ({
  caseData,
  isOpen,
  onClose,
  onSubmit,
  language = 'en',
}) => {
  const isHi = language === 'hi';

  const [condition, setCondition] = useState<CropOutcomeCondition>('IMPROVED');
  const [currentSeverity, setCurrentSeverity] = useState('Low');
  const [symptomChange, setSymptomChange] = useState(
    isHi
      ? 'पत्तियों पर नए धब्बे रुक गए हैं और नई हरी पत्तियां निकल रही हैं।'
      : 'Lesions dried up and new healthy vegetative growth emerged.'
  );
  const [treatmentFollowed, setTreatmentFollowed] = useState(
    isHi
      ? 'सलाह अनुसार संक्रमित पत्तियों की छंटाई की और अनुशंसित जैविक स्प्रे किया।'
      : 'Pruned diseased foliage and applied prescribed IPM biological spray.'
  );
  const [comments, setComments] = useState('');
  const [followUpImageUri, setFollowUpImageUri] = useState<string>(
    'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=800&auto=format&fit=crop&q=80'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      caseId: caseData.id,
      cropCondition: condition,
      initialSeverity:
        caseData.expertAssessment?.verifiedSeverity ||
        caseData.aiAssessment.severity ||
        'Moderate',
      currentSeverity,
      symptomChange,
      treatmentFollowed,
      followUpImageUri,
      farmerComments: comments,
    });
    onClose();
  };

  const conditionOptions: {
    value: CropOutcomeCondition;
    labelEn: string;
    labelHi: string;
    subEn: string;
    subHi: string;
  }[] = [
    {
      value: 'FULLY_RECOVERED',
      labelEn: 'Fully Recovered',
      labelHi: 'पूर्ण रूप से स्वस्थ',
      subEn: 'No symptoms remain; plant normal',
      subHi: 'कोई लक्षण नहीं बचा; फसल सामान्य',
    },
    {
      value: 'IMPROVED',
      labelEn: 'Improved / Recovering',
      labelHi: 'सुधार हो रहा है',
      subEn: 'Spread stopped, new healthy leaves',
      subHi: 'फैलाव रुका, नई पत्तियां ठीक हैं',
    },
    {
      value: 'NO_CHANGE',
      labelEn: 'No Observable Change',
      labelHi: 'कोई बदलाव नहीं',
      subEn: 'Disease stayed at same level',
      subHi: 'रोग का स्तर जस का तस है',
    },
    {
      value: 'WORSE',
      labelEn: 'Deteriorated / Worse',
      labelHi: 'स्थिति और बिगड़ गई',
      subEn: 'Symptoms expanded to other parts',
      subHi: 'लक्षण अन्य शाखाओं में फैल गए',
    },
    {
      value: 'UNCERTAIN',
      labelEn: 'Uncertain / Unsure',
      labelHi: 'अनिश्चित / समझ नहीं आ रहा',
      subEn: 'Need another agronomist check',
      subHi: 'दोबारा वैज्ञानिक जांच की आवश्यकता है',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 sm:p-7 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              {isHi ? 'चरण ६: परिणाम रिपोर्ट' : 'Step 6: Field Outcome Report'}
            </span>
            <h2 className="text-xl font-black text-stone-900 mt-1">
              {isHi ? 'आपकी फसल अब कैसी है?' : 'How is your crop now?'}
            </h2>
            <p className="text-xs text-stone-500">
              {caseData.crop} ({caseData.fieldName || 'Field'}) — Case #{caseData.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Condition Selector */}
          <div>
            <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-2">
              {isHi ? '१. वर्तमान फसल स्थिति चुनें' : '1. Select Current Condition'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {conditionOptions.map((opt) => {
                const isSelected = condition === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCondition(opt.value)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold shadow-2xs ring-1 ring-emerald-600'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">{isHi ? opt.labelHi : opt.labelEn}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <p className="text-[10px] text-stone-500 mt-0.5">
                      {isHi ? opt.subHi : opt.subEn}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Follow-up image preview */}
          <div>
            <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-2">
              {isHi ? '२. अनुवर्ती फोटो (Follow-Up Photo)' : '2. Follow-Up Crop Photo'}
            </label>
            <div className="flex items-center gap-4 p-3 rounded-2xl border border-stone-200 bg-stone-50">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                <img
                  src={followUpImageUri}
                  alt="Follow-up preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-xs">
                <p className="font-bold text-stone-800">
                  {isHi ? 'पुनरुद्धार फोटो संलग्न है' : 'Follow-up canopy photo attached'}
                </p>
                <p className="text-[11px] text-stone-500">
                  {isHi
                    ? 'वैज्ञानिक इस फोटो की तुलना पहले वाले फोटो से करेंगे।'
                    : 'Agronomist will compare this photo with the initial scan.'}
                </p>
              </div>
            </div>
          </div>

          {/* Current Severity Trajectory */}
          <div>
            <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-2">
              {isHi ? '३. वर्तमान गंभीरता स्तर' : '3. Current Foliage Severity'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['Low', 'Moderate', 'High', 'Critical'].map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setCurrentSeverity(sev)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition ${
                    currentSeverity === sev
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-2xs'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Symptom change & treatment followed */}
          <div>
            <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-1.5">
              {isHi ? '४. आपने क्या बदलाव देखा?' : '4. What changes did you observe?'}
            </label>
            <textarea
              rows={2}
              value={symptomChange}
              onChange={(e) => setSymptomChange(e.target.value)}
              className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-emerald-600 bg-white"
              placeholder={isHi ? 'लक्षणों में क्या बदलाव आया...' : 'Describe how lesions evolved...'}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-1.5">
              {isHi ? '५. आपने कौन सा उपचार या कदम उठाया?' : '5. What action or treatment did you follow?'}
            </label>
            <input
              type="text"
              value={treatmentFollowed}
              onChange={(e) => setTreatmentFollowed(e.target.value)}
              className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-emerald-600 bg-white"
              placeholder={isHi ? 'जैसे: छंटाई की, जैविक स्प्रे किया...' : 'E.g., sprayed bio-fungicide, pruned lower stems...'}
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 transition"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition"
            >
              {isHi ? 'परिणाम रिपोर्ट जमा करें' : 'Submit Outcome Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
