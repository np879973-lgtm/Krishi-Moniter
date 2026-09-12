// Visual Representation of the Closed Loop (Part 7)
// Farmer → AI Diagnosis → Expert Verification → Extension Support → Field Action → Verified Outcome → Learning Loop

import React from 'react';
import {
  Sprout,
  Sparkles,
  UserCheck,
  ShieldCheck,
  Briefcase,
  CheckCircle2,
  Database,
  ArrowRight,
} from 'lucide-react';
import { ClosedLoopCaseStatus } from '../types';

interface ClosedLoopVisualizerProps {
  currentStatus?: ClosedLoopCaseStatus;
  compact?: boolean;
  language?: 'en' | 'hi';
}

export const ClosedLoopVisualizer: React.FC<ClosedLoopVisualizerProps> = ({
  currentStatus = 'EXPERT_VERIFIED',
  compact = false,
  language = 'en',
}) => {
  const isHi = language === 'hi';

  const steps = [
    {
      id: 'farmer',
      title: isHi ? 'किसान' : 'Farmer',
      sub: isHi ? 'मामला दर्ज' : 'Crop Case',
      icon: Sprout,
      active: true,
      color: 'emerald',
    },
    {
      id: 'ai',
      title: isHi ? 'AI निदान' : 'AI Scan',
      sub: isHi ? 'प्रारंभिक जांच' : 'Vision Model',
      icon: Sparkles,
      active: true,
      color: 'emerald',
    },
    {
      id: 'expert',
      title: isHi ? 'विशेषज्ञ' : 'Expert',
      sub: isHi ? 'सत्यापन' : 'Agronomist',
      icon: UserCheck,
      active:
        currentStatus !== 'DRAFT' &&
        currentStatus !== 'SUBMITTED' &&
        currentStatus !== 'AI_ANALYZED',
      color: 'blue',
    },
    {
      id: 'extension',
      title: isHi ? 'कृषि प्रसार' : 'Extension',
      sub: isHi ? 'सहायता' : 'Govt Support',
      icon: ShieldCheck,
      active:
        currentStatus === 'ESCALATED_TO_EXTENSION' ||
        currentStatus === 'GOVERNMENT_REVIEW' ||
        currentStatus === 'ACTION_IN_PROGRESS' ||
        currentStatus === 'OUTCOME_PENDING' ||
        currentStatus === 'OUTCOME_REPORTED' ||
        currentStatus === 'OUTCOME_VERIFIED',
      color: 'purple',
    },
    {
      id: 'action',
      title: isHi ? 'कार्रवाई' : 'Action',
      sub: isHi ? 'खेत निरीक्षण' : 'Field Visit',
      icon: Briefcase,
      active:
        currentStatus === 'ACTION_IN_PROGRESS' ||
        currentStatus === 'OUTCOME_PENDING' ||
        currentStatus === 'OUTCOME_REPORTED' ||
        currentStatus === 'OUTCOME_VERIFIED',
      color: 'amber',
    },
    {
      id: 'outcome',
      title: isHi ? 'परिणाम' : 'Outcome',
      sub: isHi ? 'सुधार रिपोर्ट' : 'Crop Recovery',
      icon: CheckCircle2,
      active:
        currentStatus === 'OUTCOME_REPORTED' || currentStatus === 'OUTCOME_VERIFIED',
      color: 'emerald',
    },
    {
      id: 'learning',
      title: isHi ? 'लर्निंग' : 'Learning',
      sub: isHi ? 'डेटा पाइपलाइन' : 'Verified Intel',
      icon: Database,
      active: currentStatus === 'OUTCOME_VERIFIED',
      color: 'indigo',
    },
  ];

  if (compact) {
    return (
      <div className="w-full bg-stone-50 border border-stone-200/80 rounded-2xl p-3 shadow-2xs">
        <div className="flex items-center justify-between overflow-x-auto gap-1 text-[11px] py-1">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <React.Fragment key={s.id}>
                <div
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-xl shrink-0 transition-all ${
                    s.active
                      ? 'bg-white text-stone-900 font-bold border border-stone-300 shadow-2xs'
                      : 'text-stone-400 opacity-60'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      s.active ? 'text-emerald-700' : 'text-stone-400'
                    }`}
                  />
                  <span>{s.title}</span>
                </div>
                {idx < steps.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-stone-300 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-stone-200 rounded-3xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-stone-100">
        <div>
          <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {isHi
              ? 'किसान → विशेषज्ञ → कृषि प्रसार संपूर्ण लूप'
              : 'Farmer → Expert → Government Closed Loop'}
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            {isHi
              ? 'प्रमाणित रोग पहचान से लेकर खेत निरीक्षण, परिणाम और सत्यापन चक्र'
              : 'Traceable journey from AI scan to field intervention, recovery, and verified intelligence'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
            Immutable Audit Trail
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              className={`p-3 rounded-2xl border transition-all ${
                s.active
                  ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950 shadow-2xs'
                  : 'bg-stone-50 border-stone-200 text-stone-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold text-stone-400">
                  0{idx + 1}
                </span>
                <Icon
                  className={`w-4 h-4 ${
                    s.active ? 'text-emerald-700' : 'text-stone-400'
                  }`}
                />
              </div>
              <p className="text-xs font-black tracking-tight">{s.title}</p>
              <p className="text-[10px] text-stone-500 mt-0.5">{s.sub}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
