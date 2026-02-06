/**
 * ImmersiveThemeSelector — The Studio
 * Full-screen atmospheric territory experiences
 * 
 * Each theme is a complete sensory experience, not a card.
 * Scroll, swipe, or arrow keys to navigate between worlds.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// Import ThemeId from root types (App.tsx is in root, this component is in src/components)
// Using local enum to avoid import issues - this matches the parent App's ThemeId
enum ThemeId {
    LOBBY = 'LOBBY',
    GARDEN = 'GARDEN',
    JUKE_JOINT = 'JUKE_JOINT',
    EDITORIAL = 'EDITORIAL'
}

// Local ParticleConfig type
interface ParticleConfig {
    count: number;
    color: string;
    size: { min: number; max: number };
    speed: { min: number; max: number };
    opacity: { min: number; max: number };
    shape: 'circle' | 'square' | 'line';
}

interface ImmersiveThemeSelectorProps {
    onSelectTheme: (themeId: ThemeId) => void;
}

// Territory order for navigation
const TERRITORIES: ThemeId[] = [
    ThemeId.LOBBY,
    ThemeId.GARDEN,
    ThemeId.JUKE_JOINT,
    ThemeId.EDITORIAL
];

// --- PARTICLE CANVAS ---

const ParticleCanvas: React.FC<{ config: ParticleConfig; active: boolean }> = ({ config, active }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const particlesRef = useRef<Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        opacity: number;
    }>>([]);

    useEffect(() => {
        if (!active || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Initialize particles
        particlesRef.current = Array.from({ length: config.count }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * (config.speed.max - config.speed.min) + config.speed.min,
            vy: (Math.random() - 0.5) * (config.speed.max - config.speed.min) + config.speed.min,
            size: Math.random() * (config.size.max - config.size.min) + config.size.min,
            opacity: Math.random() * (config.opacity.max - config.opacity.min) + config.opacity.min,
        }));

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesRef.current.forEach(p => {
                // Update position
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around edges
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                // Draw particle
                ctx.save();
                ctx.globalAlpha = p.opacity;
                ctx.fillStyle = config.color;

                if (config.shape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                } else if (config.shape === 'line') {
                    ctx.strokeStyle = config.color;
                    ctx.lineWidth = p.size;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x + p.vx * 10, p.y + p.vy * 10);
                    ctx.stroke();
                } else {
                    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
                }
                ctx.restore();
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [config, active]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-10"
            style={{ opacity: active ? 1 : 0, transition: 'opacity 1s ease' }}
        />
    );
};

// --- THE LOBBY SCENE ---

const LobbyScene: React.FC<{ active: boolean; onEnter: () => void }> = ({ active, onEnter }) => {
    const [showDoor, setShowDoor] = useState(false);

    useEffect(() => {
        if (active) {
            const timer = setTimeout(() => setShowDoor(true), 800);
            return () => clearTimeout(timer);
        } else {
            setShowDoor(false);
        }
    }, [active]);

    return (
        <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            style={{ backgroundColor: '#0F172A' }}
        >
            <ParticleCanvas
                config={{
                    count: 60,
                    color: '#D4AF37',
                    size: { min: 1, max: 3 },
                    speed: { min: 0.1, max: 0.3 },
                    opacity: { min: 0.2, max: 0.5 },
                    shape: 'circle'
                }}
                active={active}
            />

            {/* Gold Art Deco Door Frame */}
            <div
                className={`relative z-20 transition-all duration-1000 ${showDoor ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                style={{ transitionDelay: '0.5s' }}
            >
                {/* Door frame */}
                <div
                    className="relative w-64 h-96 border-4 flex flex-col items-center justify-end pb-8"
                    style={{
                        borderColor: '#D4AF37',
                        background: 'linear-gradient(180deg, rgba(212,175,55,0.1) 0%, rgba(15,23,42,0.9) 100%)',
                        boxShadow: '0 0 60px rgba(212,175,55,0.3), inset 0 0 30px rgba(212,175,55,0.1)'
                    }}
                >
                    {/* Art Deco ornament top */}
                    <div
                        className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-24 h-16"
                        style={{
                            background: 'linear-gradient(180deg, #D4AF37 0%, transparent 100%)',
                            clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                            opacity: 0.8
                        }}
                    />

                    {/* Door handle */}
                    <div
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-3 h-12 rounded-full"
                        style={{ backgroundColor: '#D4AF37' }}
                    />

                    {/* Text */}
                    <h2
                        className="text-3xl tracking-widest mb-2"
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            color: '#D4AF37',
                            textShadow: '0 0 20px rgba(212,175,55,0.5)'
                        }}
                    >
                        THE LOBBY
                    </h2>
                    <p
                        className="text-xs uppercase tracking-[0.3em] opacity-60"
                        style={{ color: '#D4AF37' }}
                    >
                        Art Deco & Heritage Luxury
                    </p>
                </div>

                {/* Enter button */}
                <button
                    onClick={onEnter}
                    className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 px-8 py-3 border-2 text-xs uppercase tracking-widest font-bold transition-all duration-300 hover:scale-105"
                    style={{
                        borderColor: '#D4AF37',
                        color: '#D4AF37',
                        background: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#D4AF37';
                        e.currentTarget.style.color = '#0F172A';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#D4AF37';
                    }}
                >
                    Enter
                </button>
            </div>

            {/* Ambient text */}
            <div className="absolute bottom-8 left-8 z-20">
                <p
                    className="text-[10px] uppercase tracking-[0.5em] opacity-30"
                    style={{ color: '#D4AF37' }}
                >
                    Deep blues • Aged gold • Leather textures
                </p>
            </div>
        </div>
    );
};

// --- THE GARDEN SCENE ---

const GardenScene: React.FC<{ active: boolean; onEnter: () => void }> = ({ active, onEnter }) => {
    const [showStone, setShowStone] = useState(false);

    useEffect(() => {
        if (active) {
            const timer = setTimeout(() => setShowStone(true), 600);
            return () => clearTimeout(timer);
        } else {
            setShowStone(false);
        }
    }, [active]);

    return (
        <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            style={{ backgroundColor: '#F5F5F0' }}
        >
            {/* Animated zen lines */}
            <svg className="absolute inset-0 w-full h-full z-0" style={{ opacity: 0.1 }}>
                {[...Array(20)].map((_, i) => (
                    <line
                        key={i}
                        x1="0"
                        y1={`${(i + 1) * 5}%`}
                        x2="100%"
                        y2={`${(i + 1) * 5}%`}
                        stroke="#4A5D23"
                        strokeWidth="1"
                        style={{
                            animation: active ? `zenLine ${3 + i * 0.1}s ease-in-out infinite` : 'none',
                            transformOrigin: 'center'
                        }}
                    />
                ))}
            </svg>

            {/* Central stone element */}
            <div
                className={`relative z-20 transition-all duration-1000 ${showStone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
                {/* Moss-covered stone */}
                <div
                    className="w-48 h-32 rounded-[40%] relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(145deg, #8C8C85 0%, #5C5C55 50%, #3C3C35 100%)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                    }}
                >
                    {/* Moss patches */}
                    <div
                        className="absolute top-2 left-4 w-12 h-8 rounded-full"
                        style={{ backgroundColor: '#4A5D23', opacity: 0.7 }}
                    />
                    <div
                        className="absolute bottom-4 right-6 w-8 h-6 rounded-full"
                        style={{ backgroundColor: '#4A5D23', opacity: 0.5 }}
                    />
                </div>

                {/* Text below stone */}
                <div className="text-center mt-12">
                    <h2
                        className="text-3xl tracking-widest mb-2"
                        style={{
                            fontFamily: "'Cinzel', serif",
                            color: '#2C2C2A'
                        }}
                    >
                        THE GARDEN
                    </h2>
                    <p
                        className="text-xs uppercase tracking-[0.3em] opacity-50"
                        style={{ color: '#4A5D23' }}
                    >
                        Wabi-Sabi Minimalism
                    </p>
                </div>

                {/* Enter button */}
                <button
                    onClick={onEnter}
                    className="mx-auto mt-8 block px-8 py-3 text-xs uppercase tracking-widest font-bold transition-all duration-300 hover:scale-105 rounded-full"
                    style={{
                        backgroundColor: '#4A5D23',
                        color: '#F5F5F0'
                    }}
                >
                    Enter
                </button>
            </div>

            {/* Ambient text */}
            <div className="absolute bottom-8 left-8 z-20">
                <p
                    className="text-[10px] uppercase tracking-[0.5em] opacity-30"
                    style={{ color: '#2C2C2A' }}
                >
                    Earth tones • Handmade textures • Stone
                </p>
            </div>
        </div>
    );
};

