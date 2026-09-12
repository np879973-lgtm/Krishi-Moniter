// Farm and Field Management Service for Krishi Mentor
// Supports multiple farms, fields, crop rotations, field health derivation, and timeline events

import { Farm, FarmCreateInput } from '../../types/farm';
import { Field, FieldObservation, FieldTimelineEvent, FieldHealthStatus } from '../../types/field';
import { LocationContext } from '../../types/location';
import { LatLngTuple } from '../../types/geospatial';
import { DiagnosisResult } from '../../types';
import { calculatePolygonArea, calculatePolygonCentroid } from '../geospatial/geospatialService';
import { getSavedFarmLocation, formatPrivacyLocation } from '../location/locationService';

const FARMS_STORAGE_KEY = 'krishi_mentor_farms_v2';
const ACTIVE_FARM_ID_KEY = 'krishi_mentor_active_farm_id';
const OBSERVATIONS_STORAGE_KEY = 'krishi_mentor_field_observations_v1';
const TIMELINE_STORAGE_KEY = 'krishi_mentor_field_timeline_v1';

// Preset realistic boundary coordinates for Demo Farm in Ludhiana agricultural belt
const DEMO_LUDHIANA_LAT = 30.8752;
const DEMO_LUDHIANA_LNG = 75.8421;

// ~2.5 Acres polygon (approx 10,117 m²)
const DEMO_FIELD_A_POLYGON: LatLngTuple[] = [
  [30.8752, 75.8421],
  [30.8763, 75.8422],
  [30.8762, 75.8434],
  [30.8751, 75.8433],
];

// ~1.2 Acres polygon (approx 4,856 m²)
const DEMO_FIELD_B_POLYGON: LatLngTuple[] = [
  [30.8745, 75.8436],
  [30.8750, 75.8436],
  [30.8750, 75.8447],
  [30.8745, 75.8447],
];

// ~1.0 Acre polygon (approx 4,046 m²)
const DEMO_FIELD_C_POLYGON: LatLngTuple[] = [
  [30.8738, 75.8420],
  [30.8744, 75.8420],
  [30.8744, 75.8430],
  [30.8738, 75.8430],
];

