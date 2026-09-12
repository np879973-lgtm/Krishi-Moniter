import React from 'react';
import {
  X,
  UserCheck,
  Building2,
  Award,
  Globe2,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Info,
} from 'lucide-react';
import {
  getAllExpertProfiles,
  getActiveExpertProfile,
  setActiveExpertProfile,
} from '../../services/expert/expertService';

interface ExpertProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'hi';
}

export const ExpertProfileModal: React.FC<ExpertProfileModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const isHi = language === 'hi';
  const profiles = getAllExpertProfiles();
  const currentProfile = getActiveExpertProfile();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-700/60 border border-blue-400/40 flex items-center justify-center text-amber-300">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-tight">
                  {isHi ? 'कृषि विशेषज्ञ प्रोफाइल' : 'Expert Profile'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-black text-[10px] uppercase tracking-wider">
                  Demo Mode
                </span>
              </div>
              <p className="text-xs text-blue-200">
                {isHi
                  ? 'सत्यापित कृषि वैज्ञानिक व अनुसंधान विस्तार विशेषज्ञ'
                  : 'Verified Agricultural Scientist & Extension Agronomist'}
              </p>
            </div>
          </div>

          <button
            id="expert-profile-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Active Profile Switcher */}
          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">
              {isHi ? 'सक्रिय विशेषज्ञ चुनें (डेमो खाता)' : 'Select Active Expert (Demo Account)'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {profiles.map((p) => {
                const isSelected = p.id === currentProfile.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveExpertProfile(p.id);
                      window.location.reload();
                    }}
                    className={`text-left p-3 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-500'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-stone-900">{p.name}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </div>
                    <span className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                      {p.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Profile Card */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-black text-stone-900 flex items-center gap-1.5">
                  {currentProfile.name}
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                </h4>
                <p className="text-xs font-semibold text-blue-800">{currentProfile.title}</p>
                <p className="text-xs text-stone-600 flex items-center gap-1 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-stone-400" />
                  <span>{currentProfile.institution}</span>
                </p>
              </div>

              <div className="px-2.5 py-1 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isHi ? 'डेमो सत्यापित' : 'Demo Verified'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-200 text-xs">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">
                  {isHi ? 'कार्यक्षेत्र' : 'Specialization'}
                </span>
                <span className="font-semibold text-stone-800">{currentProfile.experience}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">
                  {isHi ? 'सत्यापित मामले' : 'Cases Reviewed'}
                </span>
                <span className="font-semibold text-emerald-700">
                  {currentProfile.casesReviewedCount} {isHi ? 'मामले' : 'cases'}
                </span>
              </div>
            </div>

            {/* Region & Languages */}
            <div className="space-y-2 pt-2 border-t border-stone-200 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-700">
                    {isHi ? 'कृषि जलवायु क्षेत्र:' : 'Agro-Climatic Zone:'}{' '}
                  </span>
                  <span className="text-stone-600">{currentProfile.region}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-stone-400 shrink-0" />
                <div>
                  <span className="font-semibold text-stone-700">
                    {isHi ? 'भाषाएं:' : 'Languages:'}{' '}
                  </span>
                  <span className="text-stone-600">{currentProfile.languages.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Specialties Badges */}
            <div className="pt-2 border-t border-stone-200">
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1.5">
                {isHi ? 'फसल एवं रोग विशेषज्ञता' : 'Crop & Diagnostic Specialties'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentProfile.expertise.map((exp, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-900 text-[11px] font-medium"
                  >
                    {exp}
                  </span>
                ))}
                {currentProfile.crops.map((crp, idx) => (
                  <span
                    key={`crp-${idx}`}
                    className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 text-[11px] font-medium"
                  >
                    {crp}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* System Compliance Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-2.5 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {isHi
                ? 'महत्वपूर्ण: डेमो मोड में परीक्षण हेतु विशेषज्ञ प्रोफाइल प्रदान किए गए हैं। वास्तविक उत्पादन वातावरण में केवल मान्यता प्राप्त ICAR/KVK वैज्ञानिकों के आधिकारिक क्रेडेंशियल्स का सत्यापन किया जाता है।'
                : 'Important: In demo mode, verified profiles are simulated for workflow demonstration. Production deployments connect directly with accredited agricultural university and KVK scientists.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex justify-end">
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
