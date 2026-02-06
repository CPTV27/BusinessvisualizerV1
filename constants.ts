import { ThemeConfig, ThemeId, EntityType, GapStatus, BusinessEntity, ServiceLayer, MoodType } from './types';

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

// --- ENVIRONMENT DESCRIPTIONS FOR PANORAMIC GENERATION (GA + CC) ---
// Maps theme × entity type → rich prompt descriptions for Gemini image generation
// Used by generatePanoramicEnvironment() in geminiService.ts

export interface EnvironmentDescription {
  base: string;
  entityBackdrops: Record<string, string>; // EntityType string keys for flexibility
  moods: Record<MoodType, string>;
  negativePrompt: string;
}

export const ENVIRONMENT_DESCRIPTIONS: Record<ThemeId, EnvironmentDescription> = {
  [ThemeId.LOBBY]: {
    base: `Art Deco luxury hotel lobby in Natchez, Mississippi. Deep navy blue walls with gold leaf geometric trim.
    Polished marble floors reflecting warm chandelier light. Leather club chairs arranged in intimate conversation groups.
    Brass elevator doors, terrazzo patterns, crystal decanters on mahogany side tables.
    1920s Southern elegance meets Mississippi Delta blues heritage. Jazz age sophistication.`,
    entityBackdrops: {
      [EntityType.VENUE]: `Grand hotel interior with double-height ceilings, ornate plasterwork, vintage brass fixtures,
        Persian rugs on hardwood, a concierge desk with fresh magnolias`,
      [EntityType.EXPERIENCE]: `Intimate performance lounge with Art Deco stage, velvet curtains, cocktail tables with
        candlelight, a baby grand piano, vintage microphone on brass stand`,
      [EntityType.BRAND]: `Luxury brand showroom with glass display cases, gold-framed mirrors, curated merchandise
        on dark walnut shelving, spot-lit product pedestals`,
      [EntityType.DEVELOPMENT]: `Architectural model room with blueprints spread on drafting tables, scale models under
        glass, brass drawing instruments, maps of the Mississippi corridor on walls`,
      [EntityType.PACKAGE]: `Gift concierge suite with velvet-lined presentation boxes, ribbon-wrapped packages,
        a tasting bar with crystal glasses, monogrammed leather accessories`,
      [EntityType.PROGRAM]: `Artist salon with easels, musical instruments in velvet cases, a writing desk with
        fountain pens, framed black-and-white photographs of Delta blues legends`,
      [EntityType.ROOM_CATEGORY]: `Luxury hotel suite with four-poster bed, Egyptian cotton linens,
        clawfoot tub visible through archway, river view through plantation shutters`,
    },
    moods: {
      day: `Bright natural light streaming through tall arched windows, golden afternoon sun casting long shadows
        across marble floors, dust motes floating in sunbeams, warm honey tones`,
      evening: `Warm tungsten chandelier glow, candlelight flickering on brass surfaces, amber warmth throughout,
        blue hour visible through windows, intimate and inviting atmosphere`,
      night: `Low dramatic lighting, spotlit artwork, deep shadows in corners, neon "OPEN" sign reflection
        from the street, after-hours speakeasy energy, mysterious and seductive`,
    },
    negativePrompt: `text, watermark, frames, borders, distortion at poles, cartoon, anime, low quality, blurry,
      modern furniture, fluorescent lighting, plastic materials`,
  },

  [ThemeId.GARDEN]: {
    base: `Japanese-inspired zen garden at a Mississippi Delta retreat. Raked white sand patterns around moss-covered stones.
    Bamboo groves filtering soft light. Koi pond with lily pads reflecting sky. Wabi-sabi beauty in every detail.
    Weathered wood pavilion with paper screens. Indoor-outdoor flow. Meditation meets Southern hospitality.
    Earth tones: sage, terracotta, aged cedar, river stone gray.`,
    entityBackdrops: {
      [EntityType.VENUE]: `Open-air pavilion with timber frame, stone foundation, wisteria climbing columns,
        gravel pathways leading to covered seating areas, water feature in courtyard`,
      [EntityType.EXPERIENCE]: `Outdoor amphitheater carved into hillside, lantern-lit stone seating,
        a natural stage framed by live oak trees, fireflies at dusk`,
      [EntityType.BRAND]: `Artisan workshop with raw materials displayed on rough-hewn shelves, handwoven textiles
        draped over wooden forms, natural dye samples in ceramic bowls`,
      [EntityType.DEVELOPMENT]: `Garden planning space with topographic maps, soil samples, pressed botanical specimens,
        hand-drawn landscape plans on rice paper`,
      [EntityType.PACKAGE]: `Tea ceremony room with tatami mats, ceramic teapot and cups, wrapped gift bundles
        in natural linen and twine, dried flower arrangements`,
      [EntityType.PROGRAM]: `Plein air painting studio under a pergola, easels facing the garden, watercolor palettes,
        journals and sketchbooks, a guitar leaning against a post`,
      [EntityType.ROOM_CATEGORY]: `Minimalist room with platform bed, linen bedding in earth tones,
        sliding shoji screens opening to garden view, stone soaking tub`,
    },
    moods: {
      day: `Bright overcast sky diffusing soft even light, dew on leaves, morning mist rising from the pond,
        birds visible in branches, fresh and peaceful energy`,
      evening: `Paper lanterns glowing warm amber, last light catching water droplets on bamboo,
        long shadows across raked sand, crickets-at-dusk atmosphere`,
      night: `Moonlight on water, stone lanterns casting pools of warm light on pathways,
        fireflies dotting the darkness, deep quiet contemplative mood`,
    },
    negativePrompt: `text, watermark, frames, borders, distortion at poles, cartoon, anime, low quality, blurry,
      bright neon colors, modern glass buildings, plastic materials, harsh shadows`,
  },

  [ThemeId.JUKE_JOINT]: {
    base: `Underground blues club in the Mississippi Delta, after midnight. Raw brick walls sweating with humidity.
    Neon signs casting purple and cyan glow through smoke haze. A small stage with a single spotlight.
    Bar lined with whiskey bottles catching colored light. Tin ceiling tiles, concrete floor worn smooth.
    Southern Gothic meets cyberpunk. Dangerous beauty. Electric tension. Heat and soul and sin.`,
    entityBackdrops: {
      [EntityType.VENUE]: `Full juke joint interior with neon beer signs, pool table in shadows,
        jukebox glowing in corner, bar stools with cracked leather, vintage concert posters peeling from walls`,
      [EntityType.EXPERIENCE]: `Stage-eye view of intimate blues club, microphone in spotlight, guitar amp glowing,
        audience silhouettes holding drinks, haze of atmosphere, raw energy`,
      [EntityType.BRAND]: `Back-alley merch booth with screen-printed posters drying on lines, neon-lit display case,
        vinyl records in crates, custom leather goods, underground aesthetic`,
      [EntityType.DEVELOPMENT]: `Abandoned warehouse being converted, exposed brick and steel beams,
        architectural plans pinned to walls with neon annotations, hard hats and blueprints`,
      [EntityType.PACKAGE]: `VIP backstage area with bottle service on industrial cable spool table,
        all-access laminates, signed setlists under glass, exclusive merchandise`,
      [EntityType.PROGRAM]: `Recording studio control room with vintage mixing console, reel-to-reel tape,
        isolation booth visible through glass, instruments hung on walls, red recording light`,
      [EntityType.ROOM_CATEGORY]: `Moody hotel room with exposed brick, neon accent light strip,
        vinyl turntable on nightstand, velvet blackout curtains, industrial bathroom fixtures`,
    },
    moods: {
      day: `Harsh afternoon light cutting through dusty windows, revealing the raw beauty of the space,
        empty stage waiting, chairs stacked, the calm before the storm`,
      evening: `Neon warming up, first patrons arriving, bartender polishing glasses,
        sound check reverberating, anticipation building, purple and amber tones`,
      night: `Full neon blaze, smoke machine haze, spotlight cutting through darkness,
        sweat on walls, bass vibrating through floor, peak energy, ecstatic and dangerous`,
    },
    negativePrompt: `text, watermark, frames, borders, distortion at poles, cartoon, anime, low quality, blurry,
      bright daylight, clean modern surfaces, corporate aesthetic, happy colors`,
  },

  [ThemeId.EDITORIAL]: {
    base: `High-fashion editorial photography studio. Stark white cyclorama walls curving into floor.
    Single bold red accent object or light. Geometric shadows from venetian blinds creating dramatic patterns.
    Minimalist Vogue aesthetic. Clean lines, dramatic negative space. Precision and power.
    Black and white with strategic red. Luxury brand campaign set. Architectural fashion.`,
    entityBackdrops: {
      [EntityType.VENUE]: `Fashion week venue with runway extending into darkness, geometric seating,
        dramatic overhead lighting rigs, black curtain backdrop, stark and powerful`,
      [EntityType.EXPERIENCE]: `Performance art installation space, white gallery walls, single red spotlight,
        geometric props casting long shadows, audience as silhouettes, avant-garde`,
      [EntityType.BRAND]: `Luxury brand campaign set with product on minimalist white pedestal,
        dramatic single-source lighting, editorial lens flare, magazine-quality composition`,
      [EntityType.DEVELOPMENT]: `Architect's studio with large-format prints on walls, 3D-printed building models,
        light tables with transparencies, everything in black white and chrome`,
      [EntityType.PACKAGE]: `Unboxing experience editorial: matte black boxes with red tissue paper,
        product photography setup, clean white surface, dramatic overhead angle`,
      [EntityType.PROGRAM]: `Dance rehearsal space with mirrors, ballet barre, single red rose on piano,
        black and white with one color accent, disciplined elegance`,
      [EntityType.ROOM_CATEGORY]: `Monochrome luxury suite with statement furniture piece in red,
        floor-to-ceiling windows with city skyline, Italian marble bathroom, designer everything`,
    },
    moods: {
      day: `Harsh directional light from large windows creating bold geometric shadows,
        high contrast black and white, crisp and clinical, power dressing energy`,
      evening: `Single warm spotlight in otherwise cool space, dramatic chiaroscuro,
        editorial photography golden hour, moody and intentional`,
      night: `Near darkness with single red neon glow, extreme contrast,
        silhouettes and reflections, after-party editorial, raw glamour`,
    },
    negativePrompt: `text, watermark, frames, borders, distortion at poles, cartoon, anime, low quality, blurry,
      warm cozy lighting, cluttered spaces, rustic textures, casual aesthetic, nature elements`,
  },
};
