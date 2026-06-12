import React, { useState, useEffect, useRef } from 'react';
import { useGameStore, type UpgradeQueueItem } from '../../store/useGameStore';
import { type ResourceType, type UnitProduction, type BuildingInfo, getResourceIcon } from '../../types/gameData';
// Importaciones de tipos
import {
    type BuildingInfoModalProps,
    type ProductionQueueItem,
    type UpgradeInfo,
    raceColors
} from './types';
import TradingChart from '../TradingChart';

// Importaciones de estilos
import {
    ModalOverlay,
    ModalContainer,
    CloseButton
} from './Modal.styles';

import {
    BuildingTitle,
    QueueStatus,
    QueueItem,
    BuildingSection,
    SectionTitle,
    UnitItem,
    UnitInfo,
    UnitNameContainer,
    UnitImage,
    UnitName,
    UnitCost,
    UpgradeItem,
    UpgradeInfo as UpgradeInfoStyled,
    UpgradeName,
    UpgradeDescription,
    UpgradeCost,
    UpgradeStatus,
    LevelUpSection,
    LevelUpCost,
    ResourceCost,
    TimeBadge,
    ProductionButton,
    UpgradeButton,
    LevelUpButton,
    UpgradeWarning,
    QuantityBadge,
    PopulationDisplay
} from './BuildingInfoPanel.styles';

