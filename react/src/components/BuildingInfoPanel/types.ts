import React from 'react';
import { type ResourceType, type RaceType, type UnitProduction } from '../../types/gameData';
import { raceColors } from '../../types/raceColors';

// Tipo para información de mejoras
export type UpgradeInfo = {
    name: string;
    cost: Partial<Record<ResourceType, number>>;
    time: number;
    description: string;
};

// Props para el componente BuildingInfoPanel
export type BuildingInfoModalProps = {
    buildingId: string | null;
    onClose: () => void;
    resources: Record<ResourceType, number>;
    setResources: React.Dispatch<React.SetStateAction<Record<ResourceType, number>>>;
    race: RaceType;
    buildings: { id: string, level: number }[];
    onBuildingUpgraded: (buildingId: string, newLevel: number) => void;
    currentLevel: number;
    gameUnits: UnitProduction[];
    setGameUnits: React.Dispatch<React.SetStateAction<UnitProduction[]>>;
};

// Tipo para item de cola de producción
export type ProductionQueueItem = {
    unit: string;
    timeLeft: number;
    buildingId: string;
    startedAt: number;
};

// Tipo para item de cola de mejoras
export type UpgradeQueueItem = {
    upgrade: string;
    timeLeft: number;
    buildingId: string;
};

// Props para componentes con estilos
export type StyledProps = {
    $primaryColor: string;
    $secondaryColor: string;
    $accentColor: string;
    $darkColor: string;
};

export type ResourceCostProps = {
    $type: ResourceType;
};

export type ButtonStateProps = {
    $canAfford?: boolean;
    $producing?: boolean;
    $upgrading?: boolean;
};

export { raceColors };