// Field Visit Scheduling & Outcome Recording Modal (Part 7)
// Connects District Extension Officers directly to the physical field

import React, { useState } from 'react';
import { X, Calendar, MapPin, CheckCircle2, User, FileText } from 'lucide-react';
import { ClosedLoopCase, CasePriority, FieldVisit } from '../types';

interface FieldVisitModalProps {
  caseData: ClosedLoopCase;
  existingVisit?: FieldVisit;
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (params: {
    caseId: string;
    purpose: string;
    priority: CasePriority;
    scheduledDate: string;
    notes?: string;
  }) => void;
  onComplete?: (params: {
    caseId: string;
    visitId: string;
    observations: string;
    photographs?: string[];
    symptomsIdentified?: string[];
    pestPresence?: string;
    severity?: string;
    farmerStatement?: string;
    recommendedAction?: string;
    outcome?: string;
  }) => void;
  language?: 'en' | 'hi';
}

export const FieldVisitModal: React.FC<FieldVisitModalProps> = ({
  caseData,
  existingVisit,
  isOpen,
  onClose,
  onSchedule,
  onComplete,
  language = 'en',
}) => {
  const isHi = language === 'hi';
  const isCompleting = !!existingVisit && existingVisit.status !== 'COMPLETED';

  // Schedule state
  const [purpose, setPurpose] = useState(
    isHi
      ? 'खेत में फसल क्षति का भौतिक सत्यापन व छिड़काव मार्गदर्शन'
      : 'On-site foliar verification and IPM spray calibration'
  );
  const [priority, setPriority] = useState<CasePriority>('HIGH');
  const [scheduledDate, setScheduledDate] = useState('2026-09-14');
  const [notes, setNotes] = useState('');

  // Complete visit state
  const [observations, setObservations] = useState(
    isHi
      ? 'खेत का निरीक्षण किया। 20% पत्तियों पर लक्षण दिखे, फल स्वस्थ हैं।'
      : 'Field inspected. 20% of lower canopy showed active lesions; upper fruit clusters unaffected.'
  );
  const [farmerStatement, setFarmerStatement] = useState(
    isHi ? 'किसान ने अनुशंसित कीटनाशक/कवकनाशी उपलब्ध कराने का अनुरोध किया।' : 'Farmer implemented trellising; requested follow-up check in 5 days.'
  );
  const [recommendedAction, setRecommendedAction] = useState(
    isHi ? 'खेत में पानी का भराव न होने दें, दोपहर में छिड़काव न करें।' : 'Maintain furrow drainage; apply morning bio-copper spray.'
  );

  if (!isOpen) return null;

  const handleSubmitSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    onSchedule({
      caseId: caseData.id,
      purpose,
      priority,
      scheduledDate,
      notes,
    });
    onClose();
  };

  const handleSubmitComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingVisit || !onComplete) return;
    onComplete({
      caseId: caseData.id,
      visitId: existingVisit.id,
      observations,
      photographs: [caseData.primaryImageUri],
      symptomsIdentified: ['Foliar lesions', 'Canopy moisture'],
      severity: 'Moderate',
      farmerStatement,
      recommendedAction,
      outcome: 'Direct guidance provided on-field.',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 sm:p-7 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
              {isHi ? 'कृषि प्रसार खेत दौरा' : 'Extension Field Visit'}
            </span>
            <h2 className="text-xl font-black text-stone-900 mt-1">
              {isCompleting
                ? isHi
                  ? 'खेत निरीक्षण रिपोर्ट दर्ज करें'
                  : 'Record Field Visit Report'
                : isHi
                ? 'खेत दौरा निर्धारित करें'
                : 'Schedule Field Visit'}
            </h2>
            <p className="text-xs text-stone-500">
              {caseData.farmerName} • {caseData.crop} • {caseData.fieldName || 'Plot'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isCompleting ? (
          <form onSubmit={handleSubmitComplete} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-1.5">
                {isHi ? 'निरीक्षण के मुख्य अवलोकन' : 'Field Observations'}
              </label>
              <textarea
                rows={3}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-amber-600 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-1.5">
                {isHi ? 'किसान का कथन / समस्या' : 'Farmer Statement'}
              </label>
              <input
                type="text"
                value={farmerStatement}
                onChange={(e) => setFarmerStatement(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-amber-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-1.5">
                {isHi ? 'अधिकारी द्वारा अनुशंसित कदम' : 'Officer Recommended Action'}
              </label>
              <input
                type="text"
                value={recommendedAction}
                onChange={(e) => setRecommendedAction(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-amber-600 bg-white"
                required
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
                className="px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-md transition"
              >
                {isHi ? 'निरीक्षण रिपोर्ट पूर्ण करें' : 'Complete Visit Report'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitSchedule} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-1.5">
                {isHi ? 'दौरे का उद्देश्य' : 'Visit Purpose'}
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-amber-600 bg-white font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-1.5">
                {isHi ? 'निरीक्षण की तिथि' : 'Scheduled Visit Date'}
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-amber-600 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-2">
                {isHi ? 'दौरे की प्राथमिकता' : 'Visit Priority'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as CasePriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition ${
                      priority === p
                        ? 'border-amber-600 bg-amber-600 text-white'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-1.5">
                {isHi ? 'अतिरिक्त निर्देश या टिप्पणी' : 'Special Instructions for Visit'}
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-amber-600 bg-white"
                placeholder={isHi ? 'जैसे: मिट्टी का नमूना भी साथ लें...' : 'E.g., bring sticky traps and sampling bags...'}
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
                className="px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-md flex items-center gap-2 transition"
              >
                <Calendar className="w-4 h-4" />
                {isHi ? 'दौरा निर्धारित करें' : 'Schedule Visit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
