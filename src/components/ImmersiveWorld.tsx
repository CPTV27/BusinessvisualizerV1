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
    onEnterBoard?: () => void;
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

// Gradient background fallback — creates a real gradient skybox texture
const GradientBackground: React.FC<{ theme: ThemeId }> = ({ theme }) => {
    const { scene } = useThree();

    useEffect(() => {
        // Rich gradient palettes per theme (top, middle, bottom)
        const palettes: Record<ThemeId, [string, string, string]> = {
            [ThemeId.LOBBY]: ['#050810', '#0F172A', '#1a2744'],
            [ThemeId.GARDEN]: ['#87CEAB', '#C8D8B0', '#E8E8DF'],
            [ThemeId.JUKE_JOINT]: ['#000000', '#0D0015', '#1a0a2f'],
            [ThemeId.EDITORIAL]: ['#E8E8E8', '#F4F4F4', '#FFFFFF']
        };

        const [topColor, midColor, bottomColor] = palettes[theme];

        // Create a vertical gradient texture using canvas
        const canvas = document.createElement('canvas');
        canvas.width = 2;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, topColor);
        gradient.addColorStop(0.4, midColor);
        gradient.addColorStop(1, bottomColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 2, 512);

        const texture = new THREE.CanvasTexture(canvas);
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;

        return () => {
            texture.dispose();
            scene.background = null;
        };
    }, [theme, scene]);

    return null;
};

// ============================================================
// Disney Multiplane Camera Effect (1950s-60s style)
// Layered planes at different depths create parallax as camera moves.
// Each theme gets a unique set of atmospheric layers.
// ============================================================

interface MultiplaneLayer {
    depth: number;       // Distance from camera (further = slower parallax)
    opacity: number;
    color: string;
    pattern: 'clouds' | 'mist' | 'columns' | 'stars' | 'foliage' | 'grid' | 'neon';
    scale: number;
    yOffset: number;
}

const MULTIPLANE_LAYERS: Record<ThemeId, MultiplaneLayer[]> = {
    [ThemeId.LOBBY]: [
        // Far background: starfield / ceiling
        { depth: -25, opacity: 0.15, color: '#D4AF37', pattern: 'stars', scale: 40, yOffset: 8 },
        // Mid: art deco columns silhouettes
        { depth: -18, opacity: 0.08, color: '#D4AF37', pattern: 'columns', scale: 20, yOffset: 0 },
        // Near foreground: warm mist
        { depth: -10, opacity: 0.06, color: '#1a2744', pattern: 'mist', scale: 15, yOffset: -2 },
    ],
    [ThemeId.GARDEN]: [
        // Far: sky wash
        { depth: -25, opacity: 0.12, color: '#4A5D23', pattern: 'clouds', scale: 40, yOffset: 8 },
        // Mid: bamboo / foliage silhouettes
        { depth: -16, opacity: 0.1, color: '#2D3B11', pattern: 'foliage', scale: 25, yOffset: -1 },
        // Near: mist off pond
        { depth: -8, opacity: 0.08, color: '#A3B18A', pattern: 'mist', scale: 12, yOffset: -3 },
    ],
    [ThemeId.JUKE_JOINT]: [
        // Far: neon glow wash
        { depth: -25, opacity: 0.2, color: '#D946EF', pattern: 'neon', scale: 35, yOffset: 5 },
        // Mid: smoke / haze
        { depth: -15, opacity: 0.12, color: '#22D3EE', pattern: 'mist', scale: 20, yOffset: 0 },
        // Near: neon reflections
        { depth: -8, opacity: 0.08, color: '#D946EF', pattern: 'neon', scale: 10, yOffset: -3 },
    ],
    [ThemeId.EDITORIAL]: [
        // Far: minimal grid
        { depth: -25, opacity: 0.06, color: '#FF3333', pattern: 'grid', scale: 40, yOffset: 5 },
        // Mid: subtle structure
        { depth: -16, opacity: 0.04, color: '#000000', pattern: 'columns', scale: 25, yOffset: 0 },
        // Near: light wash
        { depth: -8, opacity: 0.03, color: '#FF3333', pattern: 'mist', scale: 15, yOffset: -2 },
    ],
};

