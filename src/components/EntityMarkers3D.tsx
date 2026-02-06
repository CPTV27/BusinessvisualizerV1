/**
 * EntityMarkers3D.tsx
 * 
 * Interactive 3D markers for business entities inside the immersive environment.
 * Uses React Three Fiber to render entities as floating orbs/icons in 3D space.
 * 
 * Owner: AG (Antigravity)
 */

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Billboard, Html } from '@react-three/drei';
import * as THREE from 'three';

// Local types to avoid import issues
enum ThemeId {
    LOBBY = 'LOBBY',
    GARDEN = 'GARDEN',
    JUKE_JOINT = 'JUKE_JOINT',
    EDITORIAL = 'EDITORIAL'
}

interface EntityMarker {
    id: string;
    name: string;
    type: string;
    layer: string;
    description: string;
    kpiValue: string;
    coordinates: { x: number; y: number };
    gaps?: Array<{ priority: string; status: string }>;
}

interface EntityMarkers3DProps {
    entities: EntityMarker[];
    theme: ThemeId;
    onEntityClick: (entityId: string) => void;
    radius?: number; // Distance from camera to place entities
}

// Theme color palettes for entity markers
const THEME_COLORS: Record<ThemeId, {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
}> = {
    [ThemeId.LOBBY]: {
        primary: '#D4AF37',
        secondary: '#2C4A6E',
        accent: '#F4E5C3',
        glow: '#D4AF37'
    },
    [ThemeId.GARDEN]: {
        primary: '#4A5D23',
        secondary: '#8C8C85',
        accent: '#A3B18A',
        glow: '#6B8E23'
    },
    [ThemeId.JUKE_JOINT]: {
        primary: '#D946EF',
        secondary: '#22D3EE',
        accent: '#F472B6',
        glow: '#E879F9'
    },
    [ThemeId.EDITORIAL]: {
        primary: '#000000',
        secondary: '#FF3333',
        accent: '#666666',
        glow: '#FF0000'
    }
};

// Convert 2D coordinates to 3D spherical position
function coordsTo3D(x: number, y: number, radius: number = 8): [number, number, number] {
    // Convert x/y (0-100) to spherical coordinates around the viewer
    const theta = ((x - 50) / 50) * Math.PI * 0.6; // Horizontal spread (108 degrees)
    const phi = ((50 - y) / 50) * Math.PI * 0.3;   // Vertical spread (54 degrees)

    return [
        radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(phi) + 1.5, // Offset up slightly
        -radius * Math.cos(theta) * Math.cos(phi)
    ];
}

// Single floating entity orb
const EntityOrb: React.FC<{
    entity: EntityMarker;
    position: [number, number, number];
    colors: typeof THEME_COLORS[ThemeId];
    onClick: () => void;
}> = ({ entity, position, colors, onClick }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);
    const [clicked, setClicked] = useState(false);

    // Determine if entity has high priority gaps
    const hasHighPriorityGap = entity.gaps?.some(g =>
        g.priority === 'HIGH' && g.status === 'OPEN'
    );

    // Pulsing animation
    useFrame((state) => {
        if (meshRef.current) {
            const t = state.clock.getElapsedTime();

            // Gentle floating motion
            meshRef.current.position.y = position[1] + Math.sin(t * 0.5 + position[0]) * 0.1;

            // Scale pulse on hover
            const targetScale = hovered ? 1.3 : 1;
            meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

            // Rotation
            meshRef.current.rotation.y = t * 0.2;
        }
    });

    // Size based on entity type
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

    return (
        <group position={position}>
            {/* Main orb */}
            <mesh
                ref={meshRef}
                onClick={(e) => {
                    e.stopPropagation();
                    setClicked(true);
                    onClick();
                    setTimeout(() => setClicked(false), 300);
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
                    emissiveIntensity={hovered ? 0.8 : 0.4}
                    metalness={0.6}
                    roughness={0.3}
                />
            </mesh>

            {/* Glow ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[getSize() * 1.5, getSize() * 1.7, 32]} />
                <meshBasicMaterial
                    color={colors.glow}
                    transparent
                    opacity={hovered ? 0.6 : 0.2}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Label */}
            <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
                <Text
                    position={[0, getSize() + 0.3, 0]}
                    fontSize={0.15}
                    color={colors.primary}
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#000000"
                >
                    {entity.name.length > 20 ? entity.name.substring(0, 17) + '...' : entity.name}
                </Text>

                {/* KPI value below name */}
                {entity.kpiValue && (
                    <Text
                        position={[0, getSize() + 0.1, 0]}
                        fontSize={0.1}
                        color={colors.accent}
                        anchorX="center"
                        anchorY="middle"
                    >
                        {entity.kpiValue}
                    </Text>
                )}
            </Billboard>

            {/* Detail popup on hover */}
            {hovered && (
                <Html
                    position={[0.5, 0, 0]}
                    center
                    distanceFactor={10}
                    style={{
                        pointerEvents: 'none',
                        transition: 'opacity 0.2s',
                    }}
                >
                    <div
                        style={{
                            background: 'rgba(0, 0, 0, 0.9)',
                            color: colors.primary,
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: `1px solid ${colors.primary}`,
                            maxWidth: '200px',
                            fontSize: '12px',
                            fontFamily: 'system-ui',
                            boxShadow: `0 0 20px ${colors.glow}40`,
                        }}
                    >
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                            {entity.name}
                        </div>
                        <div style={{ opacity: 0.8, fontSize: '10px', textTransform: 'uppercase' }}>
                            {entity.layer} • {entity.type}
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '11px', opacity: 0.9 }}>
                            {entity.description.substring(0, 100)}...
                        </div>
                        {hasHighPriorityGap && (
                            <div style={{
                                marginTop: '8px',
                                color: '#EF4444',
                                fontSize: '10px',
                                textTransform: 'uppercase'
                            }}>
                                ⚠️ Has open gaps
                            </div>
                        )}
                    </div>
                </Html>
            )}
        </group>
    );
};

