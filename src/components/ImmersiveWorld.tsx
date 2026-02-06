/**
 * ImmersiveWorld.tsx
 * 
 * Full 3D immersive environment renderer.
 * Renders an AI-generated panoramic skybox with interactive entity markers.
 * 
 * Uses:
 * - Three.js skybox texture from Gemini-generated panoramic image
 * - EntityMarkers3D for interactive business entities
 * - Mouse/device orientation controls for looking around
 * 
 * Owner: AG (Antigravity)
 */

import React, { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { Canvas, useThree, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, Sky, Html } from '@react-three/drei';
import * as THREE from 'three';

// Local ThemeId
enum ThemeId {
    LOBBY = 'LOBBY',
    GARDEN = 'GARDEN',
    JUKE_JOINT = 'JUKE_JOINT',
    EDITORIAL = 'EDITORIAL'
}

interface EntityData {
    id: string;
    name: string;
    type: string;
    layer: string;
    description: string;
    kpiValue: string;
    coordinates: { x: number; y: number };
    gaps?: Array<{ priority: string; status: string }>;
}

interface ImmersiveWorldProps {
    theme: ThemeId;
    skyboxUrl?: string | null;
    entities: EntityData[];
    onEntityClick: (entityId: string) => void;
    onBack?: () => void;
    isLoading?: boolean;
    fallbackGradient?: string;
}

// Theme color configuration
const THEME_COLORS: Record<ThemeId, { primary: string; glow: string; accent: string }> = {
    [ThemeId.LOBBY]: { primary: '#D4AF37', glow: '#D4AF37', accent: '#F4E5C3' },
    [ThemeId.GARDEN]: { primary: '#4A5D23', glow: '#6B8E23', accent: '#A3B18A' },
    [ThemeId.JUKE_JOINT]: { primary: '#D946EF', glow: '#E879F9', accent: '#22D3EE' },
    [ThemeId.EDITORIAL]: { primary: '#000000', glow: '#FF3333', accent: '#666666' }
};

// Default environment presets per theme (when no AI skybox is available)
const THEME_ENVIRONMENTS: Record<ThemeId, string> = {
    [ThemeId.LOBBY]: 'night',
    [ThemeId.GARDEN]: 'park',
    [ThemeId.JUKE_JOINT]: 'night',
    [ThemeId.EDITORIAL]: 'studio'
};

// Convert 2D coordinates to 3D spherical position
function coordsTo3D(x: number, y: number, radius: number = 8): [number, number, number] {
    const theta = ((x - 50) / 50) * Math.PI * 0.6;
    const phi = ((50 - y) / 50) * Math.PI * 0.3;

    return [
        radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(phi) + 1.5,
        -radius * Math.cos(theta) * Math.cos(phi)
    ];
}

// Skybox from AI-generated panorama
const PanoramicSkybox: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
    const { scene } = useThree();

    useEffect(() => {
        if (!imageUrl) return;

        const loader = new THREE.TextureLoader();
        loader.load(imageUrl, (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.background = texture;
        });

        return () => {
            scene.background = null;
        };
    }, [imageUrl, scene]);

    return null;
};

// Gradient background fallback
const GradientBackground: React.FC<{ theme: ThemeId }> = ({ theme }) => {
    const { scene } = useThree();

    useEffect(() => {
        const colors: Record<ThemeId, [string, string]> = {
            [ThemeId.LOBBY]: ['#1a2744', '#050810'],
            [ThemeId.GARDEN]: ['#e8e8df', '#c8c8c0'],
            [ThemeId.JUKE_JOINT]: ['#1a0a1f', '#000000'],
            [ThemeId.EDITORIAL]: ['#ffffff', '#e0e0e0']
        };

        const [top, bottom] = colors[theme];
        scene.background = new THREE.Color(bottom);

        return () => {
            scene.background = null;
        };
    }, [theme, scene]);

    return null;
};

