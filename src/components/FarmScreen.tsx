// Farm & Crop Intelligence Dashboard for Krishi Mentor (Part 4)
// Geospatial management: Farm profile, multiple fields, interactive map, field health, weather & diagnosis links

import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Sprout,
  Plus,
  Layers,
  Compass,
  AlertTriangle,
  ShieldCheck,
  Activity,
  CloudSun,
  Camera,
  BookOpen,
  PhoneCall,
  History,
  RotateCcw,
  Sparkles,
  WifiOff,
  ChevronRight,
  Edit3,
  Calendar,
  Crosshair,
  Undo2,
  Trash2,
  Info,
} from 'lucide-react';
import { Farm, FarmCreateInput } from '../types/farm';
import { Field, FieldObservation, FieldTimelineEvent, FieldHealthStatus } from '../types/field';
import { Language } from '../types';
import { WeatherData } from '../types/weather';
import { RiskAssessment } from '../types/risk';
import { MapTileProvider, LatLngTuple } from '../types/geospatial';
import {
  getAllFarms,
  getActiveFarm,
  setActiveFarmId,
  createFarm,
  updateFarm,
  addFieldToFarm,
  changeFieldCrop,
  getFieldObservations,
  getFieldTimeline,
  loadDemoFarm,
} from '../services/farm/farmService';
import { formatPrivacyLocation } from '../services/location/locationService';
import { formatArea, calculatePolygonArea } from '../services/geospatial/geospatialService';
import { LeafletMapAdapter, HEALTH_COLOR_PALETTE } from '../services/maps/mapService';
import {
  generateFieldIntelligence,
  getAreaLevelIntelligence,
} from '../services/geospatial/agriculturalIntelligenceService';
import { FarmSetupModal } from './FarmSetupModal';
import { AddFieldModal } from './AddFieldModal';
import { ChangeCropModal } from './ChangeCropModal';

interface FarmScreenProps {
  language: Language;
  onNavigateToCheckCrop: (field?: Field) => void;
  onOpenWeather: () => void;
  onOpenRiskForecast: () => void;
  onOpenExpertModal: (field?: Field) => void;
  weather: WeatherData | null;
  riskAssessment: RiskAssessment | null;
}

