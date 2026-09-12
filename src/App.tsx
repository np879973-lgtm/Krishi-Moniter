// Krishi Mentor - Main Application Component
// Integrates: AI Crop Diagnosis + Weather Intelligence + Agricultural Risk Forecasting

import React, { useState, useEffect, useCallback } from 'react';
import { CropInfo, DiagnosisResult, FarmerReport, Language } from './types';
import { LocationContext, WeatherData, AgriculturalWeatherSignal, NetworkStatus } from './types/weather';
import { RiskAssessment } from './types/risk';
import { UserRole, AgriculturalCase } from './types/expert';
import { INITIAL_CROPS } from './data/crops';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { CropSelectionScreen } from './components/CropSelectionScreen';
import { ImageUploadScreen } from './components/ImageUploadScreen';
import { DiagnosisResultScreen } from './components/DiagnosisResultScreen';
import { MyReportsScreen } from './components/MyReportsScreen';
import { WeatherScreen } from './components/WeatherScreen';
import { RiskForecastScreen } from './components/RiskForecastScreen';
import { FarmScreen } from './components/FarmScreen';
import { FarmerCasesScreen } from './components/FarmerCasesScreen';
import { ExpertDashboard } from './components/expert/ExpertDashboard';
import { ExpertCaseDetail } from './components/expert/ExpertCaseDetail';
import { ExpertProfileModal } from './components/expert/ExpertProfileModal';
import { NotificationsModal } from './components/expert/NotificationsModal';
import { GovernmentDashboard } from './closed-loop/components/GovernmentDashboard';
import { WeatherModal } from './components/WeatherModal';
import { FarmingTipsModal } from './components/FarmingTipsModal';
import { AskExpertModal } from './components/AskExpertModal';
import { DemoScenarioModal } from './components/DemoScenarioModal';
import { LocationSelectorModal } from './components/LocationSelectorModal';
import { DemoScenario } from './services/demoScenarios';
import { getSavedReports, saveFarmerReport, deleteFarmerReport } from './services/storageService';
import { requestCropDiagnosis } from './services/aiDiagnosisService';
import { weatherService } from './services/weather/weatherService';
import { calculateAgriculturalRisk } from './services/risk/riskEngine';
import { getSavedFarmLocation, saveFarmLocation } from './services/weather/locationService';
import { getCaseById } from './services/expert/caseService';
import { Field } from './types/field';
import { OfflineBanner } from './offline/components/OfflineBanner';
import { OfflineSyncDashboard } from './offline/components/OfflineSyncDashboard';
import { OfflineDraft } from './offline/types';