// Generates a canvas texture for a multiplane layer pattern
function generateLayerTexture(pattern: MultiplaneLayer['pattern'], color: string, size: number = 512): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, size, size);

    switch (pattern) {
        case 'stars': {
            for (let i = 0; i < 120; i++) {
                const x = Math.random() * size;
                const y = Math.random() * size;
                const r = Math.random() * 2 + 0.5;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.globalAlpha = Math.random() * 0.8 + 0.2;
                ctx.fill();
            }
            break;
        }
        case 'clouds':
        case 'mist': {
            // Soft radial blobs
            for (let i = 0; i < 8; i++) {
                const x = Math.random() * size;
                const y = Math.random() * size;
                const r = Math.random() * size * 0.3 + size * 0.1;
                const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
                grad.addColorStop(0, color);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.globalAlpha = pattern === 'clouds' ? 0.4 : 0.25;
                ctx.fillRect(0, 0, size, size);
            }
            break;
        }
        case 'columns': {
            // Vertical pillars / silhouettes
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.6;
            const numCols = 6;
            const colWidth = size / (numCols * 4);
            for (let i = 0; i < numCols; i++) {
                const x = (i / numCols) * size + size / (numCols * 2);
                const h = size * (0.5 + Math.random() * 0.4);
                const y = size - h;
                ctx.fillRect(x - colWidth / 2, y, colWidth, h);
                // Decorative top
                ctx.beginPath();
                ctx.arc(x, y, colWidth * 0.8, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
        }
        case 'foliage': {
            // Organic shapes — leaves / branches
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.5;
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * size;
                const y = size * 0.3 + Math.random() * size * 0.7;
                ctx.beginPath();
                ctx.ellipse(x, y, Math.random() * 30 + 10, Math.random() * 60 + 20, Math.random() * Math.PI, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
        }
        case 'neon': {
            // Glowing horizontal / diagonal lines
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.7;
            ctx.shadowColor = color;
            ctx.shadowBlur = 20;
            for (let i = 0; i < 6; i++) {
                const y = Math.random() * size;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(size, y + (Math.random() - 0.5) * 100);
                ctx.stroke();
            }
            // Vertical neon bars
            for (let i = 0; i < 3; i++) {
                const x = Math.random() * size;
                const h = Math.random() * size * 0.4 + size * 0.1;
                const y = Math.random() * (size - h);
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + h);
                ctx.stroke();
            }
            break;
        }
        case 'grid': {
            // Clean editorial grid
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            const spacing = size / 12;
            for (let i = 0; i <= 12; i++) {
                ctx.beginPath();
                ctx.moveTo(i * spacing, 0);
                ctx.lineTo(i * spacing, size);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i * spacing);
                ctx.lineTo(size, i * spacing);
                ctx.stroke();
            }
            break;
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

// Single multiplane layer — a large transparent plane that drifts subtly
const MultiplaneLayerMesh: React.FC<{
    layer: MultiplaneLayer;
    index: number;
}> = ({ layer, index }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const texture = React.useMemo(
        () => generateLayerTexture(layer.pattern, layer.color),
        [layer.pattern, layer.color]
    );

    useFrame((state) => {
        if (meshRef.current) {
            const t = state.clock.getElapsedTime();
            // Gentle sway — each layer moves differently for parallax
            const swaySpeed = 0.1 / (index + 1);
            const swayAmount = 0.3 * (index + 1);
            meshRef.current.position.x = Math.sin(t * swaySpeed) * swayAmount;
            meshRef.current.position.y = layer.yOffset + Math.sin(t * swaySpeed * 0.7 + index) * 0.15;
        }
    });

    return (
        <mesh
            ref={meshRef}
            position={[0, layer.yOffset, layer.depth]}
            rotation={[0, 0, 0]}
        >
            <planeGeometry args={[layer.scale, layer.scale * 0.6]} />
            <meshBasicMaterial
                map={texture}
                transparent
                opacity={layer.opacity}
                side={THREE.DoubleSide}
                depthWrite={false}
            />
        </mesh>
    );
};

// The complete multiplane camera rig
const MultiplaneCamera: React.FC<{ theme: ThemeId }> = ({ theme }) => {
    const layers = MULTIPLANE_LAYERS[theme];

    return (
        <group>
            {layers.map((layer, i) => (
                <MultiplaneLayerMesh key={i} layer={layer} index={i} />
            ))}
        </group>
    );
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

// Atmospheric particles that float in the 3D space
const AtmosphericParticles: React.FC<{ colors: typeof THEME_COLORS[ThemeId]; count?: number }> = ({ colors, count = 80 }) => {
    const pointsRef = useRef<THREE.Points>(null);
    const geoRef = useRef<THREE.BufferGeometry>(null);

    useEffect(() => {
        if (!geoRef.current) return;
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 1] = Math.random() * 15 - 2;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
        }
        geoRef.current.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }, [count]);

    useFrame((state) => {
        if (pointsRef.current && geoRef.current) {
            const t = state.clock.getElapsedTime() * 0.05;
            pointsRef.current.rotation.y = t;
            const pos = geoRef.current.attributes.position as THREE.BufferAttribute;
            if (pos) {
                for (let i = 0; i < count; i++) {
                    const y = pos.getY(i);
                    pos.setY(i, y + Math.sin(state.clock.getElapsedTime() * 0.3 + i) * 0.002);
                }
                pos.needsUpdate = true;
            }
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry ref={geoRef} />
            <pointsMaterial
                color={colors.glow}
                size={0.06}
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
};

// Ground plane with subtle grid
const GroundPlane: React.FC<{ colors: typeof THEME_COLORS[ThemeId] }> = ({ colors }) => {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial
                color={colors.primary}
                transparent
                opacity={0.05}
                metalness={0.8}
                roughness={0.4}
            />
        </mesh>
    );
};

// Fog setup component (outside Suspense, theme-aware)
const FogSetup: React.FC<{ theme: ThemeId }> = ({ theme }) => {
    const { scene } = useThree();
    useEffect(() => {
        const fogColors: Record<ThemeId, string> = {
            [ThemeId.LOBBY]: '#0F172A',
            [ThemeId.GARDEN]: '#E8E8DF',
            [ThemeId.JUKE_JOINT]: '#050005',
            [ThemeId.EDITORIAL]: '#F4F4F4',
        };
        scene.fog = new THREE.Fog(fogColors[theme], 20, 40);
        return () => { scene.fog = null; };
    }, [theme, scene]);
    return null;
};

// Canvas Error Boundary
class CanvasErrorBoundary extends React.Component<
    { children: React.ReactNode; theme: ThemeId },
    { hasError: boolean }
> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error: any, info: any) {
        console.error('Canvas Error:', error, info);
    }
    render() {
        if (this.state.hasError) {
            const colors = THEME_COLORS[this.props.theme];
            return (
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(180deg, #050810, #0F172A, #1a2744)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: '16px',
                }}>
                    <div style={{ color: colors.primary, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.6 }}>
                        3D environment unavailable
                    </div>
                    <div style={{ color: colors.primary, fontSize: '10px', opacity: 0.4 }}>
                        WebGL may not be supported
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

// Subtle non-blocking loading pill indicator
const LoadingPill: React.FC<{ theme: ThemeId; visible: boolean }> = ({ theme, visible }) => {
    const colors = THEME_COLORS[theme];
    if (!visible) return null;

    return (
        <div style={{
            position: 'absolute',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            padding: '8px 20px',
            borderRadius: '100px',
            border: `1px solid ${colors.primary}30`,
        }}>
            <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: colors.primary,
                animation: 'pulse-dot 1.5s ease-in-out infinite',
            }} />
            <span style={{
                color: colors.primary,
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                fontFamily: 'system-ui, sans-serif',
                opacity: 0.8,
            }}>
                Generating skybox
            </span>
            <style>{`
                @keyframes pulse-dot {
                    0%, 100% { opacity: 0.4; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.2); }
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
    onEnterBoard,
    isLoading = false,
}) => {
    const colors = THEME_COLORS[theme];

    return (
        <div style={{ position: 'fixed', inset: 0, background: '#000' }}>
            {/* Three.js Canvas with Error Boundary */}
            <CanvasErrorBoundary theme={theme}>
                <Canvas
                    camera={{ position: [0, 1.5, 0.1], fov: 75, near: 0.1, far: 1000 }}
                    style={{ position: 'absolute', inset: 0 }}
                >
                    {/* Fog setup - OUTSIDE Suspense, theme-aware */}
                    <FogSetup theme={theme} />

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

                        {/* Disney Multiplane Camera — layered parallax planes */}
                        <MultiplaneCamera theme={theme} />

                        {/* Atmospheric effects */}
                        <AtmosphericParticles colors={colors} />
                        <GroundPlane colors={colors} />

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
            </CanvasErrorBoundary>

            {/* Subtle non-blocking loading indicator */}
            <LoadingPill theme={theme} visible={isLoading} />

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

            {/* Enter Board / Operations button */}
            {onEnterBoard && (
                <button
                    onClick={onEnterBoard}
                    style={{
                        position: 'absolute',
                        top: '24px',
                        right: '24px',
                        zIndex: 50,
                        background: `${colors.primary}`,
                        color: '#000',
                        border: 'none',
                        padding: '14px 28px',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontFamily: 'system-ui, sans-serif',
                        transition: 'all 0.3s ease',
                        boxShadow: `0 0 30px ${colors.glow}40`,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 50px ${colors.glow}80`;
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 30px ${colors.glow}40`;
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    ▸ Enter Operations
                </button>
            )}

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
