import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutGrid,
  MapPin,
  Search,
  Globe,
  Loader2,
  FileText,
  PenTool,
  Scan,
  Monitor,
  Box,
  CheckCircle2,
  X,
  Sparkles,
  Plus,
  ArrowRight,
  Film,
  ImagePlus,
  Play,
  Upload,
  CreditCard,
  Maximize2,
  Map as MapIcon,
  Wand2,
  Camera,
  MessageSquare,
  Send,
  Save,
  Clock,
  RefreshCw,
  Navigation,
  TrendingUp,
  Target,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { THEMES, INITIAL_ENTITIES } from './constants';
import { ThemeId, ThemeConfig, BusinessEntity, BusinessGap, GapStatus, ChatMessage, EntityType, MarketAnalysis } from './types';
import {
  generateGapSolutions,
  generateEntityVisual,
  performMarketAnalysis,
  generateReel,
  modifyRoomScenario,
  sendEntityChatMessage
} from './services/geminiService';
import { StudioExperience } from './src/components/StudioExperience';
import { GameBoard, GameBoardView } from './src/components/GameBoard';

// App view modes:
// 'IMMERSIVE' = StudioExperience (theme selector + 3D world)
// 'BOARD'     = GameBoard (strategic operations map with 5 views)
// 'DETAIL'    = EntityDetailView (deep dive on entity)
type AppViewMode = 'IMMERSIVE' | 'BOARD' | 'DETAIL';

// Define AIStudio interface locally to avoid global declaration conflicts
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

// --- COMPONENTS ---