export const FarmScreen: React.FC<FarmScreenProps> = ({
  language,
  onNavigateToCheckCrop,
  onOpenWeather,
  onOpenRiskForecast,
  onOpenExpertModal,
  weather,
  riskAssessment,
}) => {
  const isHi = language === 'hi';

  const [farms, setFarms] = useState<Farm[]>(() => getAllFarms());
  const [activeFarm, setActiveFarm] = useState<Farm>(() => getActiveFarm());
  const [selectedField, setSelectedField] = useState<Field | null>(null);

  // Modals
  const [isFarmSetupOpen, setIsFarmSetupOpen] = useState(false);
  const [isEditFarmOpen, setIsEditFarmOpen] = useState(false);
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [isChangeCropOpen, setIsChangeCropOpen] = useState(false);

  // Map state
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapAdapterRef = useRef<LeafletMapAdapter | null>(null);
  const [tileProvider, setTileProvider] = useState<MapTileProvider>('satellite_hybrid');
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<LatLngTuple[]>([]);
  const [drawnAreaPreview, setDrawnAreaPreview] = useState<number>(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Field observations and timeline
  const [currentObservations, setCurrentObservations] = useState<FieldObservation[]>([]);
  const [currentTimeline, setCurrentTimeline] = useState<FieldTimelineEvent[]>([]);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync active farm
  const refreshFarmState = () => {
    const all = getAllFarms();
    setFarms(all);
    const curr = getActiveFarm();
    setActiveFarm(curr);
    if (curr.fields && curr.fields.length > 0) {
      // Retain selection if valid, else pick first
      setSelectedField((prev) => {
        const found = curr.fields.find((f) => f.id === prev?.id);
        return found || curr.fields[0];
      });
    } else {
      setSelectedField(null);
    }
  };

  useEffect(() => {
    refreshFarmState();
  }, []);

  // Update observations & timeline when selected field changes
  useEffect(() => {
    if (selectedField) {
      const obs = getFieldObservations(selectedField.id);
      setCurrentObservations(obs);
      const tl = getFieldTimeline(selectedField.id);
      setCurrentTimeline(tl);
    } else {
      setCurrentObservations([]);
      setCurrentTimeline([]);
    }
  }, [selectedField]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapAdapterRef.current) {
      const adapter = new LeafletMapAdapter();
      const centerLat = activeFarm.location.latitude || 30.901;
      const centerLng = activeFarm.location.longitude || 75.8573;

      adapter.initialize(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 16,
        tileProvider,
      });

      mapAdapterRef.current = adapter;
    }

    const adapter = mapAdapterRef.current;
    adapter.setTileProvider(tileProvider);

    // Render farm marker
    adapter.renderFarm(activeFarm, () => {
      // Centered on farm
    });

    // Render field polygons
    adapter.renderFields(activeFarm.fields, selectedField?.id, (field) => {
      setSelectedField(field);
    });

    // Render observation points
    const allObservations = activeFarm.fields.flatMap((f) => getFieldObservations(f.id));
    adapter.renderObservations(allObservations, (obs) => {
      const matchedField = activeFarm.fields.find((f) => f.id === obs.fieldId);
      if (matchedField) setSelectedField(matchedField);
    });

    adapter.invalidateSize();
  }, [activeFarm, selectedField, tileProvider]);

  // Handle farm switcher
  const handleSwitchFarm = (farmId: string) => {
    setActiveFarmId(farmId);
    refreshFarmState();
    const targetFarm = farms.find((f) => f.id === farmId);
    if (targetFarm && mapAdapterRef.current && targetFarm.location.latitude && targetFarm.location.longitude) {
      mapAdapterRef.current.setCenter([targetFarm.location.latitude, targetFarm.location.longitude], 16);
    }
  };

  // Center map on active farm
  const handleRecenterMap = () => {
    if (mapAdapterRef.current && activeFarm.location.latitude && activeFarm.location.longitude) {
      mapAdapterRef.current.setCenter([activeFarm.location.latitude, activeFarm.location.longitude], 16);
    }
  };

  // Start field boundary drawing on map
  const handleStartDrawBoundary = () => {
    if (!mapAdapterRef.current) return;
    setIsDrawingMode(true);
    setDrawnPoints([]);
    setDrawnAreaPreview(0);

    mapAdapterRef.current.startDrawing((points, areaAcres) => {
      setDrawnPoints(points);
      setDrawnAreaPreview(areaAcres);
    });
  };

  // Cancel drawing
  const handleCancelDrawing = () => {
    if (!mapAdapterRef.current) return;
    mapAdapterRef.current.clearDrawing();
    setIsDrawingMode(false);
    setDrawnPoints([]);
    setDrawnAreaPreview(0);
  };

  // Undo vertex
  const handleUndoVertex = () => {
    if (!mapAdapterRef.current) return;
    const pts = mapAdapterRef.current.undoLastDrawPoint();
    setDrawnPoints(pts);
  };

  // Finish drawing and open AddFieldModal with polygon preloaded
  const handleFinishDrawing = () => {
    if (!mapAdapterRef.current) return;
    const pts = mapAdapterRef.current.finishDrawing();
    setIsDrawingMode(false);
    setDrawnPoints(pts);
    setIsAddFieldOpen(true);
  };

  // Field addition
  const handleAddField = (fieldData: {
    name: string;
    crop: string;
    cropHindi?: string;
    area?: number;
    areaUnit?: any;
    bighaRegion?: any;
    boundary?: LatLngTuple[];
    plantingDate?: string;
  }) => {
    const newField = addFieldToFarm(activeFarm.id, fieldData);
    refreshFarmState();
    setSelectedField(newField);
    setDrawnPoints([]);
  };

  // Load Demo Farm
  const handleLoadDemoFarm = () => {
    const demo = loadDemoFarm();
    refreshFarmState();
    if (mapAdapterRef.current && demo.location.latitude && demo.location.longitude) {
      mapAdapterRef.current.setCenter([demo.location.latitude, demo.location.longitude], 16);
    }
  };

  // Synthesize intelligence for currently selected field
  const fieldIntel = selectedField
    ? generateFieldIntelligence(selectedField, activeFarm, weather)
    : null;

  const areaIntel = getAreaLevelIntelligence({
    scope: 'district',
    district: activeFarm.district,
    state: activeFarm.state,
    crop: selectedField?.crop || activeFarm.primaryCrop,
  });

  const activePalette = selectedField
    ? HEALTH_COLOR_PALETTE[selectedField.healthStatus] || HEALTH_COLOR_PALETTE.UNKNOWN
    : HEALTH_COLOR_PALETTE.UNKNOWN;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-5 pb-24 space-y-5 font-sans">
      {/* Offline Warning Banner */}
      {isOffline && (
        <div className="p-3 bg-stone-900 text-amber-300 rounded-2xl flex items-center justify-between shadow-md text-xs">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {isHi
                ? 'आप ऑफलाइन हैं। सुरक्षित खेत, रकबा और सीमाएं स्थानीय रूप से प्रदर्शित हैं।'
                : "You're offline. Showing locally saved farm profiles and field boundaries."}
            </span>
          </div>
          <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
            OFFLINE CACHE
          </span>
        </div>
      )}

      {/* FARM PROFILE CARD ("MY FARM") */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
              MY FARM
            </span>
            {activeFarm.isDemo && (
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                DEMO PREVIEW
              </span>
            )}
          </div>

          {/* Farm Switcher and Actions */}
          <div className="flex items-center space-x-2">
            {farms.length > 1 && (
              <select
                value={activeFarm.id}
                onChange={(e) => handleSwitchFarm(e.target.value)}
                className="text-xs font-semibold bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1.5 outline-none text-stone-800 cursor-pointer"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} {f.isDemo ? '(Demo)' : ''}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setIsEditFarmOpen(true)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isHi ? 'स्थान बदलें' : 'Edit Profile'}</span>
            </button>

            <button
              onClick={() => setIsFarmSetupOpen(true)}
              className="text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isHi ? 'नया खेत' : 'New Farm'}</span>
            </button>
          </div>
        </div>

        {/* Farmer-Friendly Profile Information */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
            <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">
              {isHi ? 'खेत का नाम' : 'Farm Name'}
            </span>
            <span className="font-extrabold text-stone-900 text-sm sm:text-base block truncate">
              {activeFarm.name}
            </span>
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
            <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">
              {isHi ? 'स्थान (Location)' : 'Location'}
            </span>
            <span className="font-semibold text-stone-800 text-xs sm:text-sm block truncate" title={formatPrivacyLocation(activeFarm.location)}>
              📍 {formatPrivacyLocation(activeFarm.location)}
            </span>
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
            <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">
              {isHi ? 'मुख्य फसल व क्षेत्र' : 'Primary Crop & Fields'}
            </span>
            <span className="font-extrabold text-emerald-800 text-sm block truncate">
              {activeFarm.primaryCrop} • {activeFarm.fields.length} {isHi ? 'खेत' : 'Fields'}
            </span>
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">
                {isHi ? 'मौसम व जोखिम' : 'Weather & Risk'}
              </span>
              <span className="font-extrabold text-stone-900 text-sm">
                {weather ? `${Math.round(weather.current.temperature)}°C` : '—'}
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                riskAssessment?.riskLevel === 'HIGH' || riskAssessment?.riskLevel === 'VERY_HIGH'
                  ? 'bg-red-100 text-red-800 border-red-200'
                  : riskAssessment?.riskLevel === 'MODERATE'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
            >
              {riskAssessment ? riskAssessment.riskLevel : 'MODERATE'}
            </span>
          </div>
        </div>

        {/* Demo Farm Fast Test Banner */}
        {!activeFarm.isDemo && (
          <div className="flex items-center justify-between p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs">
            <div className="flex items-center gap-2 text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {isHi
                  ? 'परीक्षण के लिए डेमो फार्म (गेहूं, टमाटर व सरसों के सीमांकन) का उपयोग करें'
                  : 'Load demo farm with preset fields, polygons & diagnostic hotspot points'}
              </span>
            </div>
            <button
              onClick={handleLoadDemoFarm}
              className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded-lg transition text-[11px] cursor-pointer shrink-0 ml-2"
            >
              {isHi ? 'डेमो फार्म लोड करें' : 'Load Demo Farm'}
            </button>
          </div>
        )}
      </div>

      {/* DEDICATED FARM MAP CONTAINER */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden relative">
        {/* Map Header & Controls Strip */}
        <div className="p-3 sm:p-4 bg-stone-900 text-white flex flex-wrap items-center justify-between gap-2 z-10 relative">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm text-white">
              {isHi ? 'फार्म मैप (Farm Map)' : 'Farm Map'}
            </span>
            <span className="text-[11px] text-stone-400">
              ({activeFarm.fields.length} {isHi ? 'खेत सीमाएं' : 'field boundaries'})
            </span>
          </div>

          {/* Tile Layer Switcher & Draw Mode Trigger */}
          <div className="flex items-center space-x-2">
            {/* Tile Layer Selector */}
            <div className="inline-flex rounded-xl bg-stone-800 p-0.5 border border-stone-700">
              <button
                onClick={() => setTileProvider('satellite_hybrid')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                  tileProvider === 'satellite_hybrid'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="Satellite Imagery"
              >
                🛰️ {isHi ? 'सैटेलाइट' : 'Satellite'}
              </button>
              <button
                onClick={() => setTileProvider('osm_standard')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                  tileProvider === 'osm_standard'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="Street / Boundaries"
              >
                🗺️ {isHi ? 'सड़क/सीमा' : 'Street'}
              </button>
            </div>

            {/* Recenter button */}
            <button
              onClick={handleRecenterMap}
              title="Center on Farm"
              className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl border border-stone-700 transition cursor-pointer"
            >
              <Crosshair className="w-4 h-4 text-emerald-400" />
            </button>

            {/* Draw Polygon Trigger */}
            {!isDrawingMode ? (
              <button
                onClick={handleStartDrawBoundary}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isHi ? 'सीमा खींचें' : 'Draw Boundary'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleUndoVertex}
                  disabled={drawnPoints.length === 0}
                  className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold disabled:opacity-40 transition cursor-pointer"
                  title="Undo point"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCancelDrawing}
                  className="px-2.5 py-1 bg-rose-900/80 hover:bg-rose-900 text-rose-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  {isHi ? 'रद्द' : 'Cancel'}
                </button>
                <button
                  onClick={handleFinishDrawing}
                  disabled={drawnPoints.length < 3}
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-stone-900 rounded-xl text-xs font-bold disabled:opacity-40 transition cursor-pointer shadow-xs"
                >
                  {isHi ? 'सीमा पूरी करें' : 'Finish Polygon'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Drawing Mode Indicator */}
        {isDrawingMode && (
          <div className="bg-emerald-950 text-emerald-200 px-4 py-2 text-xs flex items-center justify-between border-b border-emerald-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>
                {isHi
                  ? 'नक्शे पर खेत के कोनों पर क्लिक करें। कम से कम 3 बिंदु आवश्यक हैं।'
                  : 'Click points around field boundary. Add at least 3 points.'}
              </span>
            </div>
            <div className="font-bold text-white text-xs">
              {drawnPoints.length} Points • ~{drawnAreaPreview.toFixed(2)} Acres
            </div>
          </div>
        )}

        {/* Leaflet Interactive Map Viewport */}
        <div
          ref={mapContainerRef}
          id="krishi-farm-leaflet-map"
          className="w-full h-[360px] sm:h-[440px] bg-stone-100 z-0"
        />

        {/* Farmer Map Legend */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              {isHi ? 'संकेत (Legend):' : 'Map Legend:'}
            </span>
            <div className="flex items-center gap-1.5 text-stone-700">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-900 border border-emerald-400 inline-block"></span>
              <span>{isHi ? 'खेत का केंद्र' : 'Farm Location'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-800">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 border border-emerald-600 inline-block"></span>
              <span>{isHi ? 'स्वस्थ' : 'Healthy'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-800">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 border border-amber-600 inline-block"></span>
              <span>{isHi ? 'निगरानी' : 'Monitor'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-orange-800">
              <span className="w-2.5 h-2.5 rounded-xs bg-orange-500 border border-orange-600 inline-block"></span>
              <span>{isHi ? 'जोखिम' : 'At Risk'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-800">
              <span className="w-2.5 h-2.5 rounded-xs bg-red-500 border border-red-600 inline-block"></span>
              <span>{isHi ? 'गंभीर' : 'High Risk'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-700">
              <span className="w-2 h-2 rounded-full bg-rose-600 inline-block"></span>
              <span>{isHi ? 'निरीक्षण बिंदु' : 'Observation Point'}</span>
            </div>
          </div>

          <span className="text-[11px] text-stone-500">
            {isHi ? 'खेत का चयन करने के लिए नक्शे पर क्लिक करें' : 'Tap any field on map to inspect'}
          </span>
        </div>
      </div>

      {/* FIELDS MANAGEMENT SECTION ("FIELDS") */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-extrabold text-lg text-stone-900">
              {isHi ? 'खेत सूची (Fields)' : 'Fields in this Farm'}
            </h3>
            <span className="text-xs bg-stone-200 text-stone-800 font-bold px-2 py-0.5 rounded-full">
              {activeFarm.fields.length}
            </span>
          </div>

          <button
            onClick={() => setIsAddFieldOpen(true)}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isHi ? 'खेत जोड़ें' : 'Add Field'}</span>
          </button>
        </div>

        {/* Fields Horizontal Strip / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {activeFarm.fields.map((field) => {
            const palette = HEALTH_COLOR_PALETTE[field.healthStatus] || HEALTH_COLOR_PALETTE.UNKNOWN;
            const isSelected = selectedField?.id === field.id;

            return (
              <div
                key={field.id}
                onClick={() => setSelectedField(field)}
                className={`p-4 rounded-2xl border transition cursor-pointer text-left relative overflow-hidden ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                    : 'bg-white border-stone-200 hover:border-stone-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: palette.stroke }}
                    />
                    <h4 className="font-bold text-stone-900 text-sm">{field.name}</h4>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${palette.badgeBg}`}>
                    {isHi ? palette.labelHi : palette.label}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-600 mb-2">
                  <span className="font-medium text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                    {field.crop}
                  </span>
                  <span className="font-semibold text-stone-700">
                    {formatArea(field.area || 0, field.areaUnit, field.bighaRegion, language)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                  <span>
                    {field.boundary && field.boundary.length >= 3
                      ? isHi ? 'सीमा नक्शे पर चिह्नित' : 'Polygon Boundary'
                      : isHi ? 'सीमा अनिर्धारित' : 'No polygon set'}
                  </span>
                  <span className="font-bold text-stone-700">
                    {field.observationsCount} {isHi ? 'निरीक्षण' : 'obs'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SELECTED FIELD DEEP-DIVE CARD */}
      {selectedField && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-5">
          {/* Header of Selected Field */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-xl text-stone-900">{selectedField.name}</h3>
                <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${activePalette.badgeBg}`}>
                  {isHi ? activePalette.labelHi : activePalette.label}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {isHi ? 'बोई गई फसल:' : 'Current Crop:'}{' '}
                <strong className="text-stone-800">{selectedField.crop}</strong>
                {selectedField.plantingDate ? ` • Sown on ${selectedField.plantingDate}` : ''}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsChangeCropOpen(true)}
                className="text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
                <span>{isHi ? 'फसल बदलें (नया मौसम)' : 'Change Crop (New Season)'}</span>
              </button>

              <button
                onClick={() => onNavigateToCheckCrop(selectedField)}
                className="text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-4 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isHi ? 'फसल जांचें' : 'Check My Crop'}</span>
              </button>
            </div>
          </div>

          {/* Area & Geodesic Calculation Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">
                {isHi ? 'रकबा (Primary Area)' : 'Primary Area'}
              </span>
              <span className="font-extrabold text-stone-900 text-sm sm:text-base">
                {formatArea(selectedField.area || 0, selectedField.areaUnit, selectedField.bighaRegion, language)}
              </span>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">
                {isHi ? 'रोग जोखिम (Disease Risk)' : 'Disease Risk'}
              </span>
              <span
                className={`font-bold text-xs sm:text-sm ${
                  selectedField.diseaseRisk === 'HIGH' || selectedField.diseaseRisk === 'VERY_HIGH'
                    ? 'text-red-600'
                    : selectedField.diseaseRisk === 'MODERATE'
                    ? 'text-amber-600'
                    : 'text-emerald-700'
                }`}
              >
                {selectedField.diseaseRisk || 'LOW'}
              </span>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">
                {isHi ? 'कीट जोखिम (Pest Risk)' : 'Pest Risk'}
              </span>
              <span
                className={`font-bold text-xs sm:text-sm ${
                  selectedField.pestRisk === 'HIGH' || selectedField.pestRisk === 'VERY_HIGH'
                    ? 'text-red-600'
                    : selectedField.pestRisk === 'MODERATE'
                    ? 'text-amber-600'
                    : 'text-emerald-700'
                }`}
              >
                {selectedField.pestRisk || 'LOW'}
              </span>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">
                {isHi ? 'मौसम का तनाव' : 'Weather Stress'}
              </span>
              <span className="font-bold text-stone-800 text-xs sm:text-sm">
                {selectedField.weatherStress || 'LOW'}
              </span>
            </div>
          </div>

          {/* Actionable Field Intelligence Banner */}
          {fieldIntel && (
            <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-700" />
                  {isHi ? 'खेत स्तरीय कृषि मार्गदर्शन (Field Intelligence)' : 'Geospatial Field Intelligence'}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    fieldIntel.monitoringUrgency === 'critical'
                      ? 'bg-red-100 text-red-800'
                      : fieldIntel.monitoringUrgency === 'elevated'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {fieldIntel.monitoringUrgency}
                </span>
              </div>

              <p className="text-xs text-stone-800 font-medium">
                {isHi ? fieldIntel.actionableGuidanceHi : fieldIntel.actionableGuidance}
              </p>

              {fieldIntel.sprayFeasibilityNotice && (
                <div className="pt-2 border-t border-emerald-200/80 text-[11px] font-semibold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    {isHi ? fieldIntel.sprayFeasibilityNoticeHi : fieldIntel.sprayFeasibilityNotice}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Latest Diagnosis / Observation Record */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                {isHi ? 'हालिया फसल निरीक्षण (Latest Observation)' : 'Latest Observation'}
              </span>
              {selectedField.recentDiagnosisDate && (
                <span className="text-[11px] text-stone-500">
                  {new Date(selectedField.recentDiagnosisDate).toLocaleDateString()}
                </span>
              )}
            </div>

            {selectedField.recentDiagnosisTitle ? (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">
                    {selectedField.recentDiagnosisTitle}
                  </h4>
                  <p className="text-xs text-stone-600">
                    {selectedField.healthExplanation || 'Foliage observation logged'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      selectedField.recentDiagnosisSeverity === 'High' || selectedField.recentDiagnosisSeverity === 'Critical'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedField.recentDiagnosisSeverity} Severity
                  </span>
                  {selectedField.recentDiagnosisConfidence && (
                    <span className="text-xs font-semibold text-stone-600">
                      {Math.round(selectedField.recentDiagnosisConfidence * 100)}% Conf.
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs text-stone-600 italic py-1">
                {isHi
                  ? 'इस खेत के लिए अभी कोई डायग्नोसिस दर्ज नहीं है।'
                  : 'No recent diagnosis recorded for this field. Tap "Check My Crop" to capture an image.'}
              </div>
            )}
          </div>

          {/* Field Activity Timeline */}
          {currentTimeline.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-stone-500" />
                <span>{isHi ? 'खेत गतिविधि इतिहास (Timeline)' : 'Field Activity Timeline'}</span>
              </h4>

              <div className="space-y-2 pl-2 border-l-2 border-emerald-200">
                {currentTimeline.map((item) => (
                  <div key={item.id} className="relative pl-3 text-xs">
                    <span className="absolute -left-[11px] top-1 w-2 h-2 rounded-full bg-emerald-600" />
                    <div className="flex items-center justify-between">
                      <strong className="text-stone-900">{isHi ? item.titleHi : item.title}</strong>
                      <span className="text-[10px] text-stone-500">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-stone-600 mt-0.5">
                      {isHi ? item.descriptionHi : item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Row: Ask Expert, IPM Advisory, Crop Check */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
            <button
              onClick={() => onOpenExpertModal(selectedField)}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isHi ? 'विशेषज्ञ से पूछें' : 'Ask an Expert'}</span>
            </button>

            <button
              onClick={onOpenRiskForecast}
              className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{isHi ? 'जोखिम पूर्वानुमान देखें' : 'View Crop Risk'}</span>
            </button>

            <button
              onClick={() => onNavigateToCheckCrop(selectedField)}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <Camera className="w-4 h-4" />
              <span>{isHi ? 'इस खेत की जांच करें' : 'Diagnose This Field'}</span>
            </button>
          </div>
        </div>
      )}

      {/* AREA-LEVEL / COMMUNITY RISK FOUNDATION */}
      <div className="p-4 bg-stone-100 rounded-3xl border border-stone-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            {isHi ? 'क्षेत्रीय कृषि सतर्कता (Area-Level Intelligence)' : 'Area-Level Intelligence'}
          </span>
          <span className="text-[10px] bg-stone-200 text-stone-700 font-bold px-2 py-0.5 rounded-full">
            {activeFarm.district}, {activeFarm.state}
          </span>
        </div>

        <p className="text-xs text-stone-600">
          {isHi ? areaIntel.messageHi : areaIntel.message}
        </p>

        <div className="pt-2 border-t border-stone-200 flex items-center gap-2 text-[11px] text-stone-500">
          <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span>
            {isHi
              ? 'किसानों के खेतों के नाम व सटीक सीमाएं पूर्णतः निजी हैं। केवल आधिकारिक पुष्ट डेटा ही प्रदर्शित किया जाता है।'
              : 'Individual farm data is completely private. Only verified public agricultural advisories appear here.'}
          </span>
        </div>
      </div>

      {/* Modals */}
      <FarmSetupModal
        isOpen={isFarmSetupOpen}
        onClose={() => setIsFarmSetupOpen(false)}
        onSaveFarm={(input) => {
          createFarm(input);
          refreshFarmState();
        }}
        language={language}
      />

      <FarmSetupModal
        isOpen={isEditFarmOpen}
        onClose={() => setIsEditFarmOpen(false)}
        existingFarm={activeFarm}
        onSaveFarm={(input) => {
          updateFarm({
            ...activeFarm,
            name: input.name,
            village: input.village,
            district: input.district,
            state: input.state,
            country: input.country || 'India',
            primaryCrop: input.primaryCrop,
            primaryCropHindi: input.primaryCropHindi,
            location: {
              ...activeFarm.location,
              village: input.village,
              district: input.district,
              state: input.state,
              country: input.country || 'India',
              latitude: input.latitude || activeFarm.location.latitude,
              longitude: input.longitude || activeFarm.location.longitude,
              isGps: input.isGps !== undefined ? input.isGps : activeFarm.location.isGps,
              displayName: formatPrivacyLocation({
                village: input.village,
                district: input.district,
                state: input.state,
                country: input.country || 'India',
              }),
            },
            updatedAt: Date.now(),
          });
          refreshFarmState();
        }}
        language={language}
      />

      <AddFieldModal
        isOpen={isAddFieldOpen}
        onClose={() => setIsAddFieldOpen(false)}
        onAddField={handleAddField}
        drawnBoundary={drawnPoints}
        onStartDrawingOnMap={handleStartDrawBoundary}
        language={language}
      />

      <ChangeCropModal
        isOpen={isChangeCropOpen}
        onClose={() => setIsChangeCropOpen(false)}
        field={selectedField}
        onChangeCrop={(fieldId, newCrop, newCropHindi) => {
          changeFieldCrop(activeFarm.id, fieldId, newCrop, newCropHindi);
          refreshFarmState();
        }}
        language={language}
      />
    </div>
  );
};
