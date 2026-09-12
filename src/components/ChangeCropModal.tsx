// Change Field Crop / Seasonal Crop Rotation Modal
// Allows the farmer to rotate crops across seasons while preserving historic diagnoses

import React, { useState } from 'react';
import { X, Sprout, Check, History, ArrowRight } from 'lucide-react';
import { Field } from '../types/field';
import { Language } from '../types';
import { INITIAL_CROPS } from '../data/crops';

interface ChangeCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  field: Field | null;
  onChangeCrop: (fieldId: string, newCrop: string, newCropHindi?: string) => void;
  language: Language;
}

export const ChangeCropModal: React.FC<ChangeCropModalProps> = ({
  isOpen,
  onClose,
  field,
  onChangeCrop,
  language,
}) => {
  const isHi = language === 'hi';
  const [selectedCropName, setSelectedCropName] = useState(field?.crop || 'Wheat');

  if (!isOpen || !field) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = INITIAL_CROPS.find((c) => c.name === selectedCropName);
    onChangeCrop(field.id, selectedCropName, matched?.hindiName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-stone-200">
        <div className="p-4 sm:p-5 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700/80 border border-emerald-600 flex items-center justify-center text-amber-300">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {isHi ? 'फसल चक्र / नई फसल' : 'Seasonal Crop Rotation'}
              </h3>
              <p className="text-xs text-emerald-200">
                {field.name} • {isHi ? 'वर्तमान:' : 'Current:'} {field.crop}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-700/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="p-5 space-y-4">
          <div className="flex items-center justify-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">
                {isHi ? 'पिछली फसल' : 'Previous Crop'}
              </span>
              <span className="font-bold text-stone-800">{field.crop}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-600" />
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">
                {isHi ? 'नई फसल' : 'New Crop'}
              </span>
              <span className="font-bold text-emerald-700">{selectedCropName}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              {isHi ? 'नए मौसम के लिए फसल चुनें:' : 'Select Crop for Next Season:'}
            </label>
            <select
              value={selectedCropName}
              onChange={(e) => setSelectedCropName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-stone-900 font-medium cursor-pointer"
            >
              {INITIAL_CROPS.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.hindiName})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2 text-xs text-emerald-900">
            <History className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              {isHi
                ? 'पिछली फसल के सभी डायग्नोसिस और रिकॉर्ड सुरक्षित रहेंगे। नया चक्र नई स्वास्थ्य स्थिति के साथ शुरू होगा।'
                : 'Historical diagnosis reports and scouting notes for previous crops are permanently preserved.'}
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-800 rounded-xl transition cursor-pointer"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isHi ? 'फसल बदलें' : 'Update Crop'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
