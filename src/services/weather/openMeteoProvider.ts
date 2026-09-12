// Open-Meteo Weather Provider for Krishi Mentor
// Real-world, open, high-precision agrometeorological forecasting API
// Free for non-commercial & educational use, zero API key required

import { WeatherData, WeatherConditionCode, LocationContext, DailyForecast } from '../../types/weather';

function mapWmoCode(code: number): { condition: WeatherConditionCode; textEn: string; textHi: string } {
  switch (code) {
    case 0:
      return { condition: 'clear', textEn: 'Clear Sky', textHi: 'साफ आसमान' };
    case 1:
      return { condition: 'mostly_clear', textEn: 'Mostly Clear', textHi: 'मुख्यतः साफ' };
    case 2:
      return { condition: 'partly_cloudy', textEn: 'Partly Cloudy', textHi: 'आंशिक बादल' };
    case 3:
      return { condition: 'overcast', textEn: 'Overcast', textHi: 'घने बादल' };
    case 45:
    case 48:
      return { condition: 'fog', textEn: 'Fog / Mist', textHi: 'कोहरा / धुंध' };
    case 51:
    case 53:
    case 55:
      return { condition: 'drizzle', textEn: 'Light Drizzle', textHi: 'बूंदाबांदी' };
    case 61:
      return { condition: 'light_rain', textEn: 'Light Rain', textHi: 'हल्की बारिश' };
    case 63:
      return { condition: 'moderate_rain', textEn: 'Moderate Rain', textHi: 'मध्यम बारिश' };
    case 65:
      return { condition: 'heavy_rain', textEn: 'Heavy Rain', textHi: 'भारी बारिश' };
    case 80:
    case 81:
    case 82:
      return { condition: 'moderate_rain', textEn: 'Rain Showers', textHi: 'वर्षा की बौछारें' };
    case 95:
    case 96:
    case 99:
      return { condition: 'thunderstorm', textEn: 'Thunderstorm', textHi: 'गरज के साथ बारिश' };
    default:
      return { condition: 'partly_cloudy', textEn: 'Partly Cloudy', textHi: 'आंशिक बादल' };
  }
}

function degreeToCardinal(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

export async function fetchOpenMeteoWeather(location: LocationContext): Promise<WeatherData> {
  const lat = location.latitude ?? 30.9010;
  const lon = location.longitude ?? 75.8573;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Weather server responded with status: ${response.status}`);
    }

    const data = await response.json();

    const currentWmo = mapWmoCode(data.current?.weather_code ?? 0);
    const temp = Math.round((data.current?.temperature_2m ?? 26) * 10) / 10;
    const feelsLike = Math.round((data.current?.apparent_temperature ?? temp) * 10) / 10;
    const humidity = Math.round(data.current?.relative_humidity_2m ?? 60);
    const rainfall = Math.round((data.current?.precipitation ?? 0) * 10) / 10;
    const windSpeed = Math.round((data.current?.wind_speed_10m ?? 8) * 10) / 10;
    const windDir = degreeToCardinal(data.current?.wind_direction_10m ?? 0);
    const cloudCover = Math.round(data.current?.cloud_cover ?? 20);

    // Build 7-day forecast
    const daily = data.daily;
    const forecast: DailyForecast[] = [];
    const dayLabelsEn = ['Today', 'Tomorrow', 'Day +2', 'Day +3', 'Day +4', 'Day +5', 'Day +6'];
    const dayLabelsHi = ['आज', 'कल', '+2 दिन', '+3 दिन', '+4 दिन', '+5 दिन', '+6 दिन'];

    if (daily && Array.isArray(daily.time)) {
      const len = Math.min(daily.time.length, 7);
      for (let i = 0; i < len; i++) {
        const wmo = mapWmoCode(daily.weather_code?.[i] ?? 0);
        forecast.push({
          date: daily.time[i],
          dayLabel: dayLabelsEn[i] || daily.time[i],
          dayLabelHi: dayLabelsHi[i] || daily.time[i],
          minTemperature: Math.round(daily.temperature_2m_min?.[i] ?? 18),
          maxTemperature: Math.round(daily.temperature_2m_max?.[i] ?? 28),
          humidity: humidity, // approximate baseline if daily rh not provided
          rainfallProbability: Math.round(daily.precipitation_probability_max?.[i] ?? 0),
          rainfallAmount: Math.round((daily.precipitation_sum?.[i] ?? 0) * 10) / 10,
          windSpeed: Math.round(daily.wind_speed_10m_max?.[i] ?? 10),
          condition: wmo.condition,
          conditionText: wmo.textEn,
          conditionTextHi: wmo.textHi,
        });
      }
    }

    // Build farmer summary
    let summaryEn = 'Weather is steady. Monitor soil moisture and inspect foliage.';
    let summaryHi = 'मौसम स्थिर है। मिट्टी की नमी व पत्तों की स्थिति की निगरानी करें।';

    const maxRainTomorrow = forecast[1]?.rainfallAmount ?? 0;
    const rainProbTomorrow = forecast[1]?.rainfallProbability ?? 0;

    if (rainfall > 10 || maxRainTomorrow > 15 || rainProbTomorrow > 70) {
      summaryEn = 'Rain expected soon. Hold fertilizer and pesticide applications until foliage dries.';
      summaryHi = 'जल्द बारिश की संभावना है। पत्ते सूखने तक खाद व कीटनाशक छिड़काव स्थगित रखें।';
    } else if (humidity > 80) {
      summaryEn = 'High humidity creates favorable conditions for fungal spore spread. Scout lower canopy.';
      summaryHi = 'उच्च नमी फफूंद संक्रमण के लिए अनुकूल है। पौधों के निचले हिस्से का नियमित निरीक्षण करें।';
    } else if (temp > 38) {
      summaryEn = 'Hot and dry conditions. Provide timely irrigation to avoid moisture stress.';
      summaryHi = 'मौसम गर्म और सूखा है। नमी तनाव से बचाव हेतु शाम या सुबह हल्की सिंचाई करें।';
    } else if (windSpeed > 25) {
      summaryEn = 'Strong winds expected. Avoid spray drift and inspect field borders.';
      summaryHi = 'तेज हवाओं की संभावना। दवा का छिड़काव न करें ताकि बहाव न हो।';
    }

    return {
      current: {
        temperature: temp,
        feelsLike,
        humidity,
        rainfall,
        windSpeed,
        windDirection: windDir,
        cloudCover,
        condition: currentWmo.condition,
        conditionText: currentWmo.textEn,
        conditionTextHi: currentWmo.textHi,
      },
      forecast,
      source: 'Open-Meteo Agrometeorology (Live)',
      sourceType: 'live_api',
      fetchedAt: Date.now(),
      location,
      summaryFarmer: summaryEn,
      summaryFarmerHi: summaryHi,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
