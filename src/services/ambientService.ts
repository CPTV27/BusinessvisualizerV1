/**
 * Ambient Service — The Studio
 * Handles soundscapes, time-aware themes, and atmospheric effects
 */

import { ThemeId, ThemeConfig } from '../../types';

// --- SOUNDSCAPES ---

interface Soundscape {
    id: ThemeId;
    name: string;
    audioUrl: string;
    volume: number; // Default volume 0-1
}

// Royalty-free ambient audio URLs (placeholder - replace with actual hosted files)
const SOUNDSCAPES: Record<ThemeId, Soundscape> = {
    [ThemeId.LOBBY]: {
        id: ThemeId.LOBBY,
        name: 'Jazz Lounge',
        audioUrl: '/audio/lobby-ambient.mp3', // Soft jazz, clinking glasses
        volume: 0.3
    },
    [ThemeId.GARDEN]: {
        id: ThemeId.GARDEN,
        name: 'Zen Garden',
        audioUrl: '/audio/garden-ambient.mp3', // Wind, birds, water
        volume: 0.4
    },
    [ThemeId.JUKE_JOINT]: {
        id: ThemeId.JUKE_JOINT,
        name: 'Electric Blues',
        audioUrl: '/audio/jukejoint-ambient.mp3', // Low blues hum, neon buzz
        volume: 0.25
    },
    [ThemeId.EDITORIAL]: {
        id: ThemeId.EDITORIAL,
        name: 'Minimal Focus',
        audioUrl: '/audio/editorial-ambient.mp3', // White noise, soft typing
        volume: 0.2
    }
};

let currentAudio: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;
let gainNode: GainNode | null = null;

export const initAudioContext = (): void => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
};

export const playSoundscape = (
    themeId: ThemeId,
    volume: number = 0.3
): void => {
    const soundscape = SOUNDSCAPES[themeId];
    if (!soundscape) return;

    // Stop current audio with fade
    if (currentAudio) {
        fadeOutAndStop(currentAudio);
    }

    // Create new audio
    currentAudio = new Audio(soundscape.audioUrl);
    currentAudio.loop = true;
    currentAudio.volume = 0;

    // Handle missing audio files gracefully
    currentAudio.onerror = () => {
        console.log(`Ambient audio not found for ${themeId}, continuing silently`);
    };

    currentAudio.play().then(() => {
        fadeIn(currentAudio!, volume * soundscape.volume);
    }).catch(e => {
        // Autoplay blocked - will play on user interaction
        console.log('Ambient audio requires user interaction to start');
    });
};

export const stopSoundscape = (): void => {
    if (currentAudio) {
        fadeOutAndStop(currentAudio);
        currentAudio = null;
    }
};

export const setVolume = (volume: number): void => {
    if (currentAudio) {
        currentAudio.volume = Math.max(0, Math.min(1, volume));
    }
};

const fadeIn = (audio: HTMLAudioElement, targetVolume: number, duration: number = 2000): void => {
    const startTime = Date.now();
    const startVolume = 0;

    const fade = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        audio.volume = startVolume + (targetVolume - startVolume) * progress;

        if (progress < 1) {
            requestAnimationFrame(fade);
        }
    };

    fade();
};

const fadeOutAndStop = (audio: HTMLAudioElement, duration: number = 1000): void => {
    const startTime = Date.now();
    const startVolume = audio.volume;

    const fade = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        audio.volume = startVolume * (1 - progress);

        if (progress < 1) {
            requestAnimationFrame(fade);
        } else {
            audio.pause();
            audio.src = '';
        }
    };

    fade();
};

// --- TIME-AWARE THEMES ---

type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'dusk' | 'evening' | 'night';

export const getTimeOfDay = (): TimeOfDay => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 19) return 'dusk';
    if (hour >= 19 && hour < 22) return 'evening';
    return 'night';
};

// Color adjustments based on time of day
const TIME_ADJUSTMENTS: Record<TimeOfDay, {
    brightness: number;
    warmth: number;
    saturation: number
}> = {
    dawn: { brightness: 0.9, warmth: 0.1, saturation: 0.95 },
    morning: { brightness: 1.0, warmth: 0, saturation: 1.0 },
    afternoon: { brightness: 1.05, warmth: 0.05, saturation: 1.0 },
    dusk: { brightness: 0.95, warmth: 0.15, saturation: 1.05 },
    evening: { brightness: 0.85, warmth: 0.1, saturation: 0.9 },
    night: { brightness: 0.75, warmth: 0, saturation: 0.85 }
};

