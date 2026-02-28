import React, { useState, useEffect, useRef } from 'react';
import { buildingsData } from '../../types/jsonResponse';
import { type ResourceType, type UnitProduction, getResourceIcon } from '../../types/gameData';
// Importaciones de tipos
import {
    type BuildingInfoModalProps,
    type ProductionQueueItem,
    type UpgradeQueueItem,
    type UpgradeInfo,
    raceColors
} from './types';

// Importaciones de estilos
import {
    ModalOverlay,
    ModalContainer,
    CloseButton
} from './Modal.styles';

import {
    BuildingTitle,
    BuildingDescription,
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
    buildings,
    onBuildingUpgraded,
    gameUnits,
    setGameUnits,
}) => {
    // Estado para los niveles de los edificios
    const [buildingLevels, setBuildingLevels] = useState<Record<string, number>>(() => {
        const initialLevels: Record<string, number> = {};
        buildings.forEach(b => {
            initialLevels[b.id] = b.level;
        });
        return initialLevels;
    });

    // Estado para la cola de producción de unidades
    const [productionQueue, setProductionQueue] = useState<ProductionQueueItem[]>([]);

    // Estado para la cola de mejoras de edificios
    const [upgradeQueue, setUpgradeQueue] = useState<UpgradeQueueItem[]>([]);

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

    // Efecto para la producción de unidades (se ejecuta cada segundo)
    useEffect(() => {
        const timer = setInterval(() => {
            setProductionQueue(prevQueue => {
                const newQueue: typeof prevQueue = [];
                const unitsToAdd: string[] = [];

                prevQueue.forEach(item => {
                    if (item.timeLeft <= 1) {
                        const unitKey = `${item.unit}-${item.startedAt}`;
                        if (!completedUnitsRef.current.has(unitKey)) {
                            unitsToAdd.push(item.unit);
                            completedUnitsRef.current.add(unitKey);
                        }
                    } else {
                        newQueue.push({
                            ...item,
                            timeLeft: item.timeLeft - 1
                        });
                    }
                });

                // Agrega unidades completadas al juego
                if (unitsToAdd.length > 0) {
                    setGameUnits(prevUnits => {
                        return prevUnits.map(unit => {
                            const count = unitsToAdd.filter(u => u === unit.name).length;
                            return count > 0
                                ? { ...unit, available: (unit.available || 0) + count }
                                : unit;
                        });
                    });
                }

                return newQueue;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [setGameUnits]);

    // Efecto para las mejoras de edificios (se ejecuta cada segundo)
    useEffect(() => {
        const timer = setInterval(() => {
            setUpgradeQueue(prev => {
                const updated = prev.map(item => ({
                    ...item,
                    timeLeft: item.timeLeft - 1
                })).filter(item => item.timeLeft > 0);

                // Procesa mejoras completadas
                const completed = prev.filter(item => item.timeLeft === 1);
                completed.forEach(item => {
                    const newLevel = (buildingLevels[item.buildingId] || 1) + 1;
                    setBuildingLevels(prev => ({
                        ...prev,
                        [item.buildingId]: newLevel
                    }));
                    onBuildingUpgraded(item.buildingId, newLevel);
                });

                return updated;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [buildingLevels, onBuildingUpgraded]);

    const currentRaceStyle = raceColors[race];

    if (!buildingId) return null;

    // Encuentra el edificio actual
    const building = Object.values(buildingsData).find(b => b.name === buildingId);
    if (!building) return null;

    // Verifica si el jugador puede pagar un costo
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

        // Agrega a la cola de mejoras
        setUpgradeQueue(prev => [
            ...prev,
            {
                upgrade: upgrade.name,
                timeLeft: upgrade.time,
                buildingId: buildingId
            }
        ]);
    };

    // Encuentra el edificio principal y su nivel
    const mainBuilding = Object.values(buildingsData).find(b => b.main);
    const mainBuildingName = mainBuilding?.name || null;
    const mainBuildingLevel = mainBuildingName ? buildingLevels[mainBuildingName] || 1 : 1;

    // Maneja la mejora de nivel del edificio
    const handleLevelUp = () => {
        if (!buildingId) return;
        const currentLevel = buildingLevels[buildingId] || 1;

        // Verifica requisitos de edificio principal
        if (mainBuildingName !== null && buildingId !== mainBuildingName && currentLevel >= buildingLevels[mainBuildingName]) {
            alert(`You need to upgrade your ${mainBuildingName} to level ${currentLevel + 1} first!`);
            return;
        }

        const buildingData = Object.values(buildingsData).find(b => b.name === buildingId);
        if (!buildingData) return;

        // Calcula costo de mejora
        const levelUpCost = {
            gold: buildingData.buildCost.gold * currentLevel,
            wood: buildingData.buildCost.wood * currentLevel,
            stone: buildingData.buildCost.stone * currentLevel
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

        // Agrega a la cola de mejoras
        const upgradeTime = buildingData.buildTime;
        setUpgradeQueue(prev => [
            ...prev,
            {
                upgrade: `Level ${currentLevel + 1}`,
                timeLeft: upgradeTime,
                buildingId: buildingId
            }
        ]);
    };

    // Renderiza el costo de recursos
    const renderResourceCost = (cost: Partial<Record<ResourceType, number>>) => {
        return Object.entries(cost).map(([resource, amount]) => (
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
    const currentBuildingLevel = buildingLevels[buildingId] || 1;

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

                <PopulationDisplay $secondaryColor={currentRaceStyle.secondaryColor}>
                    Población disponible: {availablePopulation}
                </PopulationDisplay>

                <BuildingDescription>{building.description}</BuildingDescription>

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
                        {building.unitsProduced.map((unit, index) => {
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
                                            {renderResourceCost(unit.cost)}
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
                                                                ? `Entrenando en ${building.name}`
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
                        {building.upgradesAvailable.map((upgrade, index) => {
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
                    {mainBuildingName !== null && currentBuildingLevel >= mainBuildingLevel && buildingId !== mainBuildingName && (
                        <UpgradeWarning $accentColor={currentRaceStyle.accentColor}>
                            You need to upgrade your {mainBuildingName} to level {currentBuildingLevel + 1} first!
                        </UpgradeWarning>
                    )}

                    <LevelUpCost>
                        {renderResourceCost({
                            gold: building.buildCost.gold * currentBuildingLevel,
                            wood: building.buildCost.wood * currentBuildingLevel,
                            stone: building.buildCost.stone * currentBuildingLevel
                        })}
                        <TimeBadge>⏱️ 60s</TimeBadge>
                    </LevelUpCost>

                    <LevelUpButton
                        onClick={handleLevelUp}
                        disabled={
                            !canAfford({
                                gold: building.buildCost.gold * currentBuildingLevel,
                                wood: building.buildCost.wood * currentBuildingLevel,
                                stone: building.buildCost.stone * currentBuildingLevel
                            }) ||
                            isAnyUpgradeInProgress ||
                            (mainBuildingName !== null && buildingId !== mainBuildingName && currentBuildingLevel >= mainBuildingLevel)
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