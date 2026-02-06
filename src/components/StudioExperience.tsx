/**
 * StudioExperience.tsx
 * 
 * Full immersive experience flow for The Studio.
 * Manages state transitions between:
 * 1. Theme selector (pick a territory)
 * 2. Immersive 3D world (explore entities in 360°)
 * 3. Entity detail (deep dive on specific entity)
 * 
 * This is a self-contained component that can replace the existing
 * theme selector + gameboard flow without modifying App.tsx's architecture.
 * 
 * Owner: AG (Antigravity)
 */

import React, { useState, useCallback, useEffect } from 'react';
import { ImmersiveWorld } from './ImmersiveWorld';

// Local types to avoid import issues
enum ThemeId {
    LOBBY = 'LOBBY',
    GARDEN = 'GARDEN',
    JUKE_JOINT = 'JUKE_JOINT',
    EDITORIAL = 'EDITORIAL'
}

// Minimal entity interface for the 3D view
interface EntityMinimal {
    id: string;
    name: string;
    type: string;
    layer: string;
    description: string;
    kpiValue: string;
    coordinates: { x: number; y: number };
    gaps?: Array<{ priority: string; status: string }>;
}

// Experience states
type ExperienceState =
    | { mode: 'SELECTOR' }
    | { mode: 'WORLD'; themeId: ThemeId; skyboxUrl: string | null }
    | { mode: 'DETAIL'; themeId: ThemeId; entityId: string };

interface StudioExperienceProps {
    entities: EntityMinimal[];
    onEntitySelect: (entityId: string) => void;
    onThemeSelect: (themeId: ThemeId) => void;
    selectedThemeId?: ThemeId | null;
}

// Import the existing theme selector scenes
import { ImmersiveThemeSelector } from './ImmersiveThemeSelector';

// Theme descriptions for AI generation
const THEME_DESCRIPTIONS: Record<ThemeId, string> = {
    [ThemeId.LOBBY]: `Art Deco luxury hotel lobby. Deep navy blue walls with gold leaf trim.
    Marble floors reflecting warm chandelier light. Leather club chairs.
    1920s elegance meets Delta blues authenticity.`,
    [ThemeId.GARDEN]: `Japanese zen garden at twilight. Raked sand patterns, moss-covered stones.
    Bamboo groves, koi pond reflection. Wabi-sabi minimalism.
    Paper lanterns, meditation space.`,
    [ThemeId.JUKE_JOINT]: `Underground blues club after midnight. Neon signs casting purple glow.
    Smoky atmosphere, raw brick walls. Stage with single spotlight.
    Southern Gothic meets cyberpunk.`,
    [ThemeId.EDITORIAL]: `High-fashion editorial studio. Stark white cyclorama walls.
    Single bold red accent. Minimalist Vogue aesthetic.
    Clean lines, dramatic negative space.`
};

export const StudioExperience: React.FC<StudioExperienceProps> = ({
    entities,
    onEntitySelect,
    onThemeSelect,
    selectedThemeId
}) => {
    const [state, setState] = useState<ExperienceState>({ mode: 'SELECTOR' });
    const [skyboxCache, setSkyboxCache] = useState<Map<ThemeId, string | null>>(new Map());
    const [isGenerating, setIsGenerating] = useState(false);

    // If parent sets selectedThemeId, sync state
    useEffect(() => {
        if (selectedThemeId && state.mode === 'SELECTOR') {
            // Parent has selected theme, go to world view
            setState({
                mode: 'WORLD',
                themeId: selectedThemeId,
                skyboxUrl: skyboxCache.get(selectedThemeId) || null
            });
        }
    }, [selectedThemeId, state.mode, skyboxCache]);

    // Handle theme selection from selector
    const handleThemeEnter = useCallback(async (themeId: ThemeId) => {
        // Check cache first
        let skyboxUrl = skyboxCache.get(themeId) || null;

        // Transition to world immediately (even without skybox)
        setState({ mode: 'WORLD', themeId, skyboxUrl });

        // Notify parent
        onThemeSelect(themeId);

        // If no cached skybox, try to generate one
        // (This happens in background while user sees gradient fallback)
        if (!skyboxUrl && !isGenerating) {
            setIsGenerating(true);
            try {
                // Dynamic import to avoid build issues
                const { generatePanoramicEnvironment } = await import('../../services/geminiService');

                const placeholderEntity = {
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

                const generatedUrl = await generatePanoramicEnvironment(
                    placeholderEntity as any,
                    THEME_DESCRIPTIONS[themeId],
                    'evening'
                );

                if (generatedUrl) {
                    // Update cache
                    setSkyboxCache(prev => new Map(prev).set(themeId, generatedUrl));

                    // If still in this world, update the skybox
                    setState(current => {
                        if (current.mode === 'WORLD' && current.themeId === themeId) {
                            return { ...current, skyboxUrl: generatedUrl };
                        }
                        return current;
                    });
                }
            } catch (error) {
                console.error('Failed to generate skybox:', error);
            } finally {
                setIsGenerating(false);
            }
        }
    }, [skyboxCache, isGenerating, onThemeSelect]);

    // Handle entity click in world
    const handleEntityClick = useCallback((entityId: string) => {
        if (state.mode === 'WORLD') {
            // Transition to detail view
            setState({ mode: 'DETAIL', themeId: state.themeId, entityId });
            onEntitySelect(entityId);
        }
    }, [state, onEntitySelect]);

    // Handle back from world to selector
    const handleBackToSelector = useCallback(() => {
        setState({ mode: 'SELECTOR' });
        onThemeSelect(null as any);
    }, [onThemeSelect]);

    // Render based on state
    switch (state.mode) {
        case 'SELECTOR':
            return (
                <ImmersiveThemeSelector
                    onSelectTheme={handleThemeEnter}
                />
            );

        case 'WORLD':
            return (
                <ImmersiveWorld
                    theme={state.themeId}
                    skyboxUrl={state.skyboxUrl}
                    entities={entities}
                    onEntityClick={handleEntityClick}
                    onBack={handleBackToSelector}
                    isLoading={isGenerating}
                />
            );

        case 'DETAIL':
            // For now, just notify parent and let it show the detail view
            // Parent will render GameBoard or EntityDetail based on selectedThemeId + entityId
            return null;

        default:
            return null;
    }
};

export default StudioExperience;