// Connection lines between related entities
const ConnectionLines: React.FC<{
    entities: EntityMarker[];
    radius: number;
    colors: typeof THEME_COLORS[ThemeId];
}> = ({ entities, radius, colors }) => {
    const lines = useMemo(() => {
        const result: Array<[THREE.Vector3, THREE.Vector3]> = [];

        // Connect entities in the same layer
        const layerGroups = new Map<string, EntityMarker[]>();
        entities.forEach(e => {
            const existing = layerGroups.get(e.layer) || [];
            existing.push(e);
            layerGroups.set(e.layer, existing);
        });

        layerGroups.forEach((group) => {
            for (let i = 0; i < group.length - 1; i++) {
                const pos1 = coordsTo3D(group[i].coordinates.x, group[i].coordinates.y, radius);
                const pos2 = coordsTo3D(group[i + 1].coordinates.x, group[i + 1].coordinates.y, radius);
                result.push([
                    new THREE.Vector3(...pos1),
                    new THREE.Vector3(...pos2)
                ]);
            }
        });

        return result;
    }, [entities, radius]);

    return (
        <group>
            {lines.map((line, i) => (
                <line key={i}>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={2}
                            array={new Float32Array([
                                line[0].x, line[0].y, line[0].z,
                                line[1].x, line[1].y, line[1].z
                            ])}
                            itemSize={3}
                        />
                    </bufferGeometry>
                    <lineBasicMaterial color={colors.accent} transparent opacity={0.2} />
                </line>
            ))}
        </group>
    );
};

// Main 3D scene
const Scene: React.FC<{
    entities: EntityMarker[];
    theme: ThemeId;
    onEntityClick: (entityId: string) => void;
    radius: number;
}> = ({ entities, theme, onEntityClick, radius }) => {
    const colors = THEME_COLORS[theme];

    return (
        <>
            {/* Ambient lighting */}
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={0.8} color={colors.glow} />
            <pointLight position={[-10, -10, -10]} intensity={0.4} color={colors.secondary} />

            {/* Connection lines */}
            <ConnectionLines entities={entities} radius={radius} colors={colors} />

            {/* Entity orbs */}
            {entities.map((entity) => (
                <EntityOrb
                    key={entity.id}
                    entity={entity}
                    position={coordsTo3D(entity.coordinates.x, entity.coordinates.y, radius)}
                    colors={colors}
                    onClick={() => onEntityClick(entity.id)}
                />
            ))}
        </>
    );
};

// Exported component with Canvas wrapper
export const EntityMarkers3D: React.FC<EntityMarkers3DProps> = ({
    entities,
    theme,
    onEntityClick,
    radius = 8
}) => {
    return (
        <Canvas
            camera={{ position: [0, 1.5, 0], fov: 75, near: 0.1, far: 1000 }}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'auto'
            }}
        >
            <Scene
                entities={entities}
                theme={theme}
                onEntityClick={onEntityClick}
                radius={radius}
            />
        </Canvas>
    );
};

export default EntityMarkers3D;
