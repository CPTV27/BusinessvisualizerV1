/**
 * GameBoard Views — The Studio
 * 5 strategic views for the Discovery Model
 */

import React, { useState, useMemo } from 'react';
import {
    LayoutGrid,
    Layers,
    AlertTriangle,
    TrendingUp,
    Database,
    ChevronRight,
    CheckCircle2,
    Clock,
    AlertCircle,
    Zap,
    Building,
    Users,
    Cog,
    Briefcase
} from 'lucide-react';
import { ThemeConfig, BusinessEntity, EntityType, GapStatus, BusinessGap } from '../../types';

// --- VIEW TYPES ---

export type GameBoardView = 'ECOSYSTEM' | 'LAYERS' | 'GAPS' | 'REVENUE' | 'REGISTRY';

interface GameBoardProps {
    entities: BusinessEntity[];
    theme: ThemeConfig;
    activeView: GameBoardView;
    onViewChange: (view: GameBoardView) => void;
    onEntityClick: (entity: BusinessEntity) => void;
    onGapClick: (entityId: string, gap: BusinessGap) => void;
}

// --- VIEW NAVIGATION ---

const ViewNavigation: React.FC<{
    activeView: GameBoardView;
    onViewChange: (view: GameBoardView) => void;
    theme: ThemeConfig;
}> = ({ activeView, onViewChange, theme }) => {
    const views: { id: GameBoardView; label: string; icon: React.ReactNode }[] = [
        { id: 'ECOSYSTEM', label: 'Ecosystem', icon: <LayoutGrid size={16} /> },
        { id: 'LAYERS', label: 'Layers', icon: <Layers size={16} /> },
        { id: 'GAPS', label: 'Gap Tracker', icon: <AlertTriangle size={16} /> },
        { id: 'REVENUE', label: 'Revenue', icon: <TrendingUp size={16} /> },
        { id: 'REGISTRY', label: 'Registry', icon: <Database size={16} /> },
    ];

    return (
        <div className="flex gap-1 p-1 rounded-lg bg-black/20 backdrop-blur-sm">
            {views.map(view => (
                <button
                    key={view.id}
                    onClick={() => onViewChange(view.id)}
                    className={`
            flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest
            transition-all duration-300 ${theme.styles.rounded}
            ${activeView === view.id
                            ? 'opacity-100'
                            : 'opacity-50 hover:opacity-80'
                        }
          `}
                    style={{
                        backgroundColor: activeView === view.id ? theme.colors.accent : 'transparent',
                        color: activeView === view.id ? theme.colors.bg : theme.colors.text,
                    }}
                >
                    {view.icon}
                    <span className="hidden md:inline">{view.label}</span>
                </button>
            ))}
        </div>
    );
};

// --- ECOSYSTEM MAP VIEW ---

