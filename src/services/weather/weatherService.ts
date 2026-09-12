// Weather Service for Krishi Mentor
// Provider-independent abstraction with caching, staleness tracking, and agricultural signal detection

import { WeatherData, LocationContext, AgriculturalWeatherSignal, NetworkStatus } from '../../types/weather';
import { fetchOpenMeteoWeather } from './openMeteoProvider';
import { WEATHER_DEMO_SCENARIOS } from './demoWeatherProvider';

const CACHE_KEY = 'krishi_mentor_cached_weather';
const STALE_THRESHOLD_MS = 3 * 60 * 60 * 1000; // 3 hours

export interface WeatherFetchOptions {
  forceRefresh?: boolean;
  demoScenarioId?: string;
}

export interface WeatherResult {
  data: WeatherData;
  signals: AgriculturalWeatherSignal[];
  networkStatus: NetworkStatus;
  freshnessLabel: string;
  freshnessLabelHi: string;
}

export function getCachedWeather(): WeatherData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WeatherData;
    const age = Date.now() - parsed.fetchedAt;
    parsed.isStale = age > STALE_THRESHOLD_MS;
    return parsed;
  } catch {
    return null;
  }
}

export function setCachedWeather(data: WeatherData): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Unable to cache weather:', err);
  }
}

export function clearWeatherCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (err) {
    console.warn('Unable to clear weather cache:', err);
  }
}

export function getFreshnessLabel(fetchedAt: number, language: 'en' | 'hi' = 'en'): string {
  const diffMs = Date.now() - fetchedAt;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);

  if (language === 'hi') {
    if (minutes < 2) return 'अभी अपडेट किया गया';
    if (minutes < 60) return `${minutes} मिनट पहले अपडेट हुआ`;
    if (hours < 24) return `${hours} घंटे पहले अपडेट हुआ (पुराना डेटा)`;
    return 'डेटा पुराना हो सकता है (रीफ्रेश करें)';
  }

  if (minutes < 2) return 'Updated just now';
  if (minutes < 60) return `Updated ${minutes} minutes ago`;
  if (hours < 24) return `Last updated ${hours}h ago (cached)`;
  return 'Weather data may be outdated (refresh available)';
}

/**
 * Identify agricultural weather signals that affect disease, pest pressure, and field spraying
 */
