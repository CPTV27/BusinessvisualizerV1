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
  Map,
  Wand2,
  Camera,
  MessageSquare,
  Send,
  Save,
  Clock
} from 'lucide-react';
import { THEMES, INITIAL_ENTITIES } from './constants';
import { ThemeId, ThemeConfig, BusinessEntity, BusinessGap, GapStatus, ChatMessage } from './types';
import { 
  generateGapSolutions, 
  generateEntityVisual, 
  scoutRegionalBusinesses, 
  generateReel, 
  modifyRoomScenario,
  sendEntityChatMessage 
} from './services/geminiService';

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

interface EntityCardProps {
  entity: BusinessEntity;
  theme: ThemeConfig;
  onClick: () => void;
}

const EntityCard: React.FC<EntityCardProps> = ({ 
  entity, 
  theme,
  onClick
}) => {
  const currentImage = entity.imageUrl;
  const hasImage = !!currentImage;

  return (
    <div 
      onClick={onClick}
      className={`relative flex flex-col h-full overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 group/card ${theme.styles.rounded} ${theme.styles.borderWidth} ${theme.styles.shadow}`}
      style={{ 
        backgroundColor: theme.colors.surface, 
        borderColor: theme.colors.border 
      }}
    >
      {/* Visual Header */}
      <div className="relative h-64 w-full bg-black/40 overflow-hidden">
        {hasImage ? (
          <img 
            src={currentImage} 
            alt={entity.name} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-30">
             <Box size={40} color={theme.colors.text} />
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
           <span className="uppercase tracking-widest text-white text-xs font-bold border border-white/50 px-4 py-2">
             Enter World
           </span>
        </div>

        <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
          <div className="px-2 py-1 text-[10px] tracking-widest uppercase text-white/90 font-mono border border-white/20 bg-black/30 backdrop-blur-sm">
            {entity.location}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow relative">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1 opacity-50">
             <span className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.colors.accent }}></span>
             <span className="text-[10px] uppercase tracking-widest" style={{ fontFamily: theme.fonts.mono, color: theme.colors.text }}>{entity.type}</span>
          </div>
          <h3 className="text-2xl leading-none mb-2" style={{ fontFamily: theme.fonts.heading, color: theme.colors.text }}>
            {entity.name}
          </h3>
          <p className="text-xs opacity-70 leading-relaxed line-clamp-2" style={{ fontFamily: theme.fonts.body, color: theme.colors.text }}>
            {entity.description}
          </p>
        </div>
        
        {/* Active Indicators */}
        <div className="mt-auto pt-4 border-t flex gap-4" style={{ borderColor: `${theme.colors.border}30` }}>
            <div className="flex flex-col">
               <span className="text-[8px] uppercase opacity-50" style={{ color: theme.colors.text }}>Notebook</span>
               <span className="text-sm font-mono" style={{ color: theme.colors.accent }}>{entity.chatHistory?.length || 0} Notes</span>
            </div>
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
  theme,
  onClose,
  onUpdateEntity
}: {
  entity: BusinessEntity;
  theme: ThemeConfig;
  onClose: () => void;
  onUpdateEntity: (e: BusinessEntity) => void;
}) => {
  const [mode, setMode] = useState<'MAP' | 'SPACE'>('SPACE');
  const [scenarioPrompt, setScenarioPrompt] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!entity.imageUrl) return;
    setIsSimulating(true);
    try {
      const newImage = await modifyRoomScenario(entity.imageUrl, scenarioPrompt);
      if (newImage) {
        onUpdateEntity({ ...entity, imageUrl: newImage });
        setScenarioPrompt('');
      }
    } finally {
      setIsSimulating(false);
    }
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
                {entity.imageUrl ? (
                  <img src={entity.imageUrl} className="w-full h-full object-cover" alt="Space" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center opacity-30 gap-4">
                     <Camera size={64} />
                     <p className="font-mono text-sm">NO SIGNAL</p>
                  </div>
                )}
                
                {/* Upload Overlay */}
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     className="bg-black/60 backdrop-blur border border-white/20 p-2 rounded hover:bg-white hover:text-black transition-colors"
                     title="Upload Real Reference Photo"
                   >
                     <Upload size={20} />
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
                           placeholder={entity.imageUrl ? "Describe a new scenario (e.g. 'Candlelight dinner', 'Busy saturday night')..." : "Upload an image first."}
                           disabled={!entity.imageUrl}
                           className="flex-grow bg-black/50 border border-white/20 p-3 text-sm focus:outline-none focus:border-amber-500 rounded-sm backdrop-blur-md font-mono"
                         />
                         <button 
                           onClick={handleScenarioRun}
                           disabled={!entity.imageUrl || !scenarioPrompt || isSimulating}
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
                      className={`max-w-[85%] p-4 rounded-sm text-sm leading-relaxed ${
                        msg.role === 'user' 
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
  const [processingGap, setProcessingGap] = useState<{entityId: string, gap: BusinessGap} | null>(null);
  
  // Immersive View State
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'BOARD' | 'ATLAS' | 'STUDIO'>('BOARD');
  
  // Atlas State
  const [scoutLocation, setScoutLocation] = useState('');
  const [scoutResults, setScoutResults] = useState<{text: string, chunks: any[]} | null>(null);
  const [isScouting, setIsScouting] = useState(false);

  // Studio State
  const [studioImages, setStudioImages] = useState<string[]>([]);
  const [reelPrompt, setReelPrompt] = useState('');
  const [isGeneratingReel, setIsGeneratingReel] = useState(false);
  const [generatedReelUrl, setGeneratedReelUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTheme = selectedThemeId ? THEMES[selectedThemeId] : null;

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

  const handleScout = async () => {
    if (!scoutLocation || !currentTheme) return;
    setIsScouting(true);
    try {
      const demographic = "Household income >$100k, blues enthusiasts, age 35-65";
      const result = await scoutRegionalBusinesses(scoutLocation, demographic);
      setScoutResults(result);
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
            setStudioImages(prev => [...prev, reader.result as string].slice(0,3));
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

  if (!selectedThemeId || !currentTheme) {
    return (
      <div className="min-h-screen bg-black text-white p-8 md:p-12 flex flex-col justify-center">
        <header className="mb-12 max-w-4xl mx-auto text-center">
          <h1 className="text-sm font-mono tracking-[0.3em] uppercase mb-4 text-gray-500">Chase Pierson Productions</h1>
          <h2 className="text-5xl md:text-7xl font-serif mb-6">The Studio</h2>
          <p className="text-xl font-light text-gray-400 max-w-2xl mx-auto">
            Choose a territory to visualize the ecosystem.
          </p>
        </header>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {Object.values(THEMES).map((theme) => (
            <ThemeCard key={theme.id} theme={theme} onSelect={() => setSelectedThemeId(theme.id)} />
          ))}
        </div>
      </div>
    );
  }

  const selectedEntity = selectedEntityId ? entities.find(e => e.id === selectedEntityId) : null;

  return (
    <div 
      className="min-h-screen transition-colors duration-700 flex flex-col"
      style={{ backgroundColor: currentTheme.colors.bg }}
    >
      {/* Navigation */}
      <nav 
        className={`sticky top-0 z-50 border-b backdrop-blur-md px-6 py-4 flex justify-between items-center`}
        style={{ borderColor: currentTheme.colors.border, backgroundColor: `${currentTheme.colors.bg}E6` }}
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <LayoutGrid size={24} style={{ color: currentTheme.colors.accent }} />
            <div>
              <h1 className="text-lg leading-none tracking-wide font-bold" style={{ fontFamily: currentTheme.fonts.heading, color: currentTheme.colors.text }}>
                THE STUDIO
              </h1>
              <span className="text-[10px] tracking-widest uppercase opacity-60" style={{ fontFamily: currentTheme.fonts.mono, color: currentTheme.colors.text }}>
                Big Muddy Ecosystem
              </span>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="hidden md:flex gap-1 ml-8">
            <button 
              onClick={() => setActiveTab('BOARD')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'BOARD' ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
              style={{ 
                color: currentTheme.colors.text, 
                borderBottom: activeTab === 'BOARD' ? `2px solid ${currentTheme.colors.accent}` : '2px solid transparent'
              }}
            >
              Game Board
            </button>
            <button 
              onClick={() => setActiveTab('ATLAS')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'ATLAS' ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
              style={{ 
                color: currentTheme.colors.text, 
                borderBottom: activeTab === 'ATLAS' ? `2px solid ${currentTheme.colors.accent}` : '2px solid transparent'
              }}
            >
              The Atlas
            </button>
            <button 
              onClick={() => setActiveTab('STUDIO')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'STUDIO' ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
              style={{ 
                color: currentTheme.colors.text, 
                borderBottom: activeTab === 'STUDIO' ? `2px solid ${currentTheme.colors.accent}` : '2px solid transparent'
              }}
            >
              Production Studio
            </button>
          </div>
        </div>

        <button 
          onClick={() => setSelectedThemeId(null)}
          className="text-xs uppercase tracking-widest opacity-50 hover:opacity-100"
          style={{ color: currentTheme.colors.text, fontFamily: currentTheme.fonts.mono }}
        >
          Exit
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-12">
        
        {/* GAME BOARD VIEW */}
        {activeTab === 'BOARD' && (
          <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-8 border-b pb-4" style={{ borderColor: currentTheme.colors.border }}>
              <div>
                <h2 className="text-4xl mb-2" style={{ fontFamily: currentTheme.fonts.heading, color: currentTheme.colors.text }}>
                  Operational Map
                </h2>
                <p className="opacity-70" style={{ color: currentTheme.colors.muted }}>
                  Select an entity to enter <span style={{color: currentTheme.colors.accent}}>