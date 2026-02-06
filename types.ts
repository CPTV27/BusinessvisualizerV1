export enum ThemeId {
  LOBBY = 'LOBBY',
  GARDEN = 'GARDEN',
  JUKE_JOINT = 'JUKE_JOINT',
  EDITORIAL = 'EDITORIAL'
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  colors: {
    bg: string;
    surface: string;
    text: string;
    accent: string;
    muted: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  styles: {
    rounded: string;
    borderWidth: string;
    shadow: string;
  };
}

export enum EntityType {
  VENUE = 'VENUE',
  BRAND = 'BRAND',
  EXPERIENCE = 'EXPERIENCE',
  DEVELOPMENT = 'DEVELOPMENT'
}

export enum GapStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  SOLVED = 'SOLVED'
}

export interface BusinessGap {
  id: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: GapStatus;
  aiSuggestions?: string[];
  userGuidance?: string; // Director's manual input
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface BusinessEntity {
  id: string;
  name: string;
  location?: string;
  address?: string; // Real world address for Maps
  type: EntityType;
  description: string;
  kpi: string;
  kpiValue: string;
  gaps: BusinessGap[];
  imageUrl?: string; // The Space (Environment)
  whiteboardUrl?: string; // The War Room (Business Logic)
  chatHistory?: ChatMessage[]; // The persistent notebook
}

export interface ScoutResult {
  name: string;
  address: string;
  rating?: string;
  uri?: string;
}
