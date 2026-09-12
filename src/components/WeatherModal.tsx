// Upgraded Weather Modal for Krishi Mentor
// Uses weatherService for live agrometeorological data with demo fallbacks

import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  X,
  Droplets,
  Wind,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  CloudRain,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Language } from '../types';
import { LocationContext, WeatherData } from '../types/weather';
import { weatherService } from '../services/weather/weatherService';
import { translations } from '../i18n/translations';

interface WeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentLocation?: LocationContext;
  onOpenFullWeather?: () => void;
}

export const WeatherModal: React.FC<WeatherModalProps> = ({
  isOpen,
  onClose,
  language,
  currentLocation,
  onOpenFullWeather,
}) => {
  const t = translations[language];
  const isHi = language === 'hi';

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      weatherService
        .getWeather(currentLocation)
        .then((data) => setWeather(data))
        .catch((err) => console.error('Failed to load weather in modal', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, currentLocation]);

  if (!isOpen) return null;

  const current = weather?.current;
  const isGoodForSpray = current ? current.windSpeed <= 15 && current.rainfall === 0 : true;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-700 to-emerald-700 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <CloudSun className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {t.weatherTitle}
              </h3>
              <p className="text-xs text-sky-100">{t.weatherSubtitle}</p>
            </div>
          </div>

          <button
            id="weather-modal-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-12 text-center">
              <RefreshCw className="w-8 h-8 mx-auto text-emerald-700 animate-spin mb-2" />
              <p className="text-xs text-stone-500">{isHi ? 'मौसम डेटा लोड हो रहा है...' : 'Loading weather data...'}</p>
            </div>
          ) : weather && current ? (
            <>
              {/* Location Strip */}
              <div className="flex items-center justify-between bg-sky-50 border border-sky-100 rounded-xl p-3 text-xs">
                <div className="flex items-center gap-1.5 text-sky-900 font-semibold">
                  <MapPin className="w-4 h-4 text-sky-600" />
                  <span>{weather.location.displayName}</span>
                </div>
                <span className="text-[11px] text-sky-700 font-medium">{weather.source}</span>
              </div>

              {/* Current Metrics */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3">
                  <Thermometer className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <span className="text-[11px] text-stone-500 block">{isHi ? 'तापमान' : 'Temperature'}</span>
                  <span className="text-base font-bold text-stone-900">{current.temperature}°C</span>
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3">
                  <Droplets className="w-5 h-5 text-sky-600 mx-auto mb-1" />
                  <span className="text-[11px] text-stone-500 block">{isHi ? 'सापेक्ष आर्द्रता' : 'Humidity'}</span>
                  <span className="text-base font-bold text-stone-900">{current.humidity}%</span>
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3">
                  <Wind className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                  <span className="text-[11px] text-stone-500 block">{isHi ? 'हवा की गति' : 'Wind Speed'}</span>
                  <span className="text-base font-bold text-stone-900">{current.windSpeed} km/h</span>
                </div>
              </div>

              {/* Farmer Summary */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-700">
                <p className="font-semibold text-stone-900 mb-0.5">
                  {isHi ? 'मौसम स्थिति:' : 'Forecast Summary:'}{' '}
                  <span className="text-emerald-800">{isHi ? current.conditionTextHi : current.conditionText}</span>
                </p>
                <p className="italic">"{isHi ? weather.summaryFarmerHi : weather.summaryFarmer}"</p>
              </div>

              {/* Spray Guidance */}
              <div
                className={`p-4 rounded-2xl border ${
                  isGoodForSpray
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {isGoodForSpray ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                  )}
                  <span className="font-bold text-xs uppercase tracking-wider">
                    {isHi ? 'छिड़काव उपयुक्तता (SPRAY FEASIBILITY)' : 'Spray Feasibility Index'}
                  </span>
                </div>
                <p className="text-xs">
                  {isGoodForSpray
                    ? isHi
                      ? 'वर्तमान में हवा शांत है और बारिश की संभावना कम है। छिड़काव के लिए समय अनुकूल है।'
                      : 'Winds are gentle and no immediate rain is expected. Favorable spray conditions.'
                    : isHi
                      ? 'सावधानी: हवा की गति या नमी की स्थिति को ध्यान में रखकर ही छिड़काव करें।'
                      : 'Caution: Watch wind drift and drying times before applying sprays.'}
                </p>
              </div>

              {/* View Full 7-Day Forecast Button */}
              {onOpenFullWeather && (
                <button
                  id="modal-open-full-weather-btn"
                  onClick={() => {
                    onClose();
                    onOpenFullWeather();
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
                >
                  <span>{isHi ? '7-दिवसीय पूर्ण मौसम व संकेत देखें' : 'View Full 7-Day Farm Weather'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          ) : (
            <p className="text-center text-xs text-stone-500 py-6">
              {isHi ? 'मौसम डेटा अनुपलब्ध है' : 'Weather data currently unavailable.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