type FlowStep =
  | 'home'
  | 'farm'
  | 'select-crop'
  | 'upload-photo'
  | 'diagnosis-result'
  | 'reports'
  | 'weather'
  | 'risk'
  | 'cases';

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('krishi_mentor_lang');
    return (saved as Language) || 'en';
  });

  // User Role: 'FARMER' (default mobile view) or 'EXPERT' (Agronomist dashboard)
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('krishi_mentor_role');
    return (saved as UserRole) || 'FARMER';
  });

  const [activeTab, setActiveTab] = useState<'home' | 'farm' | 'reports' | 'weather' | 'risk' | 'tips' | 'cases'>('home');
  const [currentStep, setCurrentStep] = useState<FlowStep>('home');
  const [selectedCrop, setSelectedCrop] = useState<CropInfo>(INITIAL_CROPS[3]); // Default Tomato
  const [currentDiagnosis, setCurrentDiagnosis] = useState<DiagnosisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [savedReports, setSavedReports] = useState<FarmerReport[]>([]);
  const [isCurrentSaved, setIsCurrentSaved] = useState(false);

  // Expert Module State (Part 5)
  const [selectedExpertCase, setSelectedExpertCase] = useState<AgriculturalCase | null>(null);
  const [selectedFarmerCaseId, setSelectedFarmerCaseId] = useState<string | undefined>(undefined);
  const [isExpertProfileOpen, setIsExpertProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Weather & Risk State (Part 3)
  const [locationContext, setLocationContext] = useState<LocationContext>(() => getSavedFarmLocation());
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherSignals, setWeatherSignals] = useState<AgriculturalWeatherSignal[]>([]);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('online');
  const [freshnessLabel, setFreshnessLabel] = useState<string>('Live Data');
  const [activeDemoWeatherId, setActiveDemoWeatherId] = useState<string | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);

  // Auxiliary Modals
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [isExpertOpen, setIsExpertOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isSyncDashboardOpen, setIsSyncDashboardOpen] = useState(false);

  // Load saved reports on mount
  useEffect(() => {
    const loaded = getSavedReports();
    setSavedReports(loaded);
  }, []);

  // Fetch Weather & Recalculate Risk
  const refreshWeatherAndRisk = useCallback(
    async (loc?: LocationContext, diagnosis?: DiagnosisResult | null) => {
      const activeLoc = loc || locationContext;
      const activeDiag = diagnosis !== undefined ? diagnosis : currentDiagnosis;

      try {
        const weather = await weatherService.getWeather(activeLoc);
        setWeatherData(weather);

        const signals = weatherService.extractAgriculturalSignals(weather);
        setWeatherSignals(signals);

        const net = weatherService.getNetworkStatus();
        setNetworkStatus(net);

        const freshness = weatherService.getDataFreshnessLabel(weather, language);
        setFreshnessLabel(freshness);

        // Calculate agricultural risk combining crop + diagnosis + weather + location
        const risk = calculateAgriculturalRisk({
          crop: selectedCrop.name,
          cropHindi: selectedCrop.hindiName,
          weather,
          location: activeLoc,
          diagnosis: activeDiag,
          language,
        });

        setRiskAssessment(risk);

        // Connect back to diagnosis result if available
        if (activeDiag) {
          activeDiag.riskOutlookSummary = {
            overallRisk: risk.riskLevel,
            primaryDriver: risk.whatToDoNow,
            primaryDriverHi: risk.whatToDoNowHi,
            confidence: risk.confidence,
          };
        }
      } catch (err) {
        console.error('Failed to update weather/risk:', err);
      }
    },
    [locationContext, selectedCrop, currentDiagnosis, language]
  );

  // Initial weather load
  useEffect(() => {
    refreshWeatherAndRisk(locationContext, currentDiagnosis);
  }, [locationContext, selectedCrop.name, refreshWeatherAndRisk]);

  // Save language preference
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('krishi_mentor_lang', lang);
    if (weatherData) {
      setFreshnessLabel(weatherService.getDataFreshnessLabel(weatherData, lang));
    }
  };

  // Location update
  const handleLocationSelected = (newLoc: LocationContext) => {
    saveFarmLocation(newLoc);
    setLocationContext(newLoc);
    refreshWeatherAndRisk(newLoc, currentDiagnosis);
  };

  // Switch demo weather scenarios
  const handleSelectDemoWeather = (scenarioId: string | null) => {
    setActiveDemoWeatherId(scenarioId);
    weatherService.setDemoScenario(scenarioId);
    refreshWeatherAndRisk(locationContext, currentDiagnosis);
  };

  // Switch top-level navigation tabs
  const handleSelectTab = (tab: 'home' | 'farm' | 'reports' | 'weather' | 'risk' | 'tips' | 'cases') => {
    setActiveTab(tab);
    if (tab === 'home') {
      setCurrentStep('home');
    } else if (tab === 'farm') {
      setCurrentStep('farm');
    } else if (tab === 'reports') {
      setCurrentStep('reports');
    } else if (tab === 'weather') {
      setCurrentStep('weather');
    } else if (tab === 'risk') {
      setCurrentStep('risk');
    } else if (tab === 'cases') {
      setCurrentStep('cases');
    } else if (tab === 'tips') {
      setIsTipsOpen(true);
    }
  };

  // Switch between Farmer & Expert role
  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    localStorage.setItem('krishi_mentor_role', role);
    if (role === 'EXPERT') {
      setSelectedExpertCase(null);
    }
  };

  // Open a specific case from notification
  const handleSelectCaseFromNotification = (caseId: string) => {
    const c = getCaseById(caseId);
    if (c) {
      if (userRole === 'EXPERT') {
        setSelectedExpertCase(c);
      } else {
        setSelectedFarmerCaseId(caseId);
        handleSelectTab('cases');
      }
    }
  };

  // Start Crop Check flow from Home
  const handleStartCropCheck = () => {
    setCurrentStep('select-crop');
    setActiveTab('home');
  };

  // Select crop and proceed to upload
  const handleSelectCrop = (crop: CropInfo) => {
    setSelectedCrop(crop);
    setCurrentStep('upload-photo');
  };

  // Request AI Diagnosis with Part 2 & Part 3 intelligence
  const handleStartAnalysis = async (
    imageBase64: string,
    farmerNotes?: string,
    location?: string,
    previousDiagnosis?: string
  ) => {
    setIsAnalyzing(true);
    try {
      const locString = location || locationContext.displayName;
      const result = await requestCropDiagnosis({
        imageBase64,
        cropName: selectedCrop.name,
        language,
        farmerNotes,
        location: locString,
        previousDiagnosis,
      });

      // Augment result with immediate Weather + Risk Outlook
      if (weatherData) {
        const risk = calculateAgriculturalRisk({
          crop: selectedCrop.name,
          cropHindi: selectedCrop.hindiName,
          weather: weatherData,
          location: locationContext,
          diagnosis: result,
          language,
        });
        setRiskAssessment(risk);
        result.riskOutlookSummary = {
          overallRisk: risk.riskLevel,
          primaryDriver: risk.whatToDoNow,
          primaryDriverHi: risk.whatToDoNowHi,
          confidence: risk.confidence,
        };
      }

      setCurrentDiagnosis(result);
      setIsCurrentSaved(false);
      setCurrentStep('diagnosis-result');
    } catch (err) {
      console.error('Failed to complete diagnosis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load scenario directly from Demo Mode
  const handleSelectDemoScenario = (scenario: DemoScenario, diagnosis: DiagnosisResult) => {
    const matchedCrop = INITIAL_CROPS.find(
      (c) => c.name.toLowerCase() === scenario.cropName.toLowerCase()
    );
    if (matchedCrop) {
      setSelectedCrop(matchedCrop);
    }

    if (weatherData) {
      const risk = calculateAgriculturalRisk({
        crop: matchedCrop ? matchedCrop.name : scenario.cropName,
        cropHindi: matchedCrop ? matchedCrop.hindiName : undefined,
        weather: weatherData,
        location: locationContext,
        diagnosis,
        language,
      });
      setRiskAssessment(risk);
      diagnosis.riskOutlookSummary = {
        overallRisk: risk.riskLevel,
        primaryDriver: risk.whatToDoNow,
        primaryDriverHi: risk.whatToDoNowHi,
        confidence: risk.confidence,
      };
    }

    setCurrentDiagnosis(diagnosis);
    setIsCurrentSaved(false);
    setCurrentStep('diagnosis-result');
  };

  // Save report to browser/localStorage
  const handleSaveReport = (report: DiagnosisResult) => {
    const farmerReport: FarmerReport = {
      ...report,
    };
    const success = saveFarmerReport(farmerReport);
    if (success) {
      setIsCurrentSaved(true);
      setSavedReports(getSavedReports());
    }
  };

  // Delete report
  const handleDeleteReport = (id: string) => {
    deleteFarmerReport(id);
    setSavedReports(getSavedReports());
  };

  // Open saved report from reports screen
  const handleOpenSavedReport = (report: FarmerReport) => {
    const matchedCrop = INITIAL_CROPS.find(
      (c) => c.name.toLowerCase() === report.crop.toLowerCase()
    );
    if (matchedCrop) {
      setSelectedCrop(matchedCrop);
    }
    setCurrentDiagnosis(report);
    setIsCurrentSaved(true);
    setCurrentStep('diagnosis-result');
  };

  const handleSelectDraft = (draft: OfflineDraft) => {
    setIsSyncDashboardOpen(false);
    if (draft.cropName) {
      const matched = INITIAL_CROPS.find(
        (c) => c.name.toLowerCase() === draft.cropName?.toLowerCase()
      );
      if (matched) {
        setSelectedCrop(matched);
      }
    }
    setCurrentStep('upload-photo');
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans text-stone-900 selection:bg-emerald-200">
      {/* Navbar with brand, language switcher, role switcher, sync status, and tab links */}
      <Navbar
        language={language}
        onLanguageChange={handleLanguageChange}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        savedReportsCount={savedReports.length}
        onOpenExpertModal={() => setIsExpertOpen(true)}
        currentRole={userRole}
        onRoleChange={handleRoleChange}
        onOpenExpertProfile={() => setIsExpertProfileOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSyncDashboard={() => setIsSyncDashboardOpen(true)}
      />

      {/* Persistent Offline / Degraded Network Alert Banner */}
      <OfflineBanner
        language={language}
        onOpenSyncDashboard={() => setIsSyncDashboardOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {/* GOVERNMENT / EXTENSION ROLE VIEW */}
        {userRole === 'GOVERNMENT' ? (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <GovernmentDashboard language={language} />
          </div>
        ) : userRole === 'EXPERT' ? (
          /* EXPERT ROLE VIEW */
          selectedExpertCase ? (
            <div className="max-w-7xl mx-auto px-4 py-6">
              <ExpertCaseDetail
                caseItem={selectedExpertCase}
                onBack={() => setSelectedExpertCase(null)}
                onCaseUpdated={(upd) => setSelectedExpertCase(upd)}
                language={language}
              />
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-4 py-6">
              <ExpertDashboard
                onSelectCase={(c) => setSelectedExpertCase(c)}
                onOpenProfile={() => setIsExpertProfileOpen(true)}
                language={language}
              />
            </div>
          )
        ) : (
          /* FARMER ROLE VIEWS */
          <>
            {currentStep === 'home' && (
              <HomeScreen
                language={language}
                onStartCropCheck={handleStartCropCheck}
                onOpenReports={() => {
                  setActiveTab('reports');
                  setCurrentStep('reports');
                }}
                onOpenWeather={() => {
                  setActiveTab('weather');
                  setCurrentStep('weather');
                }}
                onOpenRiskForecast={() => {
                  setActiveTab('risk');
                  setCurrentStep('risk');
                }}
                onOpenFarmMap={() => {
                  setActiveTab('farm');
                  setCurrentStep('farm');
                }}
                onOpenTips={() => setIsTipsOpen(true)}
                onOpenExpertModal={() => setIsExpertOpen(true)}
                onOpenDemoScenarios={() => setIsDemoModalOpen(true)}
                reportsCount={savedReports.length}
                selectedCrop={selectedCrop}
                currentLocation={locationContext}
                onChangeCrop={() => setCurrentStep('select-crop')}
                onChangeLocation={() => setIsLocationModalOpen(true)}
                weather={weatherData}
                riskAssessment={riskAssessment}
              />
            )}

            {currentStep === 'farm' && (
              <FarmScreen
                language={language}
                onNavigateToCheckCrop={(field?: Field) => {
                  if (field) {
                    const matched = INITIAL_CROPS.find(
                      (c) => c.name.toLowerCase() === field.crop.toLowerCase()
                    );
                    if (matched) setSelectedCrop(matched);
                  }
                  setCurrentStep('upload-photo');
                  setActiveTab('home');
                }}
                onOpenWeather={() => {
                  setActiveTab('weather');
                  setCurrentStep('weather');
                }}
                onOpenRiskForecast={() => {
                  setActiveTab('risk');
                  setCurrentStep('risk');
                }}
                onOpenExpertModal={() => setIsExpertOpen(true)}
                weather={weatherData}
                riskAssessment={riskAssessment}
              />
            )}

            {currentStep === 'cases' && (
              <div className="max-w-4xl mx-auto px-4 py-6">
                <FarmerCasesScreen
                  language={language}
                  onNavigateHome={() => handleSelectTab('home')}
                  onOpenCheckCrop={handleStartCropCheck}
                  selectedCaseId={selectedFarmerCaseId}
                />
              </div>
            )}

            {currentStep === 'select-crop' && (
              <CropSelectionScreen
                language={language}
                selectedCropId={selectedCrop.id}
                onSelectCrop={handleSelectCrop}
                onBack={() => setCurrentStep('home')}
              />
            )}

            {currentStep === 'upload-photo' && (
              <ImageUploadScreen
                crop={selectedCrop}
                language={language}
                onBack={() => setCurrentStep('select-crop')}
                onChangeCrop={() => setCurrentStep('select-crop')}
                onStartAnalysis={handleStartAnalysis}
                isAnalyzing={isAnalyzing}
                onOpenDemoScenarios={() => setIsDemoModalOpen(true)}
                onOpenSyncDashboard={() => setIsSyncDashboardOpen(true)}
              />
            )}

            {currentStep === 'diagnosis-result' && currentDiagnosis && (
              <DiagnosisResultScreen
                diagnosis={currentDiagnosis}
                language={language}
                onAnalyzeAnother={() => setCurrentStep('upload-photo')}
                onChangeCrop={() => setCurrentStep('select-crop')}
                onSaveReport={handleSaveReport}
                isSaved={isCurrentSaved}
                onOpenExpertModal={() => setIsExpertOpen(true)}
                onViewRiskOutlook={() => {
                  setActiveTab('risk');
                  setCurrentStep('risk');
                }}
              />
            )}

            {currentStep === 'reports' && (
              <MyReportsScreen
                reports={savedReports}
                language={language}
                onSelectReport={handleOpenSavedReport}
                onDeleteReport={handleDeleteReport}
                onBackToHome={() => {
                  setActiveTab('home');
                  setCurrentStep('home');
                }}
                onStartNewDiagnosis={handleStartCropCheck}
              />
            )}

            {currentStep === 'weather' && (
              <WeatherScreen
                weather={weatherData}
                signals={weatherSignals}
                networkStatus={networkStatus}
                freshnessLabel={freshnessLabel}
                onRefresh={() => refreshWeatherAndRisk(locationContext, currentDiagnosis)}
                onChangeLocation={() => setIsLocationModalOpen(true)}
                onSelectDemoScenario={handleSelectDemoWeather}
                activeDemoScenarioId={activeDemoWeatherId}
                onBack={() => {
                  setActiveTab('home');
                  setCurrentStep('home');
                }}
                language={language}
              />
            )}

            {currentStep === 'risk' && (
              <RiskForecastScreen
                assessment={riskAssessment}
                onBack={() => {
                  setActiveTab('home');
                  setCurrentStep('home');
                }}
                onNavigateToCheckCrop={handleStartCropCheck}
                onChangeLocation={() => setIsLocationModalOpen(true)}
                language={language}
              />
            )}
          </>
        )}
      </main>

      {/* Auxiliary Modals */}
      <WeatherModal
        isOpen={isWeatherModalOpen}
        onClose={() => setIsWeatherModalOpen(false)}
        language={language}
        currentLocation={locationContext}
        onOpenFullWeather={() => {
          setActiveTab('weather');
          setCurrentStep('weather');
        }}
      />

      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={locationContext}
        onLocationSelected={handleLocationSelected}
        language={language}
      />

      <FarmingTipsModal
        isOpen={isTipsOpen}
        onClose={() => setIsTipsOpen(false)}
        language={language}
      />

      {/* Part 5 Upgraded Ask Expert Consultation Modal */}
      <AskExpertModal
        isOpen={isExpertOpen}
        onClose={() => setIsExpertOpen(false)}
        language={language}
        currentDiagnosis={currentDiagnosis}
        onCaseCreated={(newCase) => {
          setSelectedFarmerCaseId(newCase.id);
          handleSelectTab('cases');
        }}
        farmName={locationContext.displayName}
        weatherSummary={{
          temperature: weatherData?.current.temperature,
          humidity: weatherData?.current.humidity,
          condition: weatherData?.current.condition,
          rainfall: weatherData?.current.precipitation,
          riskSummary: riskAssessment?.whatToDoNow,
        }}
        fieldRisk={{
          diseaseRisk: riskAssessment?.diseaseRisk,
          pestRisk: riskAssessment?.pestRisk,
          weatherStress: riskAssessment?.weatherStress,
        }}
      />

      {/* AI Scenario Test Center Modal */}
      <DemoScenarioModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        language={language}
        onSelectScenario={handleSelectDemoScenario}
      />

      {/* Expert Profile & Credentials Modal */}
      <ExpertProfileModal
        isOpen={isExpertProfileOpen}
        onClose={() => setIsExpertProfileOpen(false)}
        language={language}
      />

      {/* Notifications Drawer/Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        currentRole={userRole}
        language={language}
        onSelectCase={handleSelectCaseFromNotification}
      />

      {/* Offline Synchronization & Network Resilience Dashboard */}
      <OfflineSyncDashboard
        isOpen={isSyncDashboardOpen}
        onClose={() => setIsSyncDashboardOpen(false)}
        language={language}
        onSelectDraft={handleSelectDraft}
      />

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-6 border-t border-stone-800 text-center text-xs">
        <div className="max-w-2xl mx-auto px-4 space-y-2">
          <p className="text-stone-300 font-semibold">
            Krishi Mentor — {language === 'hi' ? 'भारतीय किसानों के लिए समर्पित AI कृषि सहायक' : 'AI Crop Health Companion for Indian Agriculture'}
          </p>
          <p className="text-stone-500">
            {language === 'hi'
              ? 'यह प्रणाली केवल प्राथमिक सहायता व मार्गदर्शन के लिए है। रासायनिक छिड़काव से पूर्व स्थानीय कृषि विज्ञान केंद्र (KVK) से अवश्य पुष्टि करें।'
              : 'Field-level confirmation recommended before applying synthetic agricultural chemicals. Aligned with Integrated Pest Management (IPM) protocols.'}
          </p>
        </div>
      </footer>
    </div>
  );
}