export const DEMO_FARM: Farm = {
  id: 'demo-farm-punjab',
  name: 'Kisan Adarsh Farm',
  village: 'Gill Kalan',
  district: 'Ludhiana',
  state: 'Punjab',
  country: 'India',
  location: {
    village: 'Gill Kalan',
    district: 'Ludhiana',
    state: 'Punjab',
    country: 'India',
    latitude: DEMO_LUDHIANA_LAT,
    longitude: DEMO_LUDHIANA_LNG,
    displayName: 'Gill Kalan, Ludhiana, Punjab',
    isGps: false,
    privacyProtected: true,
  },
  primaryCrop: 'Wheat',
  primaryCropHindi: 'गेहूं (Wheat)',
  crops: ['Wheat', 'Tomato', 'Mustard'],
  createdAt: Date.now() - 30 * 24 * 3600 * 1000,
  updatedAt: Date.now(),
  isDemo: true,
  fields: [
    {
      id: 'demo-field-1',
      farmId: 'demo-farm-punjab',
      name: 'North Wheat Field',
      crop: 'Wheat',
      cropHindi: 'गेहूं',
      area: 2.5,
      areaUnit: 'acre',
      bighaRegion: 'punjab_haryana',
      boundary: DEMO_FIELD_A_POLYGON,
      plantingDate: '2025-11-15',
      status: 'ACTIVE',
      healthStatus: 'AT_RISK',
      healthExplanation: 'Yellow Rust spore alert active; high humidity and cool night dew creating favorable incubation conditions.',
      healthExplanationHi: 'पीला रतुआ (Yellow Rust) अलर्ट सक्रिय; उच्च आर्द्रता व रात की ओस से संक्रमण का खतरा।',
      diseaseRisk: 'HIGH',
      pestRisk: 'LOW',
      weatherStress: 'MODERATE',
      recentDiagnosisId: 'demo-diag-rust',
      recentDiagnosisTitle: 'Yellow Rust / Stripe Rust',
      recentDiagnosisSeverity: 'Moderate',
      recentDiagnosisConfidence: 0.88,
      recentDiagnosisDate: Date.now() - 4 * 3600 * 1000,
      observationsCount: 3,
      createdAt: Date.now() - 25 * 24 * 3600 * 1000,
      updatedAt: Date.now(),
    },
    {
      id: 'demo-field-2',
      farmId: 'demo-farm-punjab',
      name: 'Vegetable Block',
      crop: 'Tomato',
      cropHindi: 'टमाटर',
      area: 1.2,
      areaUnit: 'acre',
      bighaRegion: 'punjab_haryana',
      boundary: DEMO_FIELD_B_POLYGON,
      plantingDate: '2025-12-01',
      status: 'ACTIVE',
      healthStatus: 'MONITOR',
      healthExplanation: 'Minor lower foliage Early Blight spots recorded; isolated to edge rows. Regular field scouting advised.',
      healthExplanationHi: 'निचली पत्तियों पर अगेती झुलसा (Early Blight) के धब्बे; नियमित निगरानी जरूरी।',
      diseaseRisk: 'MODERATE',
      pestRisk: 'MODERATE',
      weatherStress: 'LOW',
      recentDiagnosisId: 'demo-diag-blight',
      recentDiagnosisTitle: 'Early Blight (Alternaria)',
      recentDiagnosisSeverity: 'Low',
      recentDiagnosisConfidence: 0.84,
      recentDiagnosisDate: Date.now() - 2 * 24 * 3600 * 1000,
      observationsCount: 2,
      createdAt: Date.now() - 20 * 24 * 3600 * 1000,
      updatedAt: Date.now(),
    },
    {
      id: 'demo-field-3',
      farmId: 'demo-farm-punjab',
      name: 'Canal Strip Mustard',
      crop: 'Mustard',
      cropHindi: 'सरसों',
      area: 1.0,
      areaUnit: 'acre',
      bighaRegion: 'punjab_haryana',
      boundary: DEMO_FIELD_C_POLYGON,
      plantingDate: '2025-10-20',
      status: 'ACTIVE',
      healthStatus: 'HEALTHY',
      healthExplanation: 'Canopy clean with optimal pod formation. Aphid population suppressed by natural beneficial predators.',
      healthExplanationHi: 'फसल स्वस्थ, फलियां अच्छी अवस्था में। प्राकृतिक मित्र कीटों द्वारा माहू नियंत्रित।',
      diseaseRisk: 'LOW',
      pestRisk: 'LOW',
      weatherStress: 'LOW',
      observationsCount: 1,
      createdAt: Date.now() - 20 * 24 * 3600 * 1000,
      updatedAt: Date.now(),
    },
  ],
};

export const DEMO_OBSERVATIONS: FieldObservation[] = [
  {
    id: 'demo-obs-1',
    farmId: 'demo-farm-punjab',
    fieldId: 'demo-field-1',
    fieldName: 'North Wheat Field',
    latitude: 30.8756,
    longitude: 75.8427,
    timestamp: Date.now() - 4 * 3600 * 1000,
    crop: 'Wheat',
    cropHindi: 'गेहूं',
    problemType: 'Disease',
    diagnosis: 'Yellow Rust / Stripe Rust',
    diagnosisHindi: 'पीला रतुआ (Stripe Rust)',
    severity: 'Moderate',
    confidence: 0.88,
    pestCount: null,
    weatherSummary: 'Humid, 24°C, Leaf wetness high',
    riskOutlook: 'High spread risk due to overcast skies',
    status: 'AT_RISK',
    notes: 'Yellowish powdery pustules in linear stripes on flag leaf.',
  },
  {
    id: 'demo-obs-2',
    farmId: 'demo-farm-punjab',
    fieldId: 'demo-field-1',
    fieldName: 'North Wheat Field',
    latitude: 30.8759,
    longitude: 75.8424,
    timestamp: Date.now() - 26 * 3600 * 1000,
    crop: 'Wheat',
    cropHindi: 'गेहूं',
    problemType: 'Healthy',
    diagnosis: 'Healthy Vigorous Tillers',
    diagnosisHindi: 'स्वस्थ कल्ले',
    severity: 'Low',
    confidence: 0.94,
    pestCount: 0,
    weatherSummary: 'Sunny, 22°C',
    status: 'HEALTHY',
    notes: 'Uniform vegetative growth across southern quadrant.',
  },
  {
    id: 'demo-obs-3',
    farmId: 'demo-farm-punjab',
    fieldId: 'demo-field-2',
    fieldName: 'Vegetable Block',
    latitude: 30.8747,
    longitude: 75.8441,
    timestamp: Date.now() - 48 * 3600 * 1000,
    crop: 'Tomato',
    cropHindi: 'टमाटर',
    problemType: 'Disease',
    diagnosis: 'Early Blight (Alternaria solani)',
    diagnosisHindi: 'अगेती झुलसा',
    severity: 'Low',
    confidence: 0.84,
    pestCount: null,
    weatherSummary: '28°C, Humidity 65%',
    riskOutlook: 'Moderate risk; prune lower leaves touching soil',
    status: 'MONITOR',
    notes: 'Concentric ring spots on oldest lower leaves.',
  },
];

