import React from 'react';
import { BookOpen, X, Sprout, ShieldAlert, Bug, Droplet, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface FarmingTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const FarmingTipsModal: React.FC<FarmingTipsModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  const tips = [
    {
      title: language === 'hi' ? 'खेत में "W" आकार में निगरानी (Scouting)' : 'W-Pattern Field Scouting',
      desc:
        language === 'hi'
          ? 'केवल खेत के किनारे न देखें; खेत के अंदर "W" आकार में घूमकर कम से कम 20 पौधों की निचली व ऊपरी पत्तियों की जांच करें।'
          : 'Do not scout solely field borders; traverse the interior in a zig-zag "W" path inspecting both upper and lower canopy surfaces on at least 20 random plants.',
      tag: 'Monitoring',
      icon: <Bug className="w-5 h-5 text-amber-600" />,
    },
    {
      title: language === 'hi' ? '5% नीम के बीज का काढ़ा (NSKE) तैयार करना' : 'Preparing 5% Neem Seed Extract (NSKE)',
      desc:
        language === 'hi'
          ? '50 ग्राम सूखे नीम के बीजों को कूटकर रातभर 1 लीटर पानी में भिगोएं। सुबह छानकर थोड़ा साबुन का घोल मिलाएं। यह रस चूसक कीटों के लिए बेहतरीन प्राकृतिक निवारक है।'
          : 'Crush 50g dried neem seeds, soak overnight in 1L water, filter, and add a drop of mild liquid soap emulsifier. Acts as an excellent safe anti-feedant for sap-sucking pests.',
      tag: 'Biological IPM',
      icon: <Sprout className="w-5 h-5 text-emerald-600" />,
    },
    {
      title: language === 'hi' ? 'पीले व नीले चिपचिपे ट्रैप' : 'Sticky Trap Installation Density',
      desc:
        language === 'hi'
          ? 'सफेद मक्खी, एफिड्स के लिए पीले और थ्रिप्स के लिए नीले ट्रैप फसल की ऊंचाई से 6 इंच ऊपर लगाएं (प्रति एकड़ 5-8 ट्रैप)।'
          : 'Deploy 5 to 8 sticky cards per acre (Yellow for whiteflies & aphids; Blue for thrips) positioned roughly 6 inches above current crop canopy.',
      tag: 'Mechanical Control',
      icon: <ShieldAlert className="w-5 h-5 text-teal-600" />,
    },
    {
      title: language === 'hi' ? 'सुरक्षित छिड़काव नियम' : 'Safe Spraying & Waiting Period',
      desc:
        language === 'hi'
          ? 'तेज धूप व दोपहर में छिड़काव न करें। हमेशा दस्ताने व मास्क पहनें और फसल तुड़ाई से पहले सुरक्षा अंतराल (Pre-Harvest Interval) का ध्यान रखें।'
          : 'Never spray during peak mid-day heat or against the wind. Always observe the certified Pre-Harvest Interval (PHI) between spraying and crop harvesting.',
      tag: 'Safety Guidance',
      icon: <Droplet className="w-5 h-5 text-sky-600" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-stone-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {t.farmingTipsTitle}
              </h3>
              <p className="text-xs text-emerald-200">{t.farmingTipsSubtitle}</p>
            </div>
          </div>

          <button
            id="farming-tips-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-3.5">
          {tips.map((item, idx) => (
            <div
              key={idx}
              className="bg-stone-50 border border-stone-200/90 rounded-2xl p-4 text-left"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {item.icon}
                  <h4 className="font-bold text-sm text-stone-900">
                    {item.title}
                  </h4>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                  {item.tag}
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed pl-7">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-5 py-3.5 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition"
          >
            {language === 'hi' ? 'समझ गया' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
