// Weather Types for Krishi Mentor

export type WeatherConditionCode =
  | 'clear'
  | 'mostly_clear'
  | 'partly_cloudy'
  | 'cloudy'
  | 'overcast'
  | 'light_rain'
  | 'moderate_rain'
  | 'heavy_rain'
  | 'thunderstorm'
  | 'drizzle'
  | 'fog'
  | 'windy'
  | 'hot_dry';

import { LocationContext } from './location';
export type { LocationContext };

export interface CurrentWeather {
  temperature: number; // °C
  feelsLike: number; // °C
  humidity: number; // % (0-100)
  rainfall: number; // mm in last hour/today
  windSpeed: number; // km/h
  windDirection: string; // e.g. "N", "NE", "E", "SE", "S", "SW", "W", "NW"
  cloudCover: number; // % (0-100)
  condition: WeatherConditionCode;
  conditionText: string;
  conditionTextHi: string;
  uvIndex?: number;
}

export interface DailyForecast {
  date: string; // YYYY-MM-DD
  dayLabel: string; // "Today", "Tomorrow", "Wed", etc.
  dayLabelHi: string;
  minTemperature: number; // °C
  maxTemperature: number; // °C
  humidity: number; // %
  rainfallProbability: number; // %
  rainfallAmount: number; // mm
  windSpeed: number; // km/h
  condition: WeatherConditionCode;
  conditionText: string;
  conditionTextHi: string;
}

export interface WeatherData {
  current: CurrentWeather;
  forecast: DailyForecast[];
  source: string;
  sourceType: 'live_api' | 'cached' | 'demo';
  fetchedAt: number; // unix ms
  isStale?: boolean;
  location: LocationContext;
  summaryFarmer: string;
  summaryFarmerHi: string;
}

export type WeatherSignalType =
  | 'high_humidity'
  | 'prolonged_wetness'
  | 'heavy_rain'
  | 'rain_forecast'
  | 'heat_stress'
  | 'dry_spell'
  | 'strong_wind'
  | 'cold_snap'
  | 'extended_cloudiness';

export interface AgriculturalWeatherSignal {
  id: string;
  type: WeatherSignalType;
  severity: 'low' | 'moderate' | 'high';
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  impactOnCrops: string;
  impactOnCropsHi: string;
  iconName?: string;
}

export type NetworkStatus = 'online' | 'offline' | 'syncing';