export const DEMO_TIMELINE: FieldTimelineEvent[] = [
  {
    id: 'tl-1',
    fieldId: 'demo-field-1',
    timestamp: Date.now() - 4 * 3600 * 1000,
    type: 'DIAGNOSIS',
    title: 'Yellow Rust Observed',
    titleHi: 'पीला रतुआ का लक्षण दर्ज',
    description: 'AI detected stripe rust pustules on flag leaf with 88% confidence. Recommended bio-fungicide scouting.',
    descriptionHi: 'AI ने 88% सटीकता के साथ पत्तियों पर रतुआ के धब्बे पहचाने। जैविक रोकथाम की सलाह।',
    severity: 'Moderate',
    healthStatus: 'AT_RISK',
  },
  {
    id: 'tl-2',
    fieldId: 'demo-field-1',
    timestamp: Date.now() - 18 * 3600 * 1000,
    type: 'WEATHER_ALERT',
    title: 'High Humidity Weather Spike',
    titleHi: 'उच्च आर्द्रता मौसम चेतावनी',
    description: 'Extended night fog and 92% relative humidity increased fungal germination potential.',
    descriptionHi: 'लगातार कोहरे व 92% नमी से फफूंद पनपने का अनुकूल माहौल बना।',
    severity: 'High',
    healthStatus: 'AT_RISK',
  },
  {
    id: 'tl-3',
    fieldId: 'demo-field-1',
    timestamp: Date.now() - 48 * 3600 * 1000,
    type: 'SCOUTING',
    title: 'Field Scouting Completed',
    titleHi: 'खेत का निरीक्षण संपन्न',
    description: 'Southern furrow checked; tillering density healthy with no major lodging.',
    descriptionHi: 'खेत का निरीक्षण; कल्ले स्वस्थ पाए गए।',
    severity: 'Low',
    healthStatus: 'HEALTHY',
  },
];

/**
 * Derives field health status from diagnosis, severity, risk, and weather signals
 */
export function deriveFieldHealthStatus(params: {
  recentSeverity?: string;
  diseaseRisk?: string;
  pestRisk?: string;
  weatherStress?: string;
  hasDiagnosis?: boolean;
}): FieldHealthStatus {
  const { recentSeverity, diseaseRisk, pestRisk, weatherStress, hasDiagnosis } = params;

  if (!hasDiagnosis && !diseaseRisk && !pestRisk && !weatherStress) {
    return 'UNKNOWN';
  }

  // High Risk triggers
  if (
    recentSeverity === 'Critical' ||
    recentSeverity === 'High' ||
    diseaseRisk === 'VERY_HIGH' ||
    diseaseRisk === 'HIGH' ||
    pestRisk === 'VERY_HIGH' ||
    pestRisk === 'HIGH'
  ) {
    return 'HIGH_RISK';
  }

  // At Risk triggers
  if (
    recentSeverity === 'Moderate' ||
    diseaseRisk === 'MODERATE' ||
    pestRisk === 'MODERATE' ||
    weatherStress === 'HIGH'
  ) {
    return 'AT_RISK';
  }

  // Monitor triggers
  if (
    recentSeverity === 'Low' ||
    weatherStress === 'MODERATE' ||
    diseaseRisk === 'LOW' && pestRisk === 'LOW'
  ) {
    return 'MONITOR';
  }

  // Healthy
  if (recentSeverity === 'Healthy' || (diseaseRisk === 'LOW' && pestRisk === 'LOW' && weatherStress === 'LOW')) {
    return 'HEALTHY';
  }

  return 'UNKNOWN';
}