export function extractAgriculturalWeatherSignals(weather: WeatherData): AgriculturalWeatherSignal[] {
  const signals: AgriculturalWeatherSignal[] = [];
  const current = weather.current;
  const forecast = weather.forecast || [];

  // 1. High Humidity Signal
  if (current.humidity >= 80) {
    signals.push({
      id: 'high_humidity',
      type: 'high_humidity',
      severity: current.humidity >= 90 ? 'high' : 'moderate',
      title: 'High Atmospheric Humidity',
      titleHi: 'उच्च वायुमंडलीय आर्द्रता (नमी)',
      description: `Relative humidity is currently ${current.humidity}%. Free moisture on leaves provides ideal spore germination.`,
      descriptionHi: `वर्तमान में हवा में नमी ${current.humidity}% है। पत्तों पर निरंतर नमी फफूंद बीजाणुओं के अंकुरण के लिए अनुकूल है।`,
      impactOnCrops: 'Elevates threat of foliar fungal pathogens (Blight, Mildew, Rust).',
      impactOnCropsHi: 'पत्ती झुलसा, रतुआ व फफूंद जनित रोगों का फैलाव तेज हो सकता है।',
      iconName: 'Droplets',
    });
  }

  // 2. Prolonged Wetness / Consecutive Rain Forecast
  const rainyDays = forecast.filter((d) => d.rainfallAmount > 5 || d.rainfallProbability > 65);
  if (rainyDays.length >= 2 || current.rainfall >= 20) {
    signals.push({
      id: 'prolonged_wetness',
      type: 'prolonged_wetness',
      severity: 'high',
      title: 'Prolonged Leaf Wetness & Rainfall',
      titleHi: 'लगातार बारिश व पत्तों पर गीलापन',
      description: `Rainfall forecast across ${rainyDays.length} upcoming days. Extended canopy wetness accelerates bacterial rots.`,
      descriptionHi: `अगले ${rainyDays.length} दिनों में बारिश की संभावना। पत्तों का लगातार गीला रहना जीवाणु व सड़न रोगों को बढ़ाता है।`,
      impactOnCrops: 'Postpone chemical applications to prevent pesticide wash-off. Ensure adequate furrow drainage.',
      impactOnCropsHi: 'दवा का छिड़काव रोकें ताकि बारिश में दवा न बहे। खेत में जलभराव न होने दें।',
      iconName: 'CloudRain',
    });
  }

  // 3. Heat Stress / Dry spell
  if (current.temperature >= 38) {
    signals.push({
      id: 'heat_stress',
      type: 'heat_stress',
      severity: current.temperature >= 41 ? 'high' : 'moderate',
      title: 'Heat Stress & Dry Atmosphere',
      titleHi: 'उच्च तापमान व लू (थर्मल स्ट्रेस)',
      description: `Ambient temperature at ${current.temperature}°C with low humidity (${current.humidity}%).`,
      descriptionHi: `तापमान ${current.temperature}°C तक पहुंच गया है। शुष्क हवा से पौधों में वाष्पीकरण बढ़ता है।`,
      impactOnCrops: 'Accelerates proliferation of sucking pests (Whitefly, Thrips, Mites). Pollen sterility risk in flowering crops.',
      impactOnCropsHi: 'सफेद मक्खी, थ्रिप्स व माइट्स कीट तेजी से पनपते हैं। फूल आने वाली फसलों में दाना बनने पर असर।',
      iconName: 'Flame',
    });
  }

  // 4. Strong Wind Signal
  if (current.windSpeed >= 20) {
    signals.push({
      id: 'strong_wind',
      type: 'strong_wind',
      severity: current.windSpeed >= 35 ? 'high' : 'moderate',
      title: 'Strong Gusty Winds',
      titleHi: 'तेज हवा की गति',
      description: `Wind speed is ${current.windSpeed} km/h (Direction: ${current.windDirection}).`,
      descriptionHi: `हवा की गति ${current.windSpeed} किमी/घंटा है (दिशा: ${current.windDirection})।`,
      impactOnCrops: 'High risk of chemical spray drift into non-target areas. Risk of lodging in tall crops (Maize, Sugarcane).',
      impactOnCropsHi: 'छिड़काव की गई दवा उड़ने से प्रभावहीन होगी। मक्का व गन्ने की फसल झुकने का खतरा।',
      iconName: 'Wind',
    });
  }

  return signals;
}

/**
 * Main method to retrieve weather data from Provider or Cache or Demo Scenario
 */
