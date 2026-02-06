import { ThemeConfig, ThemeId, EntityType, GapStatus, BusinessEntity, ServiceLayer } from './types';

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
      shadow: "shadow-sm shadow-fuchsia-900",
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
  // --- FOUNDATION LAYER (NATCHEZ HUB) ---
  {
    id: 'e1',
    name: "The Big Muddy Inn",
    location: "Natchez, MS",
    address: "334 Main St, Natchez, MS 39120",
    type: EntityType.VENUE,
    layer: ServiceLayer.FOUNDATION,
    description: "14-room boutique hotel. Historic property restoration with speakeasy basement.",
    kpi: "Projected ADR",
    kpiValue: "$349",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1600",
    gaps: [],
    coordinates: { x: 50, y: 75 } // Center Bottom (Natchez)
  },
  {
    id: 'e2',
    name: "Hospitality Entertainment Group",
    location: "Natchez, MS",
    address: "334 Main St, Natchez, MS 39120",
    type: EntityType.VENUE,
    layer: ServiceLayer.BUSINESS,
    description: "\"The Blues Room\" live venue (75-150 cap). Hosts: Blue Monday, Blues School, Headline Fri, Sat Double Feature, Gospel & Gravy.",
    kpi: "Shows/Month",
    kpiValue: "20",
    imageUrl: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&q=80&w=1600",
    gaps: [
       {
        id: 'g_heg_1',
        description: "Soundproofing strategy for 'Gospel & Gravy' sunday brunch vs sleeping guests.",
        priority: 'HIGH',
        status: GapStatus.OPEN,
      }
    ],
    coordinates: { x: 45, y: 78 }
  },
  
  // --- ROOM CATEGORIES (CLUSTERED AROUND HOTEL) ---
  {
    id: 'e_room_1',
    name: "Delta Standard Room",
    location: "The Big Muddy Inn",
    type: EntityType.ROOM_CATEGORY,
    layer: ServiceLayer.BUSINESS,
    description: "Entry-level luxury. Authentic textures, efficient footprint.",
    kpi: "Occupancy Rate",
    kpiValue: "85% Target",
    imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1600",
    gaps: [
      {
        id: 'g_room_1',
        description: "Amenity kit sourcing from Delta artisans not finalized.",
        priority: 'MEDIUM',
        status: GapStatus.OPEN,
      }
    ],
    coordinates: { x: 55, y: 72 }
  },
  {
    id: 'e_room_2',
    name: "Crossroads King Suite",
    location: "The Big Muddy Inn",
    type: EntityType.ROOM_CATEGORY,
    layer: ServiceLayer.BUSINESS,
    description: "Mid-tier suite ($399/night). Spacious, soaking tub, writing desk.",
    kpi: "ADR",
    kpiValue: "$399",
    imageUrl: "https://images.unsplash.com/photo-1590490360182-c87295ec4232?auto=format&fit=crop&q=80&w=1600",
    gaps: [
      {
        id: 'g_room_2',
        description: "Missing guest arrival ritual logic.",
        priority: 'HIGH',
        status: GapStatus.OPEN,
      }
    ],
    coordinates: { x: 55, y: 78 }
  },
  {
    id: 'e_room_3',
    name: "Juke Joint Suite",
    location: "The Big Muddy Inn",
    type: EntityType.ROOM_CATEGORY,
    layer: ServiceLayer.BUSINESS,
    description: "Premium ($599/night). Themed decor, neon accents, listening station.",
    kpi: "RevPAR",
    kpiValue: "$500+",
    imageUrl: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=1600",
    gaps: [
      {
        id: 'g_room_3',
        description: "In-room vinyl collection curation requires licensing check.",
        priority: 'LOW',
        status: GapStatus.OPEN,
      }
    ],
    coordinates: { x: 58, y: 75 }
  },
  {
    id: 'e_room_4',
    name: "Legendary Suite",
    location: "The Big Muddy Inn",
    type: EntityType.ROOM_CATEGORY,
    layer: ServiceLayer.BUSINESS,
    description: "Ultra-premium ($799/night). Balcony, private bar, artist history.",
    kpi: "GSS Score",
    kpiValue: "9.8/10",
    imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1600",
    gaps: [
      {
        id: 'g_room_4',
        description: "Concierge experience design for VIP arrival.",
        priority: 'HIGH',
        status: GapStatus.OPEN,
      }
    ],
    coordinates: { x: 58, y: 81 }
  },

  // --- PACKAGES (FLOATING AROUND HOTEL) ---
  {
    id: 'e_pkg_1',
    name: "Stay & Hear Bronze",
    location: "Package",
    type: EntityType.PACKAGE,
    layer: ServiceLayer.BUSINESS,
    description: "Room + 1 Show Ticket. Entry level immersion.",
    kpi: "Pkg Bookings",
    kpiValue: "50/mo",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1600",
    gaps: [
      {
        id: 'g_pkg_1',
        description: "Pricing strategy vs OTA room-only rates.",
        priority: 'MEDIUM',
        status: GapStatus.OPEN,
      }
    ],
    coordinates: { x: 42, y: 82 }
  },
  {
    id: 'e_pkg_2',
    name: "Stay & Hear Silver",
    location: "Package",
    type: EntityType.PACKAGE,
    layer: ServiceLayer.BUSINESS,
    description: "Room + 2 Shows + Dinner at Soul Kitchen.",
    kpi: "Pkg Bookings",
    kpiValue: "30/mo",
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1600",
    gaps: [],
    coordinates: { x: 40, y: 78 }
  },
  {
    id: 'e_pkg_3',
    name: "Stay & Hear Gold",
    location: "Package",
    type: EntityType.PACKAGE,
    layer: ServiceLayer.BUSINESS,
    description: "Full immersion: Room + All Shows + Dinner + Backstage + Meet & Greet.",
    kpi: "Pkg Bookings",
    kpiValue: "10/mo",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1600",
    gaps: [],
    coordinates: { x: 38, y: 74 }
  },

  // --- NETWORK / BRANDS (DIGITAL / GLOBAL) ---
  {
    id: 'e3',
    name: "Ari Aslin Brand",
    location: "Global / Digital",
    type: EntityType.BRAND,
    layer: ServiceLayer.NETWORK,
    description: "Entertainment personality and creative director IP. Southern Gothic storytelling.",
    kpi: "Social Reach",
    kpiValue: "125k",
    imageUrl: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=1600",
    gaps: [
      {
        id: 'g4',
        description: "Merchandise strategy for Q4 missing.",
        priority: 'HIGH',
        status: GapStatus.OPEN,
      }
    ],
    coordinates: { x: 85, y: 20 } // Top Right (Digital/Cloud)
  },
  {
    id: 'e_prog_1',
    name: "Artist Residency",
    location: "Natchez, MS",
    type: EntityType.PROGRAM,
    layer: ServiceLayer.NETWORK,
    description: "3 Tiers: Emerging, Mid-Career, Master. Living quarters provided for creative output.",
    kpi: "Artists/Qtr",
    kpiValue: "3",
    imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=1600",
    gaps: [
      {
        id: 'g_prog_1',
        description: "Application pipeline and vetting process not built.",
        priority: 'HIGH',
        status: GapStatus.OPEN,
      }
    ],
    coordinates: { x: 60, y: 65 }
  },
  {
    id: 'e6',
    name: "Delta Textures",
    location: "Oxford, MS",
    type: EntityType.BRAND,
    layer: ServiceLayer.NETWORK,
    description: "High-end linen and home goods line inspired by the hotel interiors.",
    kpi: "Wholesale Accts",
    kpiValue: "12",
    imageUrl: "https://images.unsplash.com/photo-1520699697851-3dc68aa3a474?auto=format&fit=crop&q=80&w=1600",
    gaps: [],
    coordinates: { x: 75, y: 40 } // North East (Oxford)
  },
  
  // --- DEVELOPMENT / EXPANSION ---
  {
    id: 'e5',
    name: "Beale Street outpost",
    location: "Memphis, TN",
    address: "Beale St, Memphis, TN",
    type: EntityType.DEVELOPMENT,
    layer: ServiceLayer.NETWORK,
    description: "Potential pop-up gallery and listening room to funnel traffic to Natchez.",
    kpi: "Foot Traffic",
    kpiValue: "Est. 2k/day",
    imageUrl: "https://images.unsplash.com/photo-1550136513-548af4445338?auto=format&fit=crop&q=80&w=1600",
    gaps: [
      {
        id: 'g6',
        description: "Lease negotiation strategy for historic district.",
        priority: 'MEDIUM',
        status: GapStatus.OPEN,
      }
    ],
    coordinates: { x: 50, y: 15 } // Top Center (Memphis)
  },
  {
    id: 'e_dev_2',
    name: "Arkansas Development",
    location: "Hot Springs, AR",
    type: EntityType.DEVELOPMENT,
    layer: ServiceLayer.NETWORK,
    description: "Expansion arm for Hot Springs corridor. Connecting Blues Highway to Spa City.",
    kpi: "Scouted Props",
    kpiValue: "0",
    imageUrl: "https://images.unsplash.com/photo-1444723121867-26b5d646d637?auto=format&fit=crop&q=80&w=1600",
    gaps: [
      {
        id: 'g_dev_1',
        description: "Market analysis for Hot Springs blues tourism not started.",
        priority: 'HIGH',
        status: GapStatus.OPEN,
      }
    ],
    coordinates: { x: 20, y: 45 } // West (Arkansas)
  },
  {
    id: 'e2_real',
    name: "Soul Kitchen",
    location: "Natchez, MS",
    address: "334 Main St, Natchez, MS 39120",
    type: EntityType.EXPERIENCE,
    layer: ServiceLayer.BUSINESS,
    description: "Signature restaurant. Delta fusion cuisine + Blues cocktail program.",
    kpi: "Covers/Week",
    kpiValue: "450",
    imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16549766b?auto=format&fit=crop&q=80&w=1600",
    gaps: [
      {
        id: 'g3',
        description: "Cocktail menu names need to align with obscure Blues history.",
        priority: 'MEDIUM',
        status: GapStatus.OPEN,
      }
    ],
    coordinates: { x: 50, y: 68 }
  }
];
