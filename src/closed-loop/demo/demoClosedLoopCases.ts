// Isolated Demo Cases for Part 7 Closed-Loop Agricultural Workflow
// Clearly labeled as DEMO DATA. Demonstrates the complete Farmer → AI → Expert → Extension → Outcome → Learning loop.

import { ClosedLoopCase } from '../types';

const DEMO_IMG_TOMATO_INITIAL =
  'https://images.unsplash.com/photo-1592417817098-8f3d6910a451?w=800&auto=format&fit=crop&q=80';
const DEMO_IMG_TOMATO_FOLLOWUP =
  'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=800&auto=format&fit=crop&q=80';
const DEMO_IMG_CHILI =
  'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80';
const DEMO_IMG_WHEAT =
  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80';

export const INITIAL_CLOSED_LOOP_DEMO_CASES: ClosedLoopCase[] = [
  // =========================================================================
  // CASE 1: COMPLETE CLOSED LOOP (Farmer → AI → Expert → Extension → Action → Outcome → Verified → Training Candidate)
  // =========================================================================
  {
    id: 'KM-2026-000201',
    farmerId: 'farmer-primary',
    farmerName: 'Rameshwar Patil',
    farmId: 'farm-nashik-01',
    farmName: 'Patil Organic Horticulture',
    fieldId: 'field-tomato-north',
    fieldName: 'North Tomato Plot (1.5 Acres)',
    crop: 'Tomato',
    cropHindi: 'टमाटर',
    primaryImageUri: DEMO_IMG_TOMATO_INITIAL,
    additionalImages: [
      'https://images.unsplash.com/photo-1592417817098-8f3d6910a451?w=800&auto=format&fit=crop&q=80',
    ],
    farmerMessage:
      'Dark water-soaked spots appeared on lower leaves after continuous rains. Need urgent assistance before fruit rot sets in.',
    priority: 'URGENT',
    priorityScore: 88,
    priorityReason:
      'Critical foliar blight spread rapidly after 3-day rainfall event; high economic vulnerability',
    status: 'OUTCOME_VERIFIED',
    verificationStatus: 'EXPERT_VERIFIED',
    createdAt: Date.now() - 10 * 24 * 3600 * 1000,
    updatedAt: Date.now() - 1 * 24 * 3600 * 1000,
    submittedAt: Date.now() - 10 * 24 * 3600 * 1000,
    reviewedAt: Date.now() - 9 * 24 * 3600 * 1000,
    assignedExpertId: 'exp-icar-sharma',
    assignedExpertName: 'Dr. A. K. Sharma (ICAR-IARI)',
    isDemo: true,
    offlineSyncStatus: 'SYNCED',

    // 1. AI Assessment (Immutable)
    aiAssessment: {
      diagnosisId: 'diag-ai-201',
      crop: 'Tomato',
      cropHindi: 'टमाटर',
      problemType: 'Disease',
      diagnosis: 'Late Blight (Phytophthora infestans)',
      diagnosisHindi: 'पछेती झुलसा (फाइटोफ्थोरा इन्फेस्टन्स)',
      confidence: 0.84,
      severity: 'Critical',
      affectedAreaEstimate: '35% of canopy foliage',
      symptoms: [
        'Irregular water-soaked pale green lesions on leaves',
        'Dark brown necrotic patches with pale chlorotic borders',
        'White fungal downy growth on leaf undersides under high humidity',
      ],
      possibleCauses: ['Phytophthora infestans oospores', 'Relative humidity > 90% and cool temperatures'],
      secondaryConditions: [{ name: 'Early Blight (Alternaria)', confidence: 0.18 }],
      imageQualityScore: 88,
      ipmAdvisory: {
        immediateAction: [
          'Immediately destroy and bury heavily infected lower stems',
          'Cease overhead sprinkling to stop zoospore splashing',
        ],
        monitoring: ['Inspect leaf undersides each morning for sporulation'],
        prevention: ['Improve air ventilation by selective trellising'],
        biologicalCulturalControls: ['Apply Trichoderma harzianum soil drench'],
        chemicalControlNotice:
          'Chemical intervention: Consult your local KVK or extension officer for registered cymoxanil/mancozeb fungicide schedule.',
        whenToContactExpert: 'If dark greasy lesions expand to green fruit calyxes.',
      },
    },

    // 2. Expert Verification (Immutable)
    expertAssessment: {
      expertId: 'exp-icar-sharma',
      expertName: 'Dr. A. K. Sharma',
      expertTitle: 'Principal Scientist (Plant Pathology, ICAR)',
      decision: 'CONFIRM',
      verifiedDiagnosis: 'Late Blight (Phytophthora infestans)',
      verifiedDiagnosisHindi: 'पछेती झुलसा (फाइटोफ्थोरा इन्फेस्टन्स)',
      verifiedProblemType: 'Disease',
      verifiedSeverity: 'Critical',
      expertConfidence: 'DEFINITIVE',
      isCorrected: false,
      originalAIDiagnosis: 'Late Blight (Phytophthora infestans)',
      additionalObservations:
        'Water-soaked foliar margins and sporulation pattern confirm Phytophthora infestans. Weather forecast indicates further rainfall, creating severe community spread risk in adjacent tomato blocks.',
      internalNotes:
        'High sporulation potential. Neighboring plots in Dindori block should be put on preventive alert.',
      farmerVisibleResponse: {
        assessmentSummary:
          'Confirmed: Late Blight (Phytophthora infestans). Immediate intervention required to protect fruit clusters.',
        explanation:
          'The persistent cool moisture provided ideal conditions for fungal oospore germination. Trellising and targeted spray will prevent fruit loss.',
        recommendedActions: [
          'Remove infected leaves carefully and dispose off-field in sealed bags',
          'Ensure dry furrow irrigation; keep foliage dry',
          'Follow government extension schedule for registered systemic anti-oomycete sprays',
        ],
        followUpInstructions:
          'Upload follow-up photos after 5 days to assess lesion drying and new leaf growth.',
        chemicalGuidanceNotice:
          'Chemical guidance: Follow registered dosage strictly. Extension officer has been notified for in-field supply support.',
      },
      dataQualityFlag: 'VERIFIED_HIGH_QUALITY',
      reviewedAt: Date.now() - 9 * 24 * 3600 * 1000,
    },

    // 3. Escalation to Extension
    escalation: {
      id: 'esc-201',
      caseId: 'KM-2026-000201',
      escalatedBy: 'exp-icar-sharma',
      escalatedByName: 'Dr. A. K. Sharma',
      escalatedByRole: 'EXPERT',
      escalatedAt: Date.now() - 9 * 24 * 3600 * 1000 + 3600000,
      reason: 'HIGH_RISK_OUTBREAK',
      priority: 'URGENT',
      problemCategory: 'Late Blight Foliar Epidemic Risk',
      recommendedAction:
        'Dispatch block extension officer for on-field fungicide calibration and check neighboring plots.',
      additionalNotes:
        'Potential cluster requiring verification across Nashik tomato belt due to continuous wet weather.',
      status: 'RESOLVED',
      assignedOfficerId: 'ext-officer-verma',
      assignedOfficerName: 'Sanjay Verma (Block Agricultural Officer, Nashik)',
    },

    // 4. Extension Actions
    extensionActions: [
      {
        id: 'act-201-1',
        caseId: 'KM-2026-000201',
        actionType: 'FIELD_VISIT',
        createdBy: 'exp-icar-sharma',
        createdByName: 'Dr. A. K. Sharma',
        assignedTo: 'ext-officer-verma',
        assignedToName: 'Sanjay Verma (BAO)',
        priority: 'URGENT',
        title: 'Conduct physical field verification & leaf moisture assessment',
        description:
          'Visit Rameshwar Patil farm to verify Late Blight spread radius and demonstrate proper IPM canopy pruning.',
        createdAt: Date.now() - 8 * 24 * 3600 * 1000,
        dueDate: Date.now() - 6 * 24 * 3600 * 1000,
        status: 'COMPLETED',
        completionNotes:
          'Field visited. Farmer pruned lower 40cm canopy. Demonstrated registered fungicide spraying technique. Neighboring plots alerted.',
        completedAt: Date.now() - 6 * 24 * 3600 * 1000,
      },
      {
        id: 'act-201-2',
        caseId: 'KM-2026-000201',
        actionType: 'ADVISORY_CAMPAIGN',
        createdBy: 'ext-officer-verma',
        createdByName: 'Sanjay Verma (BAO)',
        assignedTo: 'ext-officer-verma',
        assignedToName: 'Sanjay Verma (BAO)',
        priority: 'HIGH',
        title: 'Issue Block-Level Late Blight Advisory',
        description: 'Broadcast preventative IPM bulletin to 45 registered tomato growers in village.',
        createdAt: Date.now() - 6 * 24 * 3600 * 1000,
        dueDate: Date.now() - 5 * 24 * 3600 * 1000,
        status: 'COMPLETED',
        completionNotes: 'Advisory circular dispatched via KVK WhatsApp & SMS group.',
        completedAt: Date.now() - 5 * 24 * 3600 * 1000,
      },
    ],

    // 5. Field Visits
    fieldVisits: [
      {
        id: 'fv-201',
        caseId: 'KM-2026-000201',
        farmerName: 'Rameshwar Patil',
        farmName: 'Patil Organic Horticulture',
        fieldName: 'North Tomato Plot',
        purpose: 'Direct field diagnostic verification & IPM spray supervision',
        priority: 'URGENT',
        scheduledDate: '2026-09-04',
        assignedOfficerId: 'ext-officer-verma',
        assignedOfficerName: 'Sanjay Verma (BAO)',
        status: 'COMPLETED',
        completedAt: Date.now() - 6 * 24 * 3600 * 1000,
        observations:
          'Lesions on 30% of foliage confirmed. Upper shoots and green tomato fruit clusters remain uninfected. Farmer adopted recommended trellising.',
        photographs: [DEMO_IMG_TOMATO_INITIAL],
        symptomsIdentified: ['Water-soaked lesions', 'Leaf necrosis'],
        severity: 'Severe (Contained)',
        farmerStatement: 'Farmer expressed relief; implemented pruning and copper spray immediately.',
        recommendedAction: 'Keep furrows dry, monitor new shoots after 5 days.',
        outcome: 'Condition stabilized; no fruit loss reported.',
      },
    ],

    // 6. Sample Requests
    sampleRequests: [
      {
        id: 'smp-201',
        caseId: 'KM-2026-000201',
        sampleType: 'DISEASE_SAMPLE',
        status: 'COLLECTED',
        requestedBy: 'ext-officer-verma',
        requestedByName: 'Sanjay Verma (BAO)',
        requestedAt: Date.now() - 6 * 24 * 3600 * 1000,
        collectedAt: Date.now() - 6 * 24 * 3600 * 1000,
        labResultAvailable: false,
        labResultSummary: 'Laboratory result not available.',
        labNotes: 'Leaf sample sent to Mahatma Phule Krishi Vidyapeeth for strain characterization.',
      },
    ],

    // 7. Farmer Outcome Report
    outcomeReport: {
      id: 'out-201',
      caseId: 'KM-2026-000201',
      reportedBy: 'FARMER',
      reportedByName: 'Rameshwar Patil',
      reportedAt: Date.now() - 2 * 24 * 3600 * 1000,
      cropCondition: 'IMPROVED',
      initialSeverity: 'Critical',
      currentSeverity: 'Low',
      symptomChange:
        'Old lesions dried up completely and turned papery. New green leaves are growing healthy without any water-soaked spots. Tomato fruits are green and clean.',
      treatmentFollowed:
        'Pruned infected leaves, switched to drip irrigation, sprayed recommended bio-copper solution as guided by Officer Verma.',
      followUpImageUri: DEMO_IMG_TOMATO_FOLLOWUP,
      farmerComments:
        'The extension officer visit and expert advice saved our crop from full ruin! Very grateful.',
      verificationStatus: 'EXPERT_VERIFIED',
    },

    // 8. Outcome Verification
    outcomeVerification: {
      verifiedBy: 'exp-icar-sharma',
      verifiedByName: 'Dr. A. K. Sharma',
      verifiedByRole: 'EXPERT',
      verifiedAt: Date.now() - 1 * 24 * 3600 * 1000,
      status: 'EXPERT_VERIFIED',
      notes:
        'Follow-up image confirms healthy vegetative shoot regeneration. Necrotic lesions have ceased expanding.',
      objectiveSummary:
        'Reported crop condition improved after the recorded intervention. Foliar recovery observed in follow-up assessment.',
    },

    // 9. Provenance & Consent
    provenance: {
      sourceType: 'FARMER',
      sourceId: 'KM-2026-000201',
      createdBy: 'Rameshwar Patil',
      createdAt: Date.now() - 10 * 24 * 3600 * 1000,
      updatedAt: Date.now() - 1 * 24 * 3600 * 1000,
      verifiedBy: 'Dr. A. K. Sharma',
      verifiedAt: Date.now() - 9 * 24 * 3600 * 1000,
      modelVersion: 'krishi-vision-v2.1',
      predictionVersion: 'pred-gemini-flash-1.5',
      expertReviewVersion: 'review-icar-2026',
      evidenceReferences: [DEMO_IMG_TOMATO_INITIAL, DEMO_IMG_TOMATO_FOLLOWUP],
    },
    consent: {
      caseProcessing: true,
      expertReview: true,
      aggregatedAnalytics: true,
      research: true,
      modelEvaluation: true,
      trainingCandidate: true,
      consentTimestamp: Date.now() - 10 * 24 * 3600 * 1000,
    },

    // 10. Learning Loop Qualification
    isTrainingCandidate: true,
    trainingCandidateReason:
      'High-quality verified record: Agronomist confirmed diagnosis, outcome verified post-intervention, image score 88/100, explicit data consent granted.',

    // Timeline Events
    timeline: [
      {
        id: 'tl-201-1',
        timestamp: Date.now() - 10 * 24 * 3600 * 1000,
        actor: 'farmer',
        actorName: 'Rameshwar Patil',
        type: 'CASE_CREATED',
        title: 'Case Submitted by Farmer',
        titleHi: 'किसान द्वारा मामला दर्ज',
        description: 'Uploaded tomato foliage photo after rain event.',
        imageUri: DEMO_IMG_TOMATO_INITIAL,
      },
      {
        id: 'tl-201-2',
        timestamp: Date.now() - 10 * 24 * 3600 * 1000 + 60000,
        actor: 'ai',
        actorName: 'Krishi AI Diagnostic Engine',
        type: 'AI_ANALYZED',
        title: 'AI Analysis Completed',
        titleHi: 'AI जांच पूर्ण',
        description: 'Detected Late Blight with 84% confidence. Critical severity flag raised.',
      },
      {
        id: 'tl-201-3',
        timestamp: Date.now() - 9 * 24 * 3600 * 1000,
        actor: 'expert',
        actorName: 'Dr. A. K. Sharma (ICAR)',
        type: 'EXPERT_CONFIRMED',
        title: 'Expert Verified Diagnosis',
        titleHi: 'कृषि विशेषज्ञ द्वारा पुष्टि',
        description: 'Confirmed Late Blight. Recommended immediate cultural sanitation and IPM protocol.',
      },
      {
        id: 'tl-201-4',
        timestamp: Date.now() - 9 * 24 * 3600 * 1000 + 3600000,
        actor: 'expert',
        actorName: 'Dr. A. K. Sharma (ICAR)',
        type: 'EXPERT_CONFIRMED',
        title: 'Case Escalated to Extension',
        titleHi: 'कृषि प्रसार अधिकारी को प्रेषित',
        description: 'Escalated due to high-risk cluster potential in Nashik horticultural belt.',
      },
      {
        id: 'tl-201-5',
        timestamp: Date.now() - 6 * 24 * 3600 * 1000,
        actor: 'system',
        actorName: 'Sanjay Verma (BAO)',
        type: 'EXPERT_CONFIRMED',
        title: 'Field Visit Completed',
        titleHi: 'खेत निरीक्षण संपन्न',
        description: 'Extension officer visited farm, calibrated sprayer, and issued neighbor advisory.',
      },
      {
        id: 'tl-201-6',
        timestamp: Date.now() - 2 * 24 * 3600 * 1000,
        actor: 'farmer',
        actorName: 'Rameshwar Patil',
        type: 'FEEDBACK_SUBMITTED',
        title: 'Farmer Submitted Outcome Report',
        titleHi: 'किसान द्वारा सुधार रिपोर्ट दर्ज',
        description: 'Reported crop condition improved. Uploaded follow-up photo of healthy new shoots.',
        imageUri: DEMO_IMG_TOMATO_FOLLOWUP,
      },
      {
        id: 'tl-201-7',
        timestamp: Date.now() - 1 * 24 * 3600 * 1000,
        actor: 'expert',
        actorName: 'Dr. A. K. Sharma (ICAR)',
        type: 'EXPERT_CONFIRMED',
        title: 'Outcome Verified & Added to Learning Pipeline',
        titleHi: 'परिणाम सत्यापित व लर्निंग पाइपलाइन में शामिल',
        description:
          'Expert confirmed recovery. Qualified as verified candidate for responsible future ML evaluation.',
      },
    ],
    auditTrail: [
      {
        id: 'aud-201-1',
        caseId: 'KM-2026-000201',
        timestamp: Date.now() - 10 * 24 * 3600 * 1000,
        action: 'CASE_SUBMITTED',
        actor: 'Rameshwar Patil',
        actorRole: 'FARMER',
      },
      {
        id: 'aud-201-2',
        caseId: 'KM-2026-000201',
        timestamp: Date.now() - 9 * 24 * 3600 * 1000,
        action: 'EXPERT_VERIFIED',
        actor: 'Dr. A. K. Sharma',
        actorRole: 'EXPERT',
      },
      {
        id: 'aud-201-3',
        caseId: 'KM-2026-000201',
        timestamp: Date.now() - 9 * 24 * 3600 * 1000 + 3600000,
        action: 'ESCALATED_TO_EXTENSION',
        actor: 'Dr. A. K. Sharma',
        actorRole: 'EXPERT',
      },
      {
        id: 'aud-201-4',
        caseId: 'KM-2026-000201',
        timestamp: Date.now() - 6 * 24 * 3600 * 1000,
        action: 'FIELD_VISIT_COMPLETED',
        actor: 'Sanjay Verma',
        actorRole: 'EXTENSION_OFFICER',
      },
      {
        id: 'aud-201-5',
        caseId: 'KM-2026-000201',
        timestamp: Date.now() - 2 * 24 * 3600 * 1000,
        action: 'OUTCOME_REPORTED',
        actor: 'Rameshwar Patil',
        actorRole: 'FARMER',
      },
      {
        id: 'aud-201-6',
        caseId: 'KM-2026-000201',
        timestamp: Date.now() - 1 * 24 * 3600 * 1000,
        action: 'OUTCOME_VERIFIED',
        actor: 'Dr. A. K. Sharma',
        actorRole: 'EXPERT',
      },
    ],
  },

  // =========================================================================
  // CASE 2: ESCALATED TO EXTENSION — ACTION IN PROGRESS (Chili Leaf Curl)
  // =========================================================================
  {
    id: 'KM-2026-000202',
    farmerId: 'farmer-demo-02',
    farmerName: 'Baldev Singh',
    farmId: 'farm-ludhiana-02',
    farmName: 'Baldev Farms',
    fieldId: 'field-chili-01',
    fieldName: 'Chili Plot C',
    crop: 'Chili',
    cropHindi: 'मिर्च',
    primaryImageUri: DEMO_IMG_CHILI,
    farmerMessage: 'Leaves are curling upwards severely and plants are stunted across half the field.',
    priority: 'HIGH',
    priorityScore: 74,
    priorityReason: 'Viral symptom cluster with high whitefly vector activity observed',
    status: 'ACTION_IN_PROGRESS',
    verificationStatus: 'EXPERT_VERIFIED',
    createdAt: Date.now() - 4 * 24 * 3600 * 1000,
    updatedAt: Date.now() - 12 * 3600 * 1000,
    submittedAt: Date.now() - 4 * 24 * 3600 * 1000,
    reviewedAt: Date.now() - 3 * 24 * 3600 * 1000,
    assignedExpertId: 'exp-icar-sharma',
    assignedExpertName: 'Dr. A. K. Sharma',
    isDemo: true,
    offlineSyncStatus: 'SYNCED',

    aiAssessment: {
      diagnosisId: 'diag-ai-202',
      crop: 'Chili',
      cropHindi: 'मिर्च',
      problemType: 'Disease',
      diagnosis: 'Chili Leaf Curl Virus (Begomovirus)',
      diagnosisHindi: 'मिर्च पत्ती मरोड़ विषाणु',
      confidence: 0.81,
      severity: 'High',
      affectedAreaEstimate: '40% canopy',
      symptoms: ['Upward curling of leaves', 'Vein clearing', 'Severe plant stunting'],
      possibleCauses: ['Begomovirus transmission via Bemisia tabaci (whitefly)'],
      imageQualityScore: 82,
      ipmAdvisory: {
        immediateAction: ['Install yellow sticky traps (10 per acre) to trap whitefly vectors'],
        monitoring: ['Count whitefly nymphs on leaf undersides every 48 hours'],
        prevention: ['Use silver reflective mulch in next planting'],
        biologicalCulturalControls: ['Spray neem oil (10,000 ppm) at 3ml/L'],
        chemicalControlNotice:
          'Chemical intervention: Consult extension officer for registered systemic vector control.',
        whenToContactExpert: 'If curling extends to 50%+ of all seedlings.',
      },
    },

    expertAssessment: {
      expertId: 'exp-icar-sharma',
      expertName: 'Dr. A. K. Sharma',
      expertTitle: 'Senior Plant Pathologist',
      decision: 'CONFIRM',
      verifiedDiagnosis: 'Chili Leaf Curl Virus (Begomovirus)',
      verifiedDiagnosisHindi: 'मिर्च पत्ती मरोड़ विषाणु',
      verifiedProblemType: 'Disease',
      verifiedSeverity: 'High',
      expertConfidence: 'HIGH',
      isCorrected: false,
      originalAIDiagnosis: 'Chili Leaf Curl Virus (Begomovirus)',
      additionalObservations:
        'Viral infection transmitted by whiteflies. Vector control is urgent to halt cross-field infection.',
      internalNotes: 'Whitefly population rising in Ludhiana block; extension scouting needed.',
      farmerVisibleResponse: {
        assessmentSummary: 'Confirmed: Chili Leaf Curl Virus. Focus immediately on controlling whiteflies.',
        explanation:
          'Once a plant has the virus it cannot be cured, but suppressing the whitefly vector prevents healthy plants from getting infected.',
        recommendedActions: [
          'Erect yellow sticky cards immediately at canopy height',
          'Rogue out and bury severely stunted symptomatic plants',
          'Apply neem-based repellent spray in early morning',
        ],
        followUpInstructions: 'Report crop status in 7 days after sticky trap deployment.',
        chemicalGuidanceNotice: 'Follow registered state agricultural recommendations.',
      },
      dataQualityFlag: 'VERIFIED',
      reviewedAt: Date.now() - 3 * 24 * 3600 * 1000,
    },

    escalation: {
      id: 'esc-202',
      caseId: 'KM-2026-000202',
      escalatedBy: 'exp-icar-sharma',
      escalatedByName: 'Dr. A. K. Sharma',
      escalatedByRole: 'EXPERT',
      escalatedAt: Date.now() - 3 * 24 * 3600 * 1000,
      reason: 'COMMUNITY_IMPACT',
      priority: 'HIGH',
      problemCategory: 'Whitefly Vector Outbreak Risk',
      recommendedAction: 'Coordinate village-level yellow sticky trap distribution and field scouting.',
      additionalNotes: 'Multiple chili fields in village report upward leaf curling.',
      status: 'ACKNOWLEDGED',
      assignedOfficerId: 'ext-officer-verma',
      assignedOfficerName: 'Sanjay Verma (BAO)',
    },

    extensionActions: [
      {
        id: 'act-202-1',
        caseId: 'KM-2026-000202',
        actionType: 'PEST_MONITORING',
        createdBy: 'ext-officer-verma',
        createdByName: 'Sanjay Verma (BAO)',
        assignedTo: 'ext-officer-verma',
        assignedToName: 'Sanjay Verma (BAO)',
        priority: 'HIGH',
        title: 'Deploy Sticky Traps & Sample Whitefly Densities',
        description: 'Assess pest population density across Baldev Farms and adjacent plots.',
        createdAt: Date.now() - 2 * 24 * 3600 * 1000,
        dueDate: Date.now() + 2 * 24 * 3600 * 1000,
        status: 'IN_PROGRESS',
      },
    ],

    provenance: {
      sourceType: 'FARMER',
      sourceId: 'KM-2026-000202',
      createdBy: 'Baldev Singh',
      createdAt: Date.now() - 4 * 24 * 3600 * 1000,
      updatedAt: Date.now() - 12 * 3600 * 1000,
      verifiedBy: 'Dr. A. K. Sharma',
      verifiedAt: Date.now() - 3 * 24 * 3600 * 1000,
      modelVersion: 'krishi-vision-v2.1',
      predictionVersion: 'pred-gemini-flash-1.5',
      evidenceReferences: [DEMO_IMG_CHILI],
    },
    consent: {
      caseProcessing: true,
      expertReview: true,
      aggregatedAnalytics: true,
      research: true,
      modelEvaluation: true,
      trainingCandidate: false, // Farmer opted out of training candidate
      consentTimestamp: Date.now() - 4 * 24 * 3600 * 1000,
    },
    isTrainingCandidate: false,
    trainingCandidateReason: 'Outcome still pending; farmer opted out of training candidate consent.',

    timeline: [
      {
        id: 'tl-202-1',
        timestamp: Date.now() - 4 * 24 * 3600 * 1000,
        actor: 'farmer',
        actorName: 'Baldev Singh',
        type: 'CASE_CREATED',
        title: 'Case Submitted',
        titleHi: 'मामला दर्ज',
        description: 'Submitted chili leaf curling issue.',
        imageUri: DEMO_IMG_CHILI,
      },
      {
        id: 'tl-202-2',
        timestamp: Date.now() - 3 * 24 * 3600 * 1000,
        actor: 'expert',
        actorName: 'Dr. A. K. Sharma',
        type: 'EXPERT_CONFIRMED',
        title: 'Expert Verified & Escalated',
        titleHi: 'विशेषज्ञ सत्यापन व प्रसार विभाग को प्रेषित',
        description: 'Confirmed Begomovirus. Escalated to extension officer for vector management.',
      },
      {
        id: 'tl-202-3',
        timestamp: Date.now() - 2 * 24 * 3600 * 1000,
        actor: 'system',
        actorName: 'Sanjay Verma (BAO)',
        type: 'EXPERT_CONFIRMED',
        title: 'Pest Monitoring Action Initiated',
        titleHi: 'कीट निगरानी कार्रवाई शुरू',
        description: 'Extension team initiated yellow sticky trap deployment and field surveillance.',
      },
    ],
    auditTrail: [
      {
        id: 'aud-202-1',
        caseId: 'KM-2026-000202',
        timestamp: Date.now() - 4 * 24 * 3600 * 1000,
        action: 'CASE_SUBMITTED',
        actor: 'Baldev Singh',
        actorRole: 'FARMER',
      },
      {
        id: 'aud-202-2',
        caseId: 'KM-2026-000202',
        timestamp: Date.now() - 3 * 24 * 3600 * 1000,
        action: 'EXPERT_VERIFIED',
        actor: 'Dr. A. K. Sharma',
        actorRole: 'EXPERT',
      },
      {
        id: 'aud-202-3',
        caseId: 'KM-2026-000202',
        timestamp: Date.now() - 3 * 24 * 3600 * 1000,
        action: 'ESCALATED_TO_EXTENSION',
        actor: 'Dr. A. K. Sharma',
        actorRole: 'EXPERT',
      },
    ],
  },

  // =========================================================================
  // CASE 3: FARMER DISPUTED CASE (Wheat Rust — Ineffective Treatment)
  // =========================================================================
  {
    id: 'KM-2026-000203',
    farmerId: 'farmer-primary',
    farmerName: 'Rameshwar Patil',
    farmId: 'farm-nashik-01',
    farmName: 'Patil Organic Horticulture',
    fieldId: 'field-wheat-south',
    fieldName: 'South Wheat Plot (2 Acres)',
    crop: 'Wheat',
    cropHindi: 'गेहूं',
    primaryImageUri: DEMO_IMG_WHEAT,
    farmerMessage: 'Yellow powder continues spreading across leaf blades despite spraying the suggested advisory.',
    priority: 'HIGH',
    priorityScore: 78,
    priorityReason: 'Farmer formal dispute filed: treatment inefficacy reported on critical cereal crop',
    status: 'DISPUTED',
    verificationStatus: 'EXPERT_VERIFIED',
    createdAt: Date.now() - 7 * 24 * 3600 * 1000,
    updatedAt: Date.now() - 6 * 3600 * 1000,
    submittedAt: Date.now() - 7 * 24 * 3600 * 1000,
    reviewedAt: Date.now() - 5 * 24 * 3600 * 1000,
    assignedExpertId: 'exp-icar-sharma',
    assignedExpertName: 'Dr. A. K. Sharma',
    isDemo: true,
    offlineSyncStatus: 'SYNCED',

    aiAssessment: {
      diagnosisId: 'diag-ai-203',
      crop: 'Wheat',
      cropHindi: 'गेहूं',
      problemType: 'Disease',
      diagnosis: 'Yellow Rust / Stripe Rust (Puccinia striiformis)',
      diagnosisHindi: 'पीला रतुआ / धारीदार रतुआ',
      confidence: 0.86,
      severity: 'High',
      affectedAreaEstimate: '25% of plot',
      symptoms: ['Linear yellow pustules along leaf veins', 'Yellow dusting on clothing when walking through plot'],
      imageQualityScore: 85,
      ipmAdvisory: {
        immediateAction: ['Identify and flag foci of infection in field'],
        monitoring: ['Daily morning scouting for stripe elongation'],
        prevention: ['Plant rust-resistant certified cultivars next season'],
        biologicalCulturalControls: ['Avoid excessive nitrogen fertilization which promotes lush susceptible tissue'],
        chemicalControlNotice: 'Consult KVK for propiconazole spray recommendation.',
        whenToContactExpert: 'If stripe pustules appear on flag leaves.',
      },
    },

    expertAssessment: {
      expertId: 'exp-icar-sharma',
      expertName: 'Dr. A. K. Sharma',
      expertTitle: 'Principal Scientist (Plant Pathology)',
      decision: 'CONFIRM',
      verifiedDiagnosis: 'Stripe Rust (Puccinia striiformis)',
      verifiedDiagnosisHindi: 'पीला रतुआ (पक्सीनिया स्ट्राइफॉर्मिस)',
      verifiedProblemType: 'Disease',
      verifiedSeverity: 'High',
      expertConfidence: 'DEFINITIVE',
      isCorrected: false,
      originalAIDiagnosis: 'Yellow Rust / Stripe Rust (Puccinia striiformis)',
      farmerVisibleResponse: {
        assessmentSummary: 'Confirmed: Stripe Rust. Apply contact fungicide immediately.',
        explanation: 'Fungal spores spread via wind currents during cool, humid nights.',
        recommendedActions: ['Spray recommended registered triazole fungicide at first flag leaf sighting'],
        followUpInstructions: 'Report response after 5 days.',
        chemicalGuidanceNotice: 'Ensure proper water volume (200L/acre) for full canopy penetration.',
      },
      dataQualityFlag: 'VERIFIED',
      reviewedAt: Date.now() - 5 * 24 * 3600 * 1000,
    },

    // Farmer Dispute Recorded
    dispute: {
      id: 'disp-203',
      caseId: 'KM-2026-000203',
      disputedBy: 'farmer-primary',
      disputedByName: 'Rameshwar Patil',
      disputedAt: Date.now() - 1 * 24 * 3600 * 1000,
      disputeType: 'INEFFECTIVE_TREATMENT',
      reason: 'The recommended action did not help. Spores continue expanding onto flag leaves.',
      farmerComment:
        'We sprayed twice according to instructions but the yellow dust continues on upper canopy leaves. We need a second expert review or alternative treatment.',
      status: 'IN_SECOND_REVIEW',
    },

    secondReview: {
      reviewerId: 'exp-kvk-singh',
      reviewerName: 'Dr. Harpreet Singh',
      reviewerTitle: 'Senior Agronomist (Punjab Agricultural University)',
      reviewedAt: Date.now() - 6 * 3600 * 1000,
      result: 'AGREEMENT',
      notes:
        'Diagnosis is correct (Puccinia striiformis). Inefficacy is likely due to spray timing during high wind or suboptimal water coverage (need hollow cone nozzle, 200L water/acre minimum).',
      recommendedAdjustment:
        'Recommend re-spraying with tebuconazole + trifloxystrobin with a surfactant during early morning calm hours.',
    },

    provenance: {
      sourceType: 'FARMER',
      sourceId: 'KM-2026-000203',
      createdBy: 'Rameshwar Patil',
      createdAt: Date.now() - 7 * 24 * 3600 * 1000,
      updatedAt: Date.now() - 6 * 3600 * 1000,
      verifiedBy: 'Dr. A. K. Sharma',
      verifiedAt: Date.now() - 5 * 24 * 3600 * 1000,
      modelVersion: 'krishi-vision-v2.1',
      predictionVersion: 'pred-gemini-flash-1.5',
      evidenceReferences: [DEMO_IMG_WHEAT],
    },
    consent: {
      caseProcessing: true,
      expertReview: true,
      aggregatedAnalytics: true,
      research: true,
      modelEvaluation: true,
      trainingCandidate: true,
      consentTimestamp: Date.now() - 7 * 24 * 3600 * 1000,
    },
    isTrainingCandidate: false,
    trainingCandidateReason: 'Dispute is under active second review; ineligible until resolution confirmed.',

    timeline: [
      {
        id: 'tl-203-1',
        timestamp: Date.now() - 7 * 24 * 3600 * 1000,
        actor: 'farmer',
        actorName: 'Rameshwar Patil',
        type: 'CASE_CREATED',
        title: 'Case Submitted',
        titleHi: 'मामला दर्ज',
        description: 'Submitted wheat yellow striping symptoms.',
        imageUri: DEMO_IMG_WHEAT,
      },
      {
        id: 'tl-203-2',
        timestamp: Date.now() - 5 * 24 * 3600 * 1000,
        actor: 'expert',
        actorName: 'Dr. A. K. Sharma',
        type: 'EXPERT_CONFIRMED',
        title: 'Expert Verified Stripe Rust',
        titleHi: 'विशेषज्ञ द्वारा पुष्टि',
        description: 'Prescribed IPM triazole spray and canopy ventilation.',
      },
      {
        id: 'tl-203-3',
        timestamp: Date.now() - 1 * 24 * 3600 * 1000,
        actor: 'farmer',
        actorName: 'Rameshwar Patil',
        type: 'FEEDBACK_SUBMITTED',
        title: 'Farmer Filed Formal Dispute',
        titleHi: 'किसान द्वारा आपत्ति दर्ज',
        description: 'Reported treatment inefficacy. Requested second expert review.',
      },
      {
        id: 'tl-203-4',
        timestamp: Date.now() - 6 * 3600 * 1000,
        actor: 'expert',
        actorName: 'Dr. Harpreet Singh (PAU)',
        type: 'EXPERT_CONFIRMED',
        title: 'Second Expert Review Completed',
        titleHi: 'द्वितीय विशेषज्ञ समीक्षा पूर्ण',
        description:
          'Confirmed diagnosis; adjusted surfactant nozzle application method to overcome spray penetration failure.',
      },
    ],
    auditTrail: [
      {
        id: 'aud-203-1',
        caseId: 'KM-2026-000203',
        timestamp: Date.now() - 7 * 24 * 3600 * 1000,
        action: 'CASE_SUBMITTED',
        actor: 'Rameshwar Patil',
        actorRole: 'FARMER',
      },
      {
        id: 'aud-203-2',
        caseId: 'KM-2026-000203',
        timestamp: Date.now() - 5 * 24 * 3600 * 1000,
        action: 'EXPERT_VERIFIED',
        actor: 'Dr. A. K. Sharma',
        actorRole: 'EXPERT',
      },
      {
        id: 'aud-203-3',
        caseId: 'KM-2026-000203',
        timestamp: Date.now() - 1 * 24 * 3600 * 1000,
        action: 'DISPUTE_FILED',
        actor: 'Rameshwar Patil',
        actorRole: 'FARMER',
      },
      {
        id: 'aud-203-4',
        caseId: 'KM-2026-000203',
        timestamp: Date.now() - 6 * 3600 * 1000,
        action: 'SECOND_REVIEW_RECORDED',
        actor: 'Dr. Harpreet Singh',
        actorRole: 'EXPERT',
      },
    ],
  },
];
