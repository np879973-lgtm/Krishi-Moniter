import { Language } from '../types';

export interface UIStrings {
  brandName: string;
  tagline: string;
  homeHeroTitle: string;
  homeHeroSubtitle: string;
  checkMyCrop: string;
  homeStep1: string;
  homeStep2: string;
  homeStep3: string;
  homeStep4: string;
  weather: string;
  myReports: string;
  farmingTips: string;
  selectCropTitle: string;
  selectCropSubtitle: string;
  searchCropPlaceholder: string;
  notSureOther: string;
  selectedCropLabel: string;
  showUsCropTitle: string;
  takePhoto: string;
  uploadGallery: string;
  photoGuidanceTitle: string;
  photoGuidance1: string;
  photoGuidance2: string;
  photoGuidance3: string;
  photoGuidance4: string;
  analyzeCrop: string;
  retakePhoto: string;
  analyzingTitle: string;
  analyzingSubtitle: string;
  validationErrorTitle: string;
  validationDefaultError: string;
  problemDetected: string;
  whatWeFound: string;
  confidenceLabel: string;
  aiEstimateDisclaimer: string;
  severityLabel: string;
  affectedAreaLabel: string;
  severityNotice: string;
  symptomsTitle: string;
  whatShouldIDo: string;
  immediateAction: string;
  monitoringTitle: string;
  preventionTitle: string;
  biologicalControls: string;
  chemicalGuidanceNotice: string;
  whenToContactExpert: string;
  pestCountingAvailable: string;
  pestCountingUnavailable: string;
  estimatedPestCount: string;
  lowConfidenceNotice: string;
  possibleCausesTitle: string;
  analyzeAnother: string;
  changeCrop: string;
  saveReport: string;
  reportSaved: string;
  askExpert: string;
  noReportsTitle: string;
  noReportsDesc: string;
  backToHome: string;
  today: string;
  yesterday: string;
  deleteReport: string;
  confirmDelete: string;
  shareReport: string;
  weatherTitle: string;
  weatherSubtitle: string;
  farmingTipsTitle: string;
  farmingTipsSubtitle: string;
  expertModalTitle: string;
  expertModalSubtitle: string;
  kisanCallCenter: string;
  kvkCenter: string;
  verifiedStatus: string;
  unverifiedStatus: string;
  // Part 2 additions
  whyWeThinkThis: string;
  visualEvidenceTitle: string;
  visualClues: string;
  affectedParts: string;
  patternsIdentified: string;
  differentialDiagnosis: string;
  differentialDesc: string;
  progressionRiskTitle: string;
  riskSlow: string;
  riskModerate: string;
  riskRapid: string;
  riskAggressive: string;
  statusHealthyTitle: string;
  statusProblemTitle: string;
  statusUncertainTitle: string;
  statusHealthyDesc: string;
  pestCountingReliable: string;
  pestCountingSwarm: string;
  pestDensityLabel: string;
  farmerNotesLabel: string;
  farmerNotesPlaceholder: string;
  fieldNotesQuickTitle: string;
  quickNoteRain: string;
  quickNoteYellowing: string;
  quickNoteWilting: string;
  quickNoteInsects: string;
  locationLabel: string;
  selectLocationPlaceholder: string;
  demoModeTitle: string;
  demoModeSubtitle: string;
  demoModeBadge: string;
  qualityCheckTitle: string;
  qualityGood: string;
  qualityNeedsCare: string;
  fieldVerificationTitle: string;
  // Part 3 Weather & Risk additions
  cropRiskOutlook: string;
  weatherForFarm: string;
  riskTimeline: string;
  whatToDoNow: string;
  changeLocation: string;
  sprayingGuidance: string;
  activeAlerts: string;
  diseaseRisk: string;
  pestRisk: string;
  weatherStress: string;
  saveForecast: string;
  riskHistory: string;
}

