import { ThemeConfig, ThemeId, EntityType, GapStatus, BusinessEntity } from './types';

// --- THEME DEFINITIONS ---

export const THEMES: Record<ThemeId, ThemeConfig> = {
  [ThemeId.LOBBY]: {
    id: ThemeId.LOBBY,
    name: "The Lobby",
    description: "Art Deco & Heritage Luxury. Deep blues, aged gold, leather textures.",
    colors: {
      bg: "#0F172A", // Slate 900
      surface: "#1E293B", // Slate 800
      text: "#E2E8F0", // Slate 200
      accent: "#D4AF37", // Gold
      muted: "#64748B", // Slate 500
      border: "#D4AF37", // Gold
    },
    fonts: {
      heading: "'Playfair Display', serif",
      body: "'Inter', sans-serif",
      mono: "'Space Mono', monospace",
    },
    styles: {
      rounded: "rounded-sm",
      borderWidth: "border",
      shadow: "shadow-2xl shadow-black",
    },
  },
  [ThemeId.GARDEN]: {
    id: ThemeId.GARDEN,
    name: "The Garden",
    description: "Wabi-Sabi Minimalism. Earth tones, handmade textures, stone.",
    colors: {
      bg: "#F5F5F0", // Warm off-white
      surface: "#EBEBE0", // Stone
      text: "#2C2C2A", // Dark Earth
      accent: "#4A5D23", // Moss Green
      muted: "#8C8C85", // Stone Gray
      border: "#D6D6CF",
    },
    fonts: {
      heading: "'Cinzel', serif",
      body: "'Inter', sans-serif",
      mono: "'Space Mono', monospace",
    },
    styles: {
      rounded: "rounded-2xl",
      borderWidth: "border-0",
      shadow: "shadow-sm",
    },
  },
  [ThemeId.JUKE_JOINT]: {
    id: ThemeId.JUKE_JOINT,
    name: "Juke Joint",
    description: "Neon Southern Gothic. Glowing purples, vintage neon, dangerous.",
    colors: {
      bg: "#050505", // Black
      surface: "#111111", // Off Black
      text: "#E0E0E0", // Light Grey
      accent: "#D946EF", // Neon Fuchsia
      muted: "#22D3EE", // Neon Cyan (Secondary accent)
      border: "#D946EF",
    },
    fonts: {
      heading: "'Space Mono', monospace",
      body: "'Inter', sans-serif",
      mono: "'Space Mono', monospace",
    },
    styles: {
      rounded: "rounded-none",
      borderWidth: "border-2",
      shadow: "shadow-[0_0_15px_rgba(217,70,239,0.5)]",
    },
  },
  [ThemeId.EDITORIAL]: {
    id: ThemeId.EDITORIAL,
    name: "The Editorial",
    description: "High Fashion Business. Bold typography, B&W, grid-based.",
    colors: {
      bg: "#FFFFFF",
      surface: "#F0F0F0",
      text: "#000000",
      accent: "#FF3333", // Red punch
      muted: "#999999",
      border: "#000000",
    },
    fonts: {
      heading: "'Bodoni Moda', serif",
      body: "'Inter', sans-serif",
      mono: "'Space Mono', monospace",
    },
    styles: {
      rounded: "rounded-none",
      borderWidth: "border-t border-b", // Horizontal lines mostly
      shadow: "shadow-none",
    },
  },
};

// --- DATA ---

export const INITIAL_ENTITIES: BusinessEntity[] = [
  {
    id: 'e1',
    name: "The Big Muddy Inn",
    location: "Natchez, MS",
    address: "334 Main St, Natchez, MS 39120",
    type: EntityType.VENUE,
    description: "14-room boutique hotel in Natchez, MS. Historic property restoration with speakeasy basement.",
    kpi: "Projected ADR",
    kpiValue: "$349",
    gaps: [
      {
        id: 'g1',
        description: "Missing guest arrival ritual for 'Crossroads King' suites.",
        priority: 'HIGH',
        status: GapStatus.OPEN,
      }
    ]
  },
  {
    id: 'e2',
    name: "Soul Kitchen",
    location: "Natchez, MS",
    address: "334 Main St, Natchez, MS 39120",
    type: EntityType.EXPERIENCE,
    description: "Signature restaurant. Delta fusion cuisine + Blues cocktail program.",
    kpi: "Covers/Week",
    kpiValue: "450",
    gaps: [
      {
        id: 'g3',
        description: "Cocktail menu names need to align with obscure Blues history.",
        priority: 'MEDIUM',
        status: GapStatus.OPEN,
      }
    ]
  },
  {
    id: 'e3',
    name: "Ari Aslin Brand",
    location: "Global / Digital",
    type: EntityType.BRAND,
    description: "Entertainment personality and creative director IP. Focus on Southern Gothic storytelling.",
    kpi: "Social Reach",
    kpiValue: "125k",
    gaps: [
      {
        id: 'g4',
        description: "Merchandise strategy for Q4 missing.",
        priority: 'HIGH',
        status: GapStatus.OPEN,
      }
    ]
  },
  {
    id: 'e5',
    name: "Beale Street outpost",
    location: "Memphis, TN",
    address: "Beale St, Memphis, TN",
    type: EntityType.DEVELOPMENT,
    description: "Potential pop-up gallery and listening room to funnel traffic to Natchez.",
    kpi: "Foot Traffic",
    kpiValue: "Est. 2k/day",
    gaps: [
      {
        id: 'g6',
        description: "Lease negotiation strategy for historic district.",
        priority: 'MEDIUM',
        status: GapStatus.OPEN,
      }
    ]
  },
  {
    id: 'e6',
    name: "Delta Textures",
    location: "Oxford, MS",
    type: EntityType.BRAND,
    description: "High-end linen and home goods line inspired by the hotel interiors.",
    kpi: "Wholesale Accts",
    kpiValue: "12",
    gaps: []
  }
];