interface ThemeCardProps {
  theme: ThemeConfig;
  onSelect: () => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({ theme, onSelect }) => (
  <button
    onClick={onSelect}
    className="group relative w-full h-80 overflow-hidden text-left transition-all duration-500 hover:scale-[1.02]"
  >
    <div
      className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-90"
      style={{ backgroundColor: theme.colors.bg }}
    />
    <div
      className={`absolute inset-0 border-4 opacity-50 group-hover:opacity-100 transition-all duration-300`}
      style={{ borderColor: theme.colors.accent }}
    />

    <div className="relative z-10 h-full p-8 flex flex-col justify-end">
      <h3
        className="text-3xl mb-2"
        style={{ fontFamily: theme.fonts.heading, color: theme.colors.text }}
      >
        {theme.name}
      </h3>
      <p
        className="text-sm opacity-80"
        style={{ fontFamily: theme.fonts.body, color: theme.colors.text }}
      >
        {theme.description}
      </p>
    </div>
  </button>
);

interface MapMarkerProps {
  entity: BusinessEntity;
  theme: ThemeConfig;
  onClick: () => void;
}

const MapMarker: React.FC<MapMarkerProps> = ({ entity, theme, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const x = entity.coordinates?.x || 50;
  const y = entity.coordinates?.y || 50;

  // Visual distinction based on entity type
  const isHub = entity.type === EntityType.VENUE && entity.layer === 'FOUNDATION';
  const size = isHub ? 48 : 32;

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div
        className="relative flex items-center justify-center cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        {/* Radar Ping Animation */}
        <div className={`absolute rounded-full border opacity-50 animate-ping ${isHub ? 'w-24 h-24 duration-[3000ms]' : 'w-12 h-12 duration-[2000ms]'}`}
          style={{ borderColor: theme.colors.accent }}
        />

        {/* Pin */}
        <div
          className={`rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${isHovered ? 'scale-125' : 'scale-100'}`}
          style={{
            width: size,
            height: size,
            backgroundColor: theme.colors.surface,
            border: `2px solid ${entity.gaps.some(g => g.priority === 'HIGH' && g.status === 'OPEN') ? '#EF4444' : theme.colors.accent}`
          }}
        >
          {isHub ? <LayoutGrid size={24} color={theme.colors.text} /> : <MapPin size={16} color={theme.colors.text} />}
        </div>

        {/* Hover Card */}
        <div
          className={`absolute left-full ml-4 top-1/2 -translate-y-1/2 w-64 p-4 pointer-events-none transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
          style={{
            backgroundColor: theme.colors.surface,
            borderLeft: `4px solid ${theme.colors.accent}`,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}
        >
          <h4 className="font-bold text-sm mb-1 leading-none" style={{ fontFamily: theme.fonts.heading, color: theme.colors.text }}>{entity.name}</h4>
          <p className="text-[10px] opacity-70 mb-2 uppercase tracking-wide" style={{ color: theme.colors.text }}>{entity.type}</p>
          {entity.gaps.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              {entity.gaps.length} Action Items
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- DIALOGS ---

const GapSolverDialog = ({
  isOpen,
  onClose,
  theme,
  gap,
  onSolve
}: {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeConfig;
  gap: BusinessGap | null;
  onSolve: (guidance: string) => void;
}) => {
  const [guidance, setGuidance] = useState('');

  if (!isOpen || !gap) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md bg-black/70 p-4 animate-in fade-in zoom-in duration-200">
      <div
        className={`w-full max-w-xl p-8 relative ${theme.styles.rounded} ${theme.styles.shadow}`}
        style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.accent}` }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 hover:opacity-70" style={{ color: theme.colors.text }}>
          <X size={24} />
        </button>

        <h3 className="text-xl mb-1" style={{ fontFamily: theme.fonts.heading, color: theme.colors.text }}>
          Strategic Resolution
        </h3>
        <p className="text-xs uppercase tracking-widest opacity-50 mb-6" style={{ fontFamily: theme.fonts.mono, color: theme.colors.text }}>
          Sidekick Intelligent Agent
        </p>

        <div className="mb-6 p-4 bg-black/20 rounded border border-white/5">
          <p className="text-sm italic opacity-90" style={{ color: theme.colors.text }}>
            "{gap.description}"
          </p>
        </div>

        <div className="mb-6">
          <textarea
            value={guidance}
            onChange={(e) => setGuidance(e.target.value)}
            placeholder="Provide director's notes (optional)..."
            className="w-full h-24 p-3 bg-transparent border focus:outline-none text-sm resize-none"
            style={{
              borderColor: theme.colors.border,
              color: theme.colors.text,
              borderRadius: '4px'
            }}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => onSolve(guidance)}
            className="px-6 py-2 text-xs font-bold uppercase tracking-widest hover:brightness-110 flex items-center gap-2"
            style={{ backgroundColor: theme.colors.accent, color: theme.colors.bg }}
          >
            <Sparkles size={14} />
            Generate Solution
          </button>
        </div>
      </div>
    </div>
  );
};

// --- IMMERSIVE ENTITY DETAIL VIEW ---

