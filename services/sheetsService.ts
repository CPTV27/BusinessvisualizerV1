/**
 * [CC] Google Sheets Service — Discovery Model Connector
 *
 * Connects the 235-formula Discovery Model spreadsheet to the Studio.
 * Maps spreadsheet data → BusinessEntity objects for live rendering.
 *
 * Owned by: CC (Claude Code)
 * Depends on: types.ts (GA territory)
 */

import { BusinessEntity, EntityType, ServiceLayer, GapStatus, BusinessGap } from '../types';

// ============================================
// TYPES FOR SHEETS MAPPING
// ============================================

export interface SheetConfig {
  spreadsheetId: string;
  apiKey?: string; // For public sheets, or use OAuth
  ranges: {
    foundation: string;   // e.g., "Foundation Layer!A2:Z"
    machine: string;      // e.g., "Machine Layer!A2:Z"
    network: string;      // e.g., "Network Layer!A2:Z"
    business: string;     // e.g., "Business Layer!A2:Z"
    revenue: string;      // e.g., "Revenue Model!A2:Z"
  };
}

export interface RevenueProjection {
  entityId: string;
  monthly: number;
  quarterly: number;
  annual: number;
  growthRate: number;     // percentage
  breakEvenMonths: number;
  roi: number;            // percentage
}

export interface DiscoveryModelData {
  entities: BusinessEntity[];
  revenue: RevenueProjection[];
  lastUpdated: number;
  sheetTitle: string;
}

// ============================================
// DEFAULT SHEET CONFIG (Big Muddy Discovery Model)
// ============================================

const DEFAULT_CONFIG: SheetConfig = {
  spreadsheetId: '', // Set via .env or UI
  ranges: {
    foundation: 'Foundation!A2:Z100',
    machine: 'Machine!A2:Z100',
    network: 'Network!A2:Z100',
    business: 'Business!A2:Z100',
    revenue: 'Revenue Model!A2:Z100',
  }
};

// ============================================
// COLUMN MAPPING
// Maps spreadsheet columns to entity fields
// Adjust these when the spreadsheet structure changes
// ============================================

interface ColumnMap {
  name: number;        // Column index for entity name
  type: number;        // Column index for entity type
  location: number;    // Column index for location
  description: number; // Column index for description
  kpi: number;         // Column index for KPI label
  kpiValue: number;    // Column index for KPI value
  gapCol: number;      // Column index where gaps start
  gapCount: number;    // Number of gap columns
  revenue?: number;    // Column index for revenue (if in same sheet)
}

const STANDARD_COLUMNS: ColumnMap = {
  name: 0,        // A
  type: 1,        // B
  location: 2,    // C
  description: 3, // D
  kpi: 4,         // E
  kpiValue: 5,    // F
  gapCol: 6,      // G onwards
  gapCount: 3,    // 3 gap columns
  revenue: 9,     // J
};

// ============================================
// GOOGLE SHEETS API (via REST)
// Using API key for read-only public sheets
// Or OAuth token for private sheets
// ============================================

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

interface FetchOptions {
  apiKey?: string;
  accessToken?: string;
}

