/**
 * ThemeEnvironmentContext.tsx
 * 
 * State management for immersive 3D environments.
 * Handles skybox loading, caching, and entity positioning.
 * 
 * Owner: AG (Antigravity)
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

// Local ThemeId to avoid import issues
enum ThemeId {
    LOBBY = 'LOBBY',
    GARDEN = 'GARDEN',
    JUKE_JOINT = 'JUKE_JOINT',
    EDITORIAL = 'EDITORIAL'
}

interface EnvironmentState {
    themeId: ThemeId;
    skyboxUrl: string | null;
    isLoading: boolean;
    error: string | null;
    generatedAt: number;
}

interface ThemeEnvironmentContextValue {
    // Current environment per theme
    environments: Map<ThemeId, EnvironmentState>;

    // Active theme
    activeTheme: ThemeId;
    setActiveTheme: (themeId: ThemeId) => void;

    // Skybox management
    getSkybox: (themeId: ThemeId) => string | null;
    setSkybox: (themeId: ThemeId, url: string) => void;
    setLoading: (themeId: ThemeId, loading: boolean) => void;
    setError: (themeId: ThemeId, error: string | null) => void;

    // Generate new skybox for theme
    generateSkybox: (themeId: ThemeId) => Promise<void>;

    // Check if we need to generate
    needsGeneration: (themeId: ThemeId) => boolean;
}

const ThemeEnvironmentContext = createContext<ThemeEnvironmentContextValue | null>(null);

// Theme-specific descriptions for panoramic generation
const THEME_DESCRIPTIONS: Record<ThemeId, string> = {
    [ThemeId.LOBBY]: `
    Art Deco luxury hotel lobby. Deep navy blue walls with gold leaf trim.
    Marble floors reflecting warm chandelier light. Leather club chairs.
    Brass fixtures, geometric patterns, 1920s elegance.
    Southern Gothic atmosphere with Mississippi Delta heritage.
    Jazz age sophistication meets Delta blues authenticity.
  `,
    [ThemeId.GARDEN]: `
    Japanese zen garden at twilight. Raked sand patterns, moss-covered stones.
    Bamboo groves, koi pond reflection. Wabi-sabi beauty, imperfect perfection.
    Muted earth tones, soft shadows. Paper lanterns provide ambient glow.
    Minimalist architecture blending indoor-outdoor. Meditation space.
  `,
    [ThemeId.JUKE_JOINT]: `
    Underground blues club after midnight. Neon signs casting purple and cyan glow.
    Smoky atmosphere, raw brick walls. Stage with single spotlight.
    Bar with glass bottles catching light. Electric tension in the air.
    Southern Gothic meets cyberpunk. Dangerous beauty. Heat and soul.
  `,
    [ThemeId.EDITORIAL]: `
    High-fashion editorial studio. Stark white cyclorama walls.
    Single bold red accent. Geometric shadows, harsh lighting contrasts.
    Minimalist Vogue aesthetic. Clean lines, dramatic negative space.
    Luxury brand photography set. Precision and power.
  `
};

// Fallback gradient backgrounds when we can't generate
const FALLBACK_GRADIENTS: Record<ThemeId, string> = {
    [ThemeId.LOBBY]: 'radial-gradient(ellipse at center, #1a2744 0%, #0f172a 50%, #050810 100%)',
    [ThemeId.GARDEN]: 'radial-gradient(ellipse at center, #e8e8df 0%, #f5f5f0 50%, #e0e0d6 100%)',
    [ThemeId.JUKE_JOINT]: 'radial-gradient(ellipse at center, #1a0a1f 0%, #050505 50%, #000000 100%)',
    [ThemeId.EDITORIAL]: 'radial-gradient(ellipse at center, #ffffff 0%, #f8f8f8 50%, #e8e8e8 100%)'
};

export const ThemeEnvironmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [environments, setEnvironments] = useState<Map<ThemeId, EnvironmentState>>(
        new Map([
            [ThemeId.LOBBY, { themeId: ThemeId.LOBBY, skyboxUrl: null, isLoading: false, error: null, generatedAt: 0 }],
            [ThemeId.GARDEN, { themeId: ThemeId.GARDEN, skyboxUrl: null, isLoading: false, error: null, generatedAt: 0 }],
            [ThemeId.JUKE_JOINT, { themeId: ThemeId.JUKE_JOINT, skyboxUrl: null, isLoading: false, error: null, generatedAt: 0 }],
            [ThemeId.EDITORIAL, { themeId: ThemeId.EDITORIAL, skyboxUrl: null, isLoading: false, error: null, generatedAt: 0 }],
        ])
    );

    const [activeTheme, setActiveTheme] = useState<ThemeId>(ThemeId.LOBBY);
    const generationInProgress = useRef<Set<ThemeId>>(new Set());

    const getSkybox = useCallback((themeId: ThemeId) => {
        return environments.get(themeId)?.skyboxUrl ?? null;
    }, [environments]);

    const setSkybox = useCallback((themeId: ThemeId, url: string) => {
        setEnvironments(prev => {
            const newMap = new Map(prev);
            const current = newMap.get(themeId);
            if (current) {
                newMap.set(themeId, { ...current, skyboxUrl: url, isLoading: false, generatedAt: Date.now() });
            }
            return newMap;
        });
    }, []);

    const setLoading = useCallback((themeId: ThemeId, loading: boolean) => {
        setEnvironments(prev => {
            const newMap = new Map(prev);
            const current = newMap.get(themeId);
            if (current) {
                newMap.set(themeId, { ...current, isLoading: loading });
            }
            return newMap;
        });
    }, []);

    const setError = useCallback((themeId: ThemeId, error: string | null) => {
        setEnvironments(prev => {
            const newMap = new Map(prev);
            const current = newMap.get(themeId);
            if (current) {
                newMap.set(themeId, { ...current, error, isLoading: false });
            }
            return newMap;
        });
    }, []);

    const needsGeneration = useCallback((themeId: ThemeId) => {
        const env = environments.get(themeId);
        if (!env) return true;
        if (env.isLoading) return false;
        if (env.skyboxUrl) return false;
        return true;
    }, [environments]);

    const generateSkybox = useCallback(async (themeId: ThemeId) => {
        // Prevent duplicate generation
        if (generationInProgress.current.has(themeId)) {
            console.log(`Skybox generation already in progress for ${themeId}`);
            return;
        }

        const env = environments.get(themeId);
        if (env?.skyboxUrl) {
            console.log(`Skybox already exists for ${themeId}`);
            return;
        }

        generationInProgress.current.add(themeId);
        setLoading(themeId, true);

        try {
            // Dynamic import to avoid SSR issues
            const { generatePanoramicEnvironment } = await import('../services/geminiService');

            // Create a placeholder entity for the theme environment
            const themeEntity = {
                id: `theme_${themeId}`,
                name: themeId.replace('_', ' '),
                description: THEME_DESCRIPTIONS[themeId],
                type: 'VENUE' as const,
                layer: 'FOUNDATION',
                location: 'The Studio',
                kpi: '',
                kpiValue: '',
                imageUrl: '',
                gaps: [],
                coordinates: { x: 50, y: 50 }
            };

            const imageUrl = await generatePanoramicEnvironment(
                themeEntity as any,
                THEME_DESCRIPTIONS[themeId],
                'evening'
            );

            if (imageUrl) {
                setSkybox(themeId, imageUrl);
                console.log(`Generated skybox for ${themeId}`);
            } else {
                setError(themeId, 'Failed to generate panoramic environment');
                console.warn(`Failed to generate skybox for ${themeId}, using gradient fallback`);
            }
        } catch (error) {
            console.error(`Error generating skybox for ${themeId}:`, error);
            setError(themeId, error instanceof Error ? error.message : 'Unknown error');
        } finally {
            generationInProgress.current.delete(themeId);
        }
    }, [environments, setLoading, setSkybox, setError]);

    const value: ThemeEnvironmentContextValue = {
        environments,
        activeTheme,
        setActiveTheme,
        getSkybox,
        setSkybox,
        setLoading,
        setError,
        generateSkybox,
        needsGeneration
    };

    return (
        <ThemeEnvironmentContext.Provider value={value}>
            {children}
        </ThemeEnvironmentContext.Provider>
    );
};

export const useThemeEnvironment = () => {
    const context = useContext(ThemeEnvironmentContext);
    if (!context) {
        throw new Error('useThemeEnvironment must be used within ThemeEnvironmentProvider');
    }
    return context;
};

export { ThemeId, THEME_DESCRIPTIONS, FALLBACK_GRADIENTS };