// --- JUKE JOINT SCENE ---

const JukeJointScene: React.FC<{ active: boolean; onEnter: () => void }> = ({ active, onEnter }) => {
    const [neonOn, setNeonOn] = useState(false);
    const [flicker, setFlicker] = useState(false);

    useEffect(() => {
        if (active) {
            // Neon flicker effect
            const flickerTimers: NodeJS.Timeout[] = [];
            flickerTimers.push(setTimeout(() => setFlicker(true), 500));
            flickerTimers.push(setTimeout(() => setFlicker(false), 600));
            flickerTimers.push(setTimeout(() => setFlicker(true), 800));
            flickerTimers.push(setTimeout(() => setFlicker(false), 850));
            flickerTimers.push(setTimeout(() => setNeonOn(true), 1000));

            return () => flickerTimers.forEach(t => clearTimeout(t));
        } else {
            setNeonOn(false);
            setFlicker(false);
        }
    }, [active]);

    return (
        <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            style={{ backgroundColor: '#050505' }}
        >
            <ParticleCanvas
                config={{
                    count: 80,
                    color: '#D946EF',
                    size: { min: 1, max: 2 },
                    speed: { min: 0.5, max: 1.5 },
                    opacity: { min: 0.2, max: 0.5 },
                    shape: 'line'
                }}
                active={active}
            />

            {/* Neon sign */}
            <div
                className={`relative z-20 transition-all duration-300 ${(neonOn || flicker) ? 'opacity-100' : 'opacity-0'}`}
                style={{
                    filter: (neonOn || flicker) ? 'drop-shadow(0 0 30px #D946EF) drop-shadow(0 0 60px #D946EF)' : 'none',
                    transform: flicker && !neonOn ? 'scale(0.98)' : 'scale(1)'
                }}
            >
                <h2
                    className="text-5xl md:text-7xl tracking-widest text-center"
                    style={{
                        fontFamily: "'Space Mono', monospace",
                        color: '#D946EF',
                        textShadow: neonOn ? '0 0 10px #D946EF, 0 0 20px #D946EF, 0 0 40px #D946EF, 0 0 80px #22D3EE' : 'none'
                    }}
                >
                    JUKE JOINT
                </h2>
                <p
                    className="text-center mt-4 text-xs uppercase tracking-[0.5em]"
                    style={{ color: '#22D3EE' }}
                >
                    After Midnight
                </p>

                {/* Glowing doorway */}
                <div
                    className="mx-auto mt-12 w-32 h-48 relative"
                    style={{
                        border: '2px solid #D946EF',
                        boxShadow: neonOn ? '0 0 20px #D946EF, inset 0 0 40px rgba(217,70,239,0.2)' : 'none',
                        animation: neonOn ? 'pulse 2s ease-in-out infinite' : 'none'
                    }}
                >
                    <button
                        onClick={onEnter}
                        className="absolute inset-0 flex items-end justify-center pb-4 text-xs uppercase tracking-widest font-bold transition-all duration-300 hover:bg-purple-500/20"
                        style={{ color: '#D946EF' }}
                    >
                        Enter
                    </button>
                </div>
            </div>

            {/* Ambient text */}
            <div className="absolute bottom-8 left-8 z-20">
                <p
                    className="text-[10px] uppercase tracking-[0.5em] opacity-30"
                    style={{ color: '#22D3EE' }}
                >
                    Neon Southern Gothic • Dangerous • Electric
                </p>
            </div>

            <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 20px #D946EF, inset 0 0 40px rgba(217,70,239,0.2); }
          50% { box-shadow: 0 0 40px #D946EF, inset 0 0 60px rgba(217,70,239,0.3); }
        }
      `}</style>
        </div>
    );
};

// --- THE EDITORIAL SCENE ---

const EditorialScene: React.FC<{ active: boolean; onEnter: () => void }> = ({ active, onEnter }) => {
    const [showLine, setShowLine] = useState(false);
    const [showText, setShowText] = useState(false);

    useEffect(() => {
        if (active) {
            const t1 = setTimeout(() => setShowLine(true), 300);
            const t2 = setTimeout(() => setShowText(true), 800);
            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
            };
        } else {
            setShowLine(false);
            setShowText(false);
        }
    }, [active]);

    return (
        <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            style={{ backgroundColor: '#FFFFFF' }}
        >
            {/* Animated red line */}
            <div
                className="absolute top-1/2 left-0 h-1 transition-all duration-700 ease-out"
                style={{
                    backgroundColor: '#FF3333',
                    width: showLine ? '100%' : '0%',
                    transform: 'translateY(-50%)'
                }}
            />

            {/* Typography */}
            <div
                className={`relative z-20 text-center transition-all duration-500 ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
                <h2
                    className="text-6xl md:text-8xl font-bold tracking-tight"
                    style={{
                        fontFamily: "'Bodoni Moda', serif",
                        color: '#000000'
                    }}
                >
                    THE EDITORIAL
                </h2>
                <p
                    className="mt-4 text-xs uppercase tracking-[0.5em]"
                    style={{ color: '#FF3333' }}
                >
                    High Fashion Business
                </p>

                {/* Enter button */}
                <button
                    onClick={onEnter}
                    className="mt-12 px-12 py-4 text-xs uppercase tracking-widest font-bold transition-all duration-300 hover:scale-105 border-2"
                    style={{
                        borderColor: '#000000',
                        color: '#000000',
                        backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#000000';
                        e.currentTarget.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#000000';
                    }}
                >
                    Enter
                </button>
            </div>

            {/* Ambient text */}
            <div className="absolute bottom-8 left-8 z-20">
                <p
                    className="text-[10px] uppercase tracking-[0.5em] opacity-30"
                    style={{ color: '#000000' }}
                >
                    Bold typography • B&W • Grid-based
                </p>
            </div>
        </div>
    );
};

