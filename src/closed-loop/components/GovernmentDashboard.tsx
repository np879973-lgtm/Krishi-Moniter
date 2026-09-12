// Government & Agricultural Extension Dashboard (Part 7)
// Empowers District Extension Officers & Agricultural Authorities to manage escalations,
// coordinate field visits, monitor privacy-preserving regional signals, and inspect verified outcomes.

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Calendar,
  MapPin,
  FileCheck,
  Activity,
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  Database,
  Filter,
  Eye,
  RefreshCw,
  Search,
  Check,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  FlaskConical,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  ClosedLoopCase,
  ClosedLoopGovernmentStats,
  PotentialCluster,
  RegionalSignal,
  CasePriority,
} from '../types';
import {
  getCasesForGovernmentAdmin,
  addFieldVisit,
  recordFieldVisitOutcome,
  addExtensionAction,
  verifyOutcome,
} from '../services/closedLoopService';
import { computeGovernmentStats } from '../services/governmentReportingService';
import { detectPotentialClusters } from '../services/clusterDetectionService';
import { generateRegionalSignals } from '../services/regionalSignalService';
import { FieldVisitModal } from './FieldVisitModal';
import { BeforeAfterComparison } from './BeforeAfterComparison';
import { ClosedLoopVisualizer } from './ClosedLoopVisualizer';
import { DataConsentBadge } from './DataConsentBadge';
import { runClosedLoopValidationTests, TestResult } from '../tests/closedLoop.test';

interface GovernmentDashboardProps {
  language?: 'en' | 'hi';
}

type TabType =
  | 'overview'
  | 'escalated'
  | 'clusters'
  | 'signals'
  | 'interventions'
  | 'outcomes'
  | 'learning';