async function fetchSheetRange(
  spreadsheetId: string,
  range: string,
  options: FetchOptions
): Promise<string[][]> {
  const encodedRange = encodeURIComponent(range);
  let url = `${SHEETS_API_BASE}/${spreadsheetId}/values/${encodedRange}?valueRenderOption=FORMATTED_VALUE`;

  if (options.apiKey) {
    url += `&key=${options.apiKey}`;
  }

  const headers: Record<string, string> = {};
  if (options.accessToken) {
    headers['Authorization'] = `Bearer ${options.accessToken}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Sheets API Error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.values || [];
}

async function fetchSheetMetadata(
  spreadsheetId: string,
  options: FetchOptions
): Promise<{ title: string; sheets: string[] }> {
  let url = `${SHEETS_API_BASE}/${spreadsheetId}?fields=properties.title,sheets.properties.title`;

  if (options.apiKey) {
    url += `&key=${options.apiKey}`;
  }

  const headers: Record<string, string> = {};
  if (options.accessToken) {
    headers['Authorization'] = `Bearer ${options.accessToken}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Sheets metadata error: ${response.status}`);
  }

  const data = await response.json();
  return {
    title: data.properties?.title || 'Unknown',
    sheets: (data.sheets || []).map((s: any) => s.properties?.title || '')
  };
}

// ============================================
// ROW → ENTITY PARSER
// ============================================

function parseEntityType(raw: string): EntityType {
  const normalized = raw?.toUpperCase().trim();
  const map: Record<string, EntityType> = {
    'VENUE': EntityType.VENUE,
    'HOTEL': EntityType.VENUE,
    'RESTAURANT': EntityType.VENUE,
    'BRAND': EntityType.BRAND,
    'EXPERIENCE': EntityType.EXPERIENCE,
    'SHOW': EntityType.EXPERIENCE,
    'EVENT': EntityType.EXPERIENCE,
    'DEVELOPMENT': EntityType.DEVELOPMENT,
    'EXPANSION': EntityType.DEVELOPMENT,
    'PACKAGE': EntityType.PACKAGE,
    'PROGRAM': EntityType.PROGRAM,
    'ROOM': EntityType.ROOM_CATEGORY,
  };
  return map[normalized] || EntityType.VENUE;
}

function parseGapPriority(raw: string): 'HIGH' | 'MEDIUM' | 'LOW' {
  const normalized = raw?.toUpperCase().trim();
  if (normalized?.includes('HIGH') || normalized?.includes('H')) return 'HIGH';
  if (normalized?.includes('LOW') || normalized?.includes('L')) return 'LOW';
  return 'MEDIUM';
}

function rowToEntity(
  row: string[],
  layer: ServiceLayer,
  columns: ColumnMap = STANDARD_COLUMNS,
  index: number
): BusinessEntity | null {
  const name = row[columns.name]?.trim();
  if (!name) return null;

  // Parse gaps from columns
  const gaps: BusinessGap[] = [];
  for (let i = 0; i < columns.gapCount; i++) {
    const gapText = row[columns.gapCol + i]?.trim();
    if (gapText) {
      gaps.push({
        id: `g-sheet-${layer.toLowerCase()}-${index}-${i}`,
        description: gapText,
        priority: parseGapPriority(gapText),
        status: GapStatus.OPEN,
      });
    }
  }

  return {
    id: `sheet-${layer.toLowerCase()}-${index}`,
    name,
    type: parseEntityType(row[columns.type] || ''),
    location: row[columns.location] || '',
    description: row[columns.description] || '',
    kpi: row[columns.kpi] || 'TBD',
    kpiValue: row[columns.kpiValue] || '-',
    layer,
    gaps,
  };
}

// ============================================
// REVENUE MODEL PARSER
// ============================================

function parseRevenueRow(row: string[], entityId: string): RevenueProjection | null {
  if (!row[0]?.trim()) return null;

  return {
    entityId,
    monthly: parseFloat(row[1]?.replace(/[^0-9.-]/g, '') || '0'),
    quarterly: parseFloat(row[2]?.replace(/[^0-9.-]/g, '') || '0'),
    annual: parseFloat(row[3]?.replace(/[^0-9.-]/g, '') || '0'),
    growthRate: parseFloat(row[4]?.replace(/[^0-9.%-]/g, '') || '0'),
    breakEvenMonths: parseInt(row[5]?.replace(/[^0-9]/g, '') || '0'),
    roi: parseFloat(row[6]?.replace(/[^0-9.%-]/g, '') || '0'),
  };
}

// ============================================
// MAIN API: FETCH DISCOVERY MODEL
// ============================================

export async function fetchDiscoveryModel(
  config: Partial<SheetConfig> = {},
  auth: FetchOptions = {}
): Promise<DiscoveryModelData> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const { spreadsheetId, ranges } = mergedConfig;

  if (!spreadsheetId) {
    throw new Error('No spreadsheet ID configured. Set it in .env.local or connect via UI.');
  }

  // Fetch metadata first
  const metadata = await fetchSheetMetadata(spreadsheetId, auth);

  // Fetch all layers in parallel
  const [foundationRows, machineRows, networkRows, businessRows, revenueRows] = await Promise.all([
    fetchSheetRange(spreadsheetId, ranges.foundation, auth).catch(() => []),
    fetchSheetRange(spreadsheetId, ranges.machine, auth).catch(() => []),
    fetchSheetRange(spreadsheetId, ranges.network, auth).catch(() => []),
    fetchSheetRange(spreadsheetId, ranges.business, auth).catch(() => []),
    fetchSheetRange(spreadsheetId, ranges.revenue, auth).catch(() => []),
  ]);

  // Parse entities from each layer
  const entities: BusinessEntity[] = [];

  const layerData: [string[][], ServiceLayer][] = [
    [foundationRows, ServiceLayer.FOUNDATION],
    [machineRows, ServiceLayer.MACHINE],
    [networkRows, ServiceLayer.NETWORK],
    [businessRows, ServiceLayer.BUSINESS],
  ];

  for (const [rows, layer] of layerData) {
    rows.forEach((row, idx) => {
      const entity = rowToEntity(row, layer, STANDARD_COLUMNS, idx);
      if (entity) entities.push(entity);
    });
  }

  // Parse revenue projections
  const revenue: RevenueProjection[] = [];
  revenueRows.forEach((row, idx) => {
    const entityId = entities[idx]?.id || `sheet-revenue-${idx}`;
    const proj = parseRevenueRow(row, entityId);
    if (proj) revenue.push(proj);
  });

  return {
    entities,
    revenue,
    lastUpdated: Date.now(),
    sheetTitle: metadata.title,
  };
}

// ============================================
// LIVE SYNC (Polling-based)
// ============================================

let syncInterval: ReturnType<typeof setInterval> | null = null;

export function startLiveSync(
  config: Partial<SheetConfig>,
  auth: FetchOptions,
  onUpdate: (data: DiscoveryModelData) => void,
  intervalMs: number = 30000 // 30 seconds default
): () => void {
  // Initial fetch
  fetchDiscoveryModel(config, auth)
    .then(onUpdate)
    .catch(err => console.error('Initial sync failed:', err));

  // Periodic refresh
  syncInterval = setInterval(() => {
    fetchDiscoveryModel(config, auth)
      .then(onUpdate)
      .catch(err => console.error('Sync failed:', err));
  }, intervalMs);

  // Return cleanup function
  return () => {
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
  };
}

// ============================================
// UTILITY: MERGE SHEET DATA WITH LOCAL ENTITIES
// Combines live sheet data with locally-defined entities
// ============================================

export function mergeWithLocalEntities(
  sheetData: DiscoveryModelData,
  localEntities: BusinessEntity[]
): BusinessEntity[] {
  const merged = [...localEntities];
  const localIds = new Set(localEntities.map(e => e.name.toLowerCase()));

  // Add sheet entities that don't exist locally (by name matching)
  for (const sheetEntity of sheetData.entities) {
    if (!localIds.has(sheetEntity.name.toLowerCase())) {
      merged.push(sheetEntity);
    } else {
      // Update existing entity's KPIs from sheet (live data wins for numbers)
      const local = merged.find(e => e.name.toLowerCase() === sheetEntity.name.toLowerCase());
      if (local) {
        local.kpiValue = sheetEntity.kpiValue;
        // Merge gaps (keep local AI suggestions, add new sheet gaps)
        const localGapDescs = new Set(local.gaps.map(g => g.description.toLowerCase()));
        for (const gap of sheetEntity.gaps) {
          if (!localGapDescs.has(gap.description.toLowerCase())) {
            local.gaps.push(gap);
          }
        }
      }
    }
  }

  return merged;
}
