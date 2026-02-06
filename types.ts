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
  DEVELOPMENT = 'DEVELOPMENT',
  PACKAGE = 'PACKAGE',
  PROGRAM = 'PROGRAM',
  ROOM_CATEGORY = 'ROOM_CATEGORY'
}

export enum ServiceLayer {
  FOUNDATION = 'FOUNDATION',
  NETWORK = 'NETWORK', 
  MACHINE = 'MACHINE',
  BUSINESS = 'BUSINESS'
}

export interface LayerMapping {
  entityId: string;
  layer: ServiceLayer;
  readinessScore: number; // 0-100
  revenueImpact: 'HIGH' | 'MEDIUM' | 'LOW';
  buildCost: number;
  roi: number;
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
  layer?: ServiceLayer; // Strategic layer from Discovery Model
  description: string;
  kpi: string;
  kpiValue: string;
  gaps: BusinessGap[];
  imageUrl?: string; // The Space (Environment)
  whiteboardUrl?: string; // The War Room (Business Logic)
  chatHistory?: ChatMessage[]; // The persistent notebook
  coordinates?: { x: number; y: number }; // Percentage position on the strategic map (0-100)
}

export interface Competitor {
  name: string;
  type: 'EXISTING' | 'CONCEPT';
  description: string;
  pricePoint: string;
  strengths: string[];
  weaknesses: string[];
}

export interface MarketAnalysis {
  region: string;
  category: string;
  competitors: Competitor[]; // 2 Real
  ourConcept: Competitor; // 1 Ghost Concept
  capitalStrategy: {
    estimatedEntryCost: string;
    valueLeverage: string; // How network amplifies value
    capitalRatio: string; // e.g. "Low Spend / High Yield"
    verdict: string;
  };
}

export interface ScoutResult {
  name: string;
  address: string;
  rating?: string;
  uri?: string;
}