// Componente principal del panel de información de edificios
export const BuildingInfoPanel: React.FC<BuildingInfoModalProps> = ({
    buildingId,
    onClose,
    resources,
    setResources,
    race,
    onBuildingUpgraded: _onBuildingUpgraded,
    gameUnits,
    setGameUnits,
}) => {

    // Estado para la cola de producción de unidades
    const [productionQueue, setProductionQueue] = useState<ProductionQueueItem[]>([]);

    // Cola de mejoras de nivel: ahora viene del store global (persiste al ir a batalla)
    const upgradeQueue: UpgradeQueueItem[] = useGameStore(s => s.upgradeQueue);
    const addUpgradeToQueue = useGameStore(s => s.addUpgradeToQueue);
    const storeBuildingLevels = useGameStore(s => s.buildingLevels);
    const [buildingLevels, setBuildingLevels] = useState<Record<string, number>>(storeBuildingLevels);

    // Referencia para unidades completadas (evita duplicados)
    const completedUnitsRef = useRef<Set<string>>(new Set());

    // Efecto para manejar la tecla Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    useEffect(() => {
        const timer = setInterval(() => {
            setProductionQueue(prevQueue => {
                const newQueue = prevQueue.map(item => ({ ...item, timeLeft: item.timeLeft - 1 }));
                const finishedUnits = newQueue.filter(item => item.timeLeft <= 0);

                if (finishedUnits.length > 0) {
                    setTimeout(() => {
                        setGameUnits(prevUnits => {
                            let changed = false;
                            let updatedUnits = [...prevUnits];
                            finishedUnits.forEach(item => {
                                const unitKey = `${item.unit}-${item.startedAt}`;
                                if (!completedUnitsRef.current.has(unitKey)) {
                                    completedUnitsRef.current.add(unitKey);
                                    changed = true;
                                    updatedUnits = updatedUnits.map(unit =>
                                        unit.name === item.unit
                                            ? { ...unit, available: (unit.available || 0) + 1 }
                                            : unit
                                    );
                                }
                            });
                            return changed ? updatedUnits : prevUnits;
                        });
                    }, 0);
                }

                return newQueue.filter(item => item.timeLeft > 0);
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Sincroniza buildingLevels locales con el store global (cuando App.tsx sube el nivel)
    useEffect(() => {
        setBuildingLevels(storeBuildingLevels);
    }, [storeBuildingLevels]);

    const activeBuildingsData: Record<string, BuildingInfo> = useGameStore.getState().gameData || {};

    if (!buildingId) return null;

    const building = Object.values(activeBuildingsData).find((b: BuildingInfo) => b.name === buildingId);
    if (!building) return null;

    const currentRaceStyle = raceColors[race];

    const canAfford = (costs: Partial<Record<ResourceType, number>>): boolean => {
        return Object.entries(costs).every(([resource, amount]) => {
            return resources[resource as ResourceType] >= (amount || 0);
        });
    };

    // Maneja la producción de una unidad
    const handleProduceUnit = (unit: UnitProduction) => {
        if (isProducing(unit.name)) {
            alert(`Ya estás entrenando ${unit.name}!`);
            return;
        }

        // Verifica límite de héroes
        if (unit.unitType === 'heroe') {
            const heroExists = gameUnits.some(u =>
                u.unitType === 'heroe' &&
                u.name === unit.name &&
                u.available > 0
            );
            if (heroExists) {
                alert(`¡Ya tienes un ${unit.name}! Solo puedes tener uno.`);
                return;
            }
        }

        if (!canAfford(unit.cost)) {
            alert("Not enough resources!");
            return;
        }

        const unitToTrain = gameUnits.find(u => u.name === unit.name);
        if (!unitToTrain) {
            alert("Unit not found!");
            return;
        }

        // Maneja población para unidades no-población
        let populationToUse = null;
        if (unitToTrain.unitType !== 'poblation') {
            const populationUnits = gameUnits.filter(u => u.unitType === 'poblation');
            const totalAvailablePopulation = populationUnits.reduce((sum, u) => sum + (u.available || 0), 0);

            if (totalAvailablePopulation <= 0) {
                alert("Not enough available population!");
                return;
            }

            populationToUse = populationUnits.find(u => u.available > 0);
            if (!populationToUse) {
                alert("No population slots available!");
                return;
            }
        }

        // Deduce recursos
        const newResources = { ...resources };
        Object.entries(unit.cost).forEach(([resource, amount]) => {
            newResources[resource as ResourceType] -= amount || 0;
        });
        setResources(newResources);

        // Actualiza población si es necesario
        setGameUnits(prevUnits => {
            return prevUnits.map(u => {
                if (unitToTrain.unitType !== 'poblation' && u.id === populationToUse?.id) {
                    return { ...u, available: u.available - 1 };
                }
                return u;
            });
        });

        // Agrega a la cola de producción
        setProductionQueue(prev => [...prev, {
            unit: unit.name,
            timeLeft: unit.buildTime,
            buildingId: buildingId,
            startedAt: Date.now() // Identificador único
        }]);
    };

    // Calcula población disponible
    const availablePopulation = gameUnits
        .filter(u => u.unitType === 'poblation')
        .reduce((sum, u) => sum + (u.available || 0), 0);

    // Maneja la aplicación de mejoras
    const handleApplyUpgrade = (upgrade: UpgradeInfo) => {
        if (!canAfford(upgrade.cost)) {
            alert("Not enough resources!");
            return;
        }

        // Deduce recursos
        const newResources = { ...resources };
        Object.entries(upgrade.cost).forEach(([resource, amount]) => {
            newResources[resource as ResourceType] -= amount || 0;
        });
        setResources(newResources);

        // Agrega a la cola de mejoras global
        addUpgradeToQueue({
            upgrade: upgrade.name,
            timeLeft: upgrade.time,
            buildingId: buildingId,
            startedAt: Date.now()
        });
    };

    // Encuentra el edificio principal y su nivel
    const mainBuilding = Object.values(activeBuildingsData).find((b: BuildingInfo) => b.main);
    const mainBuildingName = mainBuilding?.name || null;
    const mainBuildingLevel = mainBuildingName ? buildingLevels[mainBuildingName.toLowerCase()] ?? 0 : 0;

    // Maneja la mejora de nivel del edificio
    const handleLevelUp = () => {
        if (!buildingId) return;
        const currentLevel = buildingLevels[buildingId.toLowerCase()] ?? 0;

        // Verifica requisitos de edificio principal
        if (mainBuildingName !== null && buildingId.toLowerCase() !== mainBuildingName.toLowerCase() && currentLevel >= (buildingLevels[mainBuildingName.toLowerCase()] ?? 0)) {
            alert(`You need to upgrade your ${mainBuildingName} to level ${currentLevel + 1} first!`);
            return;
        }

        const buildingData = Object.values(activeBuildingsData).find((b: BuildingInfo) => b.name === buildingId);
        if (!buildingData) return;

        // Calcula costo de mejora
        const costMultiplier = Math.max(1, currentLevel);
        const levelUpCost = {
            gold: buildingData.buildCost.gold * costMultiplier,
            wood: buildingData.buildCost.wood * costMultiplier,
            stone: buildingData.buildCost.stone * costMultiplier
        };

        if (!canAfford(levelUpCost)) {
            alert("Not enough resources for level up!");
            return;
        }

        // Deduce recursos
        const newResources = { ...resources };
        Object.entries(levelUpCost).forEach(([resource, amount]) => {
            newResources[resource as ResourceType] -= amount || 0;
        });
        setResources(newResources);

        // Agrega a la cola de mejoras GLOBAL (persiste al ir a batalla)
        const upgradeTime = buildingData.buildTime;
        addUpgradeToQueue({
            upgrade: `Level ${currentLevel + 1}`,
            timeLeft: upgradeTime,
            buildingId: buildingId,
            startedAt: Date.now()
        });
    };

    // Renderiza el costo de recursos
    const renderResourceCost = (cost: Partial<Record<ResourceType, number>>) => {
        return Object.entries(cost)
            .filter(([_, amount]) => amount && amount > 0)
            .map(([resource, amount]) => (
                <ResourceCost key={resource} $type={resource as ResourceType}>
                    {getResourceIcon(resource as ResourceType)} {amount}
                </ResourceCost>
            ));
    };

    // Verifica si una unidad está en producción
    const isProducing = (unitName: string) => {
        return productionQueue.some(
            item => item.unit === unitName && item.buildingId === buildingId
        );
    };

    // Verifica si una mejora está en progreso
    const isUpgrading = (upgradeName: string, buildingIdToCheck: string) => {
        return upgradeQueue.some(
            item => item.upgrade === upgradeName && item.buildingId === buildingIdToCheck
        );
    };

    // Obtiene el tiempo restante para una unidad o mejora
    const getRemainingTime = (name: string, type: 'unit' | 'upgrade') => {
        if (type === 'unit') {
            const item = productionQueue.find(
                item => item.unit === name && item.buildingId === buildingId
            );
            return item ? item.timeLeft : 0;
        } else {
            const item = upgradeQueue.find(item => item.upgrade === name && item.buildingId === buildingId);
            return item ? item.timeLeft : 0;
        }
    };

    // Variables de estado para la UI
    const isLevelUpgrading = upgradeQueue.some(
        item => item.upgrade.startsWith('Level') && item.buildingId === buildingId
    );
    const currentLevelUpgrade = upgradeQueue.find(
        item => item.upgrade.startsWith('Level') && item.buildingId === buildingId
    );
    const isAnyUpgradeInProgress = upgradeQueue.length > 0;
    const isThisBuildingTraining = productionQueue.some(
        item => item.buildingId === buildingId
    );
    const currentUpgrade = upgradeQueue.find(
        (item) => item.buildingId === buildingId
    );
    const currentBuildingLevel = buildingLevels[buildingId.toLowerCase()] ?? 0;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContainer
                onClick={(e) => e.stopPropagation()}
                $primaryColor={currentRaceStyle.primaryColor}
                $secondaryColor={currentRaceStyle.secondaryColor}
                $accentColor={currentRaceStyle.accentColor}
                $darkColor={currentRaceStyle.darkColor}
            >
                <CloseButton
                    $secondaryColor={currentRaceStyle.secondaryColor}
                    $primaryColor={currentRaceStyle.primaryColor}
                    onClick={onClose}
                >
                    ×
                </CloseButton>

                <BuildingTitle $secondaryColor={currentRaceStyle.secondaryColor}>
                    {building.name} (Level {currentBuildingLevel})
                    {currentUpgrade && (
                        <UpgradeStatus $accentColor={currentRaceStyle.accentColor}>
                            Upgrading <strong>{building.name}</strong>: {currentUpgrade.upgrade} ({currentUpgrade.timeLeft}s)
                        </UpgradeStatus>
                    )}
                </BuildingTitle>

                {building.name !== "Market" && (
                    <PopulationDisplay $secondaryColor={currentRaceStyle.secondaryColor}>
                        Población disponible: {availablePopulation}
                    </PopulationDisplay>
                )}

                {/* Se eliminó la descripción redundante a petición del usuario */}

                {building.name === "Market" && <TradingChart />}

                {/* Muestra colas de producción y mejoras */}
                {(productionQueue.length > 0 || upgradeQueue.length > 0) && (
                    <QueueStatus $secondaryColor={currentRaceStyle.secondaryColor}>
                        {productionQueue.map((item, index) => (
                            <QueueItem key={`unit-${index}`} $accentColor={currentRaceStyle.accentColor}>
                                Producing {item.unit}... {item.timeLeft}s
                            </QueueItem>
                        ))}
                        {upgradeQueue.map((item, index) => {
                            const buildingName = item.buildingId;
                            return (
                                <QueueItem key={`upgrade-${index}`} $accentColor={currentRaceStyle.accentColor}>
                                    {item.upgrade.startsWith('Level')
                                        ? `Upgrading ${buildingName} to ${item.upgrade}... ${item.timeLeft}s`
                                        : `Upgrading ${buildingName}: ${item.upgrade}... ${item.timeLeft}s`}
                                </QueueItem>
                            );
                        })}
                    </QueueStatus>
                )}

                {/* Sección de entrenamiento de unidades */}
                {building.unitsProduced.length > 0 && (
                    <BuildingSection $primaryColor={currentRaceStyle.primaryColor}>
                        <SectionTitle $secondaryColor={currentRaceStyle.secondaryColor} $accentColor={currentRaceStyle.accentColor}>
                            Train Units
                        </SectionTitle>
                        {building.unitsProduced.map((unit: any, index: number) => {
                            const producing = isProducing(unit.name);
                            const canAffordUnit = canAfford(unit.cost);
                            const unitToTrain = gameUnits.find(u => u.name === unit.name);
                            const hasPopulation = unitToTrain?.unitType === 'poblation' || availablePopulation > 0;
                            const isHero = unit.unitType === 'heroe';
                            const heroExists = isHero && (unitToTrain?.available ?? 0) > 0;
                            const isThisBuildingUpgrading = upgradeQueue.some(item => item.buildingId === buildingId);
                            const canTrain = canAffordUnit && hasPopulation &&
                                !isThisBuildingTraining && !producing &&
                                (!isHero || !heroExists) &&
                                !isThisBuildingUpgrading;
                            return (
                                <UnitItem key={index}>
                                    <UnitInfo>
                                        <UnitNameContainer>
                                            <UnitImage src={unit.image} alt={unit.name} />
                                            <UnitName $secondaryColor={currentRaceStyle.secondaryColor}>
                                                {unit.name}
                                                {unitToTrain && (
                                                    <QuantityBadge
                                                        $secondaryColor={currentRaceStyle.secondaryColor}
                                                        $primaryColor={currentRaceStyle.primaryColor}
                                                    >
                                                        {unitToTrain?.available ?? 0}
                                                    </QuantityBadge>
                                                )}
                                            </UnitName>
                                        </UnitNameContainer>
                                        <UnitCost>
                                            {renderResourceCost({ gold: unit.cost.gold, food: unit.cost.food })}
                                            <TimeBadge>⏱️ {unit.buildTime}s</TimeBadge>
                                        </UnitCost>
                                    </UnitInfo>
                                    <ProductionButton
                                        onClick={() => handleProduceUnit(unit)}
                                        disabled={!canTrain || isThisBuildingUpgrading}
                                        $canAfford={canTrain}
                                        $producing={producing}
                                        $primaryColor={currentRaceStyle.primaryColor}
                                        $secondaryColor={currentRaceStyle.secondaryColor}
                                        $darkColor={currentRaceStyle.darkColor}
                                        $accentColor={currentRaceStyle.accentColor}
                                    >
                                        {isThisBuildingUpgrading
                                            ? 'Edificio en mejora'
                                            : producing
                                                ? `Entrenando... (${getRemainingTime(unit.name, 'unit')}s)`
                                                : unit.unitType === 'heroe' && unitToTrain?.available
                                                    ? 'Límite de héroe alcanzado'
                                                    : !canAffordUnit
                                                        ? 'Recursos insuficientes'
                                                        : !hasPopulation
                                                            ? 'Población insuficiente'
                                                            : isThisBuildingTraining
                                                                ? 'En uso'
                                                                : 'Entrenar'}
                                    </ProductionButton>
                                </UnitItem>
                            );
                        })}
                    </BuildingSection>
                )}

                {/* Sección de mejoras de edificio */}
                {building.upgradesAvailable.length > 0 && (
                    <BuildingSection $primaryColor={currentRaceStyle.primaryColor}>
                        <SectionTitle $secondaryColor={currentRaceStyle.secondaryColor} $accentColor={currentRaceStyle.accentColor}>
                            Building Upgrades
                        </SectionTitle>
                        {building.upgradesAvailable.map((upgrade: any, index: number) => {
                            const upgrading = isUpgrading(upgrade.name, buildingId);
                            const canAffordUpgrade = canAfford(upgrade.cost);

                            return (
                                <UpgradeItem key={index}>
                                    <UpgradeInfoStyled>
                                        <UpgradeName $secondaryColor={currentRaceStyle.secondaryColor}>
                                            {upgrade.name}
                                        </UpgradeName>
                                        <UpgradeDescription>{upgrade.description}</UpgradeDescription>
                                        <UpgradeCost>
                                            {renderResourceCost(upgrade.cost)}
                                            <TimeBadge>⏱️ {upgrade.time}s</TimeBadge>
                                        </UpgradeCost>
                                    </UpgradeInfoStyled>
                                    <UpgradeButton
                                        onClick={() => handleApplyUpgrade(upgrade)}
                                        disabled={upgrading || !canAffordUpgrade || isAnyUpgradeInProgress}
                                        $canAfford={canAffordUpgrade}
                                        $upgrading={upgrading}
                                        $primaryColor={currentRaceStyle.primaryColor}
                                        $secondaryColor={currentRaceStyle.secondaryColor}
                                        $darkColor={currentRaceStyle.darkColor}
                                        $accentColor={currentRaceStyle.accentColor}
                                    >
                                        {upgrading
                                            ? `Upgrading... (${getRemainingTime(upgrade.name, 'upgrade')}s)`
                                            : canAffordUpgrade
                                                ? isAnyUpgradeInProgress ? 'Another upgrade in progress' : 'Upgrade'
                                                : 'Need Resources'}
                                    </UpgradeButton>
                                </UpgradeItem>
                            );
                        })}
                    </BuildingSection>
                )}

                {/* Sección de mejora de nivel */}
                <LevelUpSection $secondaryColor={currentRaceStyle.secondaryColor}>
                    <SectionTitle $secondaryColor={currentRaceStyle.secondaryColor} $accentColor={currentRaceStyle.accentColor}>
                        Upgrade Building (Level {currentBuildingLevel + 1})
                    </SectionTitle>

                    {/* Advertencia si se necesita mejorar el edificio principal primero */}
                    {mainBuildingName !== null && currentBuildingLevel >= mainBuildingLevel && buildingId.toLowerCase() !== mainBuildingName.toLowerCase() && (
                        <UpgradeWarning $accentColor={currentRaceStyle.accentColor}>
                            You need to upgrade your {mainBuildingName} to level {currentBuildingLevel + 1} first!
                        </UpgradeWarning>
                    )}

                    <LevelUpCost>
                        {renderResourceCost({
                            gold: building.buildCost.gold * Math.max(1, currentBuildingLevel),
                            wood: building.buildCost.wood * Math.max(1, currentBuildingLevel),
                            stone: building.buildCost.stone * Math.max(1, currentBuildingLevel)
                        })}
                        <TimeBadge>⏱️ 60s</TimeBadge>
                    </LevelUpCost>

                    <LevelUpButton
                        onClick={handleLevelUp}
                        disabled={
                            !canAfford({
                                gold: building.buildCost.gold * Math.max(1, currentBuildingLevel),
                                wood: building.buildCost.wood * Math.max(1, currentBuildingLevel),
                                stone: building.buildCost.stone * Math.max(1, currentBuildingLevel)
                            }) ||
                            isAnyUpgradeInProgress ||
                            (mainBuildingName !== null && buildingId.toLowerCase() !== mainBuildingName.toLowerCase() && currentBuildingLevel >= mainBuildingLevel)
                        }
                        $primaryColor={currentRaceStyle.primaryColor}
                        $secondaryColor={currentRaceStyle.secondaryColor}
                        $darkColor={currentRaceStyle.darkColor}
                    >
                        {isLevelUpgrading
                            ? `Upgrading to Level ${currentBuildingLevel + 1} (${currentLevelUpgrade?.timeLeft}s)`
                            : isAnyUpgradeInProgress
                                ? 'Another upgrade in progress'
                                : `Upgrade to Level ${currentBuildingLevel + 1}`}
                    </LevelUpButton>
                </LevelUpSection>
            </ModalContainer>
        </ModalOverlay>
    );
};

export default BuildingInfoPanel;