export async function getWeatherData(
  location: LocationContext,
  options: WeatherFetchOptions = {}
): Promise<WeatherResult> {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  // Handle explicit demo scenario
  if (options.demoScenarioId) {
    const scenario = WEATHER_DEMO_SCENARIOS.find((s) => s.id === options.demoScenarioId) || WEATHER_DEMO_SCENARIOS[0];
    const demoData = scenario.weather(location);
    const signals = extractAgriculturalWeatherSignals(demoData);
    return {
      data: demoData,
      signals,
      networkStatus: isOnline ? 'online' : 'offline',
      freshnessLabel: 'Demo Weather Data (Testing Mode)',
      freshnessLabelHi: 'डेमो मौसम डेटा (परीक्षण मोड)',
    };
  }

  // If not forcing refresh, check existing cache
  const cached = getCachedWeather();
  if (!options.forceRefresh && cached && !cached.isStale) {
    // Check if cached location matches closely
    const sameLoc =
      cached.location.district === location.district ||
      (Math.abs((cached.location.latitude ?? 0) - (location.latitude ?? 0)) < 0.2 &&
        Math.abs((cached.location.longitude ?? 0) - (location.longitude ?? 0)) < 0.2);

    if (sameLoc) {
      const signals = extractAgriculturalWeatherSignals(cached);
      return {
        data: cached,
        signals,
        networkStatus: isOnline ? 'online' : 'offline',
        freshnessLabel: getFreshnessLabel(cached.fetchedAt, 'en'),
        freshnessLabelHi: getFreshnessLabel(cached.fetchedAt, 'hi'),
      };
    }
  }

  // If offline and we have any cached data, return it with offline status
  if (!isOnline) {
    if (cached) {
      cached.source = `${cached.source} (Offline Cache)`;
      const signals = extractAgriculturalWeatherSignals(cached);
      return {
        data: cached,
        signals,
        networkStatus: 'offline',
        freshnessLabel: `Offline — ${getFreshnessLabel(cached.fetchedAt, 'en')}`,
        freshnessLabelHi: `ऑफ़लाइन — ${getFreshnessLabel(cached.fetchedAt, 'hi')}`,
      };
    } else {
      // Fallback to first demo scenario if completely offline without cache
      const fallback = WEATHER_DEMO_SCENARIOS[0].weather(location);
      fallback.source = 'Offline Standby Data';
      const signals = extractAgriculturalWeatherSignals(fallback);
      return {
        data: fallback,
        signals,
        networkStatus: 'offline',
        freshnessLabel: 'Offline — Standby Data',
        freshnessLabelHi: 'ऑफ़लाइन — स्टैंडबाय डेटा',
      };
    }
  }

  // Fetch live weather from Open-Meteo
  try {
    const liveData = await fetchOpenMeteoWeather(location);
    setCachedWeather(liveData);
    const signals = extractAgriculturalWeatherSignals(liveData);

    return {
      data: liveData,
      signals,
      networkStatus: 'online',
      freshnessLabel: getFreshnessLabel(liveData.fetchedAt, 'en'),
      freshnessLabelHi: getFreshnessLabel(liveData.fetchedAt, 'hi'),
    };
  } catch (error) {
    console.warn('Failed to fetch live weather from Open-Meteo:', error);

    // Fallback to cache if available
    if (cached) {
      cached.source = `${cached.source} (Last Known Cache)`;
      const signals = extractAgriculturalWeatherSignals(cached);
      return {
        data: cached,
        signals,
        networkStatus: 'syncing',
        freshnessLabel: 'Live update failed — showing cached weather',
        freshnessLabelHi: 'लाइव अपडेट विफल — सहेजा गया मौसम दिखाया जा रहा है',
      };
    }

    // Isolated demo fallback if first time and network failed
    const fallback = WEATHER_DEMO_SCENARIOS[0].weather(location);
    fallback.source = 'Demo Weather (Live Service Unavailable)';
    const signals = extractAgriculturalWeatherSignals(fallback);
    return {
      data: fallback,
      signals,
      networkStatus: 'syncing',
      freshnessLabel: 'We couldn’t retrieve current weather. Showing demo data.',
      freshnessLabelHi: 'वर्तमान मौसम प्राप्त नहीं हो सका। डेमो डेटा दिखाया जा रहा है।',
    };
  }
}

let activeDemoScenarioId: string | null = null;

export const weatherService = {
  getWeather: async (location?: LocationContext, options?: WeatherFetchOptions): Promise<WeatherData> => {
    const loc = location || {
      district: 'Ludhiana',
      state: 'Punjab',
      country: 'India',
      latitude: 30.9010,
      longitude: 75.8573,
      displayName: 'Ludhiana, Punjab',
      isGps: false,
    };
    const res = await getWeatherData(loc, {
      demoScenarioId: activeDemoScenarioId || options?.demoScenarioId,
      ...options,
    });
    return res.data;
  },
  getWeatherResult: async (location?: LocationContext, options?: WeatherFetchOptions): Promise<WeatherResult> => {
    const loc = location || {
      district: 'Ludhiana',
      state: 'Punjab',
      country: 'India',
      latitude: 30.9010,
      longitude: 75.8573,
      displayName: 'Ludhiana, Punjab',
      isGps: false,
    };
    return getWeatherData(loc, {
      demoScenarioId: activeDemoScenarioId || options?.demoScenarioId,
      ...options,
    });
  },
  extractAgriculturalSignals: (weather: WeatherData) => extractAgriculturalWeatherSignals(weather),
  getNetworkStatus: (): NetworkStatus => (typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'online'),
  getDataFreshnessLabel: (weather: WeatherData, lang: 'en' | 'hi' = 'en') => getFreshnessLabel(weather.fetchedAt, lang),
  setDemoScenario: (id: string | null) => {
    activeDemoScenarioId = id;
  },
  getActiveDemoScenario: () => activeDemoScenarioId,
};