const EntityDetailView = ({
  entity,
  originalEntity,
  theme,
  onClose,
  onUpdateEntity
}: {
  entity: BusinessEntity;
  originalEntity: BusinessEntity;
  theme: ThemeConfig;
  onClose: () => void;
  onUpdateEntity: (e: BusinessEntity) => void;
}) => {
  const [mode, setMode] = useState<'MAP' | 'SPACE'>('SPACE');
  const [scenarioPrompt, setScenarioPrompt] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fill prompt if gaps exist
  useEffect(() => {
    if (entity.gaps.length > 0 && !scenarioPrompt) {
      setScenarioPrompt(`Visual solution for: ${entity.gaps[0].description}`);
    }
  }, [entity.gaps]);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [entity.chatHistory]);

  const handleChatSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatting) return;

    const userMsg: ChatMessage = { role: 'user', text: chatInput, timestamp: Date.now() };
    const updatedHistory = [...(entity.chatHistory || []), userMsg];

    // Optimistic Update
    onUpdateEntity({ ...entity, chatHistory: updatedHistory });
    setChatInput('');
    setIsChatting(true);

    try {
      const responseText = await sendEntityChatMessage(entity, updatedHistory, userMsg.text);
      const aiMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
      onUpdateEntity({ ...entity, chatHistory: [...updatedHistory, aiMsg] });
    } finally {
      setIsChatting(false);
    }
  };

  const handleScenarioRun = async () => {
    if (!scenarioPrompt.trim()) return;
    setIsSimulating(true);
    try {
      if (entity.imageUrl) {
        // Modify existing image
        const newImage = await modifyRoomScenario(entity.imageUrl, scenarioPrompt);
        if (newImage) {
          onUpdateEntity({ ...entity, imageUrl: newImage });
          setScenarioPrompt('');
        }
      } else {
        // Generate fresh visual from prompt
        const newImage = await generateEntityVisual(entity, scenarioPrompt);
        if (newImage) {
          onUpdateEntity({ ...entity, imageUrl: newImage });
          setScenarioPrompt('');
        }
      }
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetVisual = () => {
    onUpdateEntity({ ...entity, imageUrl: originalEntity.imageUrl });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onUpdateEntity({ ...entity, imageUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Safe Google Maps Embed
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(entity.address || entity.location || '')}&output=embed`;

  return (
    <div className="fixed inset-0 z-[60] bg-black text-white flex flex-col animate-in slide-in-from-bottom duration-500">

      {/* Header Bar */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="hover:opacity-70 transition-opacity">
            <ArrowRight className="rotate-180" size={24} />
          </button>
          <div>
            <h2 className="text-2xl leading-none" style={{ fontFamily: theme.fonts.heading }}>{entity.name}</h2>
            <p className="text-xs opacity-50 uppercase tracking-widest">{entity.location}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('MAP')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-colors ${mode === 'MAP' ? 'bg-white text-black border-white' : 'border-white/20 hover:border-white'}`}
          >
            <div className="flex items-center gap-2"><Globe size={14} /> Orbit</div>
          </button>
          <button
            onClick={() => setMode('SPACE')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-colors ${mode === 'SPACE' ? 'bg-white text-black border-white' : 'border-white/20 hover:border-white'}`}
          >
            <div className="flex items-center gap-2"><Scan size={14} /> Space</div>
          </button>
        </div>
      </div>

      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        {/* LEFT: VISUALIZATION AREA (2/3 Width) */}
        <div className="md:w-2/3 relative bg-neutral-900 border-r border-white/10">
          {mode === 'MAP' ? (
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              src={mapUrl}
              className="w-full h-full opacity-80 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 duration-700"
            />
          ) : (
            <div className="w-full h-full relative group">
              {/* Entity visual — show image if available, otherwise atmospheric fallback */}
              {entity.imageUrl ? (
                <img src={entity.imageUrl} className="w-full h-full object-cover" alt={entity.name} />
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.bg}, ${theme.colors.surface}, ${theme.colors.bg})`,
                  }}
                >
                  <div className="text-center opacity-60">
                    <Scan size={64} style={{ color: theme.colors.accent }} className="mx-auto mb-4" />
                    <p className="text-sm uppercase tracking-widest" style={{ color: theme.colors.text }}>
                      No visual generated yet
                    </p>
                    <p className="text-xs mt-2 opacity-50" style={{ color: theme.colors.text }}>
                      Use the Visual Command Line below to create one
                    </p>
                  </div>
                </div>
              )}

              {/* Visual Actions Overlay */}
              <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-black/60 backdrop-blur border border-white/20 p-2 rounded hover:bg-white hover:text-black transition-colors"
                  title="Upload Real Reference Photo"
                >
                  <Upload size={20} />
                </button>
                <button
                  onClick={handleResetVisual}
                  className="bg-black/60 backdrop-blur border border-white/20 p-2 rounded hover:bg-white hover:text-black transition-colors"
                  title="Reset to Original Visual"
                >
                  <RefreshCw size={20} />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
              </div>

              {/* Reality Editor (Visual Command Line) */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                <div className="max-w-3xl mx-auto">
                  <label className="text-[10px] uppercase font-bold tracking-widest mb-2 flex items-center gap-2 text-amber-500">
                    <Wand2 size={12} /> Visual Command Line
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={scenarioPrompt}
                      onChange={(e) => setScenarioPrompt(e.target.value)}
                      placeholder="Prompt the room (e.g. 'Add a live jazz band in the corner')..."
                      className="flex-grow bg-black/50 border border-white/20 p-3 text-sm focus:outline-none focus:border-amber-500 rounded-sm backdrop-blur-md font-mono"
                    />
                    <button
                      onClick={handleScenarioRun}
                      disabled={!scenarioPrompt || isSimulating}
                      className="px-6 font-bold uppercase tracking-widest bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSimulating ? <Loader2 className="animate-spin" /> : 'Render'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: CHAT NOTEBOOK (1/3 Width) */}
        <div className="md:w-1/3 bg-neutral-900/50 backdrop-blur-md flex flex-col h-full border-t md:border-t-0 border-white/10">
          <div className="p-4 border-b border-white/10 bg-black/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-widest">Entity Notebook</span>
            </div>
            <div className="flex items-center gap-2 opacity-50">
              <Clock size={12} />
              <span className="text-[10px] font-mono">Auto-saved</span>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-6" ref={chatScrollRef}>
            {(!entity.chatHistory || entity.chatHistory.length === 0) && (
              <div className="text-center opacity-30 mt-10">
                <MessageSquare size={32} className="mx-auto mb-2" />
                <p className="text-xs">No notes yet. Start discussing strategy, sourcing, or operations.</p>
              </div>
            )}

            {entity.chatHistory?.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] p-4 rounded-sm text-sm leading-relaxed ${msg.role === 'user'
                    ? 'bg-white/10 text-white'
                    : 'bg-amber-900/20 text-amber-100 border border-amber-500/20'
                    }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] opacity-30 mt-1 font-mono">
                  {msg.role === 'user' ? 'Director' : 'Sidekick'}
                </span>
              </div>
            ))}

            {isChatting && (
              <div className="flex items-start">
                <div className="p-4 bg-amber-900/10 border border-amber-500/10 rounded-sm">
                  <Loader2 size={16} className="animate-spin text-amber-500" />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleChatSubmit} className="p-4 bg-black/60 border-t border-white/10">
            <div className="relative">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Discuss strategy, sourcing, or operations..."
                className="w-full bg-white/5 border border-white/10 p-4 pr-12 text-sm focus:outline-none focus:border-white/30 rounded-sm"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatting}
                className="absolute right-2 top-2 p-2 hover:bg-white/10 rounded-sm transition-colors disabled:opacity-30"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId | null>(null);
  const [entities, setEntities] = useState<BusinessEntity[]>(INITIAL_ENTITIES);
  const [processingGap, setProcessingGap] = useState<{ entityId: string, gap: BusinessGap } | null>(null);

  // View mode: IMMERSIVE (3D world) → BOARD (strategic map) → DETAIL (entity deep dive)
  const [viewMode, setViewMode] = useState<AppViewMode>('IMMERSIVE');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [activeBoardView, setActiveBoardView] = useState<GameBoardView>('ECOSYSTEM');

  // Floating Panel States
  const [isScoutOpen, setIsScoutOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // Atlas / Scout State
  const [scoutLocation, setScoutLocation] = useState('Hot Springs, AR');
  const [scoutCategory, setScoutCategory] = useState('Tiny House Village');
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [isScouting, setIsScouting] = useState(false);

  // Studio State
  const [studioImages, setStudioImages] = useState<string[]>([]);
  const [reelPrompt, setReelPrompt] = useState('');
  const [isGeneratingReel, setIsGeneratingReel] = useState(false);
  const [generatedReelUrl, setGeneratedReelUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTheme = selectedThemeId ? THEMES[selectedThemeId] : null;

  // Auto-populate Studio Images from Entities on Load
  useEffect(() => {
    if (isStudioOpen && studioImages.length === 0) {
      const entityImages = entities
        .filter(e => e.imageUrl)
        .map(e => e.imageUrl!)
        .slice(0, 3);
      if (entityImages.length > 0) {
        setStudioImages(entityImages);
      }
    }
  }, [isStudioOpen, entities, studioImages.length]);

  // --- ACTIONS ---

  const handleGapClick = (entityId: string, gap: BusinessGap) => {
    setProcessingGap({ entityId, gap });
  };

  const handleSolveGap = async (guidance: string) => {
    if (!currentTheme || !processingGap) return;

    const { entityId, gap } = processingGap;
    setProcessingGap(null);

    const entity = entities.find(e => e.id === entityId);
    if (!entity) return;

    try {
      const suggestions = await generateGapSolutions(entity, gap, currentTheme.description, guidance);
      setEntities(prev => prev.map(e => e.id === entityId ? {
        ...e, gaps: e.gaps.map(g => g.id === gap.id ? {
          ...g,
          status: GapStatus.SOLVED,
          aiSuggestions: suggestions,
          userGuidance: guidance
        } : g)
      } : e));
    } catch (e) {
      console.error(e);
    }
  };

  const handleScoutAnalysis = async () => {
    if (!scoutLocation || !scoutCategory) return;
    setIsScouting(true);
    setMarketAnalysis(null);
    try {
      const result = await performMarketAnalysis(scoutLocation, scoutCategory);
      setMarketAnalysis(result);
    } finally {
      setIsScouting(false);
    }
  };

  const handleImageImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 3); // Max 3
      files.forEach((file: any) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setStudioImages(prev => [...prev, reader.result as string].slice(0, 3));
          }
        };
        reader.readAsDataURL(file as Blob);
      });
    }
  };

  const handleCreateReel = async () => {
    if (!currentTheme) return;
    setIsGeneratingReel(true);
    setGeneratedReelUrl(null);

    try {
      const aistudio = (window as any).aistudio as AIStudio | undefined;

      if (aistudio) {
        const hasKey = await aistudio.hasSelectedApiKey();
        if (!hasKey) {
          try {
            await aistudio.openSelectKey();
          } catch (e) {
            console.error("Key selection failed/cancelled", e);
            setIsGeneratingReel(false);
            return;
          }
        }
      }

      const videoUrl = await generateReel(studioImages, reelPrompt || `A cinematic, high-energy sizzle reel. Style: ${currentTheme.description}`);
      if (videoUrl) {
        setGeneratedReelUrl(videoUrl);
      }
    } catch (error) {
      console.error("Reel Error", error);
      if (error instanceof Error && error.message.includes("Requested entity was not found")) {
        const aistudio = (window as any).aistudio as AIStudio | undefined;
        if (aistudio) {
          await aistudio.openSelectKey();
        }
      }
    } finally {
      setIsGeneratingReel(false);
    }
  };

  const handleUpdateEntity = (updatedEntity: BusinessEntity) => {
    setEntities(prev => prev.map(e => e.id === updatedEntity.id ? updatedEntity : e));
  };

  // --- RENDER ---

  // Find entities for detail view
  const selectedEntity = selectedEntityId ? entities.find(e => e.id === selectedEntityId) : null;
  const originalEntity = selectedEntityId ? INITIAL_ENTITIES.find(e => e.id === selectedEntityId) : null;

  // === VIEW 1: IMMERSIVE (Theme Selector + 3D World) ===
  if (viewMode === 'IMMERSIVE') {
    return (
      <StudioExperience
        entities={entities.map(e => ({
          id: e.id,
          name: e.name,
          type: e.type,
          layer: e.layer || 'FOUNDATION',
          description: e.description,
          kpiValue: e.kpiValue,
          coordinates: e.coordinates || { x: 50, y: 50 },
          gaps: e.gaps.map(g => ({ priority: g.priority, status: g.status })),
        }))}
        onEntitySelect={(entityId) => {
          // Entity clicked in 3D world → go to detail view
          setSelectedEntityId(entityId);
          setViewMode('DETAIL');
        }}
        onThemeSelect={(themeId) => {
          if (themeId) {
            setSelectedThemeId(themeId);
          } else {
            // Back to selector (null theme)
            setSelectedThemeId(null);
          }
        }}
        onEnterBoard={() => {
          // "Enter Operations" clicked in 3D world → go to board view
          setViewMode('BOARD');
        }}
        selectedThemeId={selectedThemeId}
      />
    );
  }

  // Need a theme for BOARD and DETAIL views
  if (!currentTheme) {
    // Safety fallback — shouldn't happen
    setViewMode('IMMERSIVE');
    return null;
  }

  // === VIEW 2: BOARD (Strategic Operations Map with GameBoard) ===
  if (viewMode === 'BOARD') {
    return (
      <div
        className="min-h-screen transition-colors duration-700 flex flex-col relative overflow-hidden"
        style={{ backgroundColor: currentTheme.colors.bg }}
      >
        {/* Header Bar */}
        <div
          className="flex items-center justify-between p-6 border-b z-10"
          style={{ borderColor: currentTheme.colors.border, backgroundColor: currentTheme.colors.bg }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('IMMERSIVE')}
              className="text-xs hover:opacity-70 flex items-center gap-2"
              style={{ color: currentTheme.colors.text }}
            >
              <ArrowRight className="rotate-180" size={16} />
              <span className="uppercase tracking-widest font-bold">Back to World</span>
            </button>
            <div className="w-px h-8 opacity-20" style={{ backgroundColor: currentTheme.colors.text }} />
            <div>
              <h1
                className="text-lg font-bold leading-none"
                style={{ fontFamily: currentTheme.fonts.heading, color: currentTheme.colors.text }}
              >
                THE STUDIO
              </h1>
              <p
                className="text-[10px] uppercase tracking-widest opacity-60"
                style={{ color: currentTheme.colors.text }}
              >
                {currentTheme.name} · Strategic Operations
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Scout button */}
            <button
              onClick={() => setIsScoutOpen(!isScoutOpen)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-colors ${currentTheme.styles.rounded}`}
              style={{
                backgroundColor: isScoutOpen ? currentTheme.colors.accent : 'transparent',
                color: isScoutOpen ? currentTheme.colors.bg : currentTheme.colors.text,
                borderColor: currentTheme.colors.border
              }}
            >
              <Globe size={14} />
              Scout
            </button>
            {/* Studio button */}
            <button
              onClick={() => setIsStudioOpen(!isStudioOpen)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-colors ${currentTheme.styles.rounded}`}
              style={{
                backgroundColor: isStudioOpen ? currentTheme.colors.accent : 'transparent',
                color: isStudioOpen ? currentTheme.colors.bg : currentTheme.colors.text,
                borderColor: currentTheme.colors.border
              }}
            >
              <Film size={14} />
              Studio
            </button>
          </div>
        </div>

        {/* Main Content: GameBoard */}
        <div className="flex-grow overflow-y-auto p-6">
          <GameBoard
            entities={entities}
            theme={currentTheme}
            activeView={activeBoardView}
            onViewChange={setActiveBoardView}
            onEntityClick={(entity) => {
              setSelectedEntityId(entity.id);
              setViewMode('DETAIL');
            }}
            onGapClick={handleGapClick}
          />
        </div>

        {/* Scout Panel (floating overlay) */}
        {isScoutOpen && (
          <div className="fixed top-20 right-6 z-50 w-96">
            <div className={`p-6 backdrop-blur-md border ${currentTheme.styles.rounded} ${currentTheme.styles.shadow}`}
              style={{ backgroundColor: `${currentTheme.colors.bg}F2`, borderColor: currentTheme.colors.border }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold" style={{ fontFamily: currentTheme.fonts.heading, color: currentTheme.colors.text }}>
                  Regional Intelligence
                </h3>
                <button onClick={() => setIsScoutOpen(false)} style={{ color: currentTheme.colors.text }}><X size={16} /></button>
              </div>
              <div className="space-y-4 mb-4">
                <div>
                  <label className="text-[10px] uppercase opacity-50 block mb-1" style={{ color: currentTheme.colors.text }}>Target Market</label>
                  <input type="text" value={scoutLocation} onChange={(e) => setScoutLocation(e.target.value)}
                    className="w-full bg-transparent border-b p-2 text-sm focus:outline-none"
                    style={{ borderColor: currentTheme.colors.border, color: currentTheme.colors.text }} />
                </div>
                <div>
                  <label className="text-[10px] uppercase opacity-50 block mb-1" style={{ color: currentTheme.colors.text }}>Venture Category</label>
                  <input type="text" value={scoutCategory} onChange={(e) => setScoutCategory(e.target.value)}
                    className="w-full bg-transparent border-b p-2 text-sm focus:outline-none"
                    style={{ borderColor: currentTheme.colors.border, color: currentTheme.colors.text }} />
                </div>
                <button onClick={handleScoutAnalysis} disabled={isScouting}
                  className="w-full py-3 text-xs font-bold uppercase tracking-widest hover:brightness-110 flex items-center justify-center gap-2"
                  style={{ backgroundColor: currentTheme.colors.accent, color: currentTheme.colors.bg }}>
                  {isScouting ? <Loader2 className="animate-spin" size={14} /> : <Target size={14} />}
                  Run Market Analysis
                </button>
              </div>
              {marketAnalysis && (
                <div className="max-h-[50vh] overflow-y-auto space-y-4">
                  <div className="p-3 border-l-4" style={{ borderColor: currentTheme.colors.accent, backgroundColor: currentTheme.colors.surface }}>
                    <p className="text-sm font-bold" style={{ color: currentTheme.colors.text }}>{marketAnalysis.capitalStrategy.capitalRatio}</p>
                    <p className="text-xs opacity-80" style={{ color: currentTheme.colors.text }}>{marketAnalysis.capitalStrategy.verdict}</p>
                  </div>
                  {marketAnalysis.competitors.map((comp, idx) => (
                    <div key={idx} className="p-3 border-l border-white/20 bg-white/5">
                      <span className="font-bold text-sm" style={{ color: currentTheme.colors.text }}>{comp.name}</span>
                      <p className="text-[10px] opacity-70" style={{ color: currentTheme.colors.text }}>{comp.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gap Solver Dialog */}
        <GapSolverDialog
          isOpen={!!processingGap}
          onClose={() => setProcessingGap(null)}
          theme={currentTheme}
          gap={processingGap?.gap || null}
          onSolve={handleSolveGap}
        />
      </div>
    );
  }

  // === VIEW 3: ENTITY DETAIL ===
  if (viewMode === 'DETAIL' && selectedEntity && originalEntity) {
    return (
      <EntityDetailView
        entity={selectedEntity}
        originalEntity={originalEntity}
        theme={currentTheme}
        onClose={() => {
          setSelectedEntityId(null);
          // Go back to board if we have a theme, otherwise immersive
          setViewMode(selectedThemeId ? 'BOARD' : 'IMMERSIVE');
        }}
        onUpdateEntity={handleUpdateEntity}
      />
    );
  }

  // Fallback: go back to immersive
  if (viewMode === 'DETAIL') {
    // Entity not found — go back
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: currentTheme?.colors.bg || '#000' }}
      >
        <div className="text-center">
          <p className="text-white/60 mb-4">Entity not found</p>
          <button
            onClick={() => { setSelectedEntityId(null); setViewMode('IMMERSIVE'); }}
            className="px-6 py-3 bg-white/10 text-white border border-white/20 text-xs uppercase tracking-widest"
          >
            Back to Territories
          </button>
        </div>
      </div>
    );
  }

  return null;
}