const EcosystemMapView: React.FC<{
    entities: BusinessEntity[];
    theme: ThemeConfig;
    onEntityClick: (entity: BusinessEntity) => void;
}> = ({ entities, theme, onEntityClick }) => {
    // Group entities by type
    const groupedEntities = useMemo(() => {
        const groups: Record<EntityType, BusinessEntity[]> = {
            [EntityType.VENUE]: [],
            [EntityType.BRAND]: [],
            [EntityType.EXPERIENCE]: [],
            [EntityType.DEVELOPMENT]: [],
        };

        entities.forEach(e => {
            if (groups[e.type]) {
                groups[e.type].push(e);
            }
        });

        return groups;
    }, [entities]);

    const typeConfig: Record<EntityType, { label: string; icon: React.ReactNode; color: string }> = {
        [EntityType.VENUE]: {
            label: 'Venues',
            icon: <Building size={20} />,
            color: '#3B82F6' // Blue
        },
        [EntityType.BRAND]: {
            label: 'Brands',
            icon: <Zap size={20} />,
            color: '#8B5CF6' // Purple
        },
        [EntityType.EXPERIENCE]: {
            label: 'Experiences',
            icon: <Users size={20} />,
            color: '#10B981' // Green
        },
        [EntityType.DEVELOPMENT]: {
            label: 'Development',
            icon: <Cog size={20} />,
            color: '#F59E0B' // Amber
        },
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(groupedEntities).map(([type, entities]) => {
                const config = typeConfig[type as EntityType];
                if (entities.length === 0) return null;

                return (
                    <div
                        key={type}
                        className={`${theme.styles.rounded} ${theme.styles.shadow} overflow-hidden`}
                        style={{ backgroundColor: theme.colors.surface }}
                    >
                        {/* Type Header */}
                        <div
                            className="p-4 flex items-center gap-3 border-b"
                            style={{
                                borderColor: theme.colors.border,
                                background: `linear-gradient(135deg, ${config.color}20, transparent)`
                            }}
                        >
                            <div
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: `${config.color}30`, color: config.color }}
                            >
                                {config.icon}
                            </div>
                            <div>
                                <h3
                                    className="font-bold uppercase tracking-widest text-xs"
                                    style={{ color: theme.colors.text }}
                                >
                                    {config.label}
                                </h3>
                                <span
                                    className="text-xs opacity-60"
                                    style={{ color: theme.colors.text }}
                                >
                                    {entities.length} {entities.length === 1 ? 'entity' : 'entities'}
                                </span>
                            </div>
                        </div>

                        {/* Entity List */}
                        <div className="divide-y" style={{ borderColor: `${theme.colors.border}50` }}>
                            {entities.map(entity => {
                                const openGaps = entity.gaps.filter(g => g.status !== GapStatus.SOLVED).length;

                                return (
                                    <button
                                        key={entity.id}
                                        onClick={() => onEntityClick(entity)}
                                        className="w-full p-4 text-left hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h4
                                                    className="font-semibold truncate"
                                                    style={{ fontFamily: theme.fonts.heading, color: theme.colors.text }}
                                                >
                                                    {entity.name}
                                                </h4>
                                                <p
                                                    className="text-xs opacity-60 mt-1 truncate"
                                                    style={{ color: theme.colors.text }}
                                                >
                                                    {entity.location || 'No location'}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 ml-2">
                                                {openGaps > 0 && (
                                                    <span
                                                        className="px-2 py-1 text-[10px] font-bold rounded-full"
                                                        style={{
                                                            backgroundColor: `${theme.colors.accent}30`,
                                                            color: theme.colors.accent
                                                        }}
                                                    >
                                                        {openGaps} gaps
                                                    </span>
                                                )}
                                                <ChevronRight
                                                    size={16}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                    style={{ color: theme.colors.accent }}
                                                />
                                            </div>
                                        </div>

                                        {/* KPI Badge */}
                                        <div
                                            className="mt-3 flex items-center gap-2 text-xs"
                                            style={{ fontFamily: theme.fonts.mono }}
                                        >
                                            <span className="opacity-50" style={{ color: theme.colors.text }}>
                                                {entity.kpi}:
                                            </span>
                                            <span
                                                className="font-bold"
                                                style={{ color: theme.colors.accent }}
                                            >
                                                {entity.kpiValue}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// --- LAYERS VIEW ---

const LayersView: React.FC<{
    entities: BusinessEntity[];
    theme: ThemeConfig;
}> = ({ entities, theme }) => {
    const layers = [
        {
            id: 'FOUNDATION',
            name: 'Foundation Layer',
            description: 'Core infrastructure and property',
            types: [EntityType.VENUE],
            color: '#3B82F6'
        },
        {
            id: 'NETWORK',
            name: 'Network Layer',
            description: 'Relationships and brand presence',
            types: [EntityType.BRAND],
            color: '#8B5CF6'
        },
        {
            id: 'MACHINE',
            name: 'Machine Layer',
            description: 'Revenue-generating experiences',
            types: [EntityType.EXPERIENCE],
            color: '#10B981'
        },
        {
            id: 'BUSINESS',
            name: 'Business Layer',
            description: 'Growth and expansion',
            types: [EntityType.DEVELOPMENT],
            color: '#F59E0B'
        },
    ];

    return (
        <div className="space-y-6">
            {layers.map((layer, idx) => {
                const layerEntities = entities.filter(e => layer.types.includes(e.type));
                const totalGaps = layerEntities.reduce((sum, e) => sum + e.gaps.length, 0);
                const solvedGaps = layerEntities.reduce(
                    (sum, e) => sum + e.gaps.filter(g => g.status === GapStatus.SOLVED).length,
                    0
                );
                const readinessScore = totalGaps > 0 ? Math.round((solvedGaps / totalGaps) * 100) : 100;

                return (
                    <div
                        key={layer.id}
                        className={`${theme.styles.rounded} ${theme.styles.shadow} overflow-hidden`}
                        style={{ backgroundColor: theme.colors.surface }}
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
                                        style={{ backgroundColor: `${layer.color}20`, color: layer.color }}
                                    >
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h3
                                            className="text-xl font-bold"
                                            style={{ fontFamily: theme.fonts.heading, color: theme.colors.text }}
                                        >
                                            {layer.name}
                                        </h3>
                                        <p className="text-sm opacity-60" style={{ color: theme.colors.text }}>
                                            {layer.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Readiness Score */}
                                <div className="text-right">
                                    <div
                                        className="text-3xl font-bold"
                                        style={{ fontFamily: theme.fonts.mono, color: layer.color }}
                                    >
                                        {readinessScore}%
                                    </div>
                                    <div className="text-xs opacity-50" style={{ color: theme.colors.text }}>
                                        Readiness
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div
                                className="h-2 rounded-full overflow-hidden"
                                style={{ backgroundColor: `${layer.color}20` }}
                            >
                                <div
                                    className="h-full rounded-full transition-all duration-1000"
                                    style={{
                                        width: `${readinessScore}%`,
                                        backgroundColor: layer.color
                                    }}
                                />
                            </div>

                            {/* Entity Count */}
                            <div className="mt-4 flex gap-4 text-xs" style={{ color: theme.colors.text }}>
                                <span className="opacity-60">
                                    {layerEntities.length} {layerEntities.length === 1 ? 'entity' : 'entities'}
                                </span>
                                <span className="opacity-60">•</span>
                                <span className="opacity-60">
                                    {solvedGaps}/{totalGaps} gaps resolved
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// --- GAP TRACKER VIEW ---

const GapTrackerView: React.FC<{
    entities: BusinessEntity[];
    theme: ThemeConfig;
    onGapClick: (entityId: string, gap: BusinessGap) => void;
}> = ({ entities, theme, onGapClick }) => {
    const allGaps = useMemo(() => {
        const gaps: Array<{ entity: BusinessEntity; gap: BusinessGap }> = [];
        entities.forEach(e => {
            e.gaps.forEach(g => {
                gaps.push({ entity: e, gap: g });
            });
        });

        // Sort by priority then status
        return gaps.sort((a, b) => {
            const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
            const statusOrder = { OPEN: 0, IN_PROGRESS: 1, SOLVED: 2 };

            if (a.gap.status !== b.gap.status) {
                return statusOrder[a.gap.status] - statusOrder[b.gap.status];
            }
            return priorityOrder[a.gap.priority] - priorityOrder[b.gap.priority];
        });
    }, [entities]);

    const statusConfig: Record<GapStatus, { label: string; icon: React.ReactNode; color: string }> = {
        [GapStatus.OPEN]: {
            label: 'Open',
            icon: <AlertCircle size={14} />,
            color: '#EF4444' // Red
        },
        [GapStatus.IN_PROGRESS]: {
            label: 'In Progress',
            icon: <Clock size={14} />,
            color: '#F59E0B' // Amber
        },
        [GapStatus.SOLVED]: {
            label: 'Solved',
            icon: <CheckCircle2 size={14} />,
            color: '#10B981' // Green
        },
    };

    return (
        <div className="space-y-4">
            {/* Stats Header */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {Object.entries(statusConfig).map(([status, config]) => {
                    const count = allGaps.filter(g => g.gap.status === status).length;
                    return (
                        <div
                            key={status}
                            className={`${theme.styles.rounded} p-4 text-center`}
                            style={{
                                backgroundColor: `${config.color}15`,
                                border: `1px solid ${config.color}30`
                            }}
                        >
                            <div
                                className="text-3xl font-bold"
                                style={{ fontFamily: theme.fonts.mono, color: config.color }}
                            >
                                {count}
                            </div>
                            <div
                                className="text-xs uppercase tracking-widest mt-1 flex items-center justify-center gap-1"
                                style={{ color: config.color }}
                            >
                                {config.icon}
                                {config.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Gap List */}
            <div className="space-y-3">
                {allGaps.map(({ entity, gap }) => {
                    const status = statusConfig[gap.status];

                    return (
                        <button
                            key={gap.id}
                            onClick={() => onGapClick(entity.id, gap)}
                            className={`
                w-full text-left p-4 ${theme.styles.rounded} ${theme.styles.shadow}
                hover:scale-[1.01] transition-all duration-200 group
              `}
                            style={{
                                backgroundColor: theme.colors.surface,
                                borderLeft: `4px solid ${status.color}`
                            }}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span
                                            className="text-[10px] uppercase tracking-widest opacity-60"
                                            style={{ color: theme.colors.text }}
                                        >
                                            {entity.name}
                                        </span>
                                        <span
                                            className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded`}
                                            style={{
                                                backgroundColor: gap.priority === 'HIGH' ? '#EF444420' :
                                                    gap.priority === 'MEDIUM' ? '#F59E0B20' : '#10B98120',
                                                color: gap.priority === 'HIGH' ? '#EF4444' :
                                                    gap.priority === 'MEDIUM' ? '#F59E0B' : '#10B981'
                                            }}
                                        >
                                            {gap.priority}
                                        </span>
                                    </div>
                                    <p
                                        className="text-sm"
                                        style={{ fontFamily: theme.fonts.body, color: theme.colors.text }}
                                    >
                                        {gap.description}
                                    </p>
                                </div>

                                <div
                                    className="ml-4 flex items-center gap-1 px-2 py-1 rounded"
                                    style={{ backgroundColor: `${status.color}20`, color: status.color }}
                                >
                                    {status.icon}
                                    <span className="text-[10px] uppercase font-bold">{status.label}</span>
                                </div>
                            </div>

                            {gap.aiSuggestions && gap.aiSuggestions.length > 0 && (
                                <div
                                    className="mt-3 pt-3 border-t text-xs opacity-60"
                                    style={{ borderColor: `${theme.colors.border}30`, color: theme.colors.text }}
                                >
                                    <span className="opacity-50">AI Solution: </span>
                                    {gap.aiSuggestions[0].substring(0, 100)}...
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// --- REVENUE VIEW (Placeholder) ---

const RevenueView: React.FC<{
    entities: BusinessEntity[];
    theme: ThemeConfig;
}> = ({ entities, theme }) => {
    return (
        <div
            className={`${theme.styles.rounded} ${theme.styles.shadow} p-12 text-center`}
            style={{ backgroundColor: theme.colors.surface }}
        >
            <TrendingUp
                size={64}
                className="mx-auto mb-4 opacity-30"
                style={{ color: theme.colors.accent }}
            />
            <h3
                className="text-2xl mb-2"
                style={{ fontFamily: theme.fonts.heading, color: theme.colors.text }}
            >
                Revenue Projections
            </h3>
            <p className="opacity-60 mb-6" style={{ color: theme.colors.text }}>
                Connect your Discovery Model spreadsheet to visualize 12-month projections.
            </p>
            <button
                className="px-6 py-3 font-bold uppercase tracking-widest text-sm"
                style={{ backgroundColor: theme.colors.accent, color: theme.colors.bg }}
            >
                Connect Google Sheets
            </button>
        </div>
    );
};

// --- REGISTRY VIEW ---

const RegistryView: React.FC<{
    entities: BusinessEntity[];
    theme: ThemeConfig;
    onEntityClick: (entity: BusinessEntity) => void;
}> = ({ entities, theme, onEntityClick }) => {
    return (
        <div
            className={`${theme.styles.rounded} ${theme.styles.shadow} overflow-hidden`}
            style={{ backgroundColor: theme.colors.surface }}
        >
            {/* Table Header */}
            <div
                className="grid grid-cols-5 gap-4 p-4 border-b text-xs uppercase tracking-widest font-bold"
                style={{ borderColor: theme.colors.border, color: theme.colors.text }}
            >
                <div>Entity</div>
                <div>Type</div>
                <div>Location</div>
                <div>KPI</div>
                <div>Build Rate</div>
            </div>

            {/* Table Body */}
            {entities.map(entity => {
                const totalGaps = entity.gaps.length;
                const solvedGaps = entity.gaps.filter(g => g.status === GapStatus.SOLVED).length;
                const buildRate = totalGaps > 0 ? Math.round((solvedGaps / totalGaps) * 100) : 100;

                return (
                    <button
                        key={entity.id}
                        onClick={() => onEntityClick(entity)}
                        className="w-full grid grid-cols-5 gap-4 p-4 border-b hover:bg-white/5 transition-colors text-left"
                        style={{ borderColor: `${theme.colors.border}30` }}
                    >
                        <div
                            className="font-semibold truncate"
                            style={{ fontFamily: theme.fonts.heading, color: theme.colors.text }}
                        >
                            {entity.name}
                        </div>
                        <div
                            className="text-xs uppercase opacity-60"
                            style={{ color: theme.colors.text }}
                        >
                            {entity.type}
                        </div>
                        <div
                            className="text-sm opacity-80 truncate"
                            style={{ color: theme.colors.text }}
                        >
                            {entity.location || '—'}
                        </div>
                        <div style={{ fontFamily: theme.fonts.mono }}>
                            <span className="text-xs opacity-50" style={{ color: theme.colors.text }}>
                                {entity.kpi}:{' '}
                            </span>
                            <span style={{ color: theme.colors.accent }}>{entity.kpiValue}</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <div
                                    className="flex-1 h-2 rounded-full overflow-hidden"
                                    style={{ backgroundColor: `${theme.colors.accent}20` }}
                                >
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${buildRate}%`,
                                            backgroundColor: buildRate === 100 ? '#10B981' : theme.colors.accent
                                        }}
                                    />
                                </div>
                                <span
                                    className="text-xs font-mono"
                                    style={{ color: theme.colors.text }}
                                >
                                    {buildRate}%
                                </span>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

// --- MAIN GAME BOARD COMPONENT ---

export const GameBoard: React.FC<GameBoardProps> = ({
    entities,
    theme,
    activeView,
    onViewChange,
    onEntityClick,
    onGapClick
}) => {
    return (
        <div className="space-y-6">
            {/* View Navigation */}
            <div className="flex justify-center">
                <ViewNavigation
                    activeView={activeView}
                    onViewChange={onViewChange}
                    theme={theme}
                />
            </div>

            {/* Active View */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeView === 'ECOSYSTEM' && (
                    <EcosystemMapView
                        entities={entities}
                        theme={theme}
                        onEntityClick={onEntityClick}
                    />
                )}
                {activeView === 'LAYERS' && (
                    <LayersView entities={entities} theme={theme} />
                )}
                {activeView === 'GAPS' && (
                    <GapTrackerView
                        entities={entities}
                        theme={theme}
                        onGapClick={onGapClick}
                    />
                )}
                {activeView === 'REVENUE' && (
                    <RevenueView entities={entities} theme={theme} />
                )}
                {activeView === 'REGISTRY' && (
                    <RegistryView
                        entities={entities}
                        theme={theme}
                        onEntityClick={onEntityClick}
                    />
                )}
            </div>
        </div>
    );
};

export default GameBoard;
