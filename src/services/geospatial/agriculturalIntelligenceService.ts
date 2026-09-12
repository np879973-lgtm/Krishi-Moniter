// Agricultural Map Intelligence & Geospatial Synthesis for Krishi Mentor
// Synthesizes Location + Crop + Weather + Diagnosis into actionable field-level guidance
// Implements privacy-preserving area intelligence foundation without fabricated outbreak data

import { Field, FieldHealthStatus } from '../../types/field';
import { Farm } from '../../types/farm';
import { WeatherData } from '../../types/weather';
import { AreaLevelIntelligence } from '../../types/geospatial';

export interface FieldIntelligenceReport {
  fieldId: string;
  fieldName: string;
  crop: string;
  healthStatus: FieldHealthStatus;
  primaryRiskSummary: string;
  primaryRiskSummaryHi: string;
  actionableGuidance: string;
  actionableGuidanceHi: string;
  monitoringUrgency: 'routine' | 'elevated' | 'critical';
  sprayFeasibilityNotice?: string;
  sprayFeasibilityNoticeHi?: string;
}

/**
 * Synthesizes location, crop, weather context, and recent field diagnoses into actionable field intelligence
 */
export function generateFieldIntelligence(
  field: Field,
  farm: Farm,
  weather?: WeatherData | null
): FieldIntelligenceReport {
  const isHighHumidity = weather && weather.current.humidity > 80;
  const isRainExpected =
    weather &&
    weather.forecast.some((f) => f.rainfallProbability > 60 || f.condition === 'light_rain' || f.condition === 'moderate_rain');
  const isHeatStress = weather && weather.current.temperature > 38;

  let urgency: 'routine' | 'elevated' | 'critical' = 'routine';
  let summary = 'Field status is normal based on current observations.';
  let summaryHi = 'वर्तमान रिकॉर्ड के अनुसार खेत की स्थिति सामान्य है।';
  let guidance = 'Continue standard seasonal crop monitoring and check weekly.';
  let guidanceHi = 'मानक मौसमी निगरानी जारी रखें और साप्ताहिक निरीक्षण करें।';

  // High severity diagnosis present
  if (field.recentDiagnosisSeverity === 'Critical' || field.recentDiagnosisSeverity === 'High') {
    urgency = 'critical';
    summary = `Active alert for ${field.recentDiagnosisTitle || 'crop disorder'}.`;
    summaryHi = `${field.recentDiagnosisTitle || 'फसल रोग'} के लिए सक्रिय चेतावनी।`;

    if (isHighHumidity || isRainExpected) {
      guidance = `High humidity and impending moisture can accelerate spore release. Inspect ${field.crop} daily and prioritize cultural sanitation before any protective spray.`;
      guidanceHi = `उच्च नमी और वर्षा की संभावना से बीमारी तेजी से फैल सकती है। दैनिक रूप से खेत का निरीक्षण करें।`;
    } else {
      guidance = `Isolate affected plants immediately. Review IPM advisory for recommended non-chemical and targeted biological controls.`;
      guidanceHi = `प्रभावित पौधों को चिह्नित करें और समेकित कीट प्रबंधन (IPM) उपायों का पालन करें।`;
    }
  } else if (
    field.recentDiagnosisSeverity === 'Moderate' ||
    field.diseaseRisk === 'HIGH' ||
    field.diseaseRisk === 'MODERATE'
  ) {
    urgency = 'elevated';
    summary = `Elevated disease pressure detected in ${field.name}.`;
    summaryHi = `${field.name} में रोग का मध्यम जोखिम बना हुआ है।`;

    if (isHighHumidity) {
      guidance = `Relative humidity (${weather?.current.humidity}%) favors fungal incubation. Your field may require closer monitoring over the next few days.`;
      guidanceHi = `हवा में अधिक नमी (${weather?.current.humidity}%) फफूंद के लिए अनुकूल है। अगले कुछ दिनों में खेत की निरंतर निगरानी रखें।`;
    } else {
      guidance = `Keep furrows well aerated and scout lower leaf canopies for fresh lesions every 48 hours.`;
      guidanceHi = `पौधों की निचली पत्तियों पर धब्बों की नियमित जांच करें।`;
    }
  } else if (isHeatStress) {
    urgency = 'elevated';
    summary = `High thermal stress (${weather?.current.temperature}°C) recorded.`;
    summaryHi = `अधिक तापमान (${weather?.current.temperature}°C) से पौधों में तनाव।`;
    guidance = `Schedule light irrigations during early morning or late evening to prevent moisture deficit.`;
    guidanceHi = `नमी बनाए रखने के लिए सुबह या शाम के समय हल्की सिंचाई करें।`;
  } else if (field.healthStatus === 'HEALTHY') {
    summary = `Field ${field.name} is in healthy condition.`;
    summaryHi = `खेत ${field.name} स्वस्थ अवस्था में है।`;
    guidance = `Maintain regular balanced nutrient management and beneficial insect habitats.`;
    guidanceHi = `संतुलित पोषण और मित्र कीटों के संरक्षण की प्रथा बनाए रखें।`;
  } else if (field.healthStatus === 'UNKNOWN') {
    summary = `No recent diagnosis recorded for ${field.name}.`;
    summaryHi = `${field.name} के लिए कोई हालिया जांच उपलब्ध नहीं है।`;
    guidance = `Take a photo of any suspect leaves or pest activity to assess field health.`;
    guidanceHi = `स्वास्थ्य जांच के लिए खेत की पत्तियों या कीटों की तस्वीर लेकर AI जांच करें।`;
  }

  // Spray feasibility check based on weather
  let sprayNotice: string | undefined;
  let sprayNoticeHi: string | undefined;

  if (weather) {
    if (weather.current.windSpeed > 20) {
      sprayNotice = '⚠️ Strong winds (>20 km/h) — Spraying will cause excessive droplet drift.';
      sprayNoticeHi = '⚠️ तेज हवा (>20 किमी/घंटा) — छिड़काव से दवा उड़कर नष्ट हो सकती है।';
    } else if (isRainExpected) {
      sprayNotice = '⚠️ Rain expected — Avoid spraying within 4-6 hours of predicted precipitation.';
      sprayNoticeHi = '⚠️ बारिश की संभावना — बारिश से पूर्व छिड़काव करने से दवा धुल जाएगी।';
    } else if (weather.current.temperature > 35) {
      sprayNotice = '⚠️ High temperature — Perform applications in early morning (6-9 AM) to avoid scorching.';
      sprayNoticeHi = '⚠️ तेज धूप — केवल सुबह 6 से 9 बजे के बीच ही छिड़काव करें।';
    }
  }

  return {
    fieldId: field.id,
    fieldName: field.name,
    crop: field.crop,
    healthStatus: field.healthStatus,
    primaryRiskSummary: summary,
    primaryRiskSummaryHi: summaryHi,
    actionableGuidance: guidance,
    actionableGuidanceHi: guidanceHi,
    monitoringUrgency: urgency,
    sprayFeasibilityNotice: sprayNotice,
    sprayFeasibilityNoticeHi: sprayNoticeHi,
  };
}

/**
 * Returns district or block level aggregated signal.
 * Strictly respects privacy and never fabricates outbreak data.
 */
export function getAreaLevelIntelligence(params: {
  scope: 'village' | 'block' | 'district' | 'state';
  district: string;
  state: string;
  crop: string;
}): AreaLevelIntelligence {
  const { scope, district, state, crop } = params;

  // Real, ethical system behavior: only show aggregated signals when verified data exists
  // Do NOT make up numbers of infected farms or false regional outbreaks
  return {
    scope,
    scopeName: `${district}, ${state}`,
    crop,
    isDataSufficient: false,
    message: `Area-level risk information for ${crop} in ${district} is not available yet. Verified signals will appear when official district advisory updates are published.`,
    messageHi: `${district} में ${crop} के लिए क्षेत्रीय जोखिम डेटा अभी उपलब्ध नहीं है। अधिकृत कृषि बुलेटिन जारी होने पर यह यहां प्रदर्शित होगा।`,
    verifiedAlertsCount: 0,
    lastUpdated: Date.now(),
  };
}
