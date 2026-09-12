// Agricultural Risk Forecasting Engine for Krishi Mentor
// Combines: Crop + AI Diagnosis + Weather + Location + Prior History
// Produces calibrated, transparent, and actionable risk assessments

import {
  RiskAssessment,
  RiskEngineInput,
  RiskFactor,
  RiskTimelinePoint,
  AgriculturalAlert,
  SpecificProblemRisk,
  RiskLevel,
  RiskRecommendedActions,
} from '../../types/risk';
import { mapScoreToRiskLevel, RISK_WEIGHTS } from './riskConfig';
import { getCropRiskProfile, CropRiskModel } from './cropRiskKnowledge';
import { extractAgriculturalWeatherSignals } from '../weather/weatherService';

export function computeAgriculturalRisk(input: RiskEngineInput): RiskAssessment {
  const { cropName, cropHindi = '', currentWeather, forecast, location, currentDiagnosis, previousReports = [] } = input;

  const cropProfile: CropRiskModel = getCropRiskProfile(cropName);
  const weatherSignals = extractAgriculturalWeatherSignals({
    current: currentWeather,
    forecast,
    source: 'Engine evaluation',
    sourceType: 'live_api',
    fetchedAt: Date.now(),
    location,
    summaryFarmer: '',
    summaryFarmerHi: '',
  });

  const factors: RiskFactor[] = [];
  let diseaseScore = 15; // baseline low
  let pestScore = 15;
  let stressScore = 10;

  // 1. Evaluate Weather Factor: Humidity
  const humidity = currentWeather.humidity;
  if (humidity >= 85) {
    diseaseScore += 35;
    factors.push({
      id: 'high_rh',
      name: 'Very High Relative Humidity',
      nameHi: 'अत्यधिक उच्च आर्द्रता (नमी)',
      category: 'weather',
      detail: `Current humidity is ${humidity}%. Persistent leaf surface moisture accelerates fungal spore germination.`,
      detailHi: `वर्तमान में हवा में नमी ${humidity}% है। पत्तियों पर लगातार गीलापन फफूंद बीजाणुओं को तेजी से बढ़ाता है।`,
      isFavorableForProblem: true,
    });
  } else if (humidity >= 75) {
    diseaseScore += 20;
    factors.push({
      id: 'moderate_rh',
      name: 'Elevated Canopy Humidity',
      nameHi: 'बढ़ी हुई नमी',
      category: 'weather',
      detail: `Humidity is ${humidity}%. Moderate leaf wetness favorable for foliar leaf spots.`,
      detailHi: `नमी ${humidity}% है। पत्ती पर धब्बे वाले रोगों के लिए अनुकूल वातावरण।`,
      isFavorableForProblem: true,
    });
  } else if (humidity <= 40) {
    pestScore += 20;
    factors.push({
      id: 'dry_rh',
      name: 'Dry Atmospheric Conditions',
      nameHi: 'शुष्क मौसम',
      category: 'weather',
      detail: `Humidity is low (${humidity}%). Sucking pests (whitefly, thrips, mites) proliferate in dry weather.`,
      detailHi: `नमी मात्र ${humidity}% है। शुष्क मौसम में रस चूसक कीट (सफेद मक्खी, थ्रिप्स) तेजी से बढ़ते हैं।`,
      isFavorableForProblem: true,
    });
  }

  // 2. Evaluate Weather Factor: Rainfall in Next 48 Hours
  const next48hRain = (forecast[0]?.rainfallAmount ?? 0) + (forecast[1]?.rainfallAmount ?? 0);
  const next48hProb = Math.max(forecast[0]?.rainfallProbability ?? 0, forecast[1]?.rainfallProbability ?? 0);

  if (next48hRain >= 25 || currentWeather.rainfall >= 25 || next48hProb >= 80) {
    diseaseScore += 25;
    pestScore -= 10; // rain washes pests
    stressScore += 20;
    factors.push({
      id: 'heavy_rain_risk',
      name: 'Heavy Rain / Wet Canopy Forecast',
      nameHi: 'भारी बारिश व जलभराव का अनुमान',
      category: 'weather',
      detail: `Rainfall forecast: ~${Math.round(next48hRain)}mm in upcoming 48 hours. Risk of water splash bacterial spread and spray washoff.`,
      detailHi: `अगले 48 घंटों में लगभग ${Math.round(next48hRain)} मिमी बारिश का अनुमान। दवा का छिड़काव धुलने का खतरा।`,
      isFavorableForProblem: true,
    });
  } else if (next48hRain >= 5 || next48hProb >= 50) {
    diseaseScore += 15;
    factors.push({
      id: 'intermittent_rain',
      name: 'Intermittent Showers Forecast',
      nameHi: 'रुक-रुक कर बारिश का अनुमान',
      category: 'weather',
      detail: `Rain showers forecasted (${Math.round(next48hRain)}mm). Extends daily leaf wetness duration.`,
      detailHi: `हल्की बारिश का अनुमान (${Math.round(next48hRain)} मिमी)। पत्तियों पर नमी की अवधि बढ़ेगी।`,
      isFavorableForProblem: true,
    });
  }

  // 3. Evaluate Temperature Window
  const temp = currentWeather.temperature;
  if (temp >= cropProfile.generalWeatherStress.heatThreshold) {
    stressScore += 35;
    pestScore += 20;
    factors.push({
      id: 'heat_stress_factor',
      name: `High Temperature Stress (${temp}°C)`,
      nameHi: `उच्च तापमान तनाव (${temp}°C)`,
      category: 'weather',
      detail: `Temperature exceeds ${cropProfile.generalWeatherStress.heatThreshold}°C. Potential blossom drop and severe sucking insect reproduction.`,
      detailHi: `तापमान ${cropProfile.generalWeatherStress.heatThreshold}°C से अधिक है। फूलों का झड़ना व चूसक कीटों का प्रकोप संभव।`,
      isFavorableForProblem: true,
    });
  } else if (temp <= cropProfile.generalWeatherStress.coldThreshold) {
    stressScore += 25;
    diseaseScore += 15;
    factors.push({
      id: 'cold_stress_factor',
      name: `Cold Snap / Dew Factor (${temp}°C)`,
      nameHi: `सर्द मौसम व ओस (${temp}°C)`,
      category: 'weather',
      detail: `Cold night temperatures slow crop vigor while morning dew sustains rust and blight spores.`,
      detailHi: `ठंडा मौसम पौधे की वृद्धि धीमा करता है तथा सुबह की ओस फफूंद बीजाणुओं को जीवित रखती है।`,
      isFavorableForProblem: true,
    });
  }

  // 4. Evaluate Wind Factor
  if (currentWeather.windSpeed >= 25) {
    stressScore += 20;
    factors.push({
      id: 'wind_speed_risk',
      name: `High Wind Speed (${currentWeather.windSpeed} km/h)`,
      nameHi: `तेज हवा की गति (${currentWeather.windSpeed} किमी/घंटा)`,
      category: 'weather',
      detail: `Strong winds cause pesticide spray drift and physical leaf friction abrasion.`,
      detailHi: `तेज हवा से कीटनाशक का बहाव होता है और पत्तियों में रगड़ से घाव बन सकते हैं।`,
      isFavorableForProblem: true,
    });
  }

  // 5. Evaluate Crop-Specific Disease Vulnerability
  const focalDisease = cropProfile.diseases[0];
  if (focalDisease) {
    const isTempFavorable = temp >= focalDisease.minTemp && temp <= focalDisease.maxTemp;
    const isHumidFavorable = humidity >= focalDisease.minHumidity;
    if (isTempFavorable && isHumidFavorable) {
      diseaseScore += 20;
      factors.push({
        id: 'crop_pathogen_favorable',
        name: `Weather Favorable for ${focalDisease.name}`,
        nameHi: `${focalDisease.nameHi} के अनुकूल मौसम`,
        category: 'crop_susceptibility',
        detail: focalDisease.favorableConditionsEn,
        detailHi: focalDisease.favorableConditionsHi,
        isFavorableForProblem: true,
      });
    }
  }

  // 6. Evaluate Crop-Specific Pest Vulnerability
  const focalPest = cropProfile.pests[0];
  if (focalPest) {
    const isPestTempFavorable = temp >= focalPest.minTemp && temp <= focalPest.maxTemp;
    const isDryFavorable = focalPest.maxHumidity ? humidity <= focalPest.maxHumidity : true;
    if (isPestTempFavorable && isDryFavorable && next48hRain < 5) {
      pestScore += 18;
      factors.push({
        id: 'crop_pest_favorable',
        name: `Microclimate Supports ${focalPest.name}`,
        nameHi: `${focalPest.nameHi} की वृद्धि के अनुकूल सूक्ष्म-मौसम`,
        category: 'crop_susceptibility',
        detail: focalPest.favorableConditionsEn,
        detailHi: focalPest.favorableConditionsHi,
        isFavorableForProblem: true,
      });
    }
  }

  // 7. Integrate AI Diagnosis (if present!)
  let isDiagnosisConnected = false;
  let diagnosisTitle = '';
  let diagnosisSeverity = '';

  if (currentDiagnosis) {
    isDiagnosisConnected = true;
    diagnosisTitle = currentDiagnosis.diagnosis;
    diagnosisSeverity = currentDiagnosis.severity;

    const probType = currentDiagnosis.problemType;
    const sev = currentDiagnosis.severity;

    let sevMultiplier = 1.0;
    if (sev === 'Critical') sevMultiplier = 2.0;
    else if (sev === 'High') sevMultiplier = 1.6;
    else if (sev === 'Moderate') sevMultiplier = 1.2;
    else sevMultiplier = 0.8;

    if (probType === 'Disease') {
      diseaseScore = Math.min(100, Math.round(diseaseScore * sevMultiplier + 20));
      factors.push({
        id: 'prior_diagnosis_disease',
        name: `Active Symptom Detected: ${currentDiagnosis.diagnosis}`,
        nameHi: `खेत में सक्रिय लक्षण पहचाने गए: ${currentDiagnosis.diagnosisHindi || currentDiagnosis.diagnosis}`,
        category: 'prior_diagnosis',
        detail: `Severity was assessed as ${sev}. Combined with prevailing humidity (${humidity}%), pathogen transmission risk increases.`,
        detailHi: `रोग की गंभीरता '${sev}' पाई गई है। वर्तमान मौसम के साथ रोग तेजी से फैलने की आशंका है।`,
        isFavorableForProblem: true,
      });
    } else if (probType === 'Pest') {
      pestScore = Math.min(100, Math.round(pestScore * sevMultiplier + 20));
      factors.push({
        id: 'prior_diagnosis_pest',
        name: `Pest Infestation Detected: ${currentDiagnosis.diagnosis}`,
        nameHi: `कीट प्रकोप पहचाना गया: ${currentDiagnosis.diagnosisHindi || currentDiagnosis.diagnosis}`,
        category: 'prior_diagnosis',
        detail: `Confirmed presence of ${currentDiagnosis.diagnosis}. Current ambient conditions may facilitate colony expansion.`,
        detailHi: `${currentDiagnosis.diagnosis} की पुष्टि हुई है। वर्तमान मौसम कीटों की अगली पीढ़ी के फैलाव में सहायक हो सकता है।`,
        isFavorableForProblem: true,
      });
    } else if (probType === 'Environmental Stress') {
      stressScore = Math.min(100, stressScore + 30);
    }
  }

  // Check previous reports in history
  const previousSameCrop = previousReports.filter(
    (r) => r.crop.toLowerCase() === cropName.toLowerCase() && r.id !== currentDiagnosis?.id
  );
  if (previousSameCrop.length > 0) {
    const recentProblem = previousSameCrop[0];
    factors.push({
      id: 'historical_recurrent_risk',
      name: `Historical Problem Pattern on Farm`,
      nameHi: `खेत में पूर्व समस्या का इतिहास`,
      category: 'prior_diagnosis',
      detail: `Prior diagnosis recorded: ${recentProblem.diagnosis} (${new Date(recentProblem.timestamp).toLocaleDateString()}). Pathogen inoculum may persist in field residue.`,
      detailHi: `पूर्व में भी इस खेत में ${recentProblem.diagnosisHindi || recentProblem.diagnosis} दर्ज हुआ था। खेत में फफूंद के अंश बचे हो सकते हैं।`,
      isFavorableForProblem: true,
    });
  }

  // Clamp individual scores between 5 and 95
  diseaseScore = Math.max(5, Math.min(95, diseaseScore));
  pestScore = Math.max(5, Math.min(95, pestScore));
  stressScore = Math.max(5, Math.min(95, stressScore));

  // Compute Overall Risk Score
  let overallScore = Math.round(diseaseScore * 0.45 + pestScore * 0.35 + stressScore * 0.20);
  if (isDiagnosisConnected && currentDiagnosis?.severity === 'Critical') {
    overallScore = Math.max(overallScore, 82);
  } else if (isDiagnosisConnected && currentDiagnosis?.severity === 'High') {
    overallScore = Math.max(overallScore, 68);
  }

  const overallRiskLevel = mapScoreToRiskLevel(overallScore);
  const diseaseRiskLevel = mapScoreToRiskLevel(diseaseScore);
  const pestRiskLevel = mapScoreToRiskLevel(pestScore);
  const weatherStressLevel = mapScoreToRiskLevel(stressScore);

  // Calibrate confidence (60% - 92%)
  let confidence = 75;
  if (currentDiagnosis && currentDiagnosis.confidence) {
    confidence = Math.min(94, Math.round(currentDiagnosis.confidence * 40 + 50));
  } else {
    confidence = forecast.length >= 5 ? 78 : 68;
  }

  // Generate Specific Disease Risk Forecast
  let diseaseForecast: SpecificProblemRisk | undefined;
  if (focalDisease) {
    const isIncreasing = diseaseRiskLevel === 'HIGH' || diseaseRiskLevel === 'VERY_HIGH';
    diseaseForecast = {
      problemName: focalDisease.name,
      problemNameHi: focalDisease.nameHi,
      problemType: 'Disease',
      riskLevel: diseaseRiskLevel,
      likelihoodTrend: isIncreasing ? 'increasing' : diseaseRiskLevel === 'MODERATE' ? 'stable' : 'decreasing',
      summary: isIncreasing
        ? `High risk of ${focalDisease.name} progression due to sustained leaf moisture.`
        : `Moderate to low risk; conditions partially support spore germination.`,
      summaryHi: isIncreasing
        ? `लगातार नमी के कारण ${focalDisease.nameHi} के फैलने का जोखिम अधिक है।`
        : `मध्यम से कम जोखिम; सामान्य सतर्कता बनाए रखें।`,
      reasons: [
        `Relative humidity: ${humidity}%`,
        `Rainfall outlook: ${Math.round(next48hRain)}mm`,
        `Temperature range: ${currentWeather.temperature}°C`,
      ],
      reasonsHi: [
        `हवा में नमी: ${humidity}%`,
        `बारिश का अनुमान: ${Math.round(next48hRain)} मिमी`,
        `तापमान: ${currentWeather.temperature}°C`,
      ],
    };
  }

  // Generate Specific Pest Risk Forecast
  let pestForecast: SpecificProblemRisk | undefined;
  if (focalPest) {
    const isPestElevated = pestRiskLevel === 'HIGH' || pestRiskLevel === 'VERY_HIGH';
    pestForecast = {
      problemName: focalPest.name,
      problemNameHi: focalPest.nameHi,
      problemType: 'Pest',
      riskLevel: pestRiskLevel,
      likelihoodTrend: isPestElevated ? 'increasing' : pestRiskLevel === 'MODERATE' ? 'stable' : 'decreasing',
      summary: isPestElevated
        ? `Conditions may favor increased ${focalPest.name} activity and feeding.`
        : `Pest pressure expected to stay within manageable thresholds.`,
      summaryHi: isPestElevated
        ? `मौसम ${focalPest.nameHi} की संख्या व सक्रियता बढ़ाने में सहायक हो सकता है।`
        : `कीट दबाव सामान्य सीमा के भीतर रहने का अनुमान।`,
      reasons: [
        `Dry conditions or warm temperature window (${currentWeather.temperature}°C)`,
        `Rainfall impact: ${next48hRain < 5 ? 'Absence of heavy wash-off rain' : 'Rain may temporarily wash away nymphs'}`,
      ],
      reasonsHi: [
        `शुष्क परिस्थितियां या गर्म तापमान (${currentWeather.temperature}°C)`,
        `बारिश का प्रभाव: ${next48hRain < 5 ? 'बारिश न होने से कीट नहीं धुलेंगे' : 'बारिश से कुछ कीट धुल सकते हैं'}`,
      ],
    };
  }

  // Generate Day-by-Day Timeline
  const timeline: RiskTimelinePoint[] = (forecast || []).slice(0, 7).map((day, idx) => {
    let dayDisScore = diseaseScore;
    let dayPestScore = pestScore;
    let dayStressScore = stressScore;

    // Day adjustments based on rain & temp
    if (day.rainfallAmount > 15 || day.rainfallProbability > 70) {
      dayDisScore += 18;
      dayPestScore -= 12;
      dayStressScore += 10;
    } else if (day.maxTemperature > 38) {
      dayStressScore += 25;
      dayPestScore += 15;
    } else if (day.rainfallAmount === 0 && day.rainfallProbability < 20) {
      dayDisScore -= 10;
    }

    const dayOverall = Math.round(dayDisScore * 0.45 + dayPestScore * 0.35 + dayStressScore * 0.20);
    const dayRiskLevel = mapScoreToRiskLevel(dayOverall);

    return {
      date: day.date,
      dayLabel: idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : day.dayLabel,
      dayLabelHi: idx === 0 ? 'आज' : idx === 1 ? 'कल' : day.dayLabelHi,
      diseaseRisk: mapScoreToRiskLevel(dayDisScore),
      pestRisk: mapScoreToRiskLevel(dayPestScore),
      weatherStress: mapScoreToRiskLevel(dayStressScore),
      overallRisk: dayRiskLevel,
      riskScore: Math.min(100, Math.max(10, dayOverall)),
      dominantCondition: day.conditionText,
      dominantConditionHi: day.conditionTextHi,
    };
  });

  // Generate Agricultural Alerts
  const alerts: AgriculturalAlert[] = [];

  // Alert 1: Heavy rain alert
  if (next48hRain >= 20 || currentWeather.rainfall >= 20) {
    alerts.push({
      id: `alert-rain-${Date.now()}`,
      type: 'weather',
      severity: 'critical',
      title: 'Heavy Rainfall Expected — Postpone Spray Operations',
      titleHi: 'भारी बारिश का अनुमान — कीटनाशक छिड़काव स्थगित रखें',
      message: 'Substantial rain will wash away foliar chemicals and waste farmer inputs.',
      messageHi: 'भारी वर्षा से छिड़काव की गई दवा धुल जाएगी और लागत व्यर्थ होगी।',
      whatIsHappening: `Forecast indicates ~${Math.round(next48hRain)}mm of rainfall over the next 48 hours.`,
      whatIsHappeningHi: `अगले 48 घंटों में लगभग ${Math.round(next48hRain)} मिमी वर्षा का अनुमान है।`,
      whyItMatters: 'Applying sprays before rain leads to chemical runoff, ground leaching, and zero pest control.',
      whyItMattersHi: 'बारिश से पहले छिड़काव करने से दवा बह जाती है और कीट-रोग पर कोई असर नहीं होता।',
      whatFarmerShouldDo: [
        'Postpone all foliar fungicides and insecticides until leaves dry completely.',
        'Clear field drainage channels to prevent root asphyxiation.',
        'Inspect lower leaves 24 hours after rainfall for water-soaked lesions.',
      ],
      whatFarmerShouldDoHi: [
        'पत्ते पूरी तरह सूखने तक फफूंदनाशक व कीटनाशक छिड़काव रोकें।',
        'खेत की नालियों को साफ करें ताकि जलभराव न हो।',
        'बारिश के 24 घंटे बाद पत्तों पर भीगे धब्बों की जांच करें।',
      ],
      crop: cropName,
      createdAt: Date.now(),
    });
  }

  // Alert 2: Disease High Risk
  if (diseaseRiskLevel === 'HIGH' || diseaseRiskLevel === 'VERY_HIGH') {
    alerts.push({
      id: `alert-disease-${Date.now()}`,
      type: 'disease_risk',
      severity: diseaseRiskLevel === 'VERY_HIGH' ? 'critical' : 'warning',
      title: `High Disease Spread Risk: ${focalDisease?.name || 'Foliar Blight'}`,
      titleHi: `रोग फैलाव का उच्च जोखिम: ${focalDisease?.nameHi || 'पत्ती झुलसा'}`,
      message: 'High moisture and moderate warmth are accelerating fungal spore germination.',
      messageHi: 'हवा में उच्च नमी और अनुकूल तापमान फफूंद के फैलाव को तीव्र कर रहे हैं।',
      whatIsHappening: `Humidity is ${humidity}%, creating an extended dew period on ${cropName} leaves.`,
      whatIsHappeningHi: `हवा में नमी ${humidity}% है, जिससे ${cropHindi || cropName} के पत्तों पर लंबे समय तक ओस टिकी रहेगी।`,
      whyItMatters: 'Foliar fungal pathogens can spread from isolated infection spots across the entire field within 48-72 hours.',
      whyItMattersHi: 'अनुकूल मौसम मिलने पर फफूंद कुछ ही दिनों में पूरे खेत में फैल सकती है।',
      whatFarmerShouldDo: [
        'Inspect 10 random plants across the field in a diagonal line.',
        'Prune heavily spotted bottom leaves and burn or bury them outside the plot.',
        'If 15% or more plants show symptoms, consult your local KVK or Agriculture Officer.',
      ],
      whatFarmerShouldDoHi: [
        'खेत में तिरछी दिशा में चलकर 10 यादृच्छिक पौधों का बारीकी से मुआयना करें।',
        'रोग से बुरी तरह ग्रसित निचले पत्तों को तोड़कर खेत से दूर नष्ट करें।',
        'यदि 15% से अधिक पौधों पर लक्षण दिखें, तो नजदीकी KVK या कृषि अधिकारी से संपर्क करें।',
      ],
      crop: cropName,
      createdAt: Date.now(),
    });
  }

  // Alert 3: Pest Sucking Flare
  if (pestRiskLevel === 'HIGH' || pestRiskLevel === 'VERY_HIGH') {
    alerts.push({
      id: `alert-pest-${Date.now()}`,
      type: 'pest_risk',
      severity: 'warning',
      title: `Elevated Pest Pressure: ${focalPest?.name || 'Sucking Insects'}`,
      titleHi: `कीट प्रकोप की चेतावनी: ${focalPest?.nameHi || 'रस चूसक कीट'}`,
      message: 'Dry, warm weather creates optimum breeding conditions for sucking insects.',
      messageHi: 'शुष्क व गर्म मौसम रस चूसक कीटों के प्रजनन के लिए अनुकूल है।',
      whatIsHappening: `Temperature of ${currentWeather.temperature}°C with low rain probability favors nymph survival.`,
      whatIsHappeningHi: `तापमान ${currentWeather.temperature}°C और बारिश न होने से कीटों की संख्या बढ़ सकती है।`,
      whyItMatters: 'Unchecked sucking pests curl leaves and transmit debilitating plant viruses.',
      whyItMattersHi: 'रस चूसक कीट पत्तों का रस चूसकर उन्हें मोड़ देते हैं व वायरस रोग फैलाते हैं।',
      whatFarmerShouldDo: [
        'Install yellow sticky traps (6–8 traps per acre) at crop canopy height.',
        'Inspect undersides of 20 random leaves in early morning.',
        'Consider neem oil spray (1500 ppm @ 5ml/litre) in late afternoon if nymphs are spotted.',
      ],
      whatFarmerShouldDoHi: [
        'खेत में फसल की ऊंचाई पर प्रति एकड़ 6-8 पीले चिपचिपे कार्ड लगाएं।',
        'सुबह के समय 20 पत्तियों की निचली सतह की जांच करें।',
        'कीट दिखने पर शाम को 5 मिली/लीटर की दर से नीम तेल (1500 ppm) का छिड़काव करें।',
      ],
      crop: cropName,
      createdAt: Date.now(),
    });
  }

  // What to do now (one prominent farmer sentence)
  let whatToDoNow = 'Scout your field regularly. Weather conditions are currently stable.';
  let whatToDoNowHi = 'खेत का नियमित मुआयना रखें। वर्तमान में मौसम स्थिर है।';

  if (next48hRain >= 15) {
    whatToDoNow = 'Postpone chemical spraying and inspect field drainage channels.';
    whatToDoNowHi = 'दवा का छिड़काव तुरंत रोकें तथा खेत से फालतू पानी निकालने की व्यवस्था करें।';
  } else if (diseaseRiskLevel === 'HIGH' || diseaseRiskLevel === 'VERY_HIGH') {
    whatToDoNow = 'Inspect lower leaves for spreading spots; remove severely infected plant debris.';
    whatToDoNowHi = 'निचले पत्तों पर धब्बों की जांच करें और अधिक खराब पत्तों को खेत से बाहर नष्ट करें।';
  } else if (pestRiskLevel === 'HIGH' || pestRiskLevel === 'VERY_HIGH') {
    whatToDoNow = 'Check leaf undersides for sucking pests and install yellow sticky traps.';
    whatToDoNowHi = 'पत्तों के नीचे कीटों की जांच करें और खेत में पीले चिपचिपे ट्रैप लगाएं।';
  } else if (currentWeather.windSpeed >= 20) {
    whatToDoNow = 'Hold foliar spray until winds calm down below 15 km/h.';
    whatToDoNowHi = 'हवा शांत होने तक छिड़काव न करें ताकि दवा उड़कर बर्बाद न हो।';
  }

  // Explanation string
  const explanation = isDiagnosisConnected
    ? `Risk forecast combines the detected ${diagnosisTitle} (${diagnosisSeverity} severity) with prevailing atmospheric humidity (${humidity}%) and a 48h rainfall forecast of ${Math.round(next48hRain)}mm.`
    : `Risk forecast is based on ${cropName} susceptibility thresholds matched with current humidity (${humidity}%), temperature (${currentWeather.temperature}°C), and 7-day weather outlook.`;

  const explanationHi = isDiagnosisConnected
    ? `यह जोखिम अनुमान फोटो से पहचानी गई समस्या '${diagnosisTitle}' (${diagnosisSeverity}) को वर्तमान नमी (${humidity}%) व 48 घंटे में ${Math.round(next48hRain)} मिमी बारिश के साथ जोड़कर तैयार किया गया है।`
    : `यह जोखिम अनुमान ${cropHindi || cropName} की फसल संवेदनशीलता, वर्तमान नमी (${humidity}%), तापमान (${currentWeather.temperature}°C) और 7 दिनों के मौसम पर आधारित है।`;

  // Recommended Actions (IPM structured)
  const recommendedActions: RiskRecommendedActions = {
    immediate: [
      next48hRain >= 10
        ? 'Hold any foliar spray application until rain subsides and foliage dries.'
        : 'Walk the field diagonally and observe 10 random plants for disease spread.',
      'Check irrigation channels; prevent standing water around root zones.',
    ],
    immediateHi: [
      next48hRain >= 10
        ? 'बारिश थमने और पत्ते सूखने तक किसी भी प्रकार का छिड़काव न करें।'
        : 'खेत में तिरछी दिशा में घूमकर 10 पौधों के पत्तों की बारीकी से जांच करें।',
      'सिंचाई की नालियां ठीक रखें; जड़ों के पास पानी न रुकने दें।',
    ],
    monitoring: [
      'Inspect undersides of 15 leaves for active colonies or fungal down.',
      'Check yellow sticky traps every 48 hours to gauge insect count trends.',
    ],
    monitoringHi: [
      '15 पत्तियों की निचली सतह पर फफूंद या कीड़ों के जमाव की जांच करें।',
      'कीटों की संख्या का रुख समझने हेतु हर 48 घंटे में पीले ट्रैप देखें।',
    ],
    culturalBiological: [
      'Prune and destroy severely infected lower leaves away from the field.',
      'Avoid excess nitrogenous urea fertilizer which produces succulent, disease-prone foliage.',
      'Apply neem-based formulations (Azadirachtin 1500 ppm) for organic suppression.',
    ],
    culturalBiologicalHi: [
      'रोगग्रस्त निचले पत्तों को काटकर खेत से दूर गड्ढे में दबाएं।',
      'अत्यधिक यूरिया के उपयोग से बचें, इससे पत्ते कोमल होकर रोग की चपेट में जल्दी आते हैं।',
      'जैविक रोकथाम हेतु नीम तेल (1500 ppm) का प्रयोग करें।',
    ],
    chemicalNotice:
      'CAUTION: Chemical pesticides should only be applied after direct scouting confirms pest/disease crosses Economic Threshold Levels (ETL). Always verify recommended dosage with your local Krishi Vigyan Kendra (KVK).',
    chemicalNoticeHi:
      'चेतावनी: रासायनिक दवाओं का छिड़काव केवल तभी करें जब कीट या बीमारी आर्थिक क्षति स्तर (ETL) पार कर जाए। सही दवा व मात्रा के लिए नजदीकी कृषि विज्ञान केंद्र (KVK) से परामर्श लें।',
    kvkRecommendation: 'Kisan Call Center: 1800-180-1551 (Toll-free advisory in your regional language)',
    kvkRecommendationHi: 'किसान कॉल सेंटर: 1800-180-1551 (निःशुल्क फोन सेवा)',
  };

  return {
    id: `risk-assessment-${Date.now()}`,
    timestamp: Date.now(),
    crop: cropName,
    cropHindi: cropHindi || cropProfile.cropHindi,
    location,
    riskLevel: overallRiskLevel,
    riskScore: overallScore,
    confidence,
    timeWindow: 'Next 48–72 hours',
    timeWindowHi: 'अगले 48–72 घंटे',
    diseaseRisk: diseaseRiskLevel,
    pestRisk: pestRiskLevel,
    weatherStress: weatherStressLevel,
    diseaseRiskForecast: diseaseForecast,
    pestRiskForecast: pestForecast,
    riskFactors: factors,
    explanation,
    explanationHi,
    whatToDoNow,
    whatToDoNowHi,
    recommendedActions,
    weatherSnapshot: currentWeather,
    weatherSignals,
    timeline,
    alerts,
    basedOnDiagnosisId: currentDiagnosis?.id,
    diagnosisTitle,
    diagnosisSeverity,
    isDiagnosisConnected,
  };
}

export function calculateAgriculturalRisk(params: {
  crop: string;
  cropHindi?: string;
  weather: any;
  location: any;
  diagnosis?: any;
  language?: 'en' | 'hi';
}): RiskAssessment {
  const { crop, cropHindi, weather, location, diagnosis } = params;

  const currentWeather = weather?.current || {
    temperature: 28,
    humidity: 70,
    rainfall: 0,
    windSpeed: 8,
    windDirection: 'NW',
    conditionCode: 1,
    conditionText: 'Partly Cloudy',
    conditionTextHi: 'आंशिक बादल',
    isDay: true,
  };

  const forecast = weather?.forecast || [];

  return computeAgriculturalRisk({
    cropName: crop,
    cropHindi,
    currentWeather,
    forecast,
    location: location || {
      district: 'Ludhiana',
      state: 'Punjab',
      country: 'India',
      latitude: 30.9010,
      longitude: 75.8573,
      displayName: 'Ludhiana, Punjab',
      isGps: false,
    },
    currentDiagnosis: diagnosis || null,
  });
}