/**
 * Reads all farms from storage
 */
export function getAllFarms(): Farm[] {
  try {
    const raw = localStorage.getItem(FARMS_STORAGE_KEY);
    if (raw) {
      const farms: Farm[] = JSON.parse(raw);
      if (Array.isArray(farms) && farms.length > 0) {
        return farms;
      }
    }
  } catch (err) {
    console.error('Failed to read farms:', err);
  }

  // Default: return user farm initialized from LocationContext
  const loc = getSavedFarmLocation();
  const defaultUserFarm: Farm = {
    id: 'my-farm-primary',
    name: 'My Farm',
    village: loc.village || '',
    district: loc.district || 'Ludhiana',
    state: loc.state || 'Punjab',
    country: loc.country || 'India',
    location: loc,
    primaryCrop: 'Wheat',
    primaryCropHindi: 'गेहूं',
    crops: ['Wheat'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isDemo: false,
    fields: [
      {
        id: 'field-1',
        farmId: 'my-farm-primary',
        name: 'Field A',
        crop: 'Wheat',
        cropHindi: 'गेहूं',
        area: 2.0,
        areaUnit: 'acre',
        bighaRegion: 'punjab_haryana',
        status: 'ACTIVE',
        healthStatus: 'UNKNOWN',
        healthExplanation: 'No recent diagnosis recorded for this field. Tap "Check My Crop" to start.',
        healthExplanationHi: 'इस खेत के लिए कोई हालिया जांच दर्ज नहीं है। शुरू करने के लिए "फसल जांचें" दबाएं।',
        observationsCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
  };

  saveFarms([defaultUserFarm]);
  return [defaultUserFarm];
}

/**
 * Saves all farms to storage
 */
export function saveFarms(farms: Farm[]): void {
  try {
    localStorage.setItem(FARMS_STORAGE_KEY, JSON.stringify(farms));
  } catch (err) {
    console.error('Failed to persist farms:', err);
  }
}

/**
 * Retrieves the currently active farm
 */
export function getActiveFarm(): Farm {
  const farms = getAllFarms();
  const activeId = localStorage.getItem(ACTIVE_FARM_ID_KEY);
  if (activeId) {
    const found = farms.find((f) => f.id === activeId);
    if (found) return found;
  }
  return farms[0] || DEMO_FARM;
}

/**
 * Sets the active farm
 */
export function setActiveFarmId(farmId: string): void {
  try {
    localStorage.setItem(ACTIVE_FARM_ID_KEY, farmId);
  } catch (err) {
    console.warn('Failed to set active farm:', err);
  }
}

/**
 * Creates a new farm
 */
export function createFarm(input: FarmCreateInput): Farm {
  const farms = getAllFarms();
  const newId = `farm-${Date.now()}`;

  const lat = input.latitude || 30.9010;
  const lng = input.longitude || 75.8573;

  const loc: LocationContext = {
    village: input.village?.trim() || '',
    district: input.district.trim(),
    state: input.state.trim(),
    country: input.country || 'India',
    latitude: lat,
    longitude: lng,
    displayName: formatPrivacyLocation({
      village: input.village,
      district: input.district,
      state: input.state,
      country: input.country || 'India',
    }),
    isGps: input.isGps || false,
    privacyProtected: true,
  };

  const initialField: Field = {
    id: `field-${Date.now()}`,
    farmId: newId,
    name: input.initialFieldName?.trim() || 'Field 1',
    crop: input.primaryCrop,
    cropHindi: input.primaryCropHindi,
    area: input.initialFieldArea || 2.0,
    areaUnit: input.initialFieldAreaUnit || 'acre',
    status: 'ACTIVE',
    healthStatus: 'UNKNOWN',
    healthExplanation: 'New field registered. Ready for crop diagnosis and monitoring.',
    healthExplanationHi: 'नया खेत जोड़ा गया। फसल जांच व निगरानी के लिए तैयार।',
    observationsCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const newFarm: Farm = {
    id: newId,
    name: input.name.trim() || 'My Farm',
    village: input.village?.trim(),
    district: input.district.trim(),
    state: input.state.trim(),
    country: input.country || 'India',
    location: loc,
    primaryCrop: input.primaryCrop,
    primaryCropHindi: input.primaryCropHindi,
    crops: [input.primaryCrop],
    fields: [initialField],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isDemo: false,
  };

  saveFarms([newFarm, ...farms]);
  setActiveFarmId(newId);
  return newFarm;
}

/**
 * Updates an existing farm
 */
export function updateFarm(farm: Farm): void {
  const farms = getAllFarms();
  const updated = farms.map((f) => (f.id === farm.id ? { ...farm, updatedAt: Date.now() } : f));
  saveFarms(updated);
}

/**
 * Adds a field to a farm
 */
export function addFieldToFarm(
  farmId: string,
  fieldData: {
    name: string;
    crop: string;
    cropHindi?: string;
    area?: number;
    areaUnit?: 'acre' | 'hectare' | 'bigha' | 'sqm';
    boundary?: LatLngTuple[];
    plantingDate?: string;
  }
): Field {
  const farms = getAllFarms();
  const farmIndex = farms.findIndex((f) => f.id === farmId);
  if (farmIndex === -1) throw new Error('Farm not found');

  const farm = farms[farmIndex];
  const newFieldId = `field-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

  // If boundary is provided, compute approximate area automatically if area is not given
  let finalArea = fieldData.area;
  let finalUnit = fieldData.areaUnit || 'acre';

  if ((!finalArea || finalArea <= 0) && fieldData.boundary && fieldData.boundary.length >= 3) {
    const calc = calculatePolygonArea(fieldData.boundary);
    finalArea = calc.acres;
    finalUnit = 'acre';
  }

  const newField: Field = {
    id: newFieldId,
    farmId,
    name: fieldData.name.trim() || `Field ${farm.fields.length + 1}`,
    crop: fieldData.crop,
    cropHindi: fieldData.cropHindi,
    area: finalArea,
    areaUnit: finalUnit,
    boundary: fieldData.boundary,
    plantingDate: fieldData.plantingDate,
    status: 'ACTIVE',
    healthStatus: 'UNKNOWN',
    healthExplanation: 'Field registered. Ready for crop diagnosis and health monitoring.',
    healthExplanationHi: 'खेत पंजीकृत। फसल जांच और स्वास्थ्य निगरानी के लिए तैयार।',
    observationsCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const updatedFields = [...farm.fields, newField];
  const updatedCrops = Array.from(new Set([...farm.crops, fieldData.crop]));

  farms[farmIndex] = {
    ...farm,
    fields: updatedFields,
    crops: updatedCrops,
    updatedAt: Date.now(),
  };

  saveFarms(farms);
  return newField;
}

/**
 * Updates an existing field
 */
export function updateFieldInFarm(farmId: string, updatedField: Field): void {
  const farms = getAllFarms();
  const farmIndex = farms.findIndex((f) => f.id === farmId);
  if (farmIndex === -1) return;

  const farm = farms[farmIndex];
  const fieldIndex = farm.fields.findIndex((f) => f.id === updatedField.id);
  if (fieldIndex === -1) return;

  const updatedFields = [...farm.fields];
  updatedFields[fieldIndex] = {
    ...updatedField,
    updatedAt: Date.now(),
  };

  farms[farmIndex] = {
    ...farm,
    fields: updatedFields,
    updatedAt: Date.now(),
  };

  saveFarms(farms);
}

/**
 * Changes crop for a field (e.g. for seasonal rotation), preserving history
 */
export function changeFieldCrop(
  farmId: string,
  fieldId: string,
  newCrop: string,
  newCropHindi?: string
): void {
  const farms = getAllFarms();
  const farm = farms.find((f) => f.id === farmId);
  if (!farm) return;

  const field = farm.fields.find((f) => f.id === fieldId);
  if (!field) return;

  const oldCrop = field.crop;
  const updatedField: Field = {
    ...field,
    crop: newCrop,
    cropHindi: newCropHindi,
    healthStatus: 'UNKNOWN',
    healthExplanation: `Crop rotated from ${oldCrop} to ${newCrop} for the new season.`,
    healthExplanationHi: `नए मौसम के लिए फसल को ${oldCrop} से बदलकर ${newCrop} किया गया।`,
    updatedAt: Date.now(),
  };

  // Add timeline event
  addFieldTimelineEvent({
    id: `tl-${Date.now()}`,
    fieldId,
    timestamp: Date.now(),
    type: 'CROP_ROTATION',
    title: `Crop Rotated to ${newCrop}`,
    titleHi: `फसल चक्र: ${newCrop} की बुवाई`,
    description: `Seasonal transition from ${oldCrop} to ${newCrop}. Historical observations for ${oldCrop} preserved.`,
    descriptionHi: `मौसम के अनुसार फसल बदली गई (${oldCrop} से ${newCrop})। पुराना रिकॉर्ड सुरक्षित है।`,
    healthStatus: 'HEALTHY',
  });

  updateFieldInFarm(farmId, updatedField);
}

/**
 * Deletes a field
 */
export function deleteFieldFromFarm(farmId: string, fieldId: string): void {
  const farms = getAllFarms();
  const farmIndex = farms.findIndex((f) => f.id === farmId);
  if (farmIndex === -1) return;

  const farm = farms[farmIndex];
  const updatedFields = farm.fields.filter((f) => f.id !== fieldId);

  farms[farmIndex] = {
    ...farm,
    fields: updatedFields,
    updatedAt: Date.now(),
  };

  saveFarms(farms);
}

/**
 * Adds an observation to a field (from diagnosis or manual scouting)
 */
export function addFieldObservation(observation: FieldObservation): void {
  try {
    const raw = localStorage.getItem(OBSERVATIONS_STORAGE_KEY);
    const existing: FieldObservation[] = raw ? JSON.parse(raw) : [];
    const updated = [observation, ...existing.filter((o) => o.id !== observation.id)].slice(0, 100);
    localStorage.setItem(OBSERVATIONS_STORAGE_KEY, JSON.stringify(updated));

    // Update field's health status and observation count
    const farms = getAllFarms();
    for (const farm of farms) {
      if (farm.id === observation.farmId) {
        const field = farm.fields.find((f) => f.id === observation.fieldId);
        if (field) {
          const updatedField: Field = {
            ...field,
            healthStatus: observation.status,
            healthExplanation: `${observation.diagnosis} (${observation.severity})`,
            healthExplanationHi: `${observation.diagnosisHindi || observation.diagnosis} (${observation.severity})`,
            recentDiagnosisId: observation.reportId,
            recentDiagnosisTitle: observation.diagnosis,
            recentDiagnosisSeverity: observation.severity,
            recentDiagnosisConfidence: observation.confidence,
            recentDiagnosisDate: observation.timestamp,
            observationsCount: (field.observationsCount || 0) + 1,
            updatedAt: Date.now(),
          };
          updateFieldInFarm(farm.id, updatedField);
          break;
        }
      }
    }

    // Append to timeline
    addFieldTimelineEvent({
      id: `tl-${Date.now()}`,
      fieldId: observation.fieldId,
      timestamp: observation.timestamp,
      type: 'DIAGNOSIS',
      title: `${observation.diagnosis} Detected`,
      titleHi: `${observation.diagnosisHindi || observation.diagnosis} दर्ज`,
      description: `Severity: ${observation.severity}, Confidence: ${Math.round(observation.confidence * 100)}%. ${observation.riskOutlook || ''}`,
      descriptionHi: `गंभीरता: ${observation.severity}, सटीकता: ${Math.round(observation.confidence * 100)}%।`,
      severity: observation.severity,
      healthStatus: observation.status,
    });
  } catch (err) {
    console.error('Failed to add observation:', err);
  }
}

/**
 * Returns observations for a field
 */
export function getFieldObservations(fieldId: string): FieldObservation[] {
  try {
    const raw = localStorage.getItem(OBSERVATIONS_STORAGE_KEY);
    const existing: FieldObservation[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((o) => o.fieldId === fieldId);
    if (filtered.length > 0) return filtered;
  } catch (err) {
    console.error('Failed to read observations:', err);
  }

  // Return demo observations if viewing demo farm
  return DEMO_OBSERVATIONS.filter((o) => o.fieldId === fieldId);
}

/**
 * Adds an event to the field timeline
 */
export function addFieldTimelineEvent(event: FieldTimelineEvent): void {
  try {
    const raw = localStorage.getItem(TIMELINE_STORAGE_KEY);
    const existing: FieldTimelineEvent[] = raw ? JSON.parse(raw) : [];
    const updated = [event, ...existing.filter((e) => e.id !== event.id)].slice(0, 100);
    localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to add timeline event:', err);
  }
}

/**
 * Gets timeline events for a field
 */
export function getFieldTimeline(fieldId: string): FieldTimelineEvent[] {
  try {
    const raw = localStorage.getItem(TIMELINE_STORAGE_KEY);
    const existing: FieldTimelineEvent[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((e) => e.fieldId === fieldId);
    if (filtered.length > 0) return filtered;
  } catch (err) {
    console.error('Failed to read timeline:', err);
  }

  return DEMO_TIMELINE.filter((e) => e.fieldId === fieldId);
}

/**
 * Records an AI diagnosis directly into a field's observation and timeline record
 */
export function recordDiagnosisForField(
  farmId: string,
  fieldId: string,
  diagnosis: DiagnosisResult
): FieldObservation {
  const farms = getAllFarms();
  const farm = farms.find((f) => f.id === farmId);
  const field = farm?.fields.find((f) => f.id === fieldId);

  let lat = farm?.location.latitude || 30.9010;
  let lng = farm?.location.longitude || 75.8573;
  if (field?.boundary && field.boundary.length > 0) {
    lat = field.boundary[0][0];
    lng = field.boundary[0][1];
  }

  let healthStatus: FieldHealthStatus = 'MONITOR';
  if (diagnosis.overallStatus === 'healthy' || diagnosis.problemType === 'Healthy') {
    healthStatus = 'HEALTHY';
  } else if (diagnosis.severity === 'Critical' || diagnosis.severity === 'High') {
    healthStatus = 'HIGH_RISK';
  } else if (diagnosis.severity === 'Moderate') {
    healthStatus = 'AT_RISK';
  }

  const obs: FieldObservation = {
    id: `obs-${Date.now()}`,
    farmId,
    fieldId,
    fieldName: field?.name || 'Field',
    reportId: diagnosis.id,
    latitude: lat,
    longitude: lng,
    timestamp: Date.now(),
    crop: diagnosis.crop,
    cropHindi: diagnosis.cropHindi,
    problemType: diagnosis.problemType,
    diagnosis: diagnosis.diagnosis,
    diagnosisHindi: diagnosis.diagnosisHindi,
    severity: diagnosis.severity,
    confidence: diagnosis.confidence,
    status: healthStatus,
    imageUri: diagnosis.imageUri,
    riskOutlook: diagnosis.riskOutlookSummary?.primaryDriver,
  };

  addFieldObservation(obs);
  return obs;
}

/**
 * Loads Demo Farm into local state for rapid testing
 */
export function loadDemoFarm(): Farm {
  const farms = getAllFarms();
  const existingDemo = farms.find((f) => f.id === DEMO_FARM.id);
  if (!existingDemo) {
    const updated = [DEMO_FARM, ...farms];
    saveFarms(updated);
  }
  setActiveFarmId(DEMO_FARM.id);
  return DEMO_FARM;
}
