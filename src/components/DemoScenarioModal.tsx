import React from 'react';
import { X, Sparkles, CheckCircle2, AlertTriangle, Bug, ShieldAlert, ArrowRight, Activity } from 'lucide-react';
import { DEMO_SCENARIOS, DemoScenario } from '../services/demoScenarios';
import { DiagnosisResult, Language } from '../types';
import { translations } from '../i18n/translations';

interface DemoScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSelectScenario: (scenario: DemoScenario, diagnosis: DiagnosisResult) => void;
}

export const DemoScenarioModal: React.FC<DemoScenarioModalProps> = ({
  isOpen,
  onClose,
  language,
  onSelectScenario,
}) => {
  if (!isOpen) return null;

  const t = translations[language];
  const isHi = language === 'hi';

  const handlePick = (scenario: DemoScenario) => {
    const result = scenario.result(language, scenario.imageUrl);
    onSelectScenario(scenario, result);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold">
                  {t.demoModeTitle}
                </h3>
                <span className="text-[10px] uppercase font-extrabold bg-amber-400 text-emerald-950 px-2 py-0.5 rounded-full">
                  Part 2 Engine
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                {t.demoModeSubtitle}
              </p>
            </div>
          </div>

          <button
            id="close-demo-modal-btn"
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scenarios Grid */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-3">
          <p className="text-xs text-stone-600 mb-2">
            {isHi
              ? 'नीचे दिए गए किसी भी कृषि परिदृश्य को चुनें और देखें कि Krishi Mentor का नया इंटेलिजेंस इंजन दृश्य साक्ष्य, प्रगति जोखिम व कीट घनत्व कैसे प्रस्तुत करता है:'
              : 'Select any field scenario below to test how the Part 2 AI Engine surfaces evidence, progression risk, pest density, and differential diagnoses:'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEMO_SCENARIOS.map((scenario) => {
              const isDisease = scenario.category.includes('Disease');
              const isPest = scenario.category.includes('Pest');
              const isHealthy = scenario.id.includes('healthy');
              const isLowConf = scenario.id.includes('ambiguous') || scenario.id.includes('quality');

              return (
                <button
                  key={scenario.id}
                  id={`demo-card-${scenario.id}`}
                  onClick={() => handlePick(scenario)}
                  className="text-left p-3.5 rounded-2xl border-2 border-stone-200 hover:border-emerald-600 bg-white hover:bg-emerald-50/40 transition group flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    {/* Top image preview and category badge */}
                    <div className="relative rounded-xl overflow-hidden aspect-16/9 mb-2.5 bg-stone-900">
                      <img
                        src={scenario.imageUrl}
                        alt={scenario.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-900/80 text-white backdrop-blur-xs">
                        {scenario.cropName}
                      </span>
                      <span
                        className={`absolute top-2 right-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isHealthy
                            ? 'bg-emerald-500 text-white'
                            : isDisease
                            ? 'bg-rose-600 text-white'
                            : isPest
                            ? 'bg-amber-500 text-stone-950'
                            : 'bg-stone-700 text-white'
                        }`}
                      >
                        {scenario.badge}
                      </span>
                    </div>

                    <h4 className="font-bold text-stone-900 text-sm leading-snug group-hover:text-emerald-800 transition">
                      {isHi ? scenario.titleHi : scenario.title}
                    </h4>

                    <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                      {isHi ? scenario.descriptionHi : scenario.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-900">
                    <span>{scenario.category}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>Indian Agronomy Datasets Grounded</span>
          <button
            onClick={onClose}
            className="text-stone-700 font-semibold hover:text-stone-900 px-3 py-1.5 rounded-lg hover:bg-stone-200 transition"
          >
            {isHi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
