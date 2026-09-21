export type UserTier = 'free' | '1week' | 'monthly';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  banned?: boolean;
  tier: UserTier;
  passExpiresAt: number | null; // Timestamp ms
  generationsUsed: number; // Lifetime count of AI position paper / speech calls
  dailyGenerations: {
    date: string; // YYYY-MM-DD
    count: number;
  };
  chatUsage?: {
    date: string; // YYYY-MM-DD
    count: number;
    lifetimeCount?: number;
  };
  createdAt: string;
}

export type SupportedLanguage = 'English' | 'Roman Urdu' | 'Urdu' | 'French' | 'Spanish' | 'Arabic';

export const SUPPORTED_LANGUAGES: { id: SupportedLanguage; label: string; native: string; flag: string }[] = [
  { id: 'English', label: 'English', native: 'English', flag: '🇬🇧' },
  { id: 'Roman Urdu', label: 'Roman Urdu', native: 'Roman Urdu', flag: '🇵🇰' },
  { id: 'Urdu', label: 'Urdu', native: 'اردو', flag: '🇵🇰' },
  { id: 'French', label: 'French', native: 'Français', flag: '🇫🇷' },
  { id: 'Spanish', label: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { id: 'Arabic', label: 'Arabic', native: 'العربية', flag: '🇸🇦' }
];

export interface DelegateContext {
  country: string;
  politicalParty?: string;
  committee: string;
  topic: string;
  bloc?: string;
  delegateName: string;
  language?: SupportedLanguage;
}

export interface PositionPaperDraft {
  id: string;
  userId: string;
  title: string;
  country: string;
  politicalParty?: string;
  committee: string;
  topic: string;
  stancePoints: string;
  intro: string;
  countryStance: string;
  pastActions: string;
  proposedSolutions: string;
  fullText: string;
  createdAt: string;
  updatedAt: string;
}

export type SpeechType = 'opening' | 'gsl' | 'rebuttal' | 'closing';

export interface SpeechDraft {
  id: string;
  userId: string;
  title: string;
  speechType: SpeechType;
  country: string;
  politicalParty?: string;
  committee: string;
  topic: string;
  timeLimitSeconds: number;
  wordCount: number;
  tone: 'formal' | 'passionate' | 'conciliatory' | 'assertive';
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResolutionClause {
  id: string;
  type: 'preambulatory' | 'operative';
  starter: string;
  text: string;
  subclauses?: string[];
}

export interface ResolutionDraft {
  id: string;
  userId: string;
  committee: string;
  topic: string;
  sponsors: string[];
  signatories: string[];
  clauses: ResolutionClause[];
  updatedAt: string;
}

export interface RoPItem {
  id: string;
  title: string;
  category: 'motion' | 'point' | 'caucus' | 'voting' | 'general';
  interruptSpeaker: boolean;
  secondRequired: boolean;
  voteRequired: string;
  debatable: string;
  explanation: string;
  samplePhrasing: string;
  chairResponse: string;
}

export interface CountryDossier {
  country: string;
  politicalParty?: string;
  topic: string;
  executiveSummary: string;
  alliancesAndBloc: string[];
  keyTreaties: string[];
  nationalInterests: string[];
  redLines: string[];
  negotiatingLeverage: string[];
  historicalPrecedents: string[];
  recommendedStrategy: string;
  generatedAt: string;
}

export interface CrisisNote {
  id: string;
  userId: string;
  recipient: string;
  senderRole: string;
  classification: 'public' | 'covert' | 'directive';
  objective: string;
  actionDetails: string;
  resourcesNeeded: string;
  feedback?: {
    realismScore: number;
    feasibilityScore: number;
    clarityScore: number;
    analysis: string;
    vulnerabilities: string[];
    recommendations: string[];
  };
  backroomResponse?: {
    newsHeadline: string;
    verdict: 'Success' | 'Partial Success' | 'Compromised' | 'Failed';
    backroomNarrative: string;
    falloutConsequences: string[];
  };
  createdAt: string;
}

export interface DebateExchange {
  id: string;
  speaker: 'delegate' | 'opponent' | 'chair';
  country: string;
  politicalParty?: string;
  text: string;
  timestamp: string;
  evaluation?: {
    score: number; // 0-100
    strengths: string[];
    weaknesses: string[];
    diplomaticCritique: string;
    suggestedRebuttal: string;
  };
}

export type TabType =
  | 'chat'
  | 'position-paper'
  | 'speech-writer'
  | 'clause-builder'
  | 'study-guide'
  | 'rop-assistant'
  | 'policy-research'
  | 'crisis-simulator'
  | 'debate-practice'
  | 'archives'
  | 'pricing' | 'admin' | 'settings' | 'more';

export interface StudyGuideSummary {
  rules_of_procedure: string;
  key_facts: string;
  existing_laws_and_gaps: string;
  past_events: string;
  questions_to_answer: string;
}

export interface StudyGuide {
  id: string;
  userId: string;
  committeeId: string;
  committeeName: string;
  topic?: string;
  fileName?: string;
  fileSize?: number;
  pageCount?: number;
  rawText: string;
  summary: StudyGuideSummary;
  createdAt: string;
  updatedAt: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface DebateTurn {
  speaker: 'user' | 'opponent' | 'chair';
  country: string;
  politicalParty?: string;
  content: string;
  timestamp: string;
  critique?: string;
}

export type Currency = 'PKR' | 'USD';

export interface PricingPlan {
  id: 'free' | '1week' | 'monthly';
  name: string;
  badge?: string;
  durationLabel: string;
  pricePKR: number;
  priceUSD: number;
  popular?: boolean;
  description: string;
  features: string[];
  limitations?: string[];
}
