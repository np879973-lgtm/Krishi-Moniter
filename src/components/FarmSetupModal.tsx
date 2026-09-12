// Farm Setup & Configuration Modal for Krishi Mentor
// Supports farm creation, editing, GPS with non-breaking permission handling, and privacy coordinates protection

import React, { useState } from 'react';
import {
  X,
  MapPin,
  Compass,
  Sprout,
  ShieldCheck,
  AlertCircle,
  Check,
  Loader2,
  Building2,
} from 'lucide-react';
import { Farm, FarmCreateInput } from '../types/farm';
import { Language } from '../types';
import {
  PRESET_AGRICULTURAL_DISTRICTS,
  requestBrowserGeolocation,
  createManualLocation,
} from '../services/location/locationService';
import { INITIAL_CROPS } from '../data/crops';

interface FarmSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveFarm: (input: FarmCreateInput) => void;
  existingFarm?: Farm | null;
  language: Language;
}

export const FarmSetupModal: React.FC<FarmSetupModalProps> = ({
  isOpen,
  onClose,
  onSaveFarm,
  existingFarm,
  language,
}) => {
  const isHi = language === 'hi';

  const [farmName, setFarmName] = useState(existingFarm?.name || 'My Farm');
  const [village, setVillage] = useState(existingFarm?.village || '');
  const [district, setDistrict] = useState(existingFarm?.district || 'Ludhiana');
  const [state, setState] = useState(existingFarm?.state || 'Punjab');
  const [country] = useState('India');
  const [primaryCrop, setPrimaryCrop] = useState(existingFarm?.primaryCrop || 'Wheat');
  const [initialFieldName, setInitialFieldName] = useState(
    existingFarm?.fields?.[0]?.name || 'Field A'
  );
  const [initialFieldArea, setInitialFieldArea] = useState<number>(
    existingFarm?.fields?.[0]?.area || 2.0
  );
  const [initialFieldAreaUnit, setInitialFieldAreaUnit] = useState<'acre' | 'hectare' | 'bigha' | 'sqm'>(
    existingFarm?.fields?.[0]?.areaUnit || 'acre'
  );

  const [latitude, setLatitude] = useState<number | undefined>(existingFarm?.location.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(existingFarm?.location.longitude);
  const [isGps, setIsGps] = useState<boolean>(existingFarm?.location.isGps || false);

  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle "Use My Location" (GPS)
  const handleUseMyLocation = async () => {
    setIsLocating(true);
    setLocationError(null);
    setLocationSuccessMsg(null);

    const result = await requestBrowserGeolocation();
    setIsLocating(false);

    if (result.success) {
      const loc = result.location;
      setLatitude(loc.latitude);
      setLongitude(loc.longitude);
      setIsGps(true);
      if (loc.district) setDistrict(loc.district);
      if (loc.state) setState(loc.state);
      setLocationSuccessMsg(
        isHi
          ? `सफलतापूर्वक पता लगाया: ${loc.district}, ${loc.state}`
          : `Detected nearest region: ${loc.district}, ${loc.state}`
      );
    } else if ('error' in result) {
      // User-friendly error message without crashing
      setLocationError(
        isHi ? result.error.farmerMessageHi : result.error.farmerMessage
      );
    }
  };

  // Handle Preset District Selection
  const handleSelectDistrictPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDistrictName = e.target.value;
    const match = PRESET_AGRICULTURAL_DISTRICTS.find((p) => p.district === selectedDistrictName);
    if (match) {
      setDistrict(match.district);
      setState(match.state);
      setLatitude(match.latitude);
      setLongitude(match.longitude);
      setIsGps(false);
      setLocationError(null);
      setLocationSuccessMsg(
        isHi
          ? `स्थान चुना गया: ${match.district}, ${match.state}`
          : `Selected: ${match.district}, ${match.state}`
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalLat = latitude;
    let finalLng = longitude;

    if (!finalLat || !finalLng) {
      const manualLoc = createManualLocation({ village, district, state, country });
      finalLat = manualLoc.latitude;
      finalLng = manualLoc.longitude;
    }

    const matchedCrop = INITIAL_CROPS.find((c) => c.name === primaryCrop);

    onSaveFarm({
      name: farmName.trim() || 'My Farm',
      village: village.trim(),
      district: district.trim(),
      state: state.trim(),
      country,
      primaryCrop,
      primaryCropHindi: matchedCrop?.hindiName,
      initialFieldName: initialFieldName.trim() || 'Field 1',
      initialFieldArea: Number(initialFieldArea) || 2.0,
      initialFieldAreaUnit,
      latitude: finalLat,
      longitude: finalLng,
      isGps,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-stone-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700/80 border border-emerald-600 flex items-center justify-center text-amber-300">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {existingFarm
                  ? isHi ? 'खेत का विवरण बदलें' : 'Update Farm Profile'
                  : isHi ? 'नया खेत जोड़ें' : 'Set Up My Farm'}
              </h3>
              <p className="text-xs text-emerald-200">
                {isHi ? 'खेत का नाम, स्थान और मुख्य फसल' : 'Farm name, location, and primary crop'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-700/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Farm Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              {isHi ? 'खेत का नाम (Farm Name)' : 'Farm Name'}
            </label>
            <input
              type="text"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              placeholder="e.g. Kisan Adarsh Farm"
              required
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-stone-900 font-medium"
            />
          </div>

          {/* Location Configuration Box */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>{isHi ? 'स्थान का चयन (Farm Location)' : 'Farm Location'}</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {isHi ? 'गोपनीय सुरक्षित' : 'Privacy Protected'}
              </span>
            </div>

            {/* GPS Detection Button */}
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={isLocating}
              className="w-full py-2.5 px-4 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>{isHi ? 'स्थान खोजा जा रहा है...' : 'Detecting GPS location...'}</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>{isHi ? 'मेरा स्थान उपयोग करें (Use My Location)' : 'Use My Location (GPS)'}</span>
                </>
              )}
            </button>

            {/* Non-breaking Permission Feedback */}
            {locationError && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{locationError}</span>
              </div>
            )}

            {locationSuccessMsg && (
              <div className="p-2.5 bg-emerald-100/80 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{locationSuccessMsg}</span>
              </div>
            )}

            {/* Manual District Selection */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                {isHi ? 'या जिला सूची से चुनें:' : 'Or Select Location Manually:'}
              </label>
              <select
                value={district}
                onChange={handleSelectDistrictPreset}
                className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-stone-800 cursor-pointer"
              >
                {PRESET_AGRICULTURAL_DISTRICTS.map((preset) => (
                  <option key={preset.district} value={preset.district}>
                    {preset.district}, {preset.state} ({preset.region})
                  </option>
                ))}
              </select>
            </div>

            {/* Village Name Input */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  {isHi ? 'गांव / क्षेत्र (वैकल्पिक)' : 'Village (Optional)'}
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="e.g. Gill Kalan"
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-stone-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  {isHi ? 'राज्य (State)' : 'State'}
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Punjab"
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-stone-800"
                />
              </div>
            </div>
          </div>

          {/* Primary Crop */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isHi ? 'मुख्य फसल (Primary Crop)' : 'Primary Crop'}</span>
            </label>
            <select
              value={primaryCrop}
              onChange={(e) => setPrimaryCrop(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-stone-900 font-medium cursor-pointer"
            >
              {INITIAL_CROPS.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.hindiName})
                </option>
              ))}
            </select>
          </div>

          {/* Initial Field Setup */}
          {!existingFarm && (
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-2.5">
              <div className="text-xs font-bold text-stone-800">
                {isHi ? 'पहला खेत जोड़ें (वैकल्पिक)' : 'Initial Field (Optional)'}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">
                    {isHi ? 'खेत का नाम' : 'Field Name'}
                  </label>
                  <input
                    type="text"
                    value={initialFieldName}
                    onChange={(e) => setInitialFieldName(e.target.value)}
                    placeholder="e.g. Field A"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">
                    {isHi ? 'रकबा (Area)' : 'Area & Unit'}
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      step="0.1"
                      value={initialFieldArea}
                      onChange={(e) => setInitialFieldArea(parseFloat(e.target.value) || 0)}
                      className="w-20 px-2.5 py-2 text-xs bg-white border border-stone-300 rounded-xl"
                    />
                    <select
                      value={initialFieldAreaUnit}
                      onChange={(e) => setInitialFieldAreaUnit(e.target.value as any)}
                      className="flex-1 px-2 py-2 text-xs bg-white border border-stone-300 rounded-xl cursor-pointer"
                    >
                      <option value="acre">{isHi ? 'एकड़' : 'Acre'}</option>
                      <option value="hectare">{isHi ? 'हेक्टेयर' : 'Hectare'}</option>
                      <option value="bigha">{isHi ? 'बीघा' : 'Bigha'}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy operational notice */}
          <div className="p-3 bg-stone-100 rounded-xl flex items-start gap-2 text-[11px] text-stone-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              {isHi
                ? 'स्थान की जानकारी केवल आपके फोन/ब्राउज़र में स्थानीय रूप से सहेजी जाती है। इसका उपयोग सटीक मौसम व फसल सलाह के लिए होता है।'
                : 'Farmer coordinates are treated as sensitive operational data and stored locally. Never exposed publicly.'}
            </span>
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition cursor-pointer"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
            >
              {existingFarm
                ? isHi ? 'बदलाव सहेजें' : 'Save Changes'
                : isHi ? 'खेत सहेजें' : 'Save Farm Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
