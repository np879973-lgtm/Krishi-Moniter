// Upgraded Farmer Dashboard for Krishi Mentor (Part 3)
// Visual, mobile-first, and combines: Greeting, Farm context, Weather today, Crop Risk Outlook, and Quick actions

import React from 'react';
import {
  Camera,
  Sprout,
  CheckCircle2,
  CloudSun,
  FileText,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  MapPin,
  Droplets,
  CloudRain,
  Activity,
  ShieldAlert,
  ChevronRight,
  Map,
} from 'lucide-react';
import { Language, CropInfo } from '../types';
import { LocationContext, WeatherData } from '../types/weather';
import { RiskAssessment } from '../types/risk';
import { CropRiskCard } from './CropRiskCard';
import { translations } from '../i18n/translations';
import { getActiveFarm } from '../services/farm/farmService';

interface HomeScreenProps {
  language: Language;
  onStartCropCheck: () => void;
  onOpenReports: () => void;
  onOpenWeather: () => void;
  onOpenRiskForecast: () => void;
  onOpenFarmMap: () => void;
  onOpenTips: () => void;
  onOpenExpertModal: () => void;
  onOpenDemoScenarios?: () => void;
  reportsCount: number;
  selectedCrop: CropInfo | null;
  currentLocation: LocationContext;
  onChangeCrop: () => void;
  onChangeLocation: () => void;
  weather: WeatherData | null;
  riskAssessment: RiskAssessment | null;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  language,
  onStartCropCheck,
  onOpenReports,
  onOpenWeather,
  onOpenRiskForecast,
  onOpenFarmMap,
  onOpenTips,
  onOpenExpertModal,
  onOpenDemoScenarios,
  reportsCount,
  selectedCrop,
  currentLocation,
  onChangeCrop,
  onChangeLocation,
  weather,
  riskAssessment,
}) => {
  const t = translations[language];
  const isHi = language === 'hi';
  const activeFarm = getActiveFarm();

  // Compute time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (isHi) {
      if (hour < 12) return 'शुभ प्रभात, किसान भाई';
      if (hour < 17) return 'नमस्कार, किसान भाई';
      return 'शुभ संध्या, किसान भाई';
    }
    if (hour < 12) return 'Good Morning, Farmer';
    if (hour < 17) return 'Good Afternoon, Farmer';
    return 'Good Evening, Farmer';
  };

  const cropName = selectedCrop
    ? isHi ? selectedCrop.hindiName || selectedCrop.name : selectedCrop.name
    : isHi ? 'टमाटर' : 'Tomato';

  const locationName = currentLocation.displayName || `${currentLocation.district}, ${currentLocation.state}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-5">
      {/* Top Personalized Greeting & Farm Context */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 text-white rounded-3xl p-6 sm:p-7 shadow-md relative overflow-hidden">
        {/* Subtle decorative curves */}
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-36 h-36 rounded-full bg-emerald-700/40 pointer-events-none blur-xl" />
        <div className="absolute bottom-0 right-8 w-24 h-24 text-emerald-700/20 pointer-events-none">
          <Sprout className="w-full h-full" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-700/60 px-3 py-1 rounded-full text-xs font-semibold text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.tagline}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {getGreeting()}
          </h2>

          {/* Your Farm Strip */}
          <div className="p-3 bg-black/20 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs backdrop-blur-xs">
            <div className="flex items-center space-x-2 text-emerald-100">
              <Sprout className="w-4 h-4 text-amber-300 shrink-0" />
              <span>
                {isHi ? 'आपकी फसल:' : 'Your Farm:'} <strong className="text-white">{cropName}</strong>
              </span>
              <button
                onClick={onChangeCrop}
                className="text-[11px] text-amber-300 underline hover:text-amber-200 ml-1 cursor-pointer"
              >
                ({isHi ? 'बदलें' : 'Change'})
              </button>
            </div>

            <div className="flex items-center space-x-1.5 text-emerald-100">
              <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span className="truncate max-w-[150px]">{locationName}</span>
              <button
                onClick={onChangeLocation}
                className="text-[11px] text-amber-300 underline hover:text-amber-200 ml-1 cursor-pointer"
              >
                ({isHi ? 'बदलें' : 'Change'})
              </button>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              id="home-check-crop-main-cta"
              onClick={onStartCropCheck}
              className="flex-1 px-6 py-3.5 bg-amber-400 hover:bg-amber-300 active:scale-98 text-stone-950 font-black text-base rounded-2xl shadow-lg shadow-amber-950/20 transition flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Camera className="w-5 h-5 text-stone-950 stroke-[2.5]" />
              <span>{t.checkMyCrop}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>

            {onOpenDemoScenarios && (
              <button
                id="home-open-demo-scenarios-btn"
                onClick={onOpenDemoScenarios}
                className="px-4 py-3 bg-emerald-700/80 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl border border-emerald-500/80 transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isHi ? 'AI जांच परिदृश्य (डेमो)' : 'AI Test Scenarios'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* WEATHER TODAY Snippet Card */}
      {weather && (
        <div
          onClick={onOpenWeather}
          className="bg-sky-50/80 hover:bg-sky-100/70 border border-sky-200 rounded-3xl p-4 sm:p-5 transition cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <CloudSun className="w-5 h-5 text-sky-700" />
              <span className="text-xs font-bold uppercase tracking-wider text-sky-900">
                {isHi ? 'आज का कृषि मौसम (WEATHER TODAY)' : 'Weather Today'}
              </span>
            </div>

            <div className="flex items-center space-x-1 text-xs font-semibold text-sky-800 group-hover:text-sky-950">
              <span>{isHi ? 'विस्तार देखें' : 'View Details'}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-black text-stone-900">{weather.current.temperature}°C</span>
              <div className="flex items-center space-x-2 text-xs text-stone-600">
                <span className="flex items-center space-x-0.5">
                  <Droplets className="w-3.5 h-3.5 text-sky-600" />
                  <span>{weather.current.humidity}% {isHi ? 'नमी' : 'humidity'}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-0.5">
                  <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                  <span>{weather.forecast[0]?.rainfallProbability ?? 0}% {isHi ? 'बारिश' : 'rain'}</span>
                </span>
              </div>
            </div>

            <span className="text-xs font-bold text-sky-900 bg-sky-100 px-2.5 py-1 rounded-xl">
              {isHi ? weather.current.conditionTextHi : weather.current.conditionText}
            </span>
          </div>

          <p className="text-xs text-stone-700 mt-2 font-medium">
            "{isHi ? weather.summaryFarmerHi : weather.summaryFarmer}"
          </p>
        </div>
      )}

      {/* Prominent CROP RISK OUTLOOK Card (Part 3 Core Requirement) */}
      <CropRiskCard
        assessment={riskAssessment}
        onViewDetails={onOpenRiskForecast}
        language={language}
      />

      {/* MY FARM & GEOSPATIAL MAP CARD (Part 4) */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-200">
              <Map className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-stone-500 block">
                {isHi ? 'मेरा खेत व डिजिटल नक्शा' : 'Farm & Crop Intelligence'}
              </span>
              <h4 className="font-extrabold text-stone-900 text-sm sm:text-base">
                {activeFarm.name}
              </h4>
            </div>
          </div>

          <button
            id="home-open-farm-map-btn"
            onClick={onOpenFarmMap}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
          >
            <span>{isHi ? 'फार्म मैप' : 'Farm Map'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-stone-700">
            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate max-w-[200px] sm:max-w-xs">
              {activeFarm.location.displayName || `${activeFarm.district}, ${activeFarm.state}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-lg text-[11px] border border-emerald-200">
              {activeFarm.fields.length} {isHi ? 'खेत सीमाएं' : 'Fields'}
            </span>
            <span className="text-stone-600 font-medium">
              {activeFarm.primaryCrop}
            </span>
          </div>
        </div>
      </div>

      {/* 4-Step Process Guide */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
          {isHi ? 'जांच की 4 आसान प्रक्रिया' : 'How Krishi Mentor Works'}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200/80">
            <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center mx-auto mb-1">
              1
            </span>
            <p className="font-bold text-xs text-stone-800">{isHi ? 'फसल चुनें' : 'Select Crop'}</p>
          </div>

          <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200/80">
            <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center mx-auto mb-1">
              2
            </span>
            <p className="font-bold text-xs text-stone-800">{isHi ? 'फोटो अपलोड' : 'Photo Scan'}</p>
          </div>

          <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200/80">
            <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center mx-auto mb-1">
              3
            </span>
            <p className="font-bold text-xs text-stone-800">{isHi ? 'AI विश्लेषण' : 'AI Analysis'}</p>
          </div>

          <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200/80">
            <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center mx-auto mb-1">
              4
            </span>
            <p className="font-bold text-xs text-stone-800">{isHi ? 'जोखिम व सलाह' : 'Risk & IPM'}</p>
          </div>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div>
        <h3 className="text-sm font-bold text-stone-900 mb-3">
          {isHi ? 'त्वरित कृषि सेवाएं' : 'Farm Services'}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Check Crop */}
          <button
            id="quick-tile-check-crop"
            onClick={onStartCropCheck}
            className="flex flex-col items-start p-4 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-2xl text-left transition active:scale-98 shadow-2xs cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-amber-300 flex items-center justify-center mb-2">
              <Camera className="w-5 h-5" />
            </div>
            <span className="font-bold text-stone-900 text-sm">{t.checkMyCrop}</span>
            <span className="text-[11px] text-emerald-800 mt-0.5">{isHi ? 'फोटो जांचें' : 'AI scan'}</span>
          </button>

          {/* Weather */}
          <button
            id="quick-tile-weather"
            onClick={onOpenWeather}
            className="flex flex-col items-start p-4 bg-sky-50 hover:bg-sky-100/80 border border-sky-200 rounded-2xl text-left transition active:scale-98 shadow-2xs cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-2">
              <CloudSun className="w-5 h-5" />
            </div>
            <span className="font-bold text-stone-900 text-sm">{t.weather}</span>
            <span className="text-[11px] text-sky-800 mt-0.5">{isHi ? 'छिड़काव स्थिति' : 'Spray guide'}</span>
          </button>

          {/* Risk Forecast */}
          <button
            id="quick-tile-risk-forecast"
            onClick={onOpenRiskForecast}
            className="flex flex-col items-start p-4 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-2xl text-left transition active:scale-98 shadow-2xs cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-2">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-bold text-stone-900 text-sm">{isHi ? 'जोखिम दृष्टिकोण' : 'Risk Outlook'}</span>
            <span className="text-[11px] text-amber-800 mt-0.5">{isHi ? 'रोग व कीट' : 'Disease & pest'}</span>
          </button>

          {/* My Reports */}
          <button
            id="quick-tile-reports"
            onClick={onOpenReports}
            className="flex flex-col items-start p-4 bg-stone-100 hover:bg-stone-200/80 border border-stone-300 rounded-2xl text-left transition active:scale-98 shadow-2xs cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-stone-800 text-amber-300 flex items-center justify-center mb-2 relative">
              <FileText className="w-5 h-5" />
              {reportsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-stone-950 text-[9px] font-bold rounded-full flex items-center justify-center">
                  {reportsCount}
                </span>
              )}
            </div>
            <span className="font-bold text-stone-900 text-sm">{t.myReports}</span>
            <span className="text-[11px] text-stone-600 mt-0.5">{reportsCount} {isHi ? 'सहेजी गई' : 'saved'}</span>
          </button>
        </div>
      </div>

      {/* Kisan Call Center Helpline Strip */}
      <div className="bg-stone-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0">
            <PhoneCall className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              {isHi ? 'किसान कॉल सेंटर (निःशुल्क)' : 'Kisan Call Center (Toll-Free)'}
            </h4>
            <p className="text-xs text-amber-300 font-mono font-semibold">
              1800-180-1551 (6 AM - 10 PM)
            </p>
          </div>
        </div>

        <button
          id="home-call-expert-btn"
          onClick={onOpenExpertModal}
          className="text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-white px-3 py-1.5 rounded-xl border border-stone-700 transition cursor-pointer"
        >
          {isHi ? 'जानकारी' : 'Details'}
        </button>
      </div>
    </div>
  );
};
