// Expert Profile Service for Krishi Mentor (Part 5)
// Manages agronomist profiles and credentials; identifies Demo Experts clearly

import { ExpertProfile } from '../../types/expert';

export const DEMO_EXPERT_PROFILES: ExpertProfile[] = [
  {
    id: 'exp-icar-sharma',
    name: 'Dr. A. K. Sharma',
    title: 'Senior Plant Pathologist (ICAR - IARI)',
    institution: 'Indian Agricultural Research Institute / KVK Regional Station',
    expertise: ['Fungal Blights', 'Rusts', 'Integrated Pest Management', 'Cereal Pathology'],
    crops: ['Wheat', 'Tomato', 'Mustard', 'Potato', 'Paddy'],
    languages: ['Hindi', 'English', 'Punjabi'],
    region: 'North-Western Plain Zone (Punjab, Haryana, Western UP)',
    verificationStatus: 'VERIFIED',
    experience: '18+ years field & diagnostic experience',
    isDemo: true,
    casesReviewedCount: 342,
  },
  {
    id: 'exp-kvk-patil',
    name: 'Dr. Sunita Patil',
    title: 'Chief Agronomist & Entomologist',
    institution: 'District Krishi Vigyan Kendra (KVK)',
    expertise: ['Sucking Pests', 'Bollworm Complex', 'Organic Biocontrol', 'Viral Diseases'],
    crops: ['Cotton', 'Chili', 'Tomato', 'Gram / Chickpea', 'Paddy'],
    languages: ['Hindi', 'English', 'Marathi'],
    region: 'Central & Western Agricultural Zone',
    verificationStatus: 'VERIFIED',
    experience: '14+ years KVK extension services',
    isDemo: true,
    casesReviewedCount: 289,
  },
];

const ACTIVE_EXPERT_ID_KEY = 'krishi_mentor_active_expert_id';

export function getActiveExpertProfile(): ExpertProfile {
  try {
    const savedId = localStorage.getItem(ACTIVE_EXPERT_ID_KEY);
    const found = DEMO_EXPERT_PROFILES.find((p) => p.id === savedId);
    if (found) return found;
  } catch (err) {
    console.error('Error reading active expert id:', err);
  }
  return DEMO_EXPERT_PROFILES[0];
}

export function setActiveExpertProfile(expertId: string): void {
  try {
    localStorage.setItem(ACTIVE_EXPERT_ID_KEY, expertId);
  } catch (err) {
    console.error('Error saving active expert id:', err);
  }
}

export function getAllExpertProfiles(): ExpertProfile[] {
  return DEMO_EXPERT_PROFILES;
}
