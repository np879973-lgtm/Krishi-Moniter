import React, { useState } from 'react';
import { Search, ArrowLeft, HelpCircle, Check, Sparkles } from 'lucide-react';
import { CropInfo, Language } from '../types';
import { INITIAL_CROPS } from '../data/crops';
import { translations } from '../i18n/translations';

interface CropSelectionScreenProps {
  language: Language;
  onSelectCrop: (crop: CropInfo) => void;
  onBack: () => void;
  selectedCropId?: string;
}

export const CropSelectionScreen: React.FC<CropSelectionScreenProps> = ({
  language,
  onSelectCrop,
  onBack,
  selectedCropId,
}) => {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCrops = INITIAL_CROPS.filter((crop) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      crop.name.toLowerCase().includes(q) ||
      crop.hindiName.toLowerCase().includes(q) ||
      crop.category.toLowerCase().includes(q)
    );
  });

  const otherCrop = INITIAL_CROPS.find((c) => c.id === 'other') || INITIAL_CROPS[INITIAL_CROPS.length - 1];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          id="crop-selection-back-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 text-stone-700 hover:text-stone-900 bg-white border border-stone-200 px-3 py-1.5 rounded-lg text-sm font-medium shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'hi' ? 'वापस' : 'Back'}</span>
        </button>

        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          Step 1 / 4
        </span>
      </div>

      {/* Screen Title & Subtitle */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 leading-snug">
          {t.selectCropTitle}
        </h2>
        <p className="text-stone-600 text-sm sm:text-base mt-1.5">
          {t.selectCropSubtitle}
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          id="crop-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchCropPlaceholder}
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-base shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-medium text-stone-500 hover:text-stone-700"
          >
            Clear
          </button>
        )}
      </div>

      {/* Grid of Large Visual Crop Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4 mb-6">
        {filteredCrops.map((crop) => {
          const isSelected = selectedCropId === crop.id;
          return (
            <button
              key={crop.id}
              id={`crop-card-${crop.id}`}
              onClick={() => onSelectCrop(crop)}
              className={`relative flex flex-col items-center text-center p-4 rounded-2xl border-2 transition active:scale-98 text-left ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-600/30'
                  : 'border-stone-200 bg-white hover:border-emerald-500 hover:bg-stone-50/80 shadow-xs'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center text-white">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              {/* Large Emoji / Graphic Icon */}
              <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center text-3xl mb-2.5 shadow-inner">
                {crop.icon}
              </div>

              {/* Crop English Name */}
              <span className="font-bold text-base text-stone-900 leading-tight">
                {crop.name}
              </span>

              {/* Hindi Name */}
              <span className="text-sm font-medium text-emerald-800 mt-0.5">
                {crop.hindiName}
              </span>

              {/* Category Pill */}
              <span className="mt-2 text-[11px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                {crop.category}
              </span>
            </button>
          );
        })}
      </div>

      {/* "Not sure? Select Other" Fallback Banner */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900">
              {t.notSureOther}
            </h4>
            <p className="text-xs text-stone-600">
              {language === 'hi'
                ? 'यदि आपकी फसल सूची में नहीं है तो भी AI रोग की पहचान कर सकता है।'
                : 'Our agricultural AI can still inspect leaf discoloration, pests and blights.'}
            </p>
          </div>
        </div>

        <button
          id="crop-select-other-btn"
          onClick={() => onSelectCrop(otherCrop)}
          className="w-full sm:w-auto px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shadow-xs transition shrink-0"
        >
          {language === 'hi' ? 'अन्य फसल चुनें' : 'Choose Other'}
        </button>
      </div>
    </div>
  );
};
