// Weather for Your Farm - Dedicated Weather Dashboard Screen
// Farmer-friendly, visual, and grounded in agrometeorological insights

import React, { useState } from 'react';
import {
  CloudSun,
  MapPin,
  Droplets,
  Wind,
  Thermometer,
  CloudRain,
  RefreshCw,
  Sun,
  Compass,
  Cloud,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Layers,
  ArrowLeft,
  Calendar,
  Sparkles,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { WeatherData, LocationContext, AgriculturalWeatherSignal, NetworkStatus } from '../types/weather';
import { Language } from '../types';
import { WEATHER_DEMO_SCENARIOS } from '../services/weather/demoWeatherProvider';

interface WeatherScreenProps {
  weather: WeatherData | null;
  signals: AgriculturalWeatherSignal[];
  networkStatus: NetworkStatus;
  freshnessLabel: string;
  onRefresh: () => void;
  onChangeLocation: () => void;
  onSelectDemoScenario: (scenarioId: string | null) => void;
  activeDemoScenarioId: string | null;
  onBack: () => void;
  language: Language;
}

export const WeatherScreen: React.FC<WeatherScreenProps> = ({
  weather,
  signals,
  networkStatus,
  freshnessLabel,
  onRefresh,
  onChangeLocation,
  onSelectDemoScenario,
  activeDemoScenarioId,
  onBack,
  language,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const isHi = language === 'hi';

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  if (!weather) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 text-center py-20">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center animate-spin mb-4">
          <RefreshCw className="w-8 h-8 text-emerald-700" />
        </div>
        <h2 className="text-xl font-bold text-stone-800">
          {isHi ? 'मौसम की जानकारी प्राप्त की जा रही है...' : 'Fetching farm weather data...'}
        </h2>
      </div>
    );
  }

  const current = weather.current;
  const forecast = weather.forecast || [];

  // Determine spray suitability
  const getSprayAdvisory = () => {
    const rainTomorrow = forecast[1]?.rainfallAmount ?? 0;
    const rainProbTomorrow = forecast[1]?.rainfallProbability ?? 0;

    if (current.windSpeed > 18) {
      return {
        status: 'danger',
        label: isHi ? 'छिड़काव न करें (तेज हवा)' : 'Do Not Spray (High Wind)',
        bg: 'bg-rose-50 border-rose-200 text-rose-900',
        icon: AlertTriangle,
        desc: isHi
          ? `हवा की गति (${current.windSpeed} किमी/घंटा) 15 किमी/घंटा से अधिक है। कीटनाशक उड़कर नष्ट हो जाएगा।`
          : `Wind speed (${current.windSpeed} km/h) exceeds safe threshold (15 km/h). Severe risk of chemical drift.`,
      };
    }

    if (current.rainfall > 5 || rainTomorrow > 10 || rainProbTomorrow > 70) {
      return {
        status: 'danger',
        label: isHi ? 'छिड़काव स्थगित रखें (बारिश की संभावना)' : 'Postpone Spray (Rain Expected)',
        bg: 'bg-rose-50 border-rose-200 text-rose-900',
        icon: CloudRain,
        desc: isHi
          ? 'आसन्न बारिश से पत्तियों पर छिड़की गई दवा बह जाएगी। वर्षा थमने तक प्रतीक्षा करें।'
          : 'Rain will wash away foliar applications before absorption. Wait until dry weather returns.',
      };
    }

    if (current.humidity > 85) {
      return {
        status: 'caution',
        label: isHi ? 'सावधानीपूर्वक छिड़काव (अधिक नमी)' : 'Caution During Spray (High Humidity)',
        bg: 'bg-amber-50 border-amber-200 text-amber-900',
        icon: Droplets,
        desc: isHi
          ? 'उच्च आर्द्रता में पत्तियों पर दवा सूखने में समय लेती है। स्टिकर/स्प्रेडर का प्रयोग करें।'
          : 'Slow evaporation rate. Use a recommended agricultural spreader and inspect foliage.',
      };
    }

    return {
      status: 'good',
      label: isHi ? 'छिड़काव के लिए अनुकूल समय' : 'Good Window for Spraying',
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: CheckCircle2,
      desc: isHi
        ? 'हवा धीमी है और बारिश की संभावना कम है। आवश्यक छिड़काव व निराई-गुड़ाई के लिए उपयुक्त।'
        : 'Calm winds and clear forecast. Optimal conditions for targeted agrochemical or bio-spray applications.',
    };
  };

  const sprayAdvisory = getSprayAdvisory();
  const SprayIcon = sprayAdvisory.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Top Bar with Back and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          id="weather-back-to-dashboard-btn"
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-stone-600 hover:text-stone-900 px-3 py-2 rounded-xl hover:bg-stone-100 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isHi ? 'डैशबोर्ड पर वापस' : 'Back to Dashboard'}</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Demo Scenario Dropdown Trigger */}
          <button
            id="weather-demo-scenarios-btn"
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            className={`text-xs font-bold px-3 py-2 rounded-xl border flex items-center space-x-1.5 transition cursor-pointer ${
              activeDemoScenarioId
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {activeDemoScenarioId
                ? isHi ? 'डेमो परिदृश्य सक्रिय' : 'Demo Mode Active'
                : isHi ? 'मौसम परिदृश्य परीक्षण' : 'Test Scenarios'}
            </span>
          </button>

          {/* Refresh Button */}
          <button
            id="weather-manual-refresh-btn"
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 transition cursor-pointer"
            title={isHi ? 'मौसम रीफ्रेश करें' : 'Refresh Weather'}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-700' : ''}`} />
          </button>
        </div>
      </div>

      {/* Demo Scenarios Menu Drawer */}
      {showDemoMenu && (
        <div className="p-4 bg-amber-50/90 rounded-3xl border border-amber-200 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{isHi ? 'कृषि मौसम परिदृश्य चुनें (परीक्षण मोड):' : 'Select Agricultural Weather Scenario (Testing Mode):'}</span>
            </p>
            {activeDemoScenarioId && (
              <button
                onClick={() => {
                  onSelectDemoScenario(null);
                  setShowDemoMenu(false);
                }}
                className="text-xs text-amber-900 underline font-semibold hover:text-amber-950"
              >
                {isHi ? 'लाइव मौसम पर लौटें' : 'Return to Live Weather'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {WEATHER_DEMO_SCENARIOS.map((sc) => {
              const isSelected = activeDemoScenarioId === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => {
                    onSelectDemoScenario(sc.id);
                    setShowDemoMenu(false);
                  }}
                  className={`p-3 rounded-2xl text-left border transition text-xs cursor-pointer ${
                    isSelected
                      ? 'bg-amber-200/70 border-amber-400 font-bold text-amber-950 shadow-2xs'
                      : 'bg-white hover:bg-amber-100/50 border-amber-200 text-stone-800'
                  }`}
                >
                  <p className="font-bold">{isHi ? sc.nameHi : sc.name}</p>
                  <p className="text-[11px] opacity-80 mt-0.5 line-clamp-2">{isHi ? sc.descriptionHi : sc.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Farm Weather Hero Header */}
      <div className="bg-gradient-to-br from-sky-800 via-sky-700 to-emerald-800 rounded-3xl text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
        {/* Subtle decorative background curves */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none"></div>

        {/* Location & Freshness header */}
        <div className="flex flex-wrap items-center justify-between gap-3 relative z-10 mb-6 pb-4 border-b border-white/15">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-amber-300 shrink-0" />
            <div>
              <span className="text-xs uppercase tracking-wider text-sky-200 font-semibold">
                {isHi ? 'आपके खेत का मौसम' : 'Weather for Your Farm'}
              </span>
              <h2 className="text-xl font-bold leading-tight flex items-center space-x-2">
                <span>{weather.location.displayName}</span>
              </h2>
            </div>
          </div>

          <button
            id="change-location-btn"
            onClick={onChangeLocation}
            className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-semibold text-white transition cursor-pointer backdrop-blur-xs"
          >
            {isHi ? 'स्थान बदलें' : 'Change Location'}
          </button>
        </div>

        {/* Current Big Metrics Hero */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center relative z-10">
          {/* Temperature & Condition */}
          <div>
            <div className="flex items-baseline space-x-3">
              <span className="text-5xl sm:text-6xl font-black tracking-tight">{current.temperature}°</span>
              <span className="text-xl text-sky-200 font-medium">C</span>
              <span className="text-xs text-sky-200 pl-2 border-l border-white/20">
                {isHi ? 'महसूस होता है:' : 'Feels like:'} {current.feelsLike}°C
              </span>
            </div>
            <p className="text-lg font-bold text-amber-300 mt-2">
              {isHi ? current.conditionTextHi : current.conditionText}
            </p>
            <p className="text-xs text-sky-100 mt-1 max-w-sm">
              "{isHi ? weather.summaryFarmerHi : weather.summaryFarmer}"
            </p>
          </div>

          {/* 4 Essential Farm Metrics */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 bg-black/20 p-4 rounded-2xl border border-white/10 backdrop-blur-xs">
            {/* Humidity */}
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Droplets className="w-5 h-5 text-sky-300" />
              </div>
              <div>
                <p className="text-[10px] uppercase text-sky-200 font-semibold">{isHi ? 'नमी' : 'Humidity'}</p>
                <p className="text-base font-bold">{current.humidity}%</p>
              </div>
            </div>

            {/* Rainfall */}
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <CloudRain className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-[10px] uppercase text-sky-200 font-semibold">{isHi ? 'बारिश' : 'Rainfall'}</p>
                <p className="text-base font-bold">{current.rainfall} mm</p>
              </div>
            </div>

            {/* Wind Speed & Direction */}
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Wind className="w-5 h-5 text-teal-300" />
              </div>
              <div>
                <p className="text-[10px] uppercase text-sky-200 font-semibold">{isHi ? 'हवा की गति' : 'Wind'}</p>
                <p className="text-base font-bold">
                  {current.windSpeed} <span className="text-[10px] font-normal">km/h ({current.windDirection})</span>
                </p>
              </div>
            </div>

            {/* Cloud Cover */}
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Cloud className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <p className="text-[10px] uppercase text-sky-200 font-semibold">{isHi ? 'बादल' : 'Clouds'}</p>
                <p className="text-base font-bold">{current.cloudCover}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Source & Freshness Tagline */}
        <div className="mt-6 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-[11px] text-sky-200">
          <div className="flex items-center space-x-2">
            {networkStatus === 'online' ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-300" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>{weather.source}</span>
          </div>
          <span className="font-medium bg-black/20 px-2.5 py-0.5 rounded-full">
            {freshnessLabel}
          </span>
        </div>
      </div>

      {/* Spraying Advisory Card */}
      <div className={`p-5 rounded-3xl border flex items-start space-x-4 ${sprayAdvisory.bg}`}>
        <div className="w-10 h-10 rounded-2xl bg-white/80 border border-current flex items-center justify-center shrink-0 shadow-2xs">
          <SprayIcon className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider opacity-75">
              {isHi ? 'छिड़काव सलाह (SPRAYING GUIDANCE)' : 'Spraying Guidance:'}
            </span>
            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-white shadow-2xs">
              {sprayAdvisory.label}
            </span>
          </div>
          <p className="text-sm font-medium leading-relaxed">{sprayAdvisory.desc}</p>
        </div>
      </div>

      {/* 7-Day Forecast Carousel / Grid */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-base text-stone-900">
              {isHi ? 'अगले 7 दिनों का मौसम पूर्वानुमान' : '7-Day Farm Weather Forecast'}
            </h3>
          </div>
          <span className="text-xs text-stone-500 font-medium">
            {isHi ? 'प्रतिदिन का अधिकतम / न्यूनतम तापमान' : 'Daily High / Low & Rain'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {forecast.map((day, idx) => {
            const isToday = idx === 0;
            return (
              <div
                key={day.date}
                className={`p-3.5 rounded-2xl text-center border transition flex flex-col justify-between ${
                  isToday
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-semibold'
                    : 'bg-stone-50/80 border-stone-200 text-stone-800 hover:bg-stone-100/60'
                }`}
              >
                <div>
                  <p className="text-xs font-bold">
                    {isHi ? day.dayLabelHi : day.dayLabel}
                  </p>
                  <p className="text-[10px] text-stone-500">{day.date.slice(5)}</p>
                </div>

                <div className="my-2.5">
                  <div className="text-base font-black">
                    {day.maxTemperature}°
                    <span className="text-xs text-stone-500 font-normal ml-1">{day.minTemperature}°</span>
                  </div>
                  <p className="text-[11px] text-stone-600 font-medium truncate mt-0.5">
                    {isHi ? day.conditionTextHi : day.conditionText}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-200/60 space-y-0.5 text-[10px] text-stone-500">
                  <div className="flex items-center justify-center space-x-1">
                    <CloudRain className="w-3 h-3 text-sky-600" />
                    <span>{day.rainfallProbability}%</span>
                    {day.rainfallAmount > 0 && <span className="font-bold">({day.rainfallAmount}mm)</span>}
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <Wind className="w-3 h-3 text-stone-400" />
                    <span>{day.windSpeed} km/h</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agricultural Weather Signals */}
      {signals.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-base text-stone-900">
              {isHi ? 'कृषि मौसम संकेत व फसल प्रभाव' : 'Agricultural Weather Signals & Crop Impact'}
            </h3>
          </div>

          <div className="space-y-3">
            {signals.map((sig) => (
              <div
                key={sig.id}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start space-x-3.5"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    sig.severity === 'high'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {sig.type === 'high_humidity' && <Droplets className="w-5 h-5" />}
                  {sig.type === 'prolonged_wetness' && <CloudRain className="w-5 h-5" />}
                  {sig.type === 'heat_stress' && <Flame className="w-5 h-5" />}
                  {sig.type === 'strong_wind' && <Wind className="w-5 h-5" />}
                </div>

                <div className="space-y-1 text-xs text-stone-700">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-stone-900">
                      {isHi ? sig.titleHi : sig.title}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sig.severity === 'high' ? 'bg-rose-100 text-rose-900' : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {sig.severity.toUpperCase()}
                    </span>
                  </div>
                  <p>{isHi ? sig.descriptionHi : sig.description}</p>
                  <p className="font-semibold text-emerald-900 pt-1">
                    {isHi ? 'फसल पर असर:' : 'Crop impact:'} {isHi ? sig.impactOnCropsHi : sig.impactOnCrops}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
