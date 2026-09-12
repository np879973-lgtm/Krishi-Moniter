// Farmer-Friendly Status Language Translator
// Enforces clear separation between internal technical statuses and user-facing farmer explanations

import { ClosedLoopCaseStatus, CropOutcomeCondition } from '../types';

export function getFarmerFriendlyStatus(
  status: ClosedLoopCaseStatus,
  language: string = 'en'
): { title: string; explanation: string; actionPrompt?: string } {
  const isHi = language === 'hi';

  switch (status) {
    case 'DRAFT':
      return {
        title: isHi ? 'प्रारूप' : 'Draft Case',
        explanation: isHi ? 'यह मामला अभी जमा नहीं किया गया है।' : 'This case has not been submitted yet.',
      };

    case 'SUBMITTED':
    case 'QUEUED_FOR_EXPERT':
      return {
        title: isHi ? 'समीक्षा हेतु प्रतीक्षारत' : 'Pending Expert Review',
        explanation: isHi
          ? 'आपकी फसल का विवरण कृषि वैज्ञानिक की जांच के लिए कतार में है।'
          : 'Your crop details are queued for verification by an agronomist.',
      };

    case 'IN_EXPERT_REVIEW':
      return {
        title: isHi ? 'विशेषज्ञ जांच जारी है' : 'Under Expert Review',
        explanation: isHi
          ? 'कृषि वैज्ञानिक आपकी पत्तियों और लक्षणों की जांच कर रहे हैं।'
          : 'An agricultural scientist is currently reviewing your photos and symptoms.',
      };

    case 'WAITING_FOR_FARMER':
      return {
        title: isHi ? 'आपकी जानकारी की आवश्यकता है' : 'Information Requested',
        explanation: isHi
          ? 'सटीक सलाह देने हेतु विशेषज्ञ ने आपसे स्पष्ट फोटो या विवरण मांगा है।'
          : 'The expert has requested a clearer photo or additional details to confirm the diagnosis.',
        actionPrompt: isHi ? 'कृपया अतिरिक्त फोटो या विवरण भेजें' : 'Please upload requested photo/details',
      };

    case 'EXPERT_VERIFIED':
      return {
        title: isHi ? 'विशेषज्ञ द्वारा सत्यापित' : 'Expert Verified',
        explanation: isHi
          ? 'कृषि विशेषज्ञ ने इस रोग की पुष्टि की है और उपचार सलाह जारी की है।'
          : 'An agricultural expert has verified this assessment and provided IPM guidance.',
        actionPrompt: isHi ? 'अनुशंसित उपाय लागू करें' : 'Follow recommended IPM actions',
      };

    case 'EXPERT_CORRECTED':
      return {
        title: isHi ? 'विशेषज्ञ द्वारा संशोधित सलाह' : 'Expert Updated Assessment',
        explanation: isHi
          ? 'कृषि विशेषज्ञ ने AI निष्कर्ष को संशोधित कर सही उपचार बताया है।'
          : 'The agronomist corrected the initial assessment and provided accurate guidance.',
        actionPrompt: isHi ? 'संशोधित सलाह का पालन करें' : 'Follow corrected guidance',
      };

    case 'UNCERTAIN':
      return {
        title: isHi ? 'प्रत्यक्ष जांच की सिफारिश' : 'Field Inspection Advised',
        explanation: isHi
          ? 'केवल फोटो से पुष्टि संभव नहीं है; स्थानीय कृषि केंद्र (KVK) से संपर्क करें।'
          : 'Symptoms cannot be confirmed by photo alone. In-field scouting is recommended.',
        actionPrompt: isHi ? 'स्थानीय कृषि अधिकारी को दिखाएं' : 'Consult your local KVK officer',
      };

    case 'ESCALATED_TO_EXTENSION':
    case 'GOVERNMENT_REVIEW':
      return {
        title: isHi ? 'विशेष सहायता हेतु भेजा गया' : 'Escalated to Agricultural Extension',
        explanation: isHi
          ? 'आपकी फसल की सुरक्षा के लिए मामला ब्लॉक/जिला कृषि प्रसार अधिकारी को भेजा गया है।'
          : 'Your case has been sent for additional agricultural extension officer support.',
        actionPrompt: isHi ? 'कृषि विभाग आपसे संपर्क कर सकता है' : 'Extension officer may contact you',
      };

    case 'ACTION_RECOMMENDED':
    case 'ACTION_IN_PROGRESS':
      return {
        title: isHi ? 'सहायता व कार्रवाई जारी' : 'Field Action In Progress',
        explanation: isHi
          ? 'कृषि प्रसार अधिकारी द्वारा खेत निरीक्षण या नमूना संग्रह की योजना बनाई गई है।'
          : 'An extension officer has planned or started field support for your crop.',
      };

    case 'OUTCOME_PENDING':
      return {
        title: isHi ? 'फसल की वर्तमान स्थिति बताएं' : 'Outcome Update Needed',
        explanation: isHi
          ? 'कृपया हमें बताएं कि उपचार के बाद आपकी फसल में क्या सुधार हुआ है।'
          : 'Please tell us how your crop is doing after following the advisory.',
        actionPrompt: isHi ? 'फसल की नई स्थिति व फोटो साझा करें' : 'Report crop condition & follow-up photo',
      };

    case 'OUTCOME_REPORTED':
      return {
        title: isHi ? 'परिणाम दर्ज किया गया' : 'Outcome Reported',
        explanation: isHi
          ? 'आपकी फसल की रिपोर्ट प्राप्त हो गई है और विशेषज्ञ द्वारा जांची जा रही है।'
          : 'Your follow-up report was received and is under review.',
      };

    case 'OUTCOME_VERIFIED':
      return {
        title: isHi ? 'फसल परिणाम सत्यापित' : 'Crop Outcome Verified',
        explanation: isHi
          ? 'कृषि विशेषज्ञ ने फसल के सुधार परिणाम को सत्यापित व दर्ज कर लिया है।'
          : 'The reported condition and recovery have been verified by an agronomist.',
      };

    case 'DISPUTED':
      return {
        title: isHi ? 'पुनर्समीक्षाधीन (आपत्ति दर्ज)' : 'Reviewing Your Feedback / Dispute',
        explanation: isHi
          ? 'आपकी आपत्ति दर्ज कर ली गई है और वरिष्ठ कृषि वैज्ञानिक द्वारा दूसरा परामर्श किया जा रहा है।'
          : 'Your dispute was recorded and is being reviewed by a senior agronomist.',
      };

    case 'CLOSED':
      return {
        title: isHi ? 'परामर्श संपन्न' : 'Consultation Completed',
        explanation: isHi
          ? 'यह मामला सफलतापूर्वक संपन्न हो चुका है।'
          : 'This agricultural consultation has concluded.',
      };

    default:
      return {
        title: isHi ? 'सक्रिय मामला' : 'Active Case',
        explanation: isHi ? 'मामले की जांच प्रक्रिया में है।' : 'Case is currently in progress.',
      };
  }
}

export function getConditionBadgeText(condition: CropOutcomeCondition, language: string = 'en'): string {
  const isHi = language === 'hi';
  switch (condition) {
    case 'IMPROVED':
      return isHi ? '✓ सुधार हुआ है' : '✓ Improved';
    case 'FULLY_RECOVERED':
      return isHi ? '✓ पूर्ण स्वस्थ' : '✓ Fully Recovered';
    case 'NO_CHANGE':
      return isHi ? 'कोई बदलाव नहीं' : 'No Change';
    case 'WORSE':
      return isHi ? 'स्थिति बिगड़ी है' : 'Worse / Deteriorated';
    case 'UNCERTAIN':
      return isHi ? 'निश्चित नहीं' : 'Uncertain';
  }
}