export const translations: Record<Language, UIStrings> = {
  en: {
    brandName: 'Krishi Mentor',
    tagline: 'Your AI Farming Companion',
    homeHeroTitle: 'Identify crop problems with your smartphone',
    homeHeroSubtitle:
      'Take or upload a photo of your crop and Krishi Mentor will help identify possible diseases, pests and crop problems.',
    checkMyCrop: 'Check My Crop',
    homeStep1: '1. Select Crop',
    homeStep2: '2. Upload Photo',
    homeStep3: '3. AI Analysis',
    homeStep4: '4. Get Advice',
    weather: 'Weather',
    myReports: 'My Reports',
    farmingTips: 'Farming Tips',
    selectCropTitle: 'What crop are you checking?',
    selectCropSubtitle: 'Select the crop to improve diagnosis accuracy.',
    searchCropPlaceholder: 'Search crop (e.g. Wheat, Tomato, Rice)...',
    notSureOther: 'Not sure? Select Other',
    selectedCropLabel: 'Selected Crop',
    showUsCropTitle: 'Show us your crop',
    takePhoto: 'Take Photo',
    uploadGallery: 'Upload from Gallery',
    photoGuidanceTitle: 'For better results:',
    photoGuidance1: 'Take a clear photo in good light',
    photoGuidance2: 'Focus on the affected leaf, stem, or fruit',
    photoGuidance3: 'Avoid very dark, shaky or blurry images',
    photoGuidance4: 'Include insects or spots when visible',
    analyzeCrop: 'Analyze Crop',
    retakePhoto: 'Retake / Choose Another',
    analyzingTitle: 'Analyzing your crop with AI...',
    analyzingSubtitle: 'Inspecting leaf patterns, lesion shapes, and pest signs',
    validationErrorTitle: 'Photo needs adjustment',
    validationDefaultError:
      'The photo is not clear enough for reliable analysis. Please take another photo in good light and focus on the affected area.',
    problemDetected: 'Problem Detected',
    whatWeFound: 'What we found',
    confidenceLabel: 'Confidence',
    aiEstimateDisclaimer:
      'AI assessment — field verification recommended for important decisions.',
    severityLabel: 'Severity',
    affectedAreaLabel: 'Affected Area',
    severityNotice:
      'Severity is an AI estimate based on the submitted image. Field inspection may be required.',
    symptomsTitle: 'Key Symptoms Observed',
    whatShouldIDo: 'What should I do? (IPM Advisory)',
    immediateAction: '1. Immediate Action',
    monitoringTitle: '2. Field Monitoring',
    preventionTitle: '3. Prevention & Cultural Care',
    biologicalControls: 'Biological & Non-Chemical Controls',
    chemicalGuidanceNotice:
      'Chemical control notice: Apply synthetic fungicides/pesticides strictly in accordance with verified recommendations from your local Krishi Vigyan Kendra (KVK) or State Agricultural Department.',
    whenToContactExpert: '4. When to Contact an Expert',
    pestCountingAvailable: 'Estimated Pest Count',
    pestCountingUnavailable: 'Pest counting is not available for this image yet.',
    estimatedPestCount: 'Estimated Pest Count',
    lowConfidenceNotice: 'We could not confidently identify the problem.',
    possibleCausesTitle: 'Possible Causes to Check:',
    analyzeAnother: 'Analyze Another Photo',
    changeCrop: 'Change Crop',
    saveReport: 'Save Report',
    reportSaved: 'Report Saved to Device',
    askExpert: 'Ask an Expert',
    noReportsTitle: 'No Saved Reports Yet',
    noReportsDesc:
      'Diagnose your crops and tap "Save Report" to build your crop health history here.',
    backToHome: 'Back to Home',
    today: 'Today',
    yesterday: 'Yesterday',
    deleteReport: 'Delete',
    confirmDelete: 'Are you sure you want to delete this report?',
    shareReport: 'Share Summary',
    weatherTitle: 'Agri-Weather & Spray Conditions',
    weatherSubtitle: 'Local weather intelligence for farm activities',
    farmingTipsTitle: 'Seasonal Farming Tips',
    farmingTipsSubtitle: 'Good agricultural practices for healthy yields',
    expertModalTitle: 'Connect with Agricultural Experts',
    expertModalSubtitle:
      'Free government helplines and certified agronomy support across India',
    kisanCallCenter: 'Kisan Call Center (Toll Free 1800-180-1551)',
    kvkCenter: 'Krishi Vigyan Kendra (KVK) Network',
    verifiedStatus: 'AI Preliminary Assessment',
    unverifiedStatus: 'Awaiting Field Confirmation',
    // Part 2 translations (English)
    whyWeThinkThis: 'Why We Think This',
    visualEvidenceTitle: 'Visual Evidence from Photo',
    visualClues: 'Visual Clues Identified',
    affectedParts: 'Affected Plant Anatomy',
    patternsIdentified: 'Symptom Patterns Recognized',
    differentialDiagnosis: 'Differential Diagnosis & Other Possibilities',
    differentialDesc: 'When symptoms overlap, consider these alternative possibilities before treating:',
    progressionRiskTitle: 'Spread & Progression Risk',
    riskSlow: 'Slow — Localized spread',
    riskModerate: 'Moderate — Monitor regularly',
    riskRapid: 'Rapid — Weather conditions favor fast multiplication',
    riskAggressive: 'Aggressive — Immediate field intervention advised',
    statusHealthyTitle: 'Healthy Crop Detected',
    statusProblemTitle: 'Crop Issue Detected',
    statusUncertainTitle: 'Inconclusive / Unclear Image',
    statusHealthyDesc: 'The foliage appears vigorous with no significant disease lesions or active insect infestation. Continue preventive care.',
    pestCountingReliable: 'Distinct countable insects visible',
    pestCountingSwarm: 'Colony / Swarm infestation (individual counting unreliable)',
    pestDensityLabel: 'Pest Density',
    farmerNotesLabel: 'Field Notes & Observations (Optional)',
    farmerNotesPlaceholder: 'e.g. Yellowing began 2 days after heavy rainfall; noticed white dust under leaves...',
    fieldNotesQuickTitle: 'Quick Field Context:',
    quickNoteRain: 'Heavy rain in past 2 days',
    quickNoteYellowing: 'Yellowing from lower canopy',
    quickNoteWilting: 'Sudden midday wilting',
    quickNoteInsects: 'Tiny insects seen on underside',
    locationLabel: 'State / Agro-Climatic Region',
    selectLocationPlaceholder: 'Select your state...',
    demoModeTitle: 'AI Scenario Test Center',
    demoModeSubtitle: 'Explore how Krishi Mentor diagnoses varied agricultural scenarios in the field',
    demoModeBadge: 'Demo Mode',
    qualityCheckTitle: 'Image Quality Pre-Check',
    qualityGood: 'Good Quality: Clear lighting & focus detected',
    qualityNeedsCare: 'Sub-optimal photo: May reduce diagnosis confidence',
    fieldVerificationTitle: 'Agronomist Field Protocol',
    // Part 3 English
    cropRiskOutlook: 'Crop Risk Outlook (Next 48–72 Hours)',
    weatherForFarm: 'Weather for Your Farm',
    riskTimeline: '7-Day Projected Risk Timeline',
    whatToDoNow: 'What Farmer Should Do Now',
    changeLocation: 'Change Location',
    sprayingGuidance: 'Spraying Guidance',
    activeAlerts: 'Active Agricultural Alerts',
    diseaseRisk: 'Disease Risk',
    pestRisk: 'Pest Risk',
    weatherStress: 'Weather Stress',
    saveForecast: 'Save Risk Forecast',
    riskHistory: 'Risk History',
  },
  hi: {
    brandName: 'कृषि मेंटर (Krishi Mentor)',
    tagline: 'आपका AI किसान साथी',
    homeHeroTitle: 'अपने स्मार्टफोन से फसल की समस्या पहचानें',
    homeHeroSubtitle:
      'अपनी फसल की एक तस्वीर लें या अपलोड करें। कृषि मेंटर संभावित बीमारियों, कीटों और समस्याओं को पहचानने में मदद करेगा।',
    checkMyCrop: 'मेरी फसल की जांच करें',
    homeStep1: '1. फसल चुनें',
    homeStep2: '2. फोटो अपलोड करें',
    homeStep3: '3. AI विश्लेषण',
    homeStep4: '4. सलाह पाएं',
    weather: 'मौसम',
    myReports: 'मेरी रिपोर्ट्स',
    farmingTips: 'खेती के सुझाव',
    selectCropTitle: 'आप किस फसल की जांच कर रहे हैं?',
    selectCropSubtitle: 'सटीक पहचान के लिए फसल का चुनाव करें।',
    searchCropPlaceholder: 'फसल खोजें (जैसे गेहूं, टमाटर, धान)...',
    notSureOther: 'निश्चित नहीं? अन्य फसल चुनें',
    selectedCropLabel: 'चुनी गई फसल',
    showUsCropTitle: 'अपनी फसल की तस्वीर दिखाएं',
    takePhoto: 'फोटो खींचें',
    uploadGallery: 'गैलरी से अपलोड करें',
    photoGuidanceTitle: 'बेहतर परिणाम के लिए:',
    photoGuidance1: 'अच्छी रोशनी में साफ फोटो लें',
    photoGuidance2: 'प्रभावित पत्ते, तने या फल पर फोकस करें',
    photoGuidance3: 'अत्यधिक अंधेरी या धुंधली तस्वीर से बचें',
    photoGuidance4: 'यदि कीट या धब्बे दिखें तो उन्हें भी शामिल करें',
    analyzeCrop: 'फसल की जांच करें',
    retakePhoto: 'दूसरी फोटो लें',
    analyzingTitle: 'AI द्वारा फसल की जांच जारी है...',
    analyzingSubtitle: 'पत्तियों के धब्बों, कीटों और लक्षणों का विश्लेषण हो रहा है',
    validationErrorTitle: 'फोटो में सुधार की आवश्यकता है',
    validationDefaultError:
      'सटीक विश्लेषण के लिए यह तस्वीर पर्याप्त रूप से स्पष्ट नहीं है। कृपया अच्छी रोशनी में प्रभावित हिस्से पर फोकस करके दोबारा फोटो लें।',
    problemDetected: 'पहचानी गई समस्या',
    whatWeFound: 'जांच में क्या मिला',
    confidenceLabel: 'अनुमानित सटीकता (Confidence)',
    aiEstimateDisclaimer:
      'यह AI अनुमान है — महत्वपूर्ण निर्णयों के लिए स्थानीय कृषि विशेषज्ञ से पुष्टि की सलाह दी जाती है।',
    severityLabel: 'गंभीरता (Severity)',
    affectedAreaLabel: 'प्रभावित हिस्सा',
    severityNotice:
      'गंभीरता का स्तर केवल फोटो पर आधारित AI अनुमान है। खेत का वास्तविक निरीक्षण आवश्यक हो सकता है।',
    symptomsTitle: 'प्रमुख लक्षण',
    whatShouldIDo: 'मुझे क्या करना चाहिए? (IPM सलाह)',
    immediateAction: '1. तत्काल उपाय',
    monitoringTitle: '2. खेत की निगरानी',
    preventionTitle: '3. रोकथाम और स्वच्छता',
    biologicalControls: 'जैविक व गैर-रासायनिक नियंत्रण',
    chemicalGuidanceNotice:
      'कीटनाशक चेतावनी: रासायनिक दवाओं का छिड़काव केवल तभी करें जब अत्यंत आवश्यक हो और स्थानीय कृषि विज्ञान केंद्र (KVK) या कृषि विभाग के निर्देशानुसार ही करें।',
    whenToContactExpert: '4. विशेषज्ञ से कब संपर्क करें',
    pestCountingAvailable: 'अनुमानित कीट संख्या',
    pestCountingUnavailable: 'इस फोटो में कीटों की गिनती की सुविधा अभी उपलब्ध नहीं है।',
    estimatedPestCount: 'अनुमानित कीट संख्या',
    lowConfidenceNotice: 'हम विश्वासपूर्वक समस्या की पहचान नहीं कर सके।',
    possibleCausesTitle: 'संभावित कारण जिनकी जांच करें:',
    analyzeAnother: 'दूसरी फोटो की जांच करें',
    changeCrop: 'फसल बदलें',
    saveReport: 'रिपोर्ट सहेजें',
    reportSaved: 'रिपोर्ट मोबाइल में सहेजी गई',
    askExpert: 'विशेषज्ञ से पूछें',
    noReportsTitle: 'अभी कोई सहेजी गई रिपोर्ट नहीं है',
    noReportsDesc:
      'फसल की जांच करने के बाद "रिपोर्ट सहेजें" पर टैप करें, ताकि आपकी पिछली जांचें यहां सुरक्षित रहें।',
    backToHome: 'होम पेज पर जाएं',
    today: 'आज',
    yesterday: 'कल',
    deleteReport: 'हटाएं',
    confirmDelete: 'क्या आप वाकई इस रिपोर्ट को हटाना चाहते हैं?',
    shareReport: 'विवरण साझा करें',
    weatherTitle: 'कृषि मौसम और छिड़काव की स्थिति',
    weatherSubtitle: 'खेती के कार्यों के लिए मौसम की जानकारी',
    farmingTipsTitle: 'सामयिक कृषि सलाह',
    farmingTipsSubtitle: 'अच्छी पैदावार और स्वस्थ फसल के लिए उत्तम उपाय',
    expertModalTitle: 'कृषि विशेषज्ञों से संपर्क करें',
    expertModalSubtitle: 'भारत सरकार की निःशुल्क हेल्पलाइन व कृषि वैज्ञानिक सहायता',
    kisanCallCenter: 'किसान कॉल सेंटर (टोल फ्री 1800-180-1551)',
    kvkCenter: 'कृषि विज्ञान केंद्र (KVK) नेटवर्क',
    verifiedStatus: 'AI प्रारंभिक विश्लेषण',
    unverifiedStatus: 'स्थानीय सत्यापन प्रतीक्षित',
    // Part 2 translations (Hindi)
    whyWeThinkThis: 'AI ने यह क्यों पहचाना (दृश्य प्रमाण)',
    visualEvidenceTitle: 'फोटो से मिले दृश्य लक्षण',
    visualClues: 'पहचाने गए मुख्य लक्षण',
    affectedParts: 'प्रभावित पौधे का हिस्सा',
    patternsIdentified: 'बीमारी के लक्षण पैटर्न',
    differentialDiagnosis: 'अन्य संभावित कारण (Differential Diagnosis)',
    differentialDesc: 'यदि लक्षण मिलते-जुलते हों, तो उपचार से पूर्व इन संभावित कारणों पर भी ध्यान दें:',
    progressionRiskTitle: 'रोग फैलाव का जोखिम',
    riskSlow: 'धीमा — सीमित फैलाव',
    riskModerate: 'मध्यम — नियमित निगरानी रखें',
    riskRapid: 'तीव्र — मौसम अनुकूल होने पर तेजी से फैलाव संभव',
    riskAggressive: 'अति-तीव्र — तत्काल खेत प्रबंधन आवश्यक',
    statusHealthyTitle: 'फसल स्वस्थ पाई गई',
    statusProblemTitle: 'फसल में समस्या पाई गई',
    statusUncertainTitle: 'अस्पष्ट फोटो / अनिश्चित परिणाम',
    statusHealthyDesc: 'पौधे की पत्तियां स्वस्थ और हरी हैं, कोई गंभीर रोग या सक्रिय कीट प्रकोप नहीं दिखा। सामान्य पोषण व रोकथाम जारी रखें।',
    pestCountingReliable: 'स्पष्ट गिने जा सकने वाले कीट दिखाई दिए',
    pestCountingSwarm: 'कीटों का झुंड / कॉलोनी (एक-एक कीट गिनना संभव नहीं)',
    pestDensityLabel: 'कीट घनत्व',
    farmerNotesLabel: 'खेत की अतिरिक्त जानकारी व लक्षण (वैकल्पिक)',
    farmerNotesPlaceholder: 'जैसे: दो दिन पहले हुई बारिश के बाद पत्ते पीले पड़ने लगे; पत्तों के नीचे सफेद जाला दिखा...',
    fieldNotesQuickTitle: 'त्वरित खेत परिस्थिति चुनें:',
    quickNoteRain: 'पिछले 2 दिनों में भारी बारिश',
    quickNoteYellowing: 'निचले पत्तों से पीलापन शुरू',
    quickNoteWilting: 'दोपहर में पौधों का अचानक मुरझाना',
    quickNoteInsects: 'पत्ते के नीचे छोटे रेंगने वाले कीड़े',
    locationLabel: 'राज्य / कृषि-जलवायु क्षेत्र',
    selectLocationPlaceholder: 'अपना राज्य चुनें...',
    demoModeTitle: 'AI जांच परिदृश्य केंद्र (Demo Mode)',
    demoModeSubtitle: 'देखें कि कृषि मेंटर खेत के अलग-अलग परिदृश्यों में कैसे रोग व कीट पहचानता है',
    demoModeBadge: 'डेमो मोड',
    qualityCheckTitle: 'फोटो गुणवत्ता पूर्व-जांच',
    qualityGood: 'उत्तम गुणवत्ता: अच्छी रोशनी व स्पष्ट फोटो',
    qualityNeedsCare: 'कम गुणवत्ता: AI सटीकता प्रभावित हो सकती है',
    fieldVerificationTitle: 'कृषि विशेषज्ञ सत्यापन निर्देश',
    // Part 3 Hindi
    cropRiskOutlook: 'फसल जोखिम दृष्टिकोण (अगले 48–72 घंटे)',
    weatherForFarm: 'आपके खेत का मौसम',
    riskTimeline: '7-दिवसीय जोखिम समयरेखा',
    whatToDoNow: 'किसान तुरंत क्या करें (What To Do Now)',
    changeLocation: 'स्थान बदलें',
    sprayingGuidance: 'छिड़काव सलाह',
    activeAlerts: 'सक्रिय कृषि चेतावनियां व अलर्ट',
    diseaseRisk: 'रोग जोखिम',
    pestRisk: 'कीट जोखिम',
    weatherStress: 'मौसम तनाव',
    saveForecast: 'पूर्वानुमान सहेजें',
    riskHistory: 'जोखिम इतिहास',
  },
};

