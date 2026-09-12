// Crop-Specific Agricultural Risk Knowledge for Krishi Mentor
// Grounded in verified ICAR / SAU agrometeorological thresholds
// Covers: Wheat, Rice, Maize, Tomato, Potato, Cotton, Soybean, Mustard, Sugarcane, Chilli, Brinjal

export interface CropDiseaseRiskProfile {
  name: string;
  nameHi: string;
  type: 'fungal' | 'bacterial' | 'viral';
  minTemp: number; // °C
  maxTemp: number; // °C
  minHumidity: number; // %
  rainfallTriggerMm: number; // mm
  descriptionEn: string;
  descriptionHi: string;
  favorableConditionsEn: string;
  favorableConditionsHi: string;
  keySymptomEn: string;
  keySymptomHi: string;
}

export interface CropPestRiskProfile {
  name: string;
  nameHi: string;
  category: 'sucking' | 'borer' | 'caterpillar' | 'mite';
  minTemp: number;
  maxTemp: number;
  maxHumidity: number; // Many sucking pests prefer dry warm weather
  rainSuppressor: boolean; // Heavy rain washes away whiteflies/aphids
  descriptionEn: string;
  descriptionHi: string;
  favorableConditionsEn: string;
  favorableConditionsHi: string;
  keyMonitoringEn: string;
  keyMonitoringHi: string;
}

export interface CropRiskModel {
  cropName: string;
  cropHindi: string;
  diseases: CropDiseaseRiskProfile[];
  pests: CropPestRiskProfile[];
  generalWeatherStress: {
    heatThreshold: number; // °C
    coldThreshold: number; // °C
    excessRainDays: number;
  };
}

