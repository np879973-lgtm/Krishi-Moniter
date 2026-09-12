import { DiagnosisResult, Language } from '../types';

export interface DemoScenario {
  id: string;
  title: string;
  titleHi: string;
  cropName: string;
  category: string;
  badge: string;
  description: string;
  descriptionHi: string;
  imageUrl: string;
  result: (language: Language, imageUrl: string) => DiagnosisResult;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'demo-tomato-early-blight',
    title: 'Tomato — Early Blight (Alternaria solani)',
    titleHi: 'टमाटर — अगेती झुलसा (Early Blight)',
    cropName: 'Tomato',
    category: 'Disease Detection & Evidence',
    badge: 'High Confidence',
    description: 'Classic target-board concentric necrotic spots on lower leaves with chlorotic halo.',
    descriptionHi: 'निचली पत्तियों पर गोल छल्लेदार भूरे धब्बे और चारों ओर पीला घेरा।',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?w=800&auto=format&fit=crop&q=80',
    result: (language: Language, imageUri: string): DiagnosisResult => {
      const isHi = language === 'hi';
      return {
        id: `demo_tomato_${Date.now()}`,
        timestamp: Date.now(),
        crop: 'Tomato',
        cropHindi: 'टमाटर',
        overallStatus: 'problem_detected',
        problemType: 'Disease',
        diagnosis: 'Early Blight (Alternaria solani)',
        diagnosisHindi: 'अगेती झुलसा रोग (Alternaria solani)',
        confidence: 0.89,
        isLowConfidence: false,
        possibleCauses: [],
        secondaryConditions: [
          {
            name: 'Septoria Leaf Spot',
            hindiName: 'सेप्टोरिया लीफ स्पॉट',
            type: 'Disease',
            confidence: 0.22,
            notes: isHi
              ? 'सेप्टोरिया के धब्बे छोटे होते हैं और केंद्र में काले बिंदु होते हैं।'
              : 'Septoria lesions are smaller with prominent dark pycnidia centers.',
          },
          {
            name: 'Magnesium Deficiency',
            hindiName: 'मैग्नीशियम की कमी',
            type: 'Nutrient Deficiency',
            confidence: 0.12,
            notes: isHi
              ? 'पत्तियों की शिराओं के बीच पीलापन होता है, गोल छल्ले नहीं बनते।'
              : 'Causes interveinal chlorosis rather than necrotic target rings.',
          },
        ],
        severity: 'Moderate',
        affectedAreaEstimate: '20–35% of lower canopy',
        progressionRisk: 'Rapid',
        symptoms: isHi
          ? [
              'निचली पुरानी पत्तियों पर गहरे भूरे गोल छल्लेदार (Target-board) धब्बे',
              'धब्बों के चारों ओर स्पष्ट पीला घेरा (Chlorotic halo)',
              'संक्रमित पत्तियों का समय से पहले पीला पड़कर सूखना',
            ]
          : [
              'Concentric target-board circular necrotic spots primarily on older lower leaves',
              'Chlorotic yellow halo radiating outward from each lesion margin',
              'Early senescence and yellowing of bottom foliage reducing photosynthetic leaf area',
            ],
        evidence: {
          visualClues: isHi
            ? [
                'धब्बों में संकेंद्रित छल्ले (Concentric rings) स्पष्ट रूप से दिखाई दे रहे हैं',
                'संक्रमण पौधे के निचले हिस्से से ऊपर की ओर बढ़ रहा है',
                'पत्ते की शिराओं के बीच ऊतक सूख चुके हैं',
              ]
            : [
                'Concentric dark rings within the necrotic lesions characteristic of Alternaria sporulation',
                'Lesion localization restricted to bottom foliage consistent with soil-splash infection',
                'Surrounding tissue chlorosis indicates toxin diffusion by the fungal pathogen',
              ],
          affectedParts: isHi
            ? ['निचले पत्ते (Lower Leaves)', 'पत्ती का डंठल (Petioles)']
            : ['Lower canopy foliage', 'Leaf petioles', 'Interveinal lamina'],
          patternsIdentified: isHi
            ? ['लक्ष्य पट्टिका पैटर्न (Target-board pattern)', 'प्रगतिशील पीलापन (Acropetal chlorosis)']
            : ['Target-board concentric banding', 'Acropetal chlorotic progression from bottom to top'],
        },
        pestCountingAvailable: false,
        pestCounting: {
          available: false,
          countable: false,
          count: null,
          note: isHi
            ? 'यह कवक जनित रोग है, कीटों की उपस्थिति नहीं पाई गई।'
            : 'Fungal pathology identified. No insect pests observed.',
        },
        ipmAdvisory: {
          immediateAction: isHi
            ? [
                'निचली संक्रमित पत्तियों को तुरंत काटकर खेत से दूर नष्ट करें या मिट्टी में दबा दें।',
                'खेत में जल निकासी सुनिश्चित करें ताकि क्यारियों में पानी न ठहरे।',
              ]
            : [
                'Prune infected bottom leaves up to 30 cm above ground and dispose away from the plot.',
                'Ensure raised-bed drainage to eliminate standing moisture near tomato crowns.',
              ],
          monitoring: isHi
            ? [
                'सप्ताह में 2 बार सुबह के समय नई पत्तियों की जांच करें कि धब्बे ऊपर तो नहीं फैल रहे।',
                'मौसम में नमी व बादल छाए रहने पर विशेष ध्यान रखें।',
              ]
            : [
                'Scout lower canopy twice weekly in morning hours to track lesion spread rate.',
                'Track local morning dew duration and relative humidity levels.',
              ],
          prevention: isHi
            ? [
                'पौधों पर नीचे से मल्चिंग (प्लास्टिक या पुआल) करें ताकि मिट्टी के छींटे पत्तों पर न पड़ें।',
                'शाम को फव्वारे से पानी न दें, केवल टपक विधि (ड्रिप) या थाले में पानी दें।',
              ]
            : [
                'Apply organic straw or plastic mulch around base to stop rain splash dispersal.',
                'Shift to drip irrigation or furrow watering, avoiding overhead canopy wetting.',
              ],
          biologicalCulturalControls: isHi
            ? [
                'ट्राइकोडर्मा हरजियनम (Trichoderma harzianum @ 5g/L) का पत्तियों पर छिड़काव करें।',
                '5% नीम के बीज का अर्क (NSKE) छिड़कें।',
              ]
            : [
                'Foliar spray with biocontrol Trichoderma harzianum or Bacillus subtilis suspension.',
                'Apply 5% Neem Seed Kernel Extract (NSKE) as an organic antifungal barrier.',
              ],
          chemicalControlNotice: isHi
            ? 'कीटनाशक चेतावनी: रासायनिक कवकनाशी (जैसे मेंकोजेब या कॉपर ऑक्सीक्लोराइड) का छिड़काव केवल तभी करें जब प्राकृतिक उपाय नाकाफी हों, और स्थानीय KVK की सिफारिश के अनुसार ही करें।'
            : 'Chemical Notice: Synthetic protectant fungicides should only be applied if lesions spread above 25% of canopy, adhering strictly to KVK / State Agriculture University spray schedules.',
          whenToContactExpert: isHi
            ? 'यदि तने पर काले घाव दिखने लगें या 3 दिनों में 25% से अधिक पौधे ग्रसित हों, तो तुरंत नजदीकी KVK से संपर्क करें।'
            : 'If dark sunken cankers appear on main stems or fruit calyxes, seek immediate KVK advice.',
        },
        imageUri,
        imageQuality: {
          isGoodQuality: true,
          qualityScore: 92,
          guidanceTips: [isHi ? 'स्पष्ट प्रकाश व धब्बों का अच्छा दृश्य' : 'Clear lighting & sharp lesion focus'],
        },
        disclaimer: 'AI assessment — field verification recommended for important decisions.',
        fieldVerificationRecommendation: isHi
          ? 'खेत में 10 यादृच्छिक पौधों का मुआयना करें और तने की जांच करें।'
          : 'Inspect 10 random plants across diagonal transect to verify stem health.',
        expertVerificationStatus: 'Unverified',
      };
    },
  },
  {
    id: 'demo-cotton-whitefly',
    title: 'Cotton — Whitefly Infestation (Bemisia tabaci)',
    titleHi: 'कपास — सफेद मक्खी (Whitefly Infestation)',
    cropName: 'Cotton',
    category: 'Pest Intelligence & Swarm Density',
    badge: 'Pest Swarm / High Severity',
    description: 'Sap-sucking whitefly nymph colony on leaf undersides causing chlorosis and honeydew sooty mold.',
    descriptionHi: 'पत्ती की निचली सतह पर सफेद मक्खियों का भारी जमावड़ा और रस चूसने से पत्तों का मुड़ना।',
    imageUrl: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?w=800&auto=format&fit=crop&q=80',
    result: (language: Language, imageUri: string): DiagnosisResult => {
      const isHi = language === 'hi';
      return {
        id: `demo_cotton_${Date.now()}`,
        timestamp: Date.now(),
        crop: 'Cotton',
        cropHindi: 'कपास',
        overallStatus: 'problem_detected',
        problemType: 'Pest',
        diagnosis: 'Whitefly Infestation (Bemisia tabaci)',
        diagnosisHindi: 'सफेद मक्खी का प्रकोप (Bemisia tabaci)',
        confidence: 0.92,
        isLowConfidence: false,
        possibleCauses: [],
        secondaryConditions: [
          {
            name: 'Cotton Leaf Curl Virus (CLCuV)',
            hindiName: 'पत्ती मरोड़ विषाणु रोग',
            type: 'Disease',
            confidence: 0.35,
            notes: isHi
              ? 'सफेद मक्खी इस विषाणु की वाहक है, पत्तियों की शिराओं का मोटा होना जांचें।'
              : 'Whitefly is the primary vector transmitting leaf curl geminivirus.',
          },
          {
            name: 'Jassids / Leafhoppers',
            hindiName: 'हरा तेला (जैसिड्स)',
            type: 'Pest',
            confidence: 0.18,
            notes: isHi
              ? 'जैसिड्स से पत्तों के किनारे त्रिकोणीय पीले पड़ते हैं।'
              : 'Jassids cause perimeter hopperburn rather than widespread sooty honeydew.',
          },
        ],
        severity: 'High',
        affectedAreaEstimate: '35–50% of plant canopy',
        progressionRisk: 'Aggressive',
        symptoms: isHi
          ? [
              'पत्तियों के निचले हिस्से पर सफेद पंखों वाली छोटी मक्खियों और बच्चों का झुंड',
              'पत्तियों का ऊपर की ओर मुड़ना व पीला पड़ना',
              'पत्तियों पर चिपचिपा स्राव और काली फफूंद (Sooty Mold) का जमना',
            ]
          : [
              'Clusters of tiny powdery white adults and scale-like translucent nymphs on foliage underside',
              'Upward cupping and mottled chlorosis of tender terminal leaves',
              'Honeydew secretion promoting dark sooty mold layer blocking sunlight',
            ],
        evidence: {
          visualClues: isHi
            ? [
                'पत्ती के निचले हिस्से पर सफेद रंग के कीटों का सघन जमावड़ा देखा गया',
                'चिपचिपे स्राव के कारण पत्तों पर काली फफूंदी के लक्षण',
                'पत्तियों की बनावट में सिकुड़न और पीलापन',
              ]
            : [
                'Dense aggregation of miniature white winged insects beneath leaf lamina',
                'Sooty black fungal mycelium coating upper surfaces from insect honeydew',
                'Loss of leaf turgor and upward cupping indicating aggressive phloem sap extraction',
              ],
          affectedParts: isHi
            ? ['पत्ती का निचला भाग (Abaxial leaf surface)', 'कोमल शीर्ष शाखाएं (Terminal Shoots)']
            : ['Underside of upper canopy leaves', 'Tender terminal shoots', 'Growing buds'],
          patternsIdentified: isHi
            ? ['झुंड/कॉलोनी पैटर्न (Colony cluster)', 'काली फफूंद आवरण (Sooty mold layer)']
            : ['Colony swarm clustering', 'Sooty mold deposition pattern'],
        },
        pestCountingAvailable: true,
        estimatedPestCount: 28,
        pestDetectionConfidence: 0.88,
        pestCounting: {
          available: true,
          countable: false,
          count: 28,
          confidence: 0.88,
          densityEstimate: isHi ? '~25–35 कीट प्रति पत्ती (उच्च घनत्व)' : '~25–35 insects per leaf cluster (High density)',
          note: isHi
            ? 'सफेद मक्खियां झुंड में रहती हैं, अतः सटीक गिनती के स्थान पर उच्च घनत्व कॉलोनी पाई गई।'
            : 'Whiteflies form active swarms; assessment reflects high colony density exceeding economic threshold.',
        },
        ipmAdvisory: {
          immediateAction: isHi
            ? [
                'खेत में प्रति एकड़ 8–10 पीले चिपचिपे ट्रैप (Yellow Sticky Traps) पौधों की ऊंचाई से 1 फीट ऊपर लगाएं।',
                'खेत के आसपास उगे खरपतवार जैसे कंघी बूटी व गाजर घास को तुरंत नष्ट करें।',
              ]
            : [
                'Install 8–10 yellow sticky traps per acre positioned 30 cm above crop canopy.',
                'Eradicate alternate weed hosts (Abutilon indicum, Parthenium) bordering the plot.',
              ],
          monitoring: isHi
            ? [
                'खेत के 20 पौधों की ऊपरी, मध्य और निचली पत्तियों पर मक्खियों की संख्या प्रतिदिन सुबह 7 से 9 बजे के बीच गिनें।',
                'आर्थिक क्षति स्तर (ETL): प्रति पत्ती 6-8 वयस्क मक्खी होने पर ही गहन उपचार करें।',
              ]
            : [
                'Scout 20 random plants early morning (7–9 AM) before wind flight begins.',
                'Economic Threshold Level (ETL): 6–8 adults or 20 nymphs per leaf.',
              ],
          prevention: isHi
            ? [
                'अधिक यूरिया डालने से बचें, क्योंकि रसीले पौधों पर सफेद मक्खी तेजी से बढ़ती है।',
                'खेत के चारों ओर ज्वार या बाजरे की 2-3 कतारें बॉर्डर क्रॉप के रूप में लगाएं।',
              ]
            : [
                'Avoid excessive urea/nitrogen application which produces lush foliage preferred by whiteflies.',
                'Plant border rows of sorghum or pearl millet to act as physical vegetative windbreak.',
              ],
          biologicalCulturalControls: isHi
            ? [
                'नीम आधारित कीटनाशक (Azadirachtin 1500 PPM @ 5 मिली प्रति लीटर पानी) का पत्तियों के नीचे छिड़काव करें।',
                'क्रिप्टोलेमस भृंग या क्राइसोपा मित्र कीटों का संरक्षण करें।',
              ]
            : [
                'Spray cold-pressed Neem Oil (1500 ppm @ 5 ml/L) ensuring thorough underside wetting.',
                'Conserve natural predators such as Chrysoperla carnea (green lacewing) larvae.',
              ],
          chemicalControlNotice: isHi
            ? 'कीटनाशक सूचना: यदि संख्या ETL स्तर पार कर जाए, तो अनुशंसित कीटनाशक (जैसे डाइफेनथियुरॉन या पाइरीप्रॉक्सीफेन) का उपयोग कृषि वैज्ञानिक की सलाह पर ही उचित नोजल से करें।'
            : 'Chemical Notice: Synthetic insecticides must only be deployed if ETL threshold is breached, rotating chemical classes to prevent resistance. Confirm product approvals with local KVK.',
          whenToContactExpert: isHi
            ? 'यदि 48 घंटों में पत्तों का तेजी से मुड़ना शुरू हो या काली फफूंद 40% पत्तों पर छा जाए, तो तुरंत कृषि अधिकारी से मिलें।'
            : 'If rapid sooty mold expansion occurs or leaf curl symptoms appear on >30% of plants, consult agronomist.',
        },
        imageUri,
        imageQuality: {
          isGoodQuality: true,
          qualityScore: 94,
          guidanceTips: [isHi ? 'पत्ते के नीचे का स्पष्ट व विस्तृत दृश्य' : 'High detail on abaxial leaf surface'],
        },
        disclaimer: 'AI assessment — field verification recommended for important decisions.',
        fieldVerificationRecommendation: isHi
          ? 'खेत में प्रति एकड़ 5 स्थानों से पत्तों को पलटकर कीटों की औसत संख्या गिनें।'
          : 'Turn over 20 random leaves at 5 field quadrants to confirm ETL threshold.',
        expertVerificationStatus: 'Unverified',
      };
    },
  },
  {
    id: 'demo-maize-fall-armyworm',
    title: 'Maize — Fall Armyworm (Spodoptera frugiperda)',
    titleHi: 'मक्का — फॉल आर्मीवर्म / सैनिक कीट',
    cropName: 'Maize',
    category: 'Pest Counting & Countable Insect Larvae',
    badge: 'Countable Larvae: 2',
    description: 'Distinctive inverted Y-shape on larval head, ragged feeding windows, and moist frass in whorl.',
    descriptionHi: 'मक्के के भोंपू (Whorl) में छेद, बुरादे जैसा मल और सिर पर उल्टा Y निशान वाला इल्ली कीट।',
    imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&auto=format&fit=crop&q=80',
    result: (language: Language, imageUri: string): DiagnosisResult => {
      const isHi = language === 'hi';
      return {
        id: `demo_maize_${Date.now()}`,
        timestamp: Date.now(),
        crop: 'Maize',
        cropHindi: 'मक्का',
        overallStatus: 'problem_detected',
        problemType: 'Pest',
        diagnosis: 'Fall Armyworm (Spodoptera frugiperda)',
        diagnosisHindi: 'फॉल आर्मीवर्म / सैनिक कीट (Spodoptera frugiperda)',
        confidence: 0.94,
        isLowConfidence: false,
        possibleCauses: [],
        secondaryConditions: [
          {
            name: 'Maize Stem Borer (Chilo partellus)',
            hindiName: 'मक्के का तना छेदक कीट',
            type: 'Pest',
            confidence: 0.15,
            notes: isHi
              ? 'तना छेदक मुख्य रूप से तने में सुराख करता है और "डेड हार्ट" बनाता है।'
              : 'Stem borer creates pinpoint pinholes in straight rows and deadhearts.',
          },
        ],
        severity: 'High',
        affectedAreaEstimate: '25–40% whorl damage',
        progressionRisk: 'Aggressive',
        symptoms: isHi
          ? [
              'पत्तियों पर बड़े अनियमित फटे हुए छेद और खिड़की जैसी पारदर्शी संरचनाएं',
              'भोंपू (Whorl) के भीतर लकड़ी के बुरादे जैसा गीला मल (Frass)',
              'कीट के सिर पर उल्टे "Y" आकार का सफेद निशान और पूंछ पर 4 काले बिंदु',
            ]
          : [
              'Characteristic ragged feeding windows and severe skeletonization of central whorl leaves',
              'Copious moist, coarse sawdust-like frass accumulating in central funnel',
              'Distinctive inverted white Y-shape marking on larval head capsule',
            ],
        evidence: {
          visualClues: isHi
            ? [
                'मक्के के भोंपू में 2 सक्रिय इल्लियां स्पष्ट रूप से दिखाई दे रही हैं',
                'पत्तियों पर विशिष्ट खुरचन व खिड़कीनुमा घाव',
                'ताजा उत्सर्जित मल भोंपू में जमा है',
              ]
            : [
                'Two distinct larvae clearly resolved inside the leaf whorl pocket',
                'Windowpane feeding pattern diagnostic of 2nd-3rd instar larvae',
                'Fresh fecal frass pellets confirming active ongoing larval ingestion',
              ],
          affectedParts: isHi
            ? ['केंद्रीय भोंपू (Central whorl)', 'नई निकलती पत्तियां (Tender emerging leaves)']
            : ['Central funnel whorl', 'Emerging leaf whorl sheath', 'Growing apex'],
          patternsIdentified: isHi
            ? ['खिड़कीनुमा भक्षण (Windowpane feeding)', 'बुरादा जमाव (Sawdust frass accumulation)']
            : ['Ragged whorl perforation pattern', 'Discrete larval aggregation'],
        },
        pestCountingAvailable: true,
        estimatedPestCount: 2,
        pestDetectionConfidence: 0.95,
        pestCounting: {
          available: true,
          countable: true,
          count: 2,
          confidence: 0.95,
          densityEstimate: isHi ? '2 इल्ली प्रति भोंपू (स्पष्ट गणना)' : '2 larvae per whorl (Reliable discrete count)',
          note: isHi
            ? 'भोंपू में 2 इल्लियां स्पष्ट रूप से दिखाई दे रही हैं। यह आर्थिक सीमा पार कर चुका है।'
            : 'Discrete count confirmed: 2 larvae visible inside central whorl. Action recommended.',
        },
        ipmAdvisory: {
          immediateAction: isHi
            ? [
                'भोंपू के अंदर सूखी बारीक बालू या रेत और राख का मिश्रण (10:1) डालें, जिससे इल्ली का दम घुटता है।',
                'खेत में प्रति एकड़ 4-5 फेरोमोन ट्रैप (Pheromone Traps) लगाएं।',
              ]
            : [
                'Apply fine dry sand or wood ash into whorls to physically abrade and suffocate larvae.',
                'Deploy 4–5 FAW sex pheromone lures per acre to track male moth emergence.',
              ],
          monitoring: isHi
            ? [
                'खेत में "W" आकार में घूमकर 50 पौधों के भोंपू का निरीक्षण करें।',
                'यदि 5% से अधिक छोटे पौधों (30 दिन तक) में ताजा क्षति दिखे तो तुरंत उपाय करें।',
              ]
            : [
                'Inspect whorls of 20 consecutive plants across 5 spots along a W-shaped field route.',
                'Action threshold: >5% damaged whorls in seedling-to-knee-high crop stage.',
              ],
          prevention: isHi
            ? [
                'गहरी ग्रीष्मकालीन जुताई करें ताकि मिट्टी में मौजूद प्यूपा धूप से नष्ट हो जाएं।',
                'मक्के के साथ दलहन (जैसे लोबिया या उड़द) की अंतःफसल (Intercropping) लगाएं।',
              ]
            : [
                'Deep summer ploughing to expose pupae to predatory birds and solar heat.',
                'Intercrop with cowpea or desmodium to suppress oviposition and encourage predators.',
              ],
          biologicalCulturalControls: isHi
            ? [
                'बैसिलस थुरिंजिएंसिस (Bt @ 2 ग्राम/लीटर) या मेटाराइजियम का शाम के समय भोंपू में छिड़काव करें।',
                'ट्राइकोग्रामा परजीवी ततैया के अंडे (Tricho-cards) खेत में लगाएं।',
              ]
            : [
                'Spray Bacillus thuringiensis (Bt kurstaki @ 2 g/L) directed into whorls at dusk.',
                'Release egg parasitoid Trichogramma pretiosum @ 50,000/acre weekly.',
              ],
          chemicalControlNotice: isHi
            ? 'कीटनाशक चेतावनी: रासायनिक कीटनाशक (जैसे इमामेक्टिन बेंजोएट 5% SG @ 0.4 ग्राम/लीटर) का छिड़काव केवल तभी करें जब जैविक उपाय असफल हों। स्प्रे नोजल को सीधे भोंपू में निर्देशित करें।'
            : 'Chemical Notice: Synthetic options (e.g. Emamectin benzoate 5% SG @ 0.4 g/L) should be strictly targeted into the whorl cup using a knapsack sprayer without nozzle swirl plate. Adhere to pre-harvest intervals.',
          whenToContactExpert: isHi
            ? 'यदि 10% से अधिक पौधों के केंद्रीय पत्ते पूरी तरह कट गए हों तो कृषि विज्ञान केंद्र (KVK) से संपर्क करें।'
            : 'Contact KVK agronomist immediately if heart leaves of >10% plants are destroyed.',
        },
        imageUri,
        imageQuality: {
          isGoodQuality: true,
          qualityScore: 96,
          guidanceTips: [isHi ? 'भोंपू के अंदर इल्लियों का बिल्कुल स्पष्ट फोकस' : 'Crisp focus inside central funnel whorl'],
        },
        disclaimer: 'AI assessment — field verification recommended for important decisions.',
        fieldVerificationRecommendation: isHi
          ? 'खेत में 20 पौधों के भोंपू खोलकर इल्ली की संख्या की पुष्टि करें।'
          : 'Peel back 20 whorls across field transect to confirm larval stage and density.',
        expertVerificationStatus: 'Unverified',
      };
    },
  },
  {
    id: 'demo-wheat-yellow-rust',
    title: 'Wheat — Yellow Rust (Puccinia striiformis)',
    titleHi: 'गेहूं — पीला रतुआ (Yellow Rust)',
    cropName: 'Wheat',
    category: 'Stripe Patterns & Humidity Risk',
    badge: 'Rapid Progression Risk',
    description: 'Bright yellow powdery pustules arranged in parallel lines on leaf blades.',
    descriptionHi: 'गेहूं की पत्तियों पर समानांतर रेखाओं में पीले पाउडर जैसे दाने और हाथ लगाने पर पीला रंग छूटना।',
    imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=80',
    result: (language: Language, imageUri: string): DiagnosisResult => {
      const isHi = language === 'hi';
      return {
        id: `demo_wheat_${Date.now()}`,
        timestamp: Date.now(),
        crop: 'Wheat',
        cropHindi: 'गेहूं',
        overallStatus: 'problem_detected',
        problemType: 'Disease',
        diagnosis: 'Yellow Rust / Stripe Rust (Puccinia striiformis)',
        diagnosisHindi: 'पीला रतुआ / स्ट्राइप रस्ट (Puccinia striiformis)',
        confidence: 0.91,
        isLowConfidence: false,
        possibleCauses: [],
        secondaryConditions: [
          {
            name: 'Brown Rust / Leaf Rust (Puccinia triticina)',
            hindiName: 'भूरा रतुआ (लीफ रस्ट)',
            type: 'Disease',
            confidence: 0.18,
            notes: isHi
              ? 'भूरे रतुए के धब्बे बिखरे हुए होते हैं, सीधी रेखा में नहीं।'
              : 'Brown rust pustules are scattered randomly across leaf, not in linear stripes.',
          },
        ],
        severity: 'Moderate',
        affectedAreaEstimate: '20–35% of leaf surface',
        progressionRisk: 'Rapid',
        symptoms: isHi
          ? [
              'पत्तियों पर चमकीले पीले रंग की धारियों (Stripes) में फफोले (Pustules)',
              'पत्तियों पर हाथ फेरने पर पीला पाउडर अंगुलियों पर लगना',
              'संक्रमित पत्तियां समय से पहले पीली होकर सूख जाना',
            ]
          : [
              'Linear stripes of miniature bright yellow-orange uredinial pustules along leaf veins',
              'Yellow fungal powder readily dislodging onto fingertips when brushed',
              'Premature chlorosis and desiccation of flag leaves reducing grain weight',
            ],
        evidence: {
          visualClues: isHi
            ? [
                'पत्ती की शिराओं के समानांतर स्पष्ट पीली धारियां',
                'पाउडर रूपी स्पोर्स (Uredospores) का उभार',
                'ठंडी व नम परिस्थितियों में विशिष्ट फैलाव',
              ]
            : [
                'Strictly parallel linear orientation of pustules following leaf venation',
                'Bright lemon-yellow powdery fungal sporulation clusters',
                'Chlorotic halos coalescing into contiguous yellow bands',
              ],
          affectedParts: isHi
            ? ['पत्ती की ऊपरी सतह (Upper leaf blade)', 'ध्वज पत्ती (Flag leaf)']
            : ['Adaxial leaf blade', 'Flag leaf canopy', 'Leaf sheath'],
          patternsIdentified: isHi
            ? ['समानांतर रेखीय धारियां (Linear stripe pattern)', 'स्पोर पाउडर जमाव (Powdery pustule eruption)']
            : ['Parallel linear stripe venation pattern', 'Uredinial pustule eruption'],
        },
        pestCountingAvailable: false,
        pestCounting: {
          available: false,
          countable: false,
          count: null,
          note: isHi ? 'कवक जनित रोग है, कीट नहीं।' : 'Airborne fungal rust pathogen. No insects present.',
        },
        ipmAdvisory: {
          immediateAction: isHi
            ? [
                'खेत में यदि किसी एक कोने में पीला रतुआ शुरू हुआ हो, तो उस हिस्से को चिन्हित करें।',
                'संक्रमित पौधों के पत्तों को हाथ से छूकर स्वस्थ पौधों को न छुएं, ताकि फैलाव रुके।',
              ]
            : [
                'Spot-treat initial focal patches immediately before wind disperses spores across the field.',
                'Avoid moving through wet fields to prevent clothing-assisted spore transmission.',
              ],
          monitoring: isHi
            ? [
                'सुबह के समय खेत का मुआयना करें, विशेषकर पेड़ की छाया वाले या अधिक नमी वाले किनारों पर।',
                'दिसंबर से फरवरी के दौरान तापमान 10-20°C और कोहरा रहने पर प्रतिदिन जांचें।',
              ]
            : [
                'Scout daily during humid cool windows (10–20°C with persistent morning fog).',
                'Focus on field margins near tree shade and canal banks where dew lingers.',
              ],
          prevention: isHi
            ? [
                'अगले मौसम में रतुआ-रोधी किस्में (जैसे HD-2967, DBW-187, DBW-222) ही बोएं।',
                'नाइट्रोजन (यूरिया) का अत्यधिक प्रयोग न करें, पोटाश की पर्याप्त मात्रा दें।',
              ]
            : [
                'Plant certified rust-resistant wheat cultivars recommended for your agro-climatic zone.',
                'Maintain balanced potassium fertilization to bolster epidermal cell wall strength.',
              ],
          biologicalCulturalControls: isHi
            ? ['शुरुआती रोकथाम हेतु जैव-कवकनाशी या नीम आधारित अर्क का उपयोग करें।']
            : ['Apply bio-fungicides during very early localized detection.'],
          chemicalControlNotice: isHi
            ? 'कीटनाशक चेतावनी: पीला रतुआ हवा से तेजी से फैलता है। लक्षण दिखते ही KVK द्वारा अनुशंसित प्रोपिकोनाजोल 25% EC (1 मिली/लीटर) या टेबुकोनाजोल का छिड़काव 200 लीटर पानी में मिलाकर करें।'
            : 'Chemical Notice: Yellow rust spreads aggressively via wind currents. If stripes appear on flag leaves, apply registered triazole fungicides (e.g. Propiconazole 25% EC @ 1 ml/L) as certified by ICAR-IIWBR / local KVK.',
          whenToContactExpert: isHi
            ? 'यदि 3 दिनों में खेत के 15% से अधिक पौधों पर पीली धारियां दिखने लगें तो तुरंत कृषि वैज्ञानिक को सूचित करें।'
            : 'Contact district wheat specialist immediately if yellow stripes reach flag leaves.',
        },
        imageUri,
        imageQuality: {
          isGoodQuality: true,
          qualityScore: 90,
          guidanceTips: [isHi ? 'पीली धारियों का बहुत स्पष्ट दृश्य' : 'Clear resolution of stripe pustules'],
        },
        disclaimer: 'AI assessment — field verification recommended for important decisions.',
        fieldVerificationRecommendation: isHi
          ? 'पत्ती पर सफेद कपड़ा या उंगली फेरकर देखें, यदि पीला पाउडर लगे तो रतुआ पुष्ट होता है।'
          : 'Gently wipe leaf with a white tissue; yellow powder confirms active rust sporulation.',
        expertVerificationStatus: 'Unverified',
      };
    },
  },
  {
    id: 'demo-healthy-crop',
    title: 'Paddy / Rice — Healthy Crop Canopy',
    titleHi: 'धान / चावल — स्वस्थ फसल',
    cropName: 'Rice / Paddy',
    category: 'Healthy Assessment & Prevention',
    badge: 'Healthy Status (95%)',
    description: 'Vibrant green canopy with uniform chlorophyll distribution and zero active pest or disease lesions.',
    descriptionHi: 'हरी-भरी स्वस्थ फसल, कोई बीमारी या कीट नहीं। सामान्य निगरानी और पोषण जारी रखें।',
    imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=80',
    result: (language: Language, imageUri: string): DiagnosisResult => {
      const isHi = language === 'hi';
      return {
        id: `demo_healthy_${Date.now()}`,
        timestamp: Date.now(),
        crop: 'Rice / Paddy',
        cropHindi: 'धान / चावल',
        overallStatus: 'healthy',
        problemType: 'Healthy',
        diagnosis: 'Healthy Crop (No Disease or Pest Detected)',
        diagnosisHindi: 'स्वस्थ फसल (कोई बीमारी या कीट नहीं दिखा)',
        confidence: 0.95,
        isLowConfidence: false,
        possibleCauses: [],
        secondaryConditions: [],
        severity: 'Low',
        affectedAreaEstimate: '0% (Healthy foliage)',
        progressionRisk: 'Slow',
        symptoms: isHi
          ? [
              'पत्तियां गहरी हरी और चमकदार हैं',
              'कोई फफूंद, धब्बा या कीट भक्षण के निशान नहीं',
              'पौधे का विकास सामान्य और स्वस्थ है',
            ]
          : [
              'Uniform deep green chlorophyll pigmentation across full leaf surface',
              'No fungal spots, lesions, chlorosis, or pest chewing damage observed',
              'Optimal leaf turgor and vegetative vigor',
            ],
        evidence: {
          visualClues: isHi
            ? [
                'पत्तियों में एकसमान हरा रंग है',
                'पौधे के किसी भी हिस्से में सूखापन या छेद नहीं हैं',
                'तने और पत्ते मजबूत व सीधे हैं',
              ]
            : [
                'Homogeneous chlorophyll pigmentation across lamina without necrosis',
                'Intact leaf margins and veins with zero feeding punctures',
                'Strong upright tillers demonstrating vigorous vegetative health',
              ],
          affectedParts: isHi ? ['कोई नहीं (सभी अंग स्वस्थ हैं)'] : ['None (All organs healthy)'],
          patternsIdentified: isHi
            ? ['समान हरा वर्णक (Uniform green pigment)', 'स्वस्थ वृद्धि पैटर्न (Healthy canopy structure)']
            : ['Uniform vegetative canopy', 'Optimal physiological turgor'],
        },
        pestCountingAvailable: false,
        pestCounting: {
          available: true,
          countable: false,
          count: 0,
          confidence: 0.98,
          densityEstimate: isHi ? '0 कीट (स्वच्छ फसल)' : '0 visible pests (Clean foliage)',
          note: isHi ? 'फसल पर कोई हानिकारक कीट नहीं देखा गया।' : 'No damaging insect pests detected in this sample.',
        },
        ipmAdvisory: {
          immediateAction: isHi
            ? [
                'वर्तमान में किसी भी रासायनिक दवा या कीटनाशक के छिड़काव की आवश्यकता नहीं है।',
                'अपनी नियमित खाद और सिंचाई का कार्यक्रम जारी रखें।',
              ]
            : [
                'No chemical sprays or fungicide interventions are required at this time.',
                'Maintain routine balanced irrigation and agronomic schedule.',
              ],
          monitoring: isHi
            ? [
                'सप्ताह में एक बार सुबह के समय खेत का मुआयना करें।',
                'मौसम में नमी बढ़ने पर नई पत्तियों पर नजर रखें।',
              ]
            : [
                'Conduct routine weekly scouting during early mornings.',
                'Keep an eye on leaf color changes after prolonged overcast days.',
              ],
          prevention: isHi
            ? [
                'खेत में मेड़ों पर खरपतवार न उगने दें।',
                'संतुलित मात्रा में नाइट्रोजन, फास्फोरस व पोटाश दें।',
              ]
            : [
                'Keep field bunds clean and weed-free to eliminate wild hosts.',
                'Maintain balanced NPK fertilization avoiding excessive urea spikes.',
              ],
          biologicalCulturalControls: isHi
            ? ['मित्र कीटों (जैसे मकड़ी, ड्रैगनफ्लाई) को सुरक्षित रखें, ये फसल की रक्षा करते हैं।']
            : ['Conserve beneficial predatory spiders and dragonflies in the paddy ecosystem.'],
          chemicalControlNotice: isHi
            ? 'निर्देश: अनावश्यक रासायनिक छिड़काव से बचें। इससे खेती की लागत बढ़ती है और मित्र कीट मर जाते हैं।'
            : 'Notice: Avoid prophylactic synthetic spraying on healthy crops to preserve natural predators and save input costs.',
          whenToContactExpert: isHi
            ? 'यदि आने वाले दिनों में किसी पौधे में पीलापन या पत्तियों पर धब्बे दिखें तो दोबारा फोटो खींचकर जांचें।'
            : 'Re-scan if unusual discoloration or leaf rolling is observed later in the season.',
        },
        imageUri,
        imageQuality: {
          isGoodQuality: true,
          qualityScore: 95,
          guidanceTips: [isHi ? 'उत्तम रोशनी व स्पष्ट पत्ता' : 'Optimal daylight & clear foliage focus'],
        },
        disclaimer: 'AI assessment — field verification recommended for important decisions.',
        fieldVerificationRecommendation: isHi
          ? 'फसल बहुत अच्छी स्थिति में है, नियमित देखभाल जारी रखें।'
          : 'Crop canopy is in excellent physiological health; continue preventive scouting.',
        expertVerificationStatus: 'Unverified',
      };
    },
  },
  {
    id: 'demo-low-confidence-sample',
    title: 'Ambiguous Leaf Spot — Low Confidence',
    titleHi: 'अस्पष्ट पत्ती धब्बा — कम सटीकता परिदृश्य',
    cropName: 'Chilli',
    category: 'Low Confidence & Differential Diagnosis',
    badge: 'Low Confidence (42%)',
    description: 'Sub-optimal photo matching multiple potential issues; demonstrates responsible AI disclaimer and differential diagnosis.',
    descriptionHi: 'धुंधली फोटो जहां लक्षण कई बीमारियों से मिलते हैं। AI अनिश्चितता और विभिन्न संभावनाएं दर्शाता है।',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?w=800&auto=format&fit=crop&q=80',
    result: (language: Language, imageUri: string): DiagnosisResult => {
      const isHi = language === 'hi';
      return {
        id: `demo_ambiguous_${Date.now()}`,
        timestamp: Date.now(),
        crop: 'Chilli',
        cropHindi: 'मिर्च',
        overallStatus: 'uncertain',
        problemType: 'Unknown',
        diagnosis: 'Inconclusive Foliage Spotting',
        diagnosisHindi: 'अस्पष्ट पत्ती धब्बा (अनिश्चित पहचान)',
        confidence: 0.42,
        isLowConfidence: true,
        possibleCauses: isHi
          ? [
              'मिर्च का सर्कोस्पोरा लीफ स्पॉट (Cercospora Leaf Spot)',
              'जीवाणु जनित पत्ती धब्बा (Bacterial Leaf Spot - Xanthomonas)',
              'पौधे में पोटाश या सूक्ष्म पोषक तत्वों की कमी',
            ]
          : [
              'Cercospora Leaf Spot (Cercospora capsici)',
              'Bacterial Leaf Spot (Xanthomonas campestris pv. vesicatoria)',
              'Early micro-nutrient imbalance (Potassium / Zinc deficiency)',
            ],
        secondaryConditions: [
          {
            name: 'Cercospora Leaf Spot',
            hindiName: 'सर्कोस्पोरा लीफ स्पॉट',
            type: 'Disease',
            confidence: 0.42,
            notes: isHi
              ? 'धब्बे के बीच का हिस्सा सफेद/सलेटी होता है।'
              : 'Lesions typically have grayish-white centers with dark brown borders.',
          },
          {
            name: 'Bacterial Leaf Spot',
            hindiName: 'जीवाणु पत्ती धब्बा रोग',
            type: 'Disease',
            confidence: 0.38,
            notes: isHi
              ? 'धब्बे जल-सिक्त (Water-soaked) होते हैं और किनारों से शुरू होते हैं।'
              : 'Water-soaked translucent spots usually initiating from leaf margins.',
          },
          {
            name: 'Nutrient Deficiency',
            hindiName: 'पोषक तत्वों की कमी',
            type: 'Nutrient Deficiency',
            confidence: 0.20,
            notes: isHi
              ? 'पत्तियों के किनारों पर सूखापन और पीलापन।'
              : 'Margin scorching without distinct fungal fungal rings.',
          },
        ],
        severity: 'Moderate',
        affectedAreaEstimate: '10–20%',
        progressionRisk: 'Moderate',
        symptoms: isHi
          ? [
              'पत्तियों पर अनियमित छोटे भूरे धब्बे',
              'धब्बों के स्पष्ट संकेंद्रित छल्ले या जीवाणु रिसाव फोटो में साफ नहीं हैं',
              'फोटो की गुणवत्ता धुंधली होने के कारण निश्चित पहचान संभव नहीं',
            ]
          : [
              'Irregular scattered small brown specks on leaf lamina',
              'Distinctive fruiting bodies or water-soaking not sharply resolvable in photo',
              'Symptom overlap between bacterial, fungal, and physiological stress',
            ],
        evidence: {
          visualClues: isHi
            ? [
                'धब्बे छोटे और छितरे हुए हैं',
                'किनारों पर स्पष्ट जीवाणु रिसाव (Bacterial ooze) या छल्ले नहीं दिख रहे',
                'फोटो में रोशनी थोड़ी कम और फोकस हल्का धुंधला है',
              ]
            : [
                'Indeterminate small brown lesions without clearly resolved margin characteristics',
                'Lighting reflection obscures subtle fungal sporulation structures',
                'Foliage orientation prevents inspection of the critical abaxial leaf surface',
              ],
          affectedParts: isHi ? ['पत्ती की ऊपरी सतह'] : ['Adaxial leaf surface'],
          patternsIdentified: isHi
            ? ['छितरे हुए धब्बे (Diffuse punctate spotting)']
            : ['Diffuse punctate spotting without pathognomonic marker'],
        },
        pestCountingAvailable: false,
        pestCounting: {
          available: false,
          countable: false,
          count: null,
          note: isHi ? 'कीटों की पहचान नहीं हुई।' : 'No countable insect pests detected.',
        },
        ipmAdvisory: {
          immediateAction: isHi
            ? [
                'तत्काल कोई भी कीटनाशक या रासायनिक स्प्रे न करें जब तक सही पहचान न हो जाए।',
                'दिन के उजाले में पत्ती को सीधा पकड़कर और पास से 1-2 नई साफ फोटो लें।',
              ]
            : [
                'Do not apply synthetic chemicals blindly; avoid unnecessary expenditure and crop stress.',
                'Take 1–2 clearer close-up photos in natural daylight focusing on a single leaf spot.',
              ],
          monitoring: isHi
            ? [
                'जांचें कि क्या धब्बों के बीच में सफेद छेद हो रहे हैं या पत्ते पीले होकर गिर रहे हैं।',
                'खेत के अन्य 10 पौधों का मुआयना करें कि क्या यह समस्या पूरे खेत में है।',
              ]
            : [
                'Check whether spots develop "shot-hole" paper centers or drop off prematurely.',
                'Inspect 10 other plants across the plot to assess if symptom is localized or systemic.',
              ],
          prevention: isHi
            ? [
                'पौधों की जड़ों में अधिक नमी न रहने दें।',
                'शाम के समय पत्तों पर पानी के छिड़काव से बचें।',
              ]
            : [
                'Ensure soil aeration and avoid prolonged root saturation.',
                'Avoid late-day sprinkler watering to prevent extended leaf wetness.',
              ],
          biologicalCulturalControls: isHi
            ? ['सुरक्षात्मक उपाय के रूप में 5% नीम तेल (Neem Oil) का हल्का छिड़काव कर सकते हैं।']
            : ['A gentle preventative application of organic neem formulation (1500 ppm) is safe while awaiting confirmation.'],
          chemicalControlNotice: isHi
            ? 'महत्वपूर्ण चेतावनी: कम सटीकता होने के कारण तुरंत रासायनिक दवा का प्रयोग न करें। नजदीकी KVK या कृषि अधिकारी को पत्ता दिखाकर पुष्टि करें।'
            : 'Caution: Given low diagnostic confidence (<50%), chemical intervention is strictly discouraged. Submit leaf sample to your nearest Krishi Vigyan Kendra (KVK) for physical verification.',
          whenToContactExpert: isHi
            ? 'सही पहचान के लिए अपने नजदीकी कृषि विज्ञान केंद्र (KVK) से संपर्क करें।'
            : 'Contact local KVK extension agronomist for microscopic examination before spraying.',
        },
        imageUri,
        imageQuality: {
          isGoodQuality: false,
          qualityScore: 52,
          guidanceTips: [
            isHi ? 'फोटो थोड़ी धुंधली है' : 'Image has slight motion blur',
            isHi ? 'पत्ती के और पास से फोटो लें' : 'Get closer to affected leaf lesion',
          ],
        },
        disclaimer: 'Low confidence AI assessment — do not apply chemicals without expert field verification.',
        fieldVerificationRecommendation: isHi
          ? 'संदेह की स्थिति में रासायनिक दवा न डालें, पहले KVK विशेषज्ञ से मिलें।'
          : 'High ambiguity: Physical agronomist inspection required prior to chemical purchase.',
        expertVerificationStatus: 'Unverified',
      };
    },
  },
];
