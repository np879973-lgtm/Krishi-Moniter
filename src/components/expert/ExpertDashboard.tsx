import React, { useState, useEffect } from 'react';
import {
  Inbox,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Layers,
  Sparkles,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { AgriculturalCase, CasePriority, VerificationStatus } from '../../types/expert';
import { getAllCases, getExpertCaseStats } from '../../services/expert/caseService';
import { getActiveExpertProfile } from '../../services/expert/expertService';

interface ExpertDashboardProps {
  onSelectCase: (caseItem: AgriculturalCase) => void;
  onOpenProfile: () => void;
  language: 'en' | 'hi';
}

export const ExpertDashboard: React.FC<ExpertDashboardProps> = ({
  onSelectCase,
  onOpenProfile,
  language,
}) => {
  const isHi = language === 'hi';
  const activeExpert = getActiveExpertProfile();

  const [cases, setCases] = useState<AgriculturalCase[]>([]);
  const [stats, setStats] = useState(getExpertCaseStats());

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState<CasePriority | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('NEEDS_REVIEW');
  const [selectedProblemType, setSelectedProblemType] = useState('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const list = getAllCases();
    setCases(list);
    setStats(getExpertCaseStats());
  };

  // Filter logic
  const filteredCases = cases.filter((c) => {
    // Search query (Case ID, Crop, Farmer Name, Diagnosis)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = c.id.toLowerCase().includes(q);
      const matchCrop = c.crop.toLowerCase().includes(q);
      const matchFarmer = c.farmerName.toLowerCase().includes(q);
      const matchDiag = c.aiAssessment.diagnosis.toLowerCase().includes(q);
      if (!matchId && !matchCrop && !matchFarmer && !matchDiag) return false;
    }

    // Crop filter
    if (selectedCrop !== 'ALL' && c.crop.toLowerCase() !== selectedCrop.toLowerCase()) {
      return false;
    }

    // Priority filter
    if (selectedPriority !== 'ALL' && c.priority !== selectedPriority) {
      return false;
    }

    // Problem type
    if (selectedProblemType !== 'ALL' && c.aiAssessment.problemType !== selectedProblemType) {
      return false;
    }

    // Tab / Status filter
    if (selectedStatus === 'NEEDS_REVIEW') {
      return (
        c.status === 'QUEUED' ||
        c.status === 'SUBMITTED' ||
        c.status === 'WAITING_FOR_FARMER' ||
        c.status === 'IN_REVIEW' ||
        c.verificationStatus === 'EXPERT_REVIEW_REQUESTED'
      );
    } else if (selectedStatus === 'REVIEWED') {
      return (
        c.status === 'VERIFIED' ||
        c.status === 'CORRECTED' ||
        c.status === 'UNCERTAIN' ||
        c.status === 'CLOSED'
      );
    }

    return true;
  });

  const availableCrops = Array.from(new Set(cases.map((c) => c.crop)));

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-24">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 font-black text-[10px] uppercase tracking-wider">
                Expert Workspace • ICAR / KVK
              </span>
              <span className="text-xs text-blue-200">
                {isHi ? 'मानव-सत्यापित कृषि निर्णय समर्थन' : 'Human-in-the-Loop Diagnostic Verification'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isHi ? 'विशेषज्ञ डैशबोर्ड' : 'Expert Dashboard'}
            </h1>
            <p className="text-xs sm:text-sm text-blue-200 max-w-2xl mt-1">
              {isHi
                ? 'किसानों द्वारा भेजे गए AI जांच परिणामों की समीक्षा करें, वैज्ञानिक सटीकता सत्यापित करें या संशोधन प्रदान करें।'
                : 'Review incoming AI crop scans, verify pathogen etiology, issue certified IPM advice, or request higher resolution evidence.'}
            </p>
          </div>

          {/* Active Expert Profile Widget */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-xs transition text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-amber-300 font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold block">{activeExpert.name}</span>
              <span className="text-[11px] text-blue-200 block max-w-[160px] truncate">
                {activeExpert.title}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards (Dynamically computed from actual cases) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Pending Reviews */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              {isHi ? 'लंबित समीक्षा' : 'Pending Reviews'}
            </span>
            <Inbox className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-stone-900">{stats.pendingReviews}</div>
          <p className="text-[11px] text-stone-500">Awaiting agronomist examination</p>
        </div>

        {/* 2. Active Cases */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              {isHi ? 'सक्रिय संवाद' : 'Active Cases'}
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-950">{stats.activeCases}</div>
          <p className="text-[11px] text-stone-500">Info requested or in diagnostic review</p>
        </div>

        {/* 3. Reviewed Today */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              {isHi ? 'आज सत्यापित' : 'Reviewed Today'}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-800">{stats.reviewedToday}</div>
          <p className="text-[11px] text-stone-500">Verified & guidance dispatched</p>
        </div>

        {/* 4. High Priority Cases */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              {isHi ? 'उच्च प्राथमिकता' : 'High Priority'}
            </span>
            <AlertOctagon className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-3xl font-black text-red-600">{stats.highPriority}</div>
          <p className="text-[11px] text-stone-500">Urgent quarantine or severe outbreaks</p>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        {/* Main Tab Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="inline-flex p-1 bg-stone-100 rounded-2xl">
            <button
              onClick={() => setSelectedStatus('NEEDS_REVIEW')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedStatus === 'NEEDS_REVIEW'
                  ? 'bg-blue-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {isHi ? 'समीक्षा हेतु मामले' : 'Cases Needing Review'} ({stats.pendingReviews + stats.activeCases})
            </button>
            <button
              onClick={() => setSelectedStatus('REVIEWED')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedStatus === 'REVIEWED'
                  ? 'bg-blue-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {isHi ? 'समीक्षित मामले (इतिहास)' : 'Reviewed Cases (History)'}
            </button>
          </div>

          <button
            onClick={loadData}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isHi ? 'रिफ्रेश' : 'Refresh'}</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHi ? 'केस ID या फसल खोजें...' : 'Search Case ID, Crop, Farmer...'}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-blue-600 bg-stone-50/50"
            />
          </div>

          {/* Crop Filter */}
          <div>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-stone-300 bg-stone-50/50 font-semibold text-stone-700"
            >
              <option value="ALL">{isHi ? 'सभी फसलें' : 'All Crops'}</option>
              {availableCrops.map((crp) => (
                <option key={crp} value={crp}>
                  {crp}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as any)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-stone-300 bg-stone-50/50 font-semibold text-stone-700"
            >
              <option value="ALL">{isHi ? 'सभी प्राथमिकता' : 'All Priorities'}</option>
              <option value="URGENT">Urgent Only</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          {/* Problem Type Filter */}
          <div>
            <select
              value={selectedProblemType}
              onChange={(e) => setSelectedProblemType(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-stone-300 bg-stone-50/50 font-semibold text-stone-700"
            >
              <option value="ALL">{isHi ? 'सभी समस्या प्रकार' : 'All Problem Types'}</option>
              <option value="Disease">Disease (रोग)</option>
              <option value="Pest">Pest (कीट)</option>
              <option value="Nutrient Deficiency">Nutrient Deficiency</option>
              <option value="Environmental Stress">Environmental Stress</option>
            </select>
          </div>
        </div>
      </div>

      {/* Case Queue Grid / Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
            <span>{selectedStatus === 'NEEDS_REVIEW' ? 'Cases Needing Review' : 'Reviewed Cases Archive'}</span>
            <span className="px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 text-xs font-bold">
              {filteredCases.length}
            </span>
          </h2>
        </div>

        {filteredCases.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3">
            <Inbox className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-bold text-stone-700">
              {isHi ? 'कोई मामला नहीं मिला' : 'No Cases Found'}
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {isHi
                ? 'वर्तमान फिल्टर के अनुसार कोई केस उपलब्ध नहीं है। फिल्टर रीसेट करके देखें।'
                : 'There are no cases matching the selected filters. Try clearing filters or searching for another crop.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCases.map((item) => {
              const isUrgent = item.priority === 'URGENT';
              const isHigh = item.priority === 'HIGH';

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl border transition-all hover:shadow-md p-5 flex flex-col justify-between space-y-4 ${
                    isUrgent
                      ? 'border-red-300 ring-2 ring-red-200/80 bg-red-50/10'
                      : isHigh
                      ? 'border-amber-300'
                      : 'border-stone-200'
                  }`}
                >
                  {/* Card Header: Case ID, Priority badge, Time */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-900">
                          {item.id}
                        </span>
                        {item.isDemo && (
                          <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 text-[10px] font-bold border border-stone-200">
                            Demo
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isUrgent
                              ? 'bg-red-600 text-white animate-pulse'
                              : isHigh
                              ? 'bg-amber-400 text-stone-950 font-bold'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {item.priority}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-stone-900 mt-1">
                        {item.crop} {item.cropHindi ? `(${item.cropHindi})` : ''}
                      </h3>
                      <p className="text-xs text-stone-500">
                        {item.fieldName || item.farmName || 'Field Parcel'} • Farmer:{' '}
                        <strong>{item.farmerName}</strong>
                      </p>
                    </div>

                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                      <img
                        src={item.primaryImageUri}
                        alt={item.crop}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* AI Assessment Summary */}
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-stone-400 uppercase">
                        AI Diagnosis:
                      </span>
                      <span className="font-black text-purple-900">
                        {Math.round(item.aiAssessment.confidence * 100)}% Confidence
                      </span>
                    </div>
                    <div className="font-bold text-stone-900 line-clamp-1">
                      {item.aiAssessment.diagnosis}
                    </div>
                    <div className="text-stone-500 text-[11px]">
                      Severity: <strong>{item.aiAssessment.severity}</strong> • Type:{' '}
                      <strong>{item.aiAssessment.problemType}</strong>
                    </div>
                  </div>

                  {/* If info requested or corrected */}
                  {item.infoRequest && item.status === 'WAITING_FOR_FARMER' && (
                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-900 flex items-start gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>
                        Waiting for farmer: "<em>{item.infoRequest.message}</em>"
                      </span>
                    </div>
                  )}

                  {/* Verified / Corrected status indicator */}
                  {item.expertAssessment && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-950 flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          {item.expertAssessment.isCorrected
                            ? 'Expert Corrected AI'
                            : 'Expert Confirmed AI'}
                        </span>
                      </span>
                      <span className="font-semibold text-emerald-800">
                        {item.expertAssessment.verifiedDiagnosis}
                      </span>
                    </div>
                  )}

                  {/* Footer with Action button */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                    <span className="text-stone-400 text-[11px]">
                      Submitted: {new Date(item.createdAt).toLocaleDateString()}
                    </span>

                    <button
                      id={`review-case-btn-${item.id}`}
                      onClick={() => onSelectCase(item)}
                      className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 text-xs active:scale-95"
                    >
                      <span>{isHi ? 'केस की समीक्षा करें' : 'Review Case'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
