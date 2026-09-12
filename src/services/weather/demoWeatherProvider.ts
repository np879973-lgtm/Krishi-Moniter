// Isolated Demo Weather Provider for Krishi Mentor
// Provides 10 agricultural test scenarios strictly separated from production data

import { WeatherData, WeatherConditionCode, LocationContext } from '../../types/weather';

export interface WeatherDemoScenario {
  id: string;
  name: string;
  nameHi: string;
  description: string;
  descriptionHi: string;
  iconName: string;
  weather: (location: LocationContext) => WeatherData;
}

const createDemoDates = () => {
  const dates = [];
  const dayNamesEn = ['Today', 'Tomorrow', 'Day +2', 'Day +3', 'Day +4', 'Day +5', 'Day +6'];
  const dayNamesHi = ['आज', 'कल', '+2 दिन', '+3 दिन', '+4 दिन', '+5 दिन', '+6 दिन'];
  const now = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    dates.push({
      date: d.toISOString().split('T')[0],
      dayLabel: dayNamesEn[i],
      dayLabelHi: dayNamesHi[i],
    });
  }
  return dates;
};

export const WEATHER_DEMO_SCENARIOS: WeatherDemoScenario[] = [
  // 1. Clear weather (Ideal for crop spraying & field scouting)
  {
    id: 'clear_spray_ideal',
    name: 'Clear Weather (Ideal for Spraying)',
    nameHi: 'साफ मौसम (छिड़काव व निराई हेतु उपयुक्त)',
    description: 'Mild temperature (25°C), low humidity (48%), gentle breeze (8 km/h). Safe for necessary farm sprays.',
    descriptionHi: 'मध्यम तापमान (25°C), सामान्य आर्द्रता और हल्की हवा। आवश्यक छिड़काव व निराई-गुड़ाई के लिए उत्तम समय।',
    iconName: 'Sun',
    weather: (loc) => {
      const dates = createDemoDates();
      return {
        current: {
          temperature: 25.5,
          feelsLike: 25.0,
          humidity: 48,
          rainfall: 0.0,
          windSpeed: 8.5,
          windDirection: 'NE',
          cloudCover: 15,
          condition: 'clear',
          conditionText: 'Clear and pleasant',
          conditionTextHi: 'साफ और सुहावना मौसम',
          uvIndex: 5,
        },
        forecast: [
          { ...dates[0], minTemperature: 18, maxTemperature: 27, humidity: 50, rainfallProbability: 5, rainfallAmount: 0, windSpeed: 9, condition: 'clear', conditionText: 'Clear sky', conditionTextHi: 'साफ आसमान' },
          { ...dates[1], minTemperature: 19, maxTemperature: 28, humidity: 52, rainfallProbability: 10, rainfallAmount: 0, windSpeed: 10, condition: 'clear', conditionText: 'Sunny', conditionTextHi: 'धूप खिली रहेगी' },
          { ...dates[2], minTemperature: 19, maxTemperature: 28, humidity: 55, rainfallProbability: 10, rainfallAmount: 0, windSpeed: 8, condition: 'partly_cloudy', conditionText: 'Partly sunny', conditionTextHi: 'आंशिक धूप' },
          { ...dates[3], minTemperature: 20, maxTemperature: 29, humidity: 50, rainfallProbability: 5, rainfallAmount: 0, windSpeed: 11, condition: 'clear', conditionText: 'Clear', conditionTextHi: 'साफ' },
          { ...dates[4], minTemperature: 20, maxTemperature: 29, humidity: 48, rainfallProbability: 5, rainfallAmount: 0, windSpeed: 10, condition: 'clear', conditionText: 'Clear', conditionTextHi: 'साफ' },
          { ...dates[5], minTemperature: 18, maxTemperature: 27, humidity: 52, rainfallProbability: 10, rainfallAmount: 0, windSpeed: 9, condition: 'clear', conditionText: 'Clear', conditionTextHi: 'साफ' },
          { ...dates[6], minTemperature: 18, maxTemperature: 28, humidity: 50, rainfallProbability: 5, rainfallAmount: 0, windSpeed: 8, condition: 'clear', conditionText: 'Clear', conditionTextHi: 'साफ' },
        ],
        source: 'Demo Weather Data — Clear Field Scenario',
        sourceType: 'demo',
        fetchedAt: Date.now(),
        location: loc,
        summaryFarmer: 'Clear and dry weather. Favorable for field work and required crop maintenance.',
        summaryFarmerHi: 'मौसम साफ और सूखा रहेगा। खेत में सामान्य कृषि कार्यों व आवश्यक छिड़काव हेतु अनुकूल।',
      };
    },
  },

  // 2. Heavy monsoon rainfall (Rot, blight risk & hold sprays)
  {
    id: 'heavy_monsoon_rain',
    name: 'Heavy Rainfall (Monsoon Downpour)',
    nameHi: 'भारी बारिश (जलभराव व फफूंद जोखिम)',
    description: 'High precipitation (48mm), 92% humidity. Delay chemical applications; ensure field drainage.',
    descriptionHi: 'तेज मानसूनी वर्षा (48mm), 92% आर्द्रता। छिड़काव तुरंत रोकें तथा खेत में जल निकासी सुनिश्चित करें।',
    iconName: 'CloudRain',
    weather: (loc) => {
      const dates = createDemoDates();
      return {
        current: {
          temperature: 24.0,
          feelsLike: 26.5,
          humidity: 92,
          rainfall: 48.0,
          windSpeed: 24.0,
          windDirection: 'SW',
          cloudCover: 95,
          condition: 'heavy_rain',
          conditionText: 'Continuous Heavy Monsoon Rain',
          conditionTextHi: 'लगातार भारी बारिश',
          uvIndex: 1,
        },
        forecast: [
          { ...dates[0], minTemperature: 22, maxTemperature: 26, humidity: 94, rainfallProbability: 95, rainfallAmount: 52, windSpeed: 26, condition: 'heavy_rain', conditionText: 'Heavy rain', conditionTextHi: 'भारी बारिश' },
          { ...dates[1], minTemperature: 22, maxTemperature: 25, humidity: 90, rainfallProbability: 85, rainfallAmount: 34, windSpeed: 22, condition: 'moderate_rain', conditionText: 'Showers', conditionTextHi: 'मध्यम वर्षा' },
          { ...dates[2], minTemperature: 23, maxTemperature: 27, humidity: 88, rainfallProbability: 60, rainfallAmount: 14, windSpeed: 18, condition: 'light_rain', conditionText: 'Light rain', conditionTextHi: 'हल्की बारिश' },
          { ...dates[3], minTemperature: 23, maxTemperature: 28, humidity: 82, rainfallProbability: 40, rainfallAmount: 5, windSpeed: 14, condition: 'cloudy', conditionText: 'Overcast', conditionTextHi: 'बादल छाए रहेंगे' },
          { ...dates[4], minTemperature: 24, maxTemperature: 29, humidity: 78, rainfallProbability: 25, rainfallAmount: 2, windSpeed: 12, condition: 'partly_cloudy', conditionText: 'Partly cloudy', conditionTextHi: 'आंशिक बादल' },
          { ...dates[5], minTemperature: 23, maxTemperature: 29, humidity: 75, rainfallProbability: 20, rainfallAmount: 0, windSpeed: 11, condition: 'partly_cloudy', conditionText: 'Partly cloudy', conditionTextHi: 'आंशिक बादल' },
          { ...dates[6], minTemperature: 24, maxTemperature: 30, humidity: 72, rainfallProbability: 15, rainfallAmount: 0, windSpeed: 10, condition: 'clear', conditionText: 'Clearing up', conditionTextHi: 'मौसम साफ' },
        ],
        source: 'Demo Weather Data — Heavy Rain Scenario',
        sourceType: 'demo',
        fetchedAt: Date.now(),
        location: loc,
        summaryFarmer: 'Heavy downpours expected today and tomorrow. Postpone all spray operations. Ensure open field channels.',
        summaryFarmerHi: 'आज व कल भारी वर्षा की संभावना। किसी भी प्रकार का छिड़काव न करें। मेड़ काटकर खेत से फालतू पानी निकालें।',
      };
    },
  },

  // 3. High humidity & continuous overcast (Fungal incubation paradise)
  {
    id: 'high_humidity_blight',
    name: 'High Humidity & Damp Fog (Fungal Threat)',
    nameHi: 'अत्यधिक नमी व धुंध (फफूंद रोग अनुकूल)',
    description: 'Humidity 88-94%, cloudy conditions for 4 consecutive days. High risk for blight, blast, and rust.',
    descriptionHi: 'लगातार 4 दिनों तक 88-94% नमी और घना बादल। झुलसा, रतुआ व ब्लास्ट फफूंद के तेजी से पनपने के अनुकूल।',
    iconName: 'Droplets',
    weather: (loc) => {
      const dates = createDemoDates();
      return {
        current: {
          temperature: 22.8,
          feelsLike: 23.5,
          humidity: 89,
          rainfall: 2.5,
          windSpeed: 7.0,
          windDirection: 'E',
          cloudCover: 85,
          condition: 'cloudy',
          conditionText: 'Dense overcast with morning mist',
          conditionTextHi: 'घना बादल व सुबह की धुंध',
          uvIndex: 2,
        },
        forecast: [
          { ...dates[0], minTemperature: 18, maxTemperature: 24, humidity: 91, rainfallProbability: 50, rainfallAmount: 4, windSpeed: 8, condition: 'cloudy', conditionText: 'Overcast & damp', conditionTextHi: 'नम व बादल' },
          { ...dates[1], minTemperature: 19, maxTemperature: 25, humidity: 89, rainfallProbability: 45, rainfallAmount: 3, windSpeed: 7, condition: 'cloudy', conditionText: 'Damp overcast', conditionTextHi: 'बादल व नमी' },
          { ...dates[2], minTemperature: 18, maxTemperature: 25, humidity: 86, rainfallProbability: 40, rainfallAmount: 2, windSpeed: 9, condition: 'cloudy', conditionText: 'Cloudy', conditionTextHi: 'घने बादल' },
          { ...dates[3], minTemperature: 19, maxTemperature: 26, humidity: 84, rainfallProbability: 30, rainfallAmount: 1, windSpeed: 10, condition: 'partly_cloudy', conditionText: 'Partly sunny', conditionTextHi: 'आंशिक धूप' },
          { ...dates[4], minTemperature: 20, maxTemperature: 27, humidity: 80, rainfallProbability: 20, rainfallAmount: 0, windSpeed: 8, condition: 'partly_cloudy', conditionText: 'Partly sunny', conditionTextHi: 'धूप-छांव' },
          { ...dates[5], minTemperature: 19, maxTemperature: 27, humidity: 76, rainfallProbability: 15, rainfallAmount: 0, windSpeed: 9, condition: 'clear', conditionText: 'Clear', conditionTextHi: 'साफ' },
          { ...dates[6], minTemperature: 19, maxTemperature: 28, humidity: 72, rainfallProbability: 10, rainfallAmount: 0, windSpeed: 8, condition: 'clear', conditionText: 'Sunny', conditionTextHi: 'साफ' },
        ],
        source: 'Demo Weather Data — High Humidity Fungal Threat',
        sourceType: 'demo',
        fetchedAt: Date.now(),
        location: loc,
        summaryFarmer: 'Prolonged high moisture and dense cloudiness. Microclimate strongly favors leaf spots and rust spore multiplication.',
        summaryFarmerHi: 'लगातार उच्च नमी और बादल। यह मौसम पत्तियों पर धब्बा और रतुआ जैसे फफूंद रोगों के फैलाव के लिए अत्यंत अनुकूल है।',
      };
    },
  },

  // 4. Heatwave & Dry Conditions (Sucking pests flare-up)
  {
    id: 'heatwave_dry_pests',
    name: 'Heatwave & Dry Spell (Sucking Pest Flare-up)',
    nameHi: 'तीव्र लू व सूखा (चूसक कीटों का प्रकोप)',
    description: 'Temperature 41.5°C, humidity 24%. Sucking pests like Whiteflies, Thrips, and Mites multiply rapidly.',
    descriptionHi: 'तापमान 41.5°C, शुष्क हवा व कम नमी। सफेद मक्खी, थ्रिप्स व माइट्स कीटों की संख्या में तीव्र वृद्धि का खतरा।',
    iconName: 'Flame',
    weather: (loc) => {
      const dates = createDemoDates();
      return {
        current: {
          temperature: 41.5,
          feelsLike: 44.0,
          humidity: 24,
          rainfall: 0.0,
          windSpeed: 19.0,
          windDirection: 'W',
          cloudCover: 5,
          condition: 'hot_dry',
          conditionText: 'Severe Heatwave / Loo Winds',
          conditionTextHi: 'तीव्र लू व गर्म हवाएं',
          uvIndex: 10,
        },
        forecast: [
          { ...dates[0], minTemperature: 28, maxTemperature: 42, humidity: 22, rainfallProbability: 0, rainfallAmount: 0, windSpeed: 20, condition: 'hot_dry', conditionText: 'Severe heat', conditionTextHi: 'तीव्र गर्मी/लू' },
          { ...dates[1], minTemperature: 29, maxTemperature: 43, humidity: 20, rainfallProbability: 0, rainfallAmount: 0, windSpeed: 22, condition: 'hot_dry', conditionText: 'Extreme heat', conditionTextHi: 'अत्यधिक गर्मी' },
          { ...dates[2], minTemperature: 28, maxTemperature: 41, humidity: 25, rainfallProbability: 5, rainfallAmount: 0, windSpeed: 18, condition: 'hot_dry', conditionText: 'Hot and dry', conditionTextHi: 'गर्म व सूखा' },
          { ...dates[3], minTemperature: 27, maxTemperature: 40, humidity: 28, rainfallProbability: 5, rainfallAmount: 0, windSpeed: 16, condition: 'clear', conditionText: 'Hot', conditionTextHi: 'तेज धूप' },
          { ...dates[4], minTemperature: 26, maxTemperature: 39, humidity: 30, rainfallProbability: 10, rainfallAmount: 0, windSpeed: 15, condition: 'clear', conditionText: 'Sunny and hot', conditionTextHi: 'धूप व गर्मी' },
          { ...dates[5], minTemperature: 26, maxTemperature: 38, humidity: 32, rainfallProbability: 10, rainfallAmount: 0, windSpeed: 14, condition: 'clear', conditionText: 'Hot', conditionTextHi: 'गर्म' },
          { ...dates[6], minTemperature: 25, maxTemperature: 38, humidity: 35, rainfallProbability: 15, rainfallAmount: 0, windSpeed: 12, condition: 'clear', conditionText: 'Warm', conditionTextHi: 'गर्म' },
        ],
        source: 'Demo Weather Data — Heatwave & Drought Scenario',
        sourceType: 'demo',
        fetchedAt: Date.now(),
        location: loc,
        summaryFarmer: 'Extreme heat and dry gusty winds. Irrigate in early morning or evening. Inspect leaf undersides for whitefly and thrips.',
        summaryFarmerHi: 'अत्यधिक गर्मी और शुष्क लू। सुबह या शाम हल्की सिंचाई करें। पत्तों के नीचे सफेद मक्खी व थ्रिप्स की जांच करें।',
      };
    },
  },

  // 5. Strong Pre-Monsoon Winds (Lodging & Spray Drift)
  {
    id: 'strong_winds_drift',
    name: 'Strong Gusty Winds (Lodging & Spray Drift)',
    nameHi: 'तेज अंधड़ व आंधी (फसल गिरने व बहाव का खतरा)',
    description: 'Wind speed 42 km/h with gusts up to 58 km/h. Do not spray chemicals; stake tall crops.',
    descriptionHi: 'हवा की गति 42 किमी/घंटा। छिड़काव का बहाव होने से प्रभाव खत्म होगा। लंबी फसलों (मक्का, गन्ना) में सहारा दें।',
    iconName: 'Wind',
    weather: (loc) => {
      const dates = createDemoDates();
      return {
        current: {
          temperature: 31.0,
          feelsLike: 33.0,
          humidity: 62,
          rainfall: 1.0,
          windSpeed: 42.0,
          windDirection: 'NW',
          cloudCover: 70,
          condition: 'windy',
          conditionText: 'High winds with dust squalls',
          conditionTextHi: 'तेज हवाएं व अंधड़',
          uvIndex: 4,
        },
        forecast: [
          { ...dates[0], minTemperature: 25, maxTemperature: 32, humidity: 65, rainfallProbability: 40, rainfallAmount: 3, windSpeed: 44, condition: 'windy', conditionText: 'Squally winds', conditionTextHi: 'आंधी तूफान' },
          { ...dates[1], minTemperature: 24, maxTemperature: 31, humidity: 68, rainfallProbability: 50, rainfallAmount: 8, windSpeed: 38, condition: 'windy', conditionText: 'Breezy & squally', conditionTextHi: 'तेज हवा' },
          { ...dates[2], minTemperature: 24, maxTemperature: 33, humidity: 60, rainfallProbability: 25, rainfallAmount: 0, windSpeed: 25, condition: 'partly_cloudy', conditionText: 'Moderate breeze', conditionTextHi: 'मध्यम हवा' },
          { ...dates[3], minTemperature: 25, maxTemperature: 34, humidity: 55, rainfallProbability: 15, rainfallAmount: 0, windSpeed: 18, condition: 'clear', conditionText: 'Breeze easing', conditionTextHi: 'हवा धीमी' },
          { ...dates[4], minTemperature: 25, maxTemperature: 34, humidity: 52, rainfallProbability: 10, rainfallAmount: 0, windSpeed: 14, condition: 'clear', conditionText: 'Normal breeze', conditionTextHi: 'सामान्य हवा' },
          { ...dates[5], minTemperature: 24, maxTemperature: 33, humidity: 50, rainfallProbability: 10, rainfallAmount: 0, windSpeed: 12, condition: 'clear', conditionText: 'Gentle breeze', conditionTextHi: 'धीमी हवा' },
          { ...dates[6], minTemperature: 24, maxTemperature: 33, humidity: 50, rainfallProbability: 10, rainfallAmount: 0, windSpeed: 10, condition: 'clear', conditionText: 'Clear', conditionTextHi: 'साफ' },
        ],
        source: 'Demo Weather Data — High Wind Squall Scenario',
        sourceType: 'demo',
        fetchedAt: Date.now(),
        location: loc,
        summaryFarmer: 'Strong gusty winds. Never apply foliar sprays in winds over 15 km/h to prevent dangerous chemical drift.',
        summaryFarmerHi: 'तेज आंधी व हवा। 15 किमी/घंटे से अधिक हवा में कभी छिड़काव न करें, दवा उड़कर व्यर्थ जाएगी व पड़ोसी फसल को नुकसान हो सकता है।',
      };
    },
  },
];
