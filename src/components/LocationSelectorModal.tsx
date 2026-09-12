// Location Selector Modal for Krishi Mentor
// Allows choosing: GPS location, Preset Indian agricultural district, or manual entry
// Respects farmer privacy: stores strictly in local browser

import React, { useState } from 'react';
import { MapPin, Navigation, Check, X, Search, ShieldCheck } from 'lucide-react';
import { LocationContext } from '../types/weather';
import { Language } from '../types';
import { PRESET_AGRICULTURAL_DISTRICTS, requestBrowserGeolocation, saveFarmLocation } from '../services/weather/locationService';
import { translations } from '../i18n/translations';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationContext;
  onLocationSelected: (newLoc: LocationContext) => void;
  language: Language;
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onLocationSelected,
  language,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isHi = language === 'hi';

  const filteredPresets = PRESET_AGRICULTURAL_DISTRICTS.filter(
    (p) =>
      p.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUseGps = async () => {
    setIsLocating(true);
    setErrorMessage(null);
    try {
      const loc = await requestBrowserGeolocation();
      onLocationSelected(loc);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || (isHi ? 'स्थान प्राप्त नहीं हो सका' : 'Could not detect location'));
    } finally {
      setIsLocating(false);
    }
  };

  const handleSelectPreset = (preset: (typeof PRESET_AGRICULTURAL_DISTRICTS)[0]) => {
    const loc: LocationContext = {
      district: preset.district,
      state: preset.state,
      country: 'India',
      latitude: preset.latitude,
      longitude: preset.longitude,
      displayName: `${preset.district}, ${preset.state}`,
      isGps: false,
    };
    saveFarmLocation(loc);
    onLocationSelected(loc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {isHi ? 'खेत का स्थान चुनें' : 'Select Farm Location'}
              </h3>
              <p className="text-xs text-emerald-100">
                {isHi ? 'सटीक मौसम व कृषि जोखिम पूर्वानुमान के लिए' : 'For localized weather & risk forecasting'}
              </p>
            </div>
          </div>
          <button
            id="close-location-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* GPS Button */}
          <button
            id="use-gps-location-btn"
            onClick={handleUseGps}
            disabled={isLocating}
            className="w-full p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 flex items-center justify-between transition group cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Navigation className={`w-5 h-5 ${isLocating ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">
                  {isHi ? 'वर्तमान जीपीएस स्थान का उपयोग करें' : 'Use Current GPS Location'}
                </p>
                <p className="text-xs text-emerald-700">
                  {isLocating
                    ? isHi ? 'स्थान का पता लगाया जा रहा है...' : 'Detecting your coordinates...'
                    : isHi ? 'फोन के जीपीएस से तुरंत स्थान पाएं' : 'Auto-detect from your device'}
                </p>
              </div>
            </div>
          </button>

          {errorMessage && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              {errorMessage}
            </div>
          )}

          {/* Current Selection */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-medium text-stone-500">
                {isHi ? 'वर्तमान चयनित स्थान:' : 'Currently selected:'}
              </span>
            </div>
            <span className="text-xs font-bold text-stone-800 bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
              {currentLocation.displayName || `${currentLocation.district}, ${currentLocation.state}`}
            </span>
          </div>

          {/* District Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              id="district-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isHi ? 'जिला या राज्य खोजें (उदा. Ludhiana, Nashik, Meerut)...' : 'Search Indian agricultural district or state...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Preset Districts List */}
          <div>
            <p className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
              {isHi ? 'प्रमुख कृषि जिले (Major Agricultural Districts)' : 'Major Agricultural Districts'}
            </p>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {filteredPresets.map((preset) => {
                const isSelected =
                  currentLocation.district.toLowerCase() === preset.district.toLowerCase() &&
                  currentLocation.state.toLowerCase() === preset.state.toLowerCase();

                return (
                  <button
                    key={`${preset.district}-${preset.state}`}
                    onClick={() => handleSelectPreset(preset)}
                    className={`w-full p-3 rounded-xl text-left flex items-center justify-between border transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold'
                        : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700'
                    }`}
                  >
                    <div>
                      <span className="text-sm font-medium">{preset.district}</span>
                      <span className="text-xs text-stone-500 ml-2 font-normal">
                        ({preset.state} • {preset.region})
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Privacy Guarantee */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start space-x-2 text-[11px] text-stone-600">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p>
              {isHi
                ? 'गोपनीयता सुरक्षा: स्थान केवल आपके फोन में मौसम व रोग पूर्वानुमान हेतु सहेजा जाता है।'
                : 'Privacy Guaranteed: Location coordinates are stored strictly on your device for weather and risk modeling.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