export const CROP_RISK_PROFILES: Record<string, CropRiskModel> = {
  // 1. Wheat (गेहूं)
  Wheat: {
    cropName: 'Wheat',
    cropHindi: 'गेहूं',
    diseases: [
      {
        name: 'Yellow (Stripe) Rust',
        nameHi: 'पीला रतुआ (हल्दी रोग)',
        type: 'fungal',
        minTemp: 10,
        maxTemp: 22,
        minHumidity: 75,
        rainfallTriggerMm: 2,
        descriptionEn: 'Conditions are favorable for stripe rust spore germination in cool, moist weather.',
        descriptionHi: 'ठंडे व नम मौसम में पीले रतुए के बीजाणु तेजी से सक्रिय हो सकते हैं।',
        favorableConditionsEn: 'Cool temperatures (10–20°C) with morning dew and intermittent light rains.',
        favorableConditionsHi: 'ठंडा तापमान (10-20°C), सुबह की ओस व हल्की वर्षा।',
        keySymptomEn: 'Yellow powdery stripes parallel to leaf veins.',
        keySymptomHi: 'पत्तियों की शिराओं के समानांतर पीले चूर्ण की धारियां।',
      },
      {
        name: 'Karnal Bunt & Blight',
        nameHi: 'करनाल बंट व पत्ती झुलसा',
        type: 'fungal',
        minTemp: 15,
        maxTemp: 26,
        minHumidity: 80,
        rainfallTriggerMm: 5,
        descriptionEn: 'High humidity during heading stage favors fungal ear infections.',
        descriptionHi: 'बालियां निकलते समय उच्च आर्द्रता फफूंद संक्रमण को बढ़ावा देती है।',
        favorableConditionsEn: 'Cloudy weather with intermittent rainfall during ear emergence.',
        favorableConditionsHi: 'बालियां निकलने के समय बादल छाए रहना व हल्की बारिश।',
        keySymptomEn: 'Partial grain blackening and fishy odor.',
        keySymptomHi: 'दानों का आंशिक रूप से काला पड़ना व सड़ी मछली जैसी गंध।',
      },
    ],
    pests: [
      {
        name: 'Wheat Aphid (Chepa)',
        nameHi: 'गेहूं का चेपा (माहू)',
        category: 'sucking',
        minTemp: 16,
        maxTemp: 28,
        maxHumidity: 65,
        rainSuppressor: true,
        descriptionEn: 'Dry, cloudy spell with warm days encourages aphid colony formation on earheads.',
        descriptionHi: 'सूखे व हल्के गर्म मौसम में गेहूं की बालियों पर चेपा कीट का तेजी से फैलाव होता है।',
        favorableConditionsEn: 'Absence of rain with temperature between 18–25°C.',
        favorableConditionsHi: 'बारिश का न होना तथा 18-25°C के बीच तापमान।',
        keyMonitoringEn: 'Inspect 20 random tillers/earheads for green colonies.',
        keyMonitoringHi: 'खेत में 20 बालियों पर हरे माहू के समूहों की जांच करें।',
      },
    ],
    generalWeatherStress: { heatThreshold: 34, coldThreshold: 4, excessRainDays: 3 },
  },

  // 2. Rice / Paddy (धान)
  Rice: {
    cropName: 'Rice',
    cropHindi: 'धान',
    diseases: [
      {
        name: 'Blast (Pyricularia oryzae)',
        nameHi: 'धान का झोंका रोग (ब्लास्ट)',
        type: 'fungal',
        minTemp: 20,
        maxTemp: 30,
        minHumidity: 85,
        rainfallTriggerMm: 10,
        descriptionEn: 'High relative humidity (>85%) and leaf wetness favor blast infection.',
        descriptionHi: '85% से अधिक हवा में नमी और पत्तों पर पानी का जमाव ब्लास्ट रोग बढ़ाता है।',
        favorableConditionsEn: 'Night temperatures around 20–24°C, prolonged dew, and cloudy days.',
        favorableConditionsHi: 'रात का तापमान 20-24°C, घनी ओस व लगातार बादल।',
        keySymptomEn: 'Spindle-shaped lesions with ash-grey centers on leaves.',
        keySymptomHi: 'पत्तियों पर नाव या आंख के आकार के भूरे-राखिया धब्बे।',
      },
      {
        name: 'Bacterial Leaf Blight (BLB)',
        nameHi: 'जीवाणु झुलसा (BLB)',
        type: 'bacterial',
        minTemp: 25,
        maxTemp: 34,
        minHumidity: 80,
        rainfallTriggerMm: 15,
        descriptionEn: 'Warm, rainy, windy conditions accelerate bacterial spread across water droplets.',
        descriptionHi: 'तेज हवा और बारिश की बूंदों से जीवाणु झुलसा पूरे खेत में फैलता है।',
        favorableConditionsEn: 'High temperature (28–34°C) with gusty monsoon rains.',
        favorableConditionsHi: '28-34°C तापमान और मानसूनी तेज बारिश व हवा।',
        keySymptomEn: 'Water-soaked wavy lesions drying from leaf tip downwards.',
        keySymptomHi: 'पत्ती के सिरे से शुरू होकर नीचे की ओर सूखने वाले लहरदार पीले धब्बे।',
      },
    ],
    pests: [
      {
        name: 'Brown Planthopper (BPH)',
        nameHi: 'भूरा माहू (BPH / तेला)',
        category: 'sucking',
        minTemp: 25,
        maxTemp: 32,
        maxHumidity: 90,
        rainSuppressor: false,
        descriptionEn: 'Dense, stagnant humid microclimate at the base of dense tillers favors BPH explosion.',
        descriptionHi: 'पौधे की जड़ के पास अत्यधिक नमी व धूप न पहुंचने से भूरा माहू तेजी से बढ़ता है।',
        favorableConditionsEn: 'High humidity (>80%) with closed dense canopy and excess nitrogen.',
        favorableConditionsHi: 'जड़ों के पास उच्च नमी व अत्यधिक यूरिया का उपयोग।',
        keyMonitoringEn: 'Part tillers gently and check the water level base for brown hoppers.',
        keyMonitoringHi: 'कल्लों को अलग करके पौधे की जड़ व पानी की सतह पर कीड़ों की जांच करें।',
      },
    ],
    generalWeatherStress: { heatThreshold: 37, coldThreshold: 12, excessRainDays: 5 },
  },

  // 3. Maize (मक्का)
  Maize: {
    cropName: 'Maize',
    cropHindi: 'मक्का',
    diseases: [
      {
        name: 'Turcicum Leaf Blight',
        nameHi: 'टर्सिकम पत्ती झुलसा',
        type: 'fungal',
        minTemp: 18,
        maxTemp: 27,
        minHumidity: 80,
        rainfallTriggerMm: 8,
        descriptionEn: 'Cool, wet and cloudy weather encourages boat-shaped necrotic lesions.',
        descriptionHi: 'ठंडा व नम मौसम पत्तों पर बड़े भूरे धब्बे बनाने के लिए अनुकूल है।',
        favorableConditionsEn: 'High humidity with cloudy conditions and dew.',
        favorableConditionsHi: 'उच्च नमी, बादल छाए रहना और पत्तों पर ओस।',
        keySymptomEn: 'Long elliptical straw-colored lesions on leaves.',
        keySymptomHi: 'पत्तियों पर लंबे नाव जैसे भूरे धब्बे।',
      },
    ],
    pests: [
      {
        name: 'Fall Armyworm (FAW)',
        nameHi: 'फॉल आर्मीवर्म (सैनिक कीट)',
        category: 'caterpillar',
        minTemp: 22,
        maxTemp: 35,
        maxHumidity: 85,
        rainSuppressor: false,
        descriptionEn: 'Warm temperatures accelerate FAW lifecycle; larvae hide inside central whorls.',
        descriptionHi: 'गर्म मौसम में सैनिक कीट का जीवनचक्र तेज हो जाता है, इल्लियां भोंपू में नुकसान करती हैं।',
        favorableConditionsEn: 'Warm, humid weather with intermittent rains.',
        favorableConditionsHi: 'गर्म व आर्द्र मौसम और रुक-रुक कर बारिश।',
        keyMonitoringEn: 'Inspect central whorls of 50 plants in W-pattern for frass.',
        keyMonitoringHi: 'खेत में W-आकार में 50 पौधों के भोंपू में लकड़ी जैसे बुरादे की जांच करें।',
      },
    ],
    generalWeatherStress: { heatThreshold: 38, coldThreshold: 10, excessRainDays: 4 },
  },

  // 4. Tomato (टमाटर)
  Tomato: {
    cropName: 'Tomato',
    cropHindi: 'टमाटर',
    diseases: [
      {
        name: 'Early Blight (Alternaria solani)',
        nameHi: 'टमाटर का अगेती झुलसा',
        type: 'fungal',
        minTemp: 20,
        maxTemp: 32,
        minHumidity: 78,
        rainfallTriggerMm: 5,
        descriptionEn: 'Alternating wet and dry periods with warm days accelerate target-board spots.',
        descriptionHi: 'नम और सूखे मौसम के बारी-बारी आने से अगेती झुलसा तेजी से फैलता है।',
        favorableConditionsEn: 'Warm temperatures (24–30°C) with frequent showers or heavy dew.',
        favorableConditionsHi: '24-30°C तापमान और सुबह की ओस या हल्की बारिश।',
        keySymptomEn: 'Concentric ring target spots surrounded by yellow chlorotic halo.',
        keySymptomHi: 'पत्तियों पर गोल छल्लेदार (टारगेट बोर्ड) भूरे धब्बे व पीला घेरा।',
      },
      {
        name: 'Late Blight (Phytophthora infestans)',
        nameHi: 'टमाटर का पछेती झुलसा',
        type: 'fungal',
        minTemp: 12,
        maxTemp: 22,
        minHumidity: 88,
        rainfallTriggerMm: 12,
        descriptionEn: 'Cool, fog-laden or cloudy wet periods trigger destructive late blight outbreaks.',
        descriptionHi: 'ठंडा, कोहरेदार व लगातार नम मौसम पछेती झुलसा की महामारी लाता है।',
        favorableConditionsEn: 'Persistent humidity (>90%) with cool temperatures (15–20°C).',
        favorableConditionsHi: 'लगातार 90% से अधिक नमी व 15-20°C तापमान।',
        keySymptomEn: 'Water-soaked greasy dark spots with white fungal down on undersides.',
        keySymptomHi: 'पत्तियों पर पानी से भीगे काले धब्बे व पत्ती के नीचे सफेद फफूंद।',
      },
    ],
    pests: [
      {
        name: 'Whitefly & Leaf Curl Vector',
        nameHi: 'सफेद मक्खी (पर्ण कुंचन वाहक)',
        category: 'sucking',
        minTemp: 25,
        maxTemp: 38,
        maxHumidity: 60,
        rainSuppressor: true,
        descriptionEn: 'Dry, warm weather promotes exponential whitefly population growth.',
        descriptionHi: 'सूखा और गर्म मौसम सफेद मक्खी के गुणन के लिए अत्यंत अनुकूल है।',
        favorableConditionsEn: 'Dry spells without heavy rainfall.',
        favorableConditionsHi: 'बिना बारिश का सूखा व गर्म समय।',
        keyMonitoringEn: 'Tap leaf underside in early morning and check yellow sticky traps.',
        keyMonitoringHi: 'सुबह के समय पत्तों के नीचे हिलाकर देखें व पीले चिपचिपे कार्ड लगाएं।',
      },
    ],
    generalWeatherStress: { heatThreshold: 37, coldThreshold: 10, excessRainDays: 3 },
  },

  // 5. Potato (आलू)
  Potato: {
    cropName: 'Potato',
    cropHindi: 'आलू',
    diseases: [
      {
        name: 'Late Blight of Potato',
        nameHi: 'आलू का पछेती झुलसा',
        type: 'fungal',
        minTemp: 10,
        maxTemp: 21,
        minHumidity: 88,
        rainfallTriggerMm: 8,
        descriptionEn: 'Conditions are highly conducive to late blight spore dispersal in dense fog.',
        descriptionHi: 'घने कोहरे व 88% से अधिक नमी में पछेती झुलसा का खतरा चरम पर होता है।',
        favorableConditionsEn: 'Cool temperature (12–18°C), cloudy sky, and relative humidity >90%.',
        favorableConditionsHi: '12-18°C तापमान, बादल छाए रहना और 90% से अधिक नमी।',
        keySymptomEn: 'Water-soaked lesions on leaf margins rapidly turning black and rotten.',
        keySymptomHi: 'पत्ती के किनारों पर काले-भूरे भीगे धब्बे जो तेजी से पूरी पत्ती को सड़ा देते हैं।',
      },
    ],
    pests: [
      {
        name: 'Potato Aphid',
        nameHi: 'आलू का चेपा / माहू',
        category: 'sucking',
        minTemp: 15,
        maxTemp: 26,
        maxHumidity: 65,
        rainSuppressor: true,
        descriptionEn: 'Mild dry winter days favor aphid colonization and virus transmission.',
        descriptionHi: 'हल्के सूखे सर्दियों के दिन माहू के फैलाव और वायरस संक्रमण को बढ़ाते हैं।',
        favorableConditionsEn: 'Clear dry winter days without rainfall.',
        favorableConditionsHi: 'बिना बारिश वाले साफ सर्दियों के दिन।',
        keyMonitoringEn: 'Check lower third of potato plants for aphid colonies.',
        keyMonitoringHi: 'आलू के पौधों के निचले एक-तिहाई हिस्से में माहू की जांच करें।',
      },
    ],
    generalWeatherStress: { heatThreshold: 32, coldThreshold: 2, excessRainDays: 3 },
  },

  // 6. Cotton (कपास)
  Cotton: {
    cropName: 'Cotton',
    cropHindi: 'कपास',
    diseases: [
      {
        name: 'Bacterial Blight / Angular Leaf Spot',
        nameHi: 'कपास का जीवाणु झुलसा (कोणीय धब्बा)',
        type: 'bacterial',
        minTemp: 25,
        maxTemp: 35,
        minHumidity: 80,
        rainfallTriggerMm: 12,
        descriptionEn: 'Warm rains and humid winds spread bacteria through leaf stomata.',
        descriptionHi: 'गर्म बारिश व तेज नम हवाएं जीवाणु को पत्तियों में तेजी से फैलाती हैं।',
        favorableConditionsEn: 'Humid stormy weather with heavy rain splash.',
        favorableConditionsHi: 'तूफानी बारिश और पानी के छींटे।',
        keySymptomEn: 'Angular water-soaked spots bounded by veins.',
        keySymptomHi: 'शिराओं से घिरे हुए कोणीय भीगे भूरे-काले धब्बे।',
      },
    ],
    pests: [
      {
        name: 'Cotton Whitefly',
        nameHi: 'कपास की सफेद मक्खी',
        category: 'sucking',
        minTemp: 28,
        maxTemp: 40,
        maxHumidity: 55,
        rainSuppressor: true,
        descriptionEn: 'Long dry hot spells trigger severe whitefly outbreaks and sooty mold.',
        descriptionHi: 'लंबे सूखे और अत्यधिक गर्म मौसम में सफेद मक्खी का भारी प्रकोप होता है।',
        favorableConditionsEn: 'Hot and dry weather (30–40°C) with low relative humidity.',
        favorableConditionsHi: '30-40°C तापमान और शुष्क हवा।',
        keyMonitoringEn: 'Inspect 3 leaves per plant (top, middle, bottom) across 20 plants.',
        keyMonitoringHi: 'प्रति पौधा 3 पत्तियों (ऊपरी, मध्य, निचली) पर वयस्कों की गिनती करें।',
      },
      {
        name: 'Pink Bollworm',
        nameHi: 'गुलाबी सुंडी (पिंक बॉलवर्म)',
        category: 'caterpillar',
        minTemp: 24,
        maxTemp: 34,
        maxHumidity: 75,
        rainSuppressor: false,
        descriptionEn: 'Warm, humid evening conditions encourage moth flight and egg laying in squares.',
        descriptionHi: 'गर्म और नम शाम के समय तितलियों की सक्रियता व फूलों में अंडों का जमाव बढ़ता है।',
        favorableConditionsEn: 'Warm nights (22–28°C) during squaring and boll formation.',
        favorableConditionsHi: 'कपास में डोडे व फूल बनते समय गर्म रातें।',
        keyMonitoringEn: 'Install pheromone traps (5/acre); inspect rosette flowers.',
        keyMonitoringHi: 'प्रति एकड़ 5 फेरोमोन ट्रैप लगाएं व गुलाबनुमा फूलों की जांच करें।',
      },
    ],
    generalWeatherStress: { heatThreshold: 43, coldThreshold: 14, excessRainDays: 4 },
  },

  // 7. Soybean (सोयाबीन)
  Soybean: {
    cropName: 'Soybean',
    cropHindi: 'सोयाबीन',
    diseases: [
      {
        name: 'Soybean Rust',
        nameHi: 'सोयाबीन का रतुआ रोग',
        type: 'fungal',
        minTemp: 18,
        maxTemp: 28,
        minHumidity: 85,
        rainfallTriggerMm: 10,
        descriptionEn: 'Continuous overcast days and high humidity favor rapid rust spread.',
        descriptionHi: 'लगातार बादल और 85% से अधिक नमी रतुआ फफूंद के फैलाव के लिए आदर्श है।',
        favorableConditionsEn: 'Leaf wetness duration of >8 hours with temperatures around 20–26°C.',
        favorableConditionsHi: 'पत्तियों पर 8 घंटे से अधिक नमी व 20-26°C तापमान।',
        keySymptomEn: 'Tiny brown pustules on leaf underside with premature defoliation.',
        keySymptomHi: 'पत्ती की निचली सतह पर छोटे भूरे दाने व पत्तियों का असमय झड़ना।',
      },
    ],
    pests: [
      {
        name: 'Girdle Beetle & Stem Fly',
        nameHi: 'गर्डल बीटल व तना मक्खी',
        category: 'borer',
        minTemp: 24,
        maxTemp: 32,
        maxHumidity: 80,
        rainSuppressor: false,
        descriptionEn: 'Early monsoon intermittent showers favor beetle emergence and stem ring-girdling.',
        descriptionHi: 'शुरुआती बारिश में बीटल जमीन से निकलकर तने पर छल्ले बनाती है।',
        favorableConditionsEn: 'Intermittent rainfall followed by bright sunshine.',
        favorableConditionsHi: 'रुक-रुक कर बारिश और तेज धूप का संयोग।',
        keyMonitoringEn: 'Inspect main stem and petioles for circular cuts/rings.',
        keyMonitoringHi: 'मुख्य तने व शाखाओं पर गोल छल्लों की जांच करें।',
      },
    ],
    generalWeatherStress: { heatThreshold: 38, coldThreshold: 12, excessRainDays: 4 },
  },

  // 8. Mustard (सरसों / राई)
  Mustard: {
    cropName: 'Mustard',
    cropHindi: 'सरसों / राई',
    diseases: [
      {
        name: 'White Rust & Alternaria Blight',
        nameHi: 'सफेद रतुआ व अल्टरनेरिया झुलसा',
        type: 'fungal',
        minTemp: 12,
        maxTemp: 22,
        minHumidity: 80,
        rainfallTriggerMm: 3,
        descriptionEn: 'Dense morning fog with overcast skies encourages white pustules on leaves.',
        descriptionHi: 'सुबह का घना कोहरा और बादल सरसों में सफेद रतुआ बढ़ाने के लिए अनुकूल है।',
        favorableConditionsEn: 'Cloudy damp weather during flowering and pod formation.',
        favorableConditionsHi: 'फूल व फलियां बनते समय लगातार नम व बादल भरा मौसम।',
        keySymptomEn: 'White porcelain-like blisters on lower leaf surface.',
        keySymptomHi: 'पत्ती की निचली सतह पर सफेद फफोले व विकृत फूल।',
      },
    ],
    pests: [
      {
        name: 'Mustard Aphid (Mahu)',
        nameHi: 'सरसों का माहू (चेपा)',
        category: 'sucking',
        minTemp: 14,
        maxTemp: 25,
        maxHumidity: 70,
        rainSuppressor: true,
        descriptionEn: 'Cloudy, calm days without rain in December/January lead to severe aphid infestation.',
        descriptionHi: 'दिसंबर-जनवरी में बिना बारिश वाले बादल छाए दिनों में माहू की भीषण वृद्धि होती है।',
        favorableConditionsEn: 'Overcast weather with mild temperature and no rain.',
        favorableConditionsHi: 'हल्की ठंड, बादल छाए रहना और बारिश का अभाव।',
        keyMonitoringEn: 'Inspect top 10 cm of central shoot for aphid colonies.',
        keyMonitoringHi: 'मुख्य शाखा के शीर्ष 10 सेमी हिस्से पर माहू के जमाव की जांच करें।',
      },
    ],
    generalWeatherStress: { heatThreshold: 32, coldThreshold: 2, excessRainDays: 2 },
  },

  // 9. Sugarcane (गन्ना)
  Sugarcane: {
    cropName: 'Sugarcane',
    cropHindi: 'गन्ना',
    diseases: [
      {
        name: 'Red Rot (Colletotrichum falcatum)',
        nameHi: 'गन्ने का लाल सड़न रोग (रेड रॉट)',
        type: 'fungal',
        minTemp: 24,
        maxTemp: 34,
        minHumidity: 85,
        rainfallTriggerMm: 20,
        descriptionEn: 'Waterlogged soil during monsoon combined with warm humidity causes red rot spread.',
        descriptionHi: 'बारिश के दिनों में जलभराव व उमस से लाल सड़न रोग गन्ने में फैलता है।',
        favorableConditionsEn: 'Waterlogging and high humidity (>80%).',
        favorableConditionsHi: 'खेत में पानी का रुकना और 80% से अधिक नमी।',
        keySymptomEn: 'Third and fourth leaves wither; split cane shows red tissue with white bands.',
        keySymptomHi: 'ऊपरी पत्तियां सूखना व चीरने पर तने के भीतर सफेद पट्टियों वाला लाल रंग।',
      },
    ],
    pests: [
      {
        name: 'Early Shoot Borer',
        nameHi: 'कंसुआ (प्रारंभिक तना छेदक)',
        category: 'borer',
        minTemp: 28,
        maxTemp: 40,
        maxHumidity: 50,
        rainSuppressor: true,
        descriptionEn: 'High temperature and low humidity during pre-monsoon favor shoot borer deadhearts.',
        descriptionHi: 'मानसून पूर्व की भीषण गर्मी और कम नमी में तना छेदक का प्रकोप बढ़ता है।',
        favorableConditionsEn: 'Hot and dry summer months (March–June).',
        favorableConditionsHi: 'मार्च से जून की शुष्क व तेज गर्मी।',
        keyMonitoringEn: 'Look for deadhearts in shoots under 3 months age.',
        keyMonitoringHi: '3 माह तक के गन्ने में बीच का सूखा कल्ला (डेडहार्ट) देखें।',
      },
    ],
    generalWeatherStress: { heatThreshold: 44, coldThreshold: 10, excessRainDays: 6 },
  },

  // 10. Chilli (मिर्च)
  Chilli: {
    cropName: 'Chilli',
    cropHindi: 'मिर्च',
    diseases: [
      {
        name: 'Anthracnose / Fruit Rot / Dieback',
        nameHi: 'मिर्च का एंथ्रेक्नोज / फल सड़न / डाइबैक',
        type: 'fungal',
        minTemp: 24,
        maxTemp: 32,
        minHumidity: 80,
        rainfallTriggerMm: 10,
        descriptionEn: 'Warm rains and splashing water disperse fungal spores on ripening fruit.',
        descriptionHi: 'गर्म बारिश और पानी के छींटे पकते फलों पर फफूंद के बीजाणु फैलाते हैं।',
        favorableConditionsEn: 'High humidity (>80%) accompanied by rain showers.',
        favorableConditionsHi: '80% से अधिक नमी व बारिश की बौछारें।',
        keySymptomEn: 'Circular sunken lesions with black concentric rings on ripe fruits.',
        keySymptomHi: 'पके फलों पर अंदर धंसे हुए काले छल्लेदार धब्बे।',
      },
    ],
    pests: [
      {
        name: 'Chilli Thrips & Mites (Murda Disease)',
        nameHi: 'मिर्च के थ्रिप्स व माइट्स (मुर्राह रोग)',
        category: 'sucking',
        minTemp: 26,
        maxTemp: 38,
        maxHumidity: 50,
        rainSuppressor: true,
        descriptionEn: 'Dry hot periods cause explosive multiplication of thrips and mites, curling leaves upwards/downwards.',
        descriptionHi: 'गर्म व शुष्क मौसम में थ्रिप्स व माइट्स से पत्तियां नाव की तरह ऊपर-नीचे मुड़ जाती हैं।',
        favorableConditionsEn: 'Dry, warm weather without continuous rains.',
        favorableConditionsHi: 'बिना बारिश का सूखा व गर्म समय।',
        keyMonitoringEn: 'Inspect terminal shoots; upward leaf curl indicates thrips, downward curl indicates mites.',
        keyMonitoringHi: 'पत्तियों का ऊपर मुड़ना थ्रिप्स व नीचे मुड़ना माइट्स का लक्षण है।',
      },
    ],
    generalWeatherStress: { heatThreshold: 39, coldThreshold: 12, excessRainDays: 3 },
  },

  // 11. Brinjal / Eggplant (बैंगन)
  Brinjal: {
    cropName: 'Brinjal',
    cropHindi: 'बैंगन',
    diseases: [
      {
        name: 'Phomopsis Blight & Fruit Rot',
        nameHi: 'फोमोप्सिस झुलसा व फल सड़न',
        type: 'fungal',
        minTemp: 22,
        maxTemp: 32,
        minHumidity: 82,
        rainfallTriggerMm: 8,
        descriptionEn: 'Humid, rainy weather promotes dark brown fruit rot patches with pycnidia.',
        descriptionHi: 'नम और बारिश वाले मौसम में फलों पर गहरे भूरे सड़न के धब्बे बनते हैं।',
        favorableConditionsEn: 'Warm and wet conditions with rain splash.',
        favorableConditionsHi: 'गर्म व आर्द्र मौसम और पानी के छींटे।',
        keySymptomEn: 'Circular soft watery lesions on fruits turning into dark mummies.',
        keySymptomHi: 'फलों पर पानी से भरे नरम धब्बे जो बाद में काले पड़ जाते हैं।',
      },
    ],
    pests: [
      {
        name: 'Shoot and Fruit Borer',
        nameHi: 'तना एवं फल छेदक कीट',
        category: 'borer',
        minTemp: 24,
        maxTemp: 36,
        maxHumidity: 75,
        rainSuppressor: false,
        descriptionEn: 'Warm and moderately humid conditions accelerate borer infestation in growing shoots and fruits.',
        descriptionHi: 'गर्म व सामान्य नम मौसम में तना व फल छेदक सुंडी का फैलाव बहुत तेज होता है।',
        favorableConditionsEn: 'Warm temperatures (26–34°C) with moderate humidity.',
        favorableConditionsHi: '26-34°C तापमान और सामान्य आर्द्रता।',
        keyMonitoringEn: 'Look for drooping withered shoot tips and boreholes with frass in fruits.',
        keyMonitoringHi: 'मुरझाई हुई ऊपरी टहनियां और फलों में छेद की जांच करें।',
      },
    ],
    generalWeatherStress: { heatThreshold: 40, coldThreshold: 10, excessRainDays: 4 },
  },
};

export function getCropRiskProfile(cropName: string): CropRiskModel {
  // Normalize
  const matchedKey = Object.keys(CROP_RISK_PROFILES).find(
    (k) => k.toLowerCase() === cropName.toLowerCase() || cropName.toLowerCase().includes(k.toLowerCase())
  );
  if (matchedKey) {
    return CROP_RISK_PROFILES[matchedKey];
  }
  // Default to Tomato profile as a conservative general baseline if crop not directly in list
  return CROP_RISK_PROFILES.Tomato;
}