export const getTimeAwareColors = (
    baseColors: ThemeConfig['colors']
): ThemeConfig['colors'] => {
    const timeOfDay = getTimeOfDay();
    const adjustment = TIME_ADJUSTMENTS[timeOfDay];

    // For now, return base colors - full implementation would HSL adjust
    // This is a placeholder for the color transformation logic
    return {
        ...baseColors,
        // Future: Apply brightness/warmth/saturation adjustments
    };
};

export const getTimeAwareCSS = (themeId: ThemeId): string => {
    const timeOfDay = getTimeOfDay();
    const adjustment = TIME_ADJUSTMENTS[timeOfDay];

    return `
    :root {
      --time-brightness: ${adjustment.brightness};
      --time-warmth: ${adjustment.warmth};
      --time-saturation: ${adjustment.saturation};
    }
    
    .time-aware-bg {
      filter: brightness(var(--time-brightness)) saturate(var(--time-saturation));
    }
    
    .time-aware-overlay {
      background: ${timeOfDay === 'dusk' || timeOfDay === 'dawn'
            ? 'linear-gradient(45deg, rgba(255,140,0,0.05), transparent)'
            : 'none'};
    }
  `;
};

// --- PARTICLE EFFECTS ---

export interface ParticleConfig {
    count: number;
    color: string;
    size: { min: number; max: number };
    speed: { min: number; max: number };
    opacity: { min: number; max: number };
    shape: 'circle' | 'square' | 'line';
}

const THEME_PARTICLES: Record<ThemeId, ParticleConfig> = {
    [ThemeId.LOBBY]: {
        count: 30,
        color: '#D4AF37',
        size: { min: 1, max: 3 },
        speed: { min: 0.2, max: 0.5 },
        opacity: { min: 0.1, max: 0.4 },
        shape: 'circle' // Dust motes in golden light
    },
    [ThemeId.GARDEN]: {
        count: 15,
        color: '#4A5D23',
        size: { min: 2, max: 5 },
        speed: { min: 0.1, max: 0.3 },
        opacity: { min: 0.2, max: 0.5 },
        shape: 'circle' // Floating pollen
    },
    [ThemeId.JUKE_JOINT]: {
        count: 50,
        color: '#D946EF',
        size: { min: 1, max: 2 },
        speed: { min: 0.5, max: 1.5 },
        opacity: { min: 0.3, max: 0.7 },
        shape: 'line' // Neon streaks
    },
    [ThemeId.EDITORIAL]: {
        count: 10,
        color: '#000000',
        size: { min: 1, max: 2 },
        speed: { min: 0.05, max: 0.1 },
        opacity: { min: 0.02, max: 0.05 },
        shape: 'square' // Barely visible grid dots
    }
};

export const getParticleConfig = (themeId: ThemeId): ParticleConfig => {
    return THEME_PARTICLES[themeId];
};

// --- KPI PULSE ANIMATION ---

export const triggerPulse = (elementId: string): void => {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('kpi-pulse');
        setTimeout(() => {
            element.classList.remove('kpi-pulse');
        }, 1000);
    }
};

// CSS for pulse animation (inject into document)
export const PULSE_CSS = `
  @keyframes kpi-pulse {
    0% { transform: scale(1); box-shadow: 0 0 0 0 currentColor; }
    50% { transform: scale(1.02); box-shadow: 0 0 20px 5px currentColor; }
    100% { transform: scale(1); box-shadow: 0 0 0 0 transparent; }
  }
  
  .kpi-pulse {
    animation: kpi-pulse 1s ease-out;
  }
  
  .kpi-glow {
    transition: box-shadow 0.3s ease;
  }
  
  .kpi-glow:hover {
    box-shadow: 0 0 15px 3px var(--accent-color, currentColor);
  }
`;

// --- INITIALIZATION ---

export const initAmbientEffects = (
    themeId: ThemeId,
    options: {
        sound?: boolean;
        timeAware?: boolean;
        particles?: boolean;
        volume?: number;
    } = {}
): void => {
    const { sound = false, timeAware = true, particles = true, volume = 0.3 } = options;

    // Inject CSS
    let styleEl = document.getElementById('ambient-styles');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'ambient-styles';
        document.head.appendChild(styleEl);
    }

    styleEl.textContent = PULSE_CSS + (timeAware ? getTimeAwareCSS(themeId) : '');

    // Sound
    if (sound) {
        playSoundscape(themeId, volume);
    } else {
        stopSoundscape();
    }

    // Time-aware class
    if (timeAware) {
        document.body.classList.add('time-aware-bg');
    } else {
        document.body.classList.remove('time-aware-bg');
    }
};

export const cleanupAmbientEffects = (): void => {
    stopSoundscape();
    document.body.classList.remove('time-aware-bg');
};
