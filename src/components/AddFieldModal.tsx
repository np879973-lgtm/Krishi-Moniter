// Add Field Modal for Krishi Mentor
// Supports manual area entry, regional Bigha variations, or map-marked boundary polygons

import React, { useState } from 'react';
import { X, Sprout, Map, Check, Ruler, Info } from 'lucide-react';
import { Language } from '../types';
import { AreaUnit, BighaRegion, LatLngTuple } from '../types/geospatial';
import { INITIAL_CROPS } from '../data/crops';
import {
  REGIONAL_BIGHA_CONFIGS,
  calculatePolygonArea,
  convertArea,
  formatArea,
} from '../services/geospatial/geospatialService';

interface AddFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddField: (fieldData: {
    name: string;
    crop: string;
    cropHindi?: string;
    area?: number;
    areaUnit?: AreaUnit;
    bighaRegion?: BighaRegion;
    boundary?: LatLngTuple[];
    plantingDate?: string;
  }) => void;
  drawnBoundary?: LatLngTuple[] | null;
  onStartDrawingOnMap?: () => void;
  language: Language;
}

export const AddFieldModal: React.FC<AddFieldModalProps> = ({
  isOpen,
  onClose,
  onAddField,
  drawnBoundary,
  onStartDrawingOnMap,
  language,
}) => {
  const isHi = language === 'hi';

  const [fieldName, setFieldName] = useState('Field B');
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [entryMode, setEntryMode] = useState<'manual' | 'map'>(
    drawnBoundary && drawnBoundary.length >= 3 ? 'map' : 'manual'
  );
  const [areaValue, setAreaValue] = useState<number>(2.0);
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('acre');
  const [bighaRegion, setBighaRegion] = useState<BighaRegion>('punjab_haryana');
  const [plantingDate, setPlantingDate] = useState<string>('');

  if (!isOpen) return null;

  // Compute area from drawn boundary if present
  const drawnAreaCalc =
    drawnBoundary && drawnBoundary.length >= 3
      ? calculatePolygonArea(drawnBoundary, bighaRegion)
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const matchedCrop = INITIAL_CROPS.find((c) => c.name === selectedCrop);

    let finalArea = areaValue;
    let finalUnit = areaUnit;
    let finalBoundary: LatLngTuple[] | undefined = undefined;

    if (entryMode === 'map' && drawnAreaCalc && drawnBoundary) {
      finalArea = drawnAreaCalc.acres;
      finalUnit = 'acre';
      finalBoundary = drawnBoundary;
    }

    onAddField({
      name: fieldName.trim() || 'Field',
      crop: selectedCrop,
      cropHindi: matchedCrop?.hindiName,
      area: finalArea,
      areaUnit: finalUnit,
      bighaRegion: finalUnit === 'bigha' ? bighaRegion : undefined,
      boundary: finalBoundary,
      plantingDate: plantingDate || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-stone-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700/80 border border-emerald-600 flex items-center justify-center text-amber-300">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {isHi ? 'नया खेत जोड़ें' : 'Add New Field'}
              </h3>
              <p className="text-xs text-emerald-200">
                {isHi ? 'खेत का नाम, फसल और क्षेत्रफल दर्ज करें' : 'Assign crop and configure boundary'}
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Field Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              {isHi ? 'खेत का नाम (Field Identifier)' : 'Field Name'}
            </label>
            <input
              type="text"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder="e.g. Field A, North Canal Block"
              required
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-stone-900 font-medium"
            />
          </div>

          {/* Crop Selection */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isHi ? 'बोई गई फसल (Crop Sown)' : 'Crop Sown in this Field'}</span>
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-stone-900 font-medium cursor-pointer"
            >
              {INITIAL_CROPS.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.hindiName})
                </option>
              ))}
            </select>
          </div>

          {/* Area Configuration Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              {isHi ? 'क्षेत्रफल निर्धारण विधि (Area Method)' : 'Field Boundary & Area Method'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEntryMode('manual')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  entryMode === 'manual'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Ruler className="w-4 h-4" />
                <span>{isHi ? 'क्षेत्रफल मैन्युअल भरें' : 'Enter Area Manually'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEntryMode('map');
                  if (onStartDrawingOnMap && (!drawnBoundary || drawnBoundary.length < 3)) {
                    onClose();
                    onStartDrawingOnMap();
                  }
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  entryMode === 'map'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Map className="w-4 h-4" />
                <span>{isHi ? 'नक्शे पर चिह्नित करें' : 'Mark on Map'}</span>
              </button>
            </div>
          </div>

          {/* Manual Entry Fields */}
          {entryMode === 'manual' && (
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    {isHi ? 'क्षेत्रफल मान' : 'Area Size'}
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    value={areaValue}
                    onChange={(e) => setAreaValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-semibold text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    {isHi ? 'इकाई (Unit)' : 'Unit'}
                  </label>
                  <select
                    value={areaUnit}
                    onChange={(e) => setAreaUnit(e.target.value as AreaUnit)}
                    className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-stone-800 cursor-pointer"
                  >
                    <option value="acre">{isHi ? 'एकड़ (Acre)' : 'Acre'}</option>
                    <option value="hectare">{isHi ? 'हेक्टेयर (Hectare)' : 'Hectare'}</option>
                    <option value="bigha">{isHi ? 'बीघा (Bigha)' : 'Bigha'}</option>
                    <option value="sqm">{isHi ? 'वर्ग मीटर (sq. m)' : 'Square Meter'}</option>
                  </select>
                </div>
              </div>

              {/* Regional Bigha Selection Notice */}
              {areaUnit === 'bigha' && (
                <div className="pt-2 border-t border-stone-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      {isHi
                        ? 'भारत में बीघा का मान राज्यवार बदलता है:'
                        : 'Bigha measurement varies regionally across India:'}
                    </span>
                  </div>

                  <select
                    value={bighaRegion}
                    onChange={(e) => setBighaRegion(e.target.value as BighaRegion)}
                    className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl outline-none text-stone-800 cursor-pointer"
                  >
                    {Object.values(REGIONAL_BIGHA_CONFIGS).map((cfg) => (
                      <option key={cfg.region} value={cfg.region}>
                        {isHi ? cfg.labelHi : cfg.label}
                      </option>
                    ))}
                  </select>

                  <div className="text-[11px] text-stone-600 bg-amber-50 p-2 rounded-lg">
                    {areaValue} {isHi ? 'बीघा' : 'Bigha'} ≈{' '}
                    <strong>
                      {convertArea(areaValue, 'bigha', 'acre', bighaRegion).toFixed(2)} Acres
                    </strong>{' '}
                    ({Math.round(convertArea(areaValue, 'bigha', 'sqm', bighaRegion))} m²)
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Map Marked Boundary Preview */}
          {entryMode === 'map' && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Map className="w-4 h-4 text-emerald-700" />
                  {isHi ? 'नक्शे पर खींची गई सीमा' : 'Map-Drawn Boundary'}
                </span>
                {drawnBoundary && drawnBoundary.length >= 3 ? (
                  <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
                    {drawnBoundary.length} Points Marked
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                    No points yet
                  </span>
                )}
              </div>

              {drawnAreaCalc ? (
                <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1">
                  <div className="text-xs text-stone-500">
                    {isHi ? 'अनुमानित क्षेत्रफल (Geodesic Area):' : 'Calculated Geodesic Area:'}
                  </div>
                  <div className="text-lg font-bold text-emerald-800">
                    {drawnAreaCalc.formattedPrimary}
                  </div>
                  <div className="text-xs text-stone-600">
                    ≈ {drawnAreaCalc.formattedSecondary} ({drawnAreaCalc.hectares} ha /{' '}
                    {drawnAreaCalc.sqMeters} m²)
                  </div>
                </div>
              ) : (
                <p className="text-xs text-stone-600">
                  {isHi
                    ? 'खेत के चारों कोनों पर क्लिक करके बहुभुज (polygon) बनाएं। फिर इस विंडो में आकर खेत सहेजें।'
                    : 'Click points around field boundary on the Farm Map. The area is automatically computed.'}
                </p>
              )}

              {onStartDrawingOnMap && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onStartDrawingOnMap();
                  }}
                  className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  {drawnBoundary && drawnBoundary.length >= 3
                    ? isHi ? 'नक्शे पर सीमा दोबारा बनाएं' : 'Redraw on Map'
                    : isHi ? 'नक्शे पर बिंदु चिह्नित करना शुरू करें' : 'Start Marking on Map'}
                </button>
              )}
            </div>
          )}

          {/* Planting Date (Optional) */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              {isHi ? 'बुवाई की तारीख (Planting Date - Optional)' : 'Planting Date (Optional)'}
            </label>
            <input
              type="date"
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl outline-none text-stone-800"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition cursor-pointer"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isHi ? 'खेत जोड़ें' : 'Save Field'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