// Floating entity orb
const EntityOrb: React.FC<{
    entity: EntityData;
    position: [number, number, number];
    colors: typeof THEME_COLORS[ThemeId];
    onClick: () => void;
}> = ({ entity, position, colors, onClick }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    const hasHighPriorityGap = entity.gaps?.some(g =>
        g.priority === 'HIGH' && g.status === 'OPEN'
    );

    const getSize = () => {
        switch (entity.type) {
            case 'VENUE': return 0.4;
            case 'ROOM_CATEGORY': return 0.25;
            case 'PACKAGE': return 0.3;
            case 'BRAND': return 0.35;
            case 'EXPERIENCE': return 0.35;
            default: return 0.3;
        }
    };

    useFrame((state) => {
        if (meshRef.current) {
            const t = state.clock.getElapsedTime();
            meshRef.current.position.y = position[1] + Math.sin(t * 0.5 + position[0]) * 0.1;
            meshRef.current.rotation.y = t * 0.2;

            const targetScale = hovered ? 1.4 : 1;
            meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        }
    });

    return (
        <group position={position}>
            <mesh
                ref={meshRef}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                    document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                    setHovered(false);
                    document.body.style.cursor = 'auto';
                }}
            >
                <sphereGeometry args={[getSize(), 32, 32]} />
                <meshStandardMaterial
                    color={hasHighPriorityGap ? '#EF4444' : colors.primary}
                    emissive={hasHighPriorityGap ? '#EF4444' : colors.glow}
                    emissiveIntensity={hovered ? 1 : 0.5}
                    metalness={0.7}
                    roughness={0.2}
                />
            </mesh>

            {/* Glow ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[getSize() * 1.4, getSize() * 1.6, 32]} />
                <meshBasicMaterial
                    color={colors.glow}
                    transparent
                    opacity={hovered ? 0.8 : 0.3}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Label on hover */}
            {hovered && (
                <Html
                    position={[0, getSize() + 0.5, 0]}
                    center
                    distanceFactor={8}
                    style={{ pointerEvents: 'none' }}
                >
                    <div
                        style={{
                            background: 'rgba(0, 0, 0, 0.95)',
                            color: colors.primary,
                            padding: '16px 20px',
                            borderRadius: '12px',
                            border: `2px solid ${colors.primary}`,
                            maxWidth: '280px',
                            fontFamily: 'system-ui, sans-serif',
                            boxShadow: `0 0 30px ${colors.glow}60`,
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <div style={{
                            fontWeight: 'bold',
                            fontSize: '16px',
                            marginBottom: '6px'
                        }}>
                            {entity.name}
                        </div>
                        <div style={{
                            opacity: 0.7,
                            fontSize: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            marginBottom: '8px'
                        }}>
                            {entity.layer} · {entity.type}
                        </div>
                        <div style={{
                            fontSize: '13px',
                            lineHeight: 1.4,
                            opacity: 0.9
                        }}>
                            {entity.description.length > 120
                                ? entity.description.substring(0, 117) + '...'
                                : entity.description}
                        </div>
                        {entity.kpiValue && (
                            <div style={{
                                marginTop: '10px',
                                padding: '8px 12px',
                                background: `${colors.primary}20`,
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: colors.glow
                            }}>
                                {entity.kpiValue}
                            </div>
                        )}
                        {hasHighPriorityGap && (
                            <div style={{
                                marginTop: '10px',
                                color: '#EF4444',
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <span>⚠️</span> Open gaps require attention
                            </div>
                        )}
                        <div style={{
                            marginTop: '12px',
                            fontSize: '10px',
                            opacity: 0.5,
                            textAlign: 'center'
                        }}>
                            Click to open details
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
};

// Loading spinner overlay
const LoadingOverlay: React.FC<{ theme: ThemeId }> = ({ theme }) => {
    const colors = THEME_COLORS[theme];

    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.8)',
                zIndex: 100,
            }}
        >
            <div
                style={{
                    width: '60px',
                    height: '60px',
                    border: `3px solid ${colors.primary}30`,
                    borderTop: `3px solid ${colors.primary}`,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                }}
            />
            <div
                style={{
                    marginTop: '24px',
                    color: colors.primary,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    fontFamily: 'system-ui, sans-serif',
                }}
            >
                Generating Environment...
            </div>
            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

// Main component
export const ImmersiveWorld: React.FC<ImmersiveWorldProps> = ({
    theme,
    skyboxUrl,
    entities,
    onEntityClick,
    onBack,
    isLoading = false,
}) => {
    const colors = THEME_COLORS[theme];

    return (
        <div style={{ position: 'fixed', inset: 0, background: '#000' }}>
            {/* Three.js Canvas */}
            <Canvas
                camera={{ position: [0, 1.5, 0.1], fov: 75, near: 0.1, far: 1000 }}
                style={{ position: 'absolute', inset: 0 }}
            >
                <Suspense fallback={null}>
                    {/* Background */}
                    {skyboxUrl ? (
                        <PanoramicSkybox imageUrl={skyboxUrl} />
                    ) : (
                        <GradientBackground theme={theme} />
                    )}

                    {/* Lighting */}
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={0.8} color={colors.glow} />
                    <pointLight position={[-10, -5, -10]} intensity={0.4} color={colors.primary} />

                    {/* Entity markers */}
                    {entities.map((entity) => (
                        <EntityOrb
                            key={entity.id}
                            entity={entity}
                            position={coordsTo3D(entity.coordinates.x, entity.coordinates.y, 8)}
                            colors={colors}
                            onClick={() => onEntityClick(entity.id)}
                        />
                    ))}

                    {/* Camera controls */}
                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        rotateSpeed={0.5}
                        minPolarAngle={Math.PI * 0.3}
                        maxPolarAngle={Math.PI * 0.7}
                    />
                </Suspense>
            </Canvas>

            {/* Loading overlay */}
            {isLoading && <LoadingOverlay theme={theme} />}

            {/* Back button */}
            {onBack && (
                <button
                    onClick={onBack}
                    style={{
                        position: 'absolute',
                        top: '24px',
                        left: '24px',
                        zIndex: 50,
                        background: 'rgba(0, 0, 0, 0.8)',
                        color: colors.primary,
                        border: `2px solid ${colors.primary}`,
                        padding: '12px 24px',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontFamily: 'system-ui, sans-serif',
                        transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.primary;
                        e.currentTarget.style.color = '#000';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
                        e.currentTarget.style.color = colors.primary;
                    }}
                >
                    ← Back to Territories
                </button>
            )}

            {/* Theme indicator */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '24px',
                    left: '24px',
                    zIndex: 50,
                    color: colors.primary,
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3em',
                    opacity: 0.6,
                    fontFamily: 'system-ui, sans-serif',
                }}
            >
                {theme.replace('_', ' ')} · {entities.length} Entities
            </div>

            {/* Controls hint */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '24px',
                    right: '24px',
                    zIndex: 50,
                    color: colors.primary,
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    opacity: 0.4,
                    fontFamily: 'system-ui, sans-serif',
                }}
            >
                Drag to look around · Click entities to explore
            </div>
        </div>
    );
};

export default ImmersiveWorld;