// --- NAVIGATION DOTS ---

const NavigationDots: React.FC<{
    currentIndex: number;
    total: number;
    onChange: (index: number) => void;
    theme: ThemeId;
}> = ({ currentIndex, total, onChange, theme }) => {
    const colors: Record<ThemeId, string> = {
        [ThemeId.LOBBY]: '#D4AF37',
        [ThemeId.GARDEN]: '#4A5D23',
        [ThemeId.JUKE_JOINT]: '#D946EF',
        [ThemeId.EDITORIAL]: '#000000',
    };

    return (
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-4">
            {TERRITORIES.map((_, i) => (
                <button
                    key={i}
                    onClick={() => onChange(i)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${i === currentIndex ? 'scale-125' : 'scale-100 opacity-50 hover:opacity-100'}`}
                    style={{
                        backgroundColor: colors[theme],
                        boxShadow: i === currentIndex ? `0 0 10px ${colors[theme]}` : 'none'
                    }}
                />
            ))}
        </div>
    );
};

// --- MAIN COMPONENT ---

export const ImmersiveThemeSelector: React.FC<ImmersiveThemeSelectorProps> = ({ onSelectTheme }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const currentTheme = TERRITORIES[currentIndex];

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isTransitioning) return;

            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                navigateTo((currentIndex + 1) % TERRITORIES.length);
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                navigateTo((currentIndex - 1 + TERRITORIES.length) % TERRITORIES.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                handleEnter(currentTheme);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, isTransitioning, currentTheme]);

    // Handle wheel navigation
    useEffect(() => {
        let wheelTimeout: NodeJS.Timeout;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            if (isTransitioning) return;

            clearTimeout(wheelTimeout);
            wheelTimeout = setTimeout(() => {
                if (e.deltaY > 0) {
                    navigateTo((currentIndex + 1) % TERRITORIES.length);
                } else {
                    navigateTo((currentIndex - 1 + TERRITORIES.length) % TERRITORIES.length);
                }
            }, 50);
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            window.removeEventListener('wheel', handleWheel);
            clearTimeout(wheelTimeout);
        };
    }, [currentIndex, isTransitioning]);

    const navigateTo = useCallback((index: number) => {
        if (index === currentIndex || isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex(index);

        // Play soundscape for new territory
        // playSoundscape(TERRITORIES[index], 0.3);

        setTimeout(() => setIsTransitioning(false), 1000);
    }, [currentIndex, isTransitioning]);

    const handleEnter = useCallback((themeId: ThemeId) => {
        // Zoom transition effect
        document.body.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        document.body.style.transform = 'scale(1.2)';

        setTimeout(() => {
            document.body.style.transform = 'scale(1)';
            onSelectTheme(themeId);
        }, 400);
    }, [onSelectTheme]);

    return (
        <div className="fixed inset-0 overflow-hidden">
            {/* Territory Scenes */}
            <LobbyScene
                active={currentTheme === ThemeId.LOBBY}
                onEnter={() => handleEnter(ThemeId.LOBBY)}
            />
            <GardenScene
                active={currentTheme === ThemeId.GARDEN}
                onEnter={() => handleEnter(ThemeId.GARDEN)}
            />
            <JukeJointScene
                active={currentTheme === ThemeId.JUKE_JOINT}
                onEnter={() => handleEnter(ThemeId.JUKE_JOINT)}
            />
            <EditorialScene
                active={currentTheme === ThemeId.EDITORIAL}
                onEnter={() => handleEnter(ThemeId.EDITORIAL)}
            />

            {/* Navigation dots */}
            <NavigationDots
                currentIndex={currentIndex}
                total={TERRITORIES.length}
                onChange={navigateTo}
                theme={currentTheme}
            />

            {/* Keyboard hint */}
            <div className="absolute bottom-8 right-8 z-50 flex items-center gap-4 opacity-30">
                <span className="text-[10px] uppercase tracking-widest" style={{ color: currentTheme === ThemeId.GARDEN || currentTheme === ThemeId.EDITORIAL ? '#000' : '#fff' }}>
                    ↑↓ Navigate • Enter to select
                </span>
            </div>

            {/* Zen line animation */}
            <style>{`
        @keyframes zenLine {
          0%, 100% { transform: scaleX(1); }
          50% { transform: scaleX(1.02); }
        }
      `}</style>
        </div>
    );
};

export default ImmersiveThemeSelector;