export const GovernmentDashboard: React.FC<GovernmentDashboardProps> = ({
  language = 'en',
}) => {
  const isHi = language === 'hi';

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [cases, setCases] = useState<ClosedLoopCase[]>([]);
  const [stats, setStats] = useState<ClosedLoopGovernmentStats | null>(null);
  const [clusters, setClusters] = useState<PotentialCluster[]>([]);
  const [signals, setSignals] = useState<RegionalSignal[]>([]);
  const [selectedCase, setSelectedCase] = useState<ClosedLoopCase | null>(null);
  const [isFieldVisitModalOpen, setIsFieldVisitModalOpen] = useState(false);

  // Filter state for escalated cases
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [cropFilter, setCropFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Automated test runner state
  const [testReport, setTestReport] = useState<{
    total: number;
    passed: number;
    failed: number;
    results: TestResult[];
  } | null>(null);

  const reloadData = () => {
    const allCases = getCasesForGovernmentAdmin();
    setCases(allCases);
    setStats(computeGovernmentStats(allCases));
    setClusters(detectPotentialClusters(allCases));
    setSignals(generateRegionalSignals(allCases));
    if (selectedCase) {
      const updated = allCases.find((c) => c.id === selectedCase.id) || null;
      setSelectedCase(updated);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleRunValidationTests = () => {
    const report = runClosedLoopValidationTests();
    setTestReport(report);
  };

  const filteredCases = cases.filter((c) => {
    if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) return false;
    if (cropFilter !== 'ALL' && c.crop !== cropFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.farmerName.toLowerCase().includes(q);
      const matchCrop = c.crop.toLowerCase().includes(q);
      const matchId = c.id.toLowerCase().includes(q);
      const matchDiag = (
        c.expertAssessment?.verifiedDiagnosis || c.aiAssessment.diagnosis
      )
        .toLowerCase()
        .includes(q);
      if (!matchName && !matchCrop && !matchId && !matchDiag) return false;
    }
    return true;
  });

  const crops = Array.from(new Set(cases.map((c) => c.crop)));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-md border border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {isHi ? 'कृषि प्रसार एवं सरकारी निगरानी' : 'Government & Extension Control'}
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {isHi ? 'प्रदर्शन डेटा मोड (DEMO DATA)' : 'DEMO MODE — Isolated Data'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isHi
                ? 'कृषि प्रसार सहायता एवं क्षेत्रीय निगरानी'
                : 'Agricultural Extension & Regional Intelligence'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
              {isHi
                ? 'विशेषज्ञों द्वारा प्रेषित उच्च-जोखिम मामलों की निगरानी, क्षेत्रीय क्लस्टर सत्यापन, खेत निरीक्षण समन्वय एवं परिणाम ट्रैकिंग।'
                : 'Closed-loop governance connecting agronomist-verified escalations to district field visits, non-causal outcome validation, and responsible ML candidate pipelines.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={reloadData}
              className="px-4 py-2 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1.5 transition border border-stone-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {isHi ? 'रिफ्रेश' : 'Sync'}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-6 mt-6 border-t border-stone-800 text-xs font-bold">
          {[
            { id: 'overview', labelEn: 'Overview', labelHi: 'सारांश', icon: Activity },
            {
              id: 'escalated',
              labelEn: 'Escalated Cases',
              labelHi: 'प्रेषित मामले',
              icon: ShieldAlert,
              count: stats?.escalatedToExtensionCount,
            },
            {
              id: 'clusters',
              labelEn: 'Potential Clusters',
              labelHi: 'संभावित क्लस्टर',
              icon: AlertTriangle,
              count: clusters.filter((cl) => cl.status === 'POTENTIAL_CLUSTER').length,
            },
            {
              id: 'signals',
              labelEn: 'Regional Signals',
              labelHi: 'क्षेत्रीय संकेत',
              icon: MapPin,
            },
            {
              id: 'interventions',
              labelEn: 'Field Interventions',
              labelHi: 'खेत निरीक्षण',
              icon: Briefcase,
              count: stats?.activeInterventionsCount,
            },
            {
              id: 'outcomes',
              labelEn: 'Verified Outcomes',
              labelHi: 'सत्यापित परिणाम',
              icon: CheckCircle2,
              count: stats?.verifiedOutcomesCount,
            },
            {
              id: 'learning',
              labelEn: 'Governance & Tests',
              labelHi: 'लर्निंग पाइपलाइन व परीक्षण',
              icon: Database,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-3.5 py-2 rounded-2xl flex items-center gap-2 whitespace-nowrap transition-all ${
                  isTabActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isHi ? tab.labelHi : tab.labelEn}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isTabActive
                        ? 'bg-white text-emerald-800'
                        : 'bg-stone-700 text-stone-200'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Visualizer Flow Header */}
      <ClosedLoopVisualizer compact language={language} />

      {/* =========================================================================
          TAB 1: OVERVIEW
      ========================================================================= */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                {isHi ? 'खुले मामले' : 'Open Cases'}
              </span>
              <p className="text-2xl font-black text-stone-900 mt-1">
                {stats.openCasesCount}
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">
                {isHi ? 'निगरानी में' : 'Active monitoring'}
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 block">
                {isHi ? 'उच्च प्राथमिकता' : 'High / Urgent'}
              </span>
              <p className="text-2xl font-black text-red-700 mt-1">
                {stats.highPriorityCount}
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">
                {isHi ? 'त्वरित ध्यान आवश्यक' : 'Immediate response'}
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">
                {isHi ? 'प्रसार को प्रेषित' : 'Escalated to Govt'}
              </span>
              <p className="text-2xl font-black text-purple-800 mt-1">
                {stats.escalatedToExtensionCount}
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">
                {isHi ? 'विशेषज्ञों द्वारा अग्रसारित' : 'Specialist referrals'}
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                {isHi ? 'सक्रिय हस्तक्षेप' : 'Field Actions'}
              </span>
              <p className="text-2xl font-black text-amber-800 mt-1">
                {stats.activeInterventionsCount}
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">
                {isHi ? 'दौरे व निगरानी' : 'Field visits & tests'}
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                {isHi ? 'सत्यापित सुधार' : 'Verified Outcomes'}
              </span>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                {stats.verifiedOutcomesCount}
              </p>
              <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
                {stats.farmerImprovementRate}% {isHi ? 'सुधार दर' : 'recovery rate'}
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                {isHi ? 'लर्निंग उम्मीदवार' : 'Training Candidates'}
              </span>
              <p className="text-2xl font-black text-indigo-800 mt-1">
                {stats.dataQualityCandidateCount}
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">
                {isHi ? 'पूर्णतः सत्यापित' : 'Consent & quality pass'}
              </p>
            </div>
          </div>

          {/* Aggregation Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Crop Verified Breakdown */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>{isHi ? 'फसल-वार सत्यापित मामले' : 'Crop-Wise Verified Distribution'}</span>
                <span className="text-xs font-mono text-stone-400">Aggregated</span>
              </h3>
              <div className="space-y-3">
                {stats.cropBreakdown.map((item) => {
                  const pct = Math.round((item.verifiedCount / (item.count || 1)) * 100);
                  return (
                    <div key={item.crop} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-800">{item.crop}</span>
                        <span className="text-stone-500 font-mono">
                          {item.verifiedCount} / {item.count}{' '}
                          <span className="text-emerald-700 font-bold">({pct}% Verified)</span>
                        </span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(15, pct))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Diagnostic Conditions Breakdown */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>{isHi ? 'मुख्य रोग एवं कीट निदान' : 'Top Diagnosed Conditions'}</span>
                <span className="text-xs font-mono text-stone-400">Verified</span>
              </h3>
              <div className="space-y-3">
                {stats.issueBreakdown.map((item) => (
                  <div
                    key={item.issue}
                    className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs"
                  >
                    <span className="font-bold text-stone-800">{item.issue}</span>
                    <span className="px-2.5 py-1 rounded-xl bg-stone-200 font-mono font-bold text-stone-800">
                      {item.count} {isHi ? 'मामले' : 'cases'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: ESCALATED CASES
      ========================================================================= */}
      {activeTab === 'escalated' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isHi
                    ? 'किसान, फसल, या निदान खोजें...'
                    : 'Search by farmer, crop, diagnosis, or case ID...'
                }
                className="w-full text-xs bg-transparent border-none focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-400 font-bold">{isHi ? 'प्राथमिकता:' : 'Priority:'}</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1 font-semibold text-stone-700"
              >
                <option value="ALL">All</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              <span className="text-stone-400 font-bold ml-2">{isHi ? 'फसल:' : 'Crop:'}</span>
              <select
                value={cropFilter}
                onChange={(e) => setCropFilter(e.target.value)}
                className="bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1 font-semibold text-stone-700"
              >
                <option value="ALL">All Crops</option>
                {crops.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cases List */}
          <div className="space-y-3">
            {filteredCases.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs hover:border-emerald-300 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                      <img
                        src={c.primaryImageUri}
                        alt={c.crop}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-stone-500">
                          {c.id}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            c.priority === 'URGENT'
                              ? 'bg-red-100 text-red-800'
                              : c.priority === 'HIGH'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {c.priority}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                          {c.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-stone-900 mt-0.5">
                        {c.crop} —{' '}
                        {c.expertAssessment?.verifiedDiagnosis || c.aiAssessment.diagnosis}
                      </h4>
                      <p className="text-xs text-stone-500">
                        {c.farmerName} • {c.farmName || 'Farm'} ({c.fieldName || 'Field'})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => {
                        setSelectedCase(c);
                        setIsFieldVisitModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      {isHi ? 'खेत दौरा तय करें' : 'Schedule Visit'}
                    </button>
                  </div>
                </div>

                {/* Escalation Information Strip if present */}
                {c.escalation && (
                  <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs text-purple-950 space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-purple-700" />
                        {isHi ? 'विशेषज्ञ प्रेषण:' : 'Agronomist Escalation:'}{' '}
                        {c.escalation.problemCategory}
                      </span>
                      <span className="text-[11px] text-purple-700 font-mono">
                        {c.escalation.escalatedByName}
                      </span>
                    </div>
                    <p className="text-purple-900 text-[11px] leading-relaxed">
                      {c.escalation.recommendedAction}
                    </p>
                  </div>
                )}

                {/* Field Visits Strip if present */}
                {c.fieldVisits && c.fieldVisits.length > 0 && (
                  <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-950 flex items-center justify-between">
                    <div>
                      <span className="font-bold block">
                        {isHi ? 'खेत दौरा स्थिति:' : 'Field Visit:'} {c.fieldVisits[0].purpose}
                      </span>
                      <span className="text-[11px] text-amber-800">
                        {isHi ? 'अधिकारी:' : 'Officer:'} {c.fieldVisits[0].assignedOfficerName} •{' '}
                        {c.fieldVisits[0].scheduledDate} ({c.fieldVisits[0].status})
                      </span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-amber-300 text-amber-900">
                      {c.fieldVisits[0].status}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: POTENTIAL CLUSTERS & HIGH RISK (Strict Anti-Hallucination & Privacy)
      ========================================================================= */}
      {activeTab === 'clusters' && (
        <div className="space-y-5">
          {/* Requirement 9: Anti-hallucination banner */}
          <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
            <h4 className="font-black text-sm text-amber-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-700" />
              {isHi
                ? 'क्लस्टर एवं क्षेत्रीय जोखिम दिशानिर्देश'
                : 'Cluster Detection Standard & Scientific Humility'}
            </h4>
            <p className="leading-relaxed">
              {isHi
                ? 'नियम: कोई भी संभावित क्लस्टर स्वचालित रूप से "पुष्ट प्रकोप" नहीं बनता। भौतिक सत्यापन से पहले केवल "संभावित क्लस्टर (सत्यापन आवश्यक)" शब्दावली का प्रयोग करें। साथ ही, किसी भी किसान के खेत के सटीक निर्देशांक सार्वजनिक न करें।'
                : 'Mandate: A potential cluster must never automatically become a confirmed outbreak. Terminology is strictly bounded to "Potential cluster requiring verification". Exact farm coordinates are protected via privacy-preserving district aggregation.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clusters.map((cl) => (
              <div
                key={cl.clusterId}
                className={`p-6 rounded-3xl border shadow-xs space-y-4 ${
                  cl.status === 'POTENTIAL_CLUSTER'
                    ? 'bg-white border-amber-300'
                    : 'bg-stone-50 border-stone-200 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      cl.status === 'POTENTIAL_CLUSTER'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {cl.status === 'POTENTIAL_CLUSTER'
                      ? isHi
                        ? 'संभावित क्लस्टर (सत्यापन आवश्यक)'
                        : 'Potential Cluster Requiring Verification'
                      : isHi
                      ? 'अपर्याप्त डेटा'
                      : 'Insufficient Data'}
                  </span>
                  <span className="text-xs font-mono text-stone-400">
                    Window: {cl.timeWindowDays} days
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-stone-900">
                    {cl.crop} — {cl.issue}
                  </h3>
                  <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    {cl.approximateRegion}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-center">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">
                      {isHi ? 'सत्यापित खेत' : 'Verified Plots'}
                    </span>
                    <span className="text-sm font-black text-stone-900">
                      {cl.caseCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">
                      {isHi ? 'गंभीरता' : 'Severity'}
                    </span>
                    <span className="text-sm font-black text-amber-700">
                      {cl.severitySummary}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">
                      {isHi ? 'संकेत विश्वास' : 'Confidence'}
                    </span>
                    <span className="text-sm font-black text-stone-900">
                      {Math.round(cl.confidence * 100)}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">{cl.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: REGIONAL SIGNALS (Block / District Privacy Aggregation)
      ========================================================================= */}
      {activeTab === 'signals' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-1">
              {isHi ? 'प्रखंड एवं जिला स्तर पर एकत्रित संकेत' : 'District & Block Intelligence Signals'}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              {isHi
                ? 'गोपनीयता सुरक्षा: व्यक्तिगत किसान नाम व जीपीएस सीमाओं को पूरी तरह सुरक्षित रखा गया है।'
                : 'Privacy guarantee: Individual farmer identities and exact field coordinates are strictly redacted in aggregated reporting.'}
            </p>

            <div className="space-y-3">
              {signals.map((sig) => (
                <div
                  key={sig.signalId}
                  className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 hover:bg-white transition space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-stone-900">
                        {sig.crop}: {sig.diagnosis}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                        {sig.approximateRegion.district}, {sig.approximateRegion.state}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md self-start sm:self-auto ${
                        sig.status === 'VERIFIED_SIGNAL'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {sig.status === 'VERIFIED_SIGNAL'
                        ? isHi
                          ? 'सत्यापित संकेत'
                          : 'Verified Signal'
                        : isHi
                        ? 'अपर्याप्त डेटा'
                        : 'Insufficient Data'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed">{sig.summaryText}</p>

                  <div className="flex items-center gap-4 text-[11px] text-stone-500 pt-1">
                    <span>
                      {isHi ? 'कुल मामले:' : 'Total Reports:'}{' '}
                      <strong className="text-stone-800">{sig.totalCases}</strong>
                    </span>
                    <span>
                      {isHi ? 'वैज्ञानिक सत्यापित:' : 'Agronomist-Verified:'}{' '}
                      <strong className="text-emerald-800">{sig.verifiedCases}</strong>
                    </span>
                    <span>
                      {isHi ? 'अवधि:' : 'Window:'} {sig.timePeriod}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: FIELD INTERVENTIONS & SAMPLES
      ========================================================================= */}
      {activeTab === 'interventions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cases
              .filter((c) => (c.fieldVisits && c.fieldVisits.length > 0) || (c.extensionActions && c.extensionActions.length > 0))
              .map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <div>
                      <span className="font-mono text-[11px] text-stone-400 font-bold">
                        {c.id}
                      </span>
                      <h4 className="text-sm font-black text-stone-900">
                        {c.crop} • {c.farmerName}
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {c.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Field Visits */}
                  {c.fieldVisits?.map((fv) => (
                    <div
                      key={fv.id}
                      className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-amber-950">
                        <span>
                          {isHi ? 'खेत दौरा:' : 'Visit:'} {fv.purpose}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-amber-300">
                          {fv.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-900">
                        Officer: {fv.assignedOfficerName} • Date: {fv.scheduledDate}
                      </p>
                      {fv.observations && (
                        <p className="text-[11px] text-amber-950 italic pt-1 border-t border-amber-200/60">
                          "{fv.observations}"
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Actions */}
                  {c.extensionActions?.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-stone-900">
                        <span>{act.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-200">
                          {act.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600">{act.description}</p>
                    </div>
                  ))}

                  {/* Sample Requests (Requirement 12: Laboratory result not available notice) */}
                  {c.sampleRequests?.map((smp) => (
                    <div
                      key={smp.id}
                      className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-blue-950">
                        <span className="flex items-center gap-1">
                          <FlaskConical className="w-3.5 h-3.5 text-blue-700" />
                          {smp.sampleType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-blue-800">{smp.status}</span>
                      </div>
                      <p className="text-[11px] text-blue-900 font-medium">
                        {smp.labResultSummary}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: VERIFIED OUTCOMES (Before vs After Visual Assessment)
      ========================================================================= */}
      {activeTab === 'outcomes' && (
        <div className="space-y-5">
          {cases
            .filter((c) => !!c.outcomeReport)
            .map((c) => (
              <BeforeAfterComparison
                key={c.id}
                crop={c.crop}
                initialImageUri={c.primaryImageUri}
                initialDiagnosis={
                  c.expertAssessment?.verifiedDiagnosis || c.aiAssessment.diagnosis
                }
                initialSeverity={
                  c.expertAssessment?.verifiedSeverity || c.aiAssessment.severity
                }
                outcomeReport={c.outcomeReport!}
                outcomeVerification={c.outcomeVerification}
                language={language}
              />
            ))}
        </div>
      )}

      {/* =========================================================================
          TAB 7: GOVERNANCE & AUTOMATED VALIDATION TEST SUITE
      ========================================================================= */}
      {activeTab === 'learning' && (
        <div className="space-y-6">
          {/* Learning Loop Candidates List */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-black text-stone-900">
                  {isHi ? 'सत्यापित प्रशिक्षण उम्मीदवार रिकॉर्ड्स' : 'Verified ML Training Candidate Records'}
                </h3>
                <p className="text-xs text-stone-500">
                  {isHi
                    ? 'केवल वे रिकॉर्ड शामिल हैं जिन्होंने किसान सहमति, विशेषज्ञ सत्यापन और परिणाम परीक्षण तीनों पास किए हैं।'
                    : 'Only records meeting consent, definitive diagnosis, verified recovery, and quality scores.'}
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-900 bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200">
                {cases.filter((c) => c.isTrainingCandidate).length} {isHi ? 'योग्य रिकॉर्ड' : 'Eligible Candidates'}
              </span>
            </div>

            <div className="space-y-3">
              {cases.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl border border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                      <img
                        src={c.primaryImageUri}
                        alt={c.crop}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold">{c.id}</span>
                        <span className="text-xs font-bold text-stone-800">{c.crop}</span>
                      </div>
                      <p className="text-xs text-stone-500">
                        {c.trainingCandidateReason || 'Evaluated against data governance criteria'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {c.isTrainingCandidate ? (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                        Candidate Qualified
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-stone-500 bg-stone-200 px-2.5 py-1 rounded-full">
                        Not Qualified
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Automated System Test Suite Runner (Requirement 46) */}
          <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-stone-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Automated Quality Assurance
                </span>
                <h3 className="text-lg font-black mt-0.5">
                  Closed-Loop System & Governance Test Suite
                </h3>
                <p className="text-xs text-stone-400">
                  Runs real verification tests for privacy boundaries, AI immutability, cluster thresholds, and consent gating.
                </p>
              </div>

              <button
                onClick={handleRunValidationTests}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md flex items-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4" />
                Run Validation Tests
              </button>
            </div>

            {testReport && (
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-stone-300">Total: {testReport.total}</span>
                  <span className="text-emerald-400 font-bold">Passed: {testReport.passed}</span>
                  {testReport.failed > 0 && (
                    <span className="text-red-400 font-bold">Failed: {testReport.failed}</span>
                  )}
                </div>

                <div className="space-y-2">
                  {testReport.results.map((r, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border text-xs font-mono ${
                        r.passed
                          ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                          : 'bg-red-950/40 border-red-800/80 text-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {r.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        )}
                        <span className="font-bold">{r.name}</span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-1 pl-6">{r.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Field Visit Modal */}
      {selectedCase && isFieldVisitModalOpen && (
        <FieldVisitModal
          caseData={selectedCase}
          isOpen={isFieldVisitModalOpen}
          onClose={() => setIsFieldVisitModalOpen(false)}
          onSchedule={(params) => {
            addFieldVisit({
              ...params,
              officerId: 'ext-officer-verma',
              officerName: 'Sanjay Verma (BAO)',
            });
            reloadData();
          }}
          language={language}
        />
      )}
    </div>
  );
};
