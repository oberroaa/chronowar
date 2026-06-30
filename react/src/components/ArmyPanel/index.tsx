import React, { useState } from 'react';
import type { UnitProduction, BuildingInfo } from '../../types/gameData';
import { raceColors } from '../../types/raceColors';
import { useGameStore } from '../../store/useGameStore';
import { formatName } from '../../utils/formatName';
import type { ArmyPanelProps, UnitImageDisplayProps, ArmyModalProps } from './types';
import {
  LeftPanelContainer,
  PanelHeader,
  HeaderOrbe,
  PanelTitle,
  Tabs,
  TabButton,
  UnitsContainer,
  UnitCard,
  UnitImageContainer,
  ImageContainer,
  UnitStaticImage,
  UnitGif,
  ImageFallback,
  UnitInfo,
  UnitNameContainer,
  UnitName,
  UnitAvailable,
  UnitStats,
  StatItem,
  StatLabel,
  StatValue,
  UnitCost,
  CostValue
} from './ArmyPanel.styles';
import {
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalFlexContainer,
  ModalImageSection,
  ModalInfoSection,
  ModalUnitImage,
  ModalTitle,
  ModalSubtitle,
  ModalInfoBox,
  ModalInfoRow,
  ModalInfoLabel,
  ModalInfoValue,
  ModalSection,
  ModalSectionTitle,
  StatsIcon,
  AbilityIcon,
  CostIcon,
  ModalStatsContainer,
  ModalStatsColumn,
  ModalStatItem,
  ModalStatLabel,
  ModalStatValue,
  ModalAbilityBox,
  ModalAbilityName,
  ModalAbilityDesc,
  ModalCostGrid,
  ModalCostItem,
  ModalCostIcon,
  ModalCostDetails,
  ModalCostAmount,
  ModalCostResource
} from './Modal.styles';

// Componente para mostrar la imagen de la unidad
const UnitImageDisplay: React.FC<UnitImageDisplayProps> = ({ unit, onUnitClick }) => {
  const [showGif, setShowGif] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [gifError, setGifError] = useState(false);

  return (
    <ImageContainer
      onMouseEnter={() => unit.gif && !gifError && setShowGif(true)}
      onMouseLeave={() => setShowGif(false)}
      onClick={(e) => {
        e.stopPropagation();
        onUnitClick(unit);
      }}
    >
      {!imgError && (
        <UnitStaticImage
          src={unit.image}
          alt={unit.name}
          onError={() => setImgError(true)}
          style={{ display: showGif ? 'none' : 'block' }}
        />
      )}

      {unit.gif && !gifError && (
        <UnitGif
          src={unit.gif}
          alt={`${unit.name} animation`}
          onError={() => setGifError(true)}
          style={{ display: showGif ? 'block' : 'none' }}
        />
      )}

      {(imgError || (gifError && showGif)) && (
        <ImageFallback>
          {formatName(unit.name)}
        </ImageFallback>
      )}
    </ImageContainer>
  );
};

// Componente del Modal
const ArmyModal: React.FC<ArmyModalProps> = ({
  unit,
  race,
  isOpen,
  onClose,
  onBuildingClick
}) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent $race={race} onClick={(e) => e.stopPropagation()}>
        <ModalCloseButton $race={race} onClick={onClose}>
          ×
        </ModalCloseButton>

        <ModalFlexContainer>
          <ModalImageSection>
            <ModalUnitImage src={unit.image} alt={unit.name} />
            <ModalTitle>{formatName(unit.name)}</ModalTitle>
            {unit.trainedAt && (
              <ModalSubtitle 
                onClick={() => onBuildingClick?.(unit.trainedAt!)}
                style={{ cursor: onBuildingClick ? 'pointer' : 'default', textDecoration: onBuildingClick ? 'underline' : 'none' }}
              >
                Trained at {formatName(unit.trainedAt)}
              </ModalSubtitle>
            )}

            <ModalInfoBox $race={race}>
              <ModalInfoRow>
                <ModalInfoLabel $race={race}>Available:</ModalInfoLabel>
                <ModalInfoValue>{unit.available}</ModalInfoValue>
              </ModalInfoRow>

              <ModalInfoRow>
                <ModalInfoLabel $race={race}>Build Time:</ModalInfoLabel>
                <ModalInfoValue>{unit.buildTime}s</ModalInfoValue>
              </ModalInfoRow>

              <ModalInfoRow>
                <ModalInfoLabel $race={race}>Combat Tier:</ModalInfoLabel>
                <ModalInfoValue>{unit.transportSize}</ModalInfoValue>
              </ModalInfoRow>


            </ModalInfoBox>
          </ModalImageSection>

          <ModalInfoSection>
            <ModalSection>
              <ModalSectionTitle $race={race}>
                <StatsIcon $race={race}>⚔️</StatsIcon> COMBAT STATISTICS
              </ModalSectionTitle>

              <ModalStatsContainer>
                <ModalStatsColumn>
                  <ModalStatItem>
                    <ModalStatLabel $race={race}>Health Points:</ModalStatLabel>
                    <ModalStatValue>
                      {unit.hp} HP
                    </ModalStatValue>
                  </ModalStatItem>

                  <ModalStatItem>
                    <ModalStatLabel $race={race}>Mana:</ModalStatLabel>
                    <ModalStatValue>
                      {unit.mana || 100} MP
                    </ModalStatValue>
                  </ModalStatItem>
                </ModalStatsColumn>

                <ModalStatsColumn>
                  <ModalStatItem>
                    <ModalStatLabel $race={race}>Attack:</ModalStatLabel>
                    <ModalStatValue>
                      {unit.attack} 
                      {unit.attackBonus ? <span style={{color: '#ffd700', fontSize: '0.8em', marginLeft: '4px'}}>(+{unit.attackBonus})</span> : null}
                    </ModalStatValue>
                  </ModalStatItem>

                  <ModalStatItem>
                    <ModalStatLabel $race={race}>Armor:</ModalStatLabel>
                    <ModalStatValue>
                      {unit.armor} 
                      {unit.armorBonus ? <span style={{color: '#ffd700', fontSize: '0.8em', marginLeft: '4px'}}>(+{unit.armorBonus})</span> : null}
                    </ModalStatValue>
                  </ModalStatItem>
                </ModalStatsColumn>
              </ModalStatsContainer>
            </ModalSection>

            <ModalSection>
              <ModalSectionTitle $race={race}>
                <AbilityIcon $race={race}>✨</AbilityIcon> SPECIAL ABILITIES
              </ModalSectionTitle>
              {unit.skillName && (
                <ModalAbilityBox $race={race}>
                  <ModalAbilityName $race={race}>{unit.skillName}</ModalAbilityName>
                  <ModalAbilityDesc>
                    {unit.skillDesc}
                  </ModalAbilityDesc>
                </ModalAbilityBox>
              )}
            </ModalSection>

            <ModalSection>
              <ModalSectionTitle $race={race}>
                <CostIcon $race={race}>📦</CostIcon> PRODUCTION COSTS
              </ModalSectionTitle>
              <ModalCostGrid>
                {unit.cost.gold ? (
                  <ModalCostItem $race={race}>
                    <ModalCostIcon>💰</ModalCostIcon>
                    <ModalCostDetails>
                      <ModalCostAmount>{unit.cost.gold}</ModalCostAmount>
                      <ModalCostResource>Gold</ModalCostResource>
                    </ModalCostDetails>
                  </ModalCostItem>
                ) : null}
                {unit.cost.supplies ? (
                  <ModalCostItem $race={race}>
                    <ModalCostIcon>📦</ModalCostIcon>
                    <ModalCostDetails>
                      <ModalCostAmount>{unit.cost.supplies}</ModalCostAmount>
                      <ModalCostResource>Supplies</ModalCostResource>
                    </ModalCostDetails>
                  </ModalCostItem>
                ) : null}
                {unit.cost.food ? (
                  <ModalCostItem $race={race}>
                    <ModalCostIcon>🍖</ModalCostIcon>
                    <ModalCostDetails>
                      <ModalCostAmount>{unit.cost.food}</ModalCostAmount>
                      <ModalCostResource>Food</ModalCostResource>
                    </ModalCostDetails>
                  </ModalCostItem>
                ) : null}
                {unit.cost.chrono ? (
                  <ModalCostItem $race={race}>
                    <ModalCostIcon>⏳</ModalCostIcon>
                    <ModalCostDetails>
                      <ModalCostAmount>{unit.cost.chrono}</ModalCostAmount>
                      <ModalCostResource>Chrono</ModalCostResource>
                    </ModalCostDetails>
                  </ModalCostItem>
                ) : null}
              </ModalCostGrid>
            </ModalSection>
          </ModalInfoSection>
        </ModalFlexContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

// Componente principal del panel de ejército
const ArmyPanel: React.FC<ArmyPanelProps> = ({
  isOpen,
  race,
  onUnitSelect,
  selectedUnits = [],
  gameUnits,
  onBuildingClick
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<UnitProduction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentRace = raceColors[race];

  // Función para obtener todas las unidades de los edificios
  const getAllUnits = () => {
    const allUnits: UnitProduction[] = [];
    const activeBuildingsData: Record<string, BuildingInfo> = useGameStore.getState().gameData || {};
    Object.values(activeBuildingsData).forEach((building: BuildingInfo) => {
      if (building.race === race && building.unitsProduced) {
        building.unitsProduced.forEach(unit => {
          allUnits.push(unit);
        });
      }
    });
    return allUnits;
  };

  // Usa las unidades del prop o obtiene todas las unidades
  const availableUnits = gameUnits || getAllUnits();

  // Agrupa las unidades por tipo
  const groupedUnits = availableUnits.reduce((acc, unit) => {
    const unitType = unit.unitType.toLowerCase();
    if (!acc[unitType]) {
      acc[unitType] = [];
    }
    acc[unitType].push(unit);
    return acc;
  }, {} as Record<string, UnitProduction[]>);

  // Calcula un valor para ordenar por tier (menor a mayor)
  const getUnitValue = (unit: UnitProduction) => {
    let baseValue = 0;
    if (unit.unitType === 'poblation') baseValue = 0;
    else if (unit.unitType === 'unit') baseValue = 10000;
    else if (unit.unitType === 'heroe') baseValue = 100000;
    
    // El costo sirve para diferenciar el tier dentro de la misma categoría
    const cost = (unit.cost.gold || 0) + (unit.cost.supplies || 0) + ((unit.cost.chrono || 0) * 5) + ((unit.cost.food || 0) * 10);
    return baseValue + cost;
  };

  // Tipos de unidades disponibles
  const unitTypes = Object.keys(groupedUnits);
  
  // Obtener unidades y ordenarlas por tier
  const displayUnits = (activeTab === 'all' ? availableUnits : groupedUnits[activeTab] || [])
    .slice()
    .sort((a, b) => getUnitValue(a) - getUnitValue(b));

  // Maneja el clic en una unidad
  const handleUnitClick = (unit: UnitProduction) => {
    setSelectedUnit(unit);
    setIsModalOpen(true);
  };

  return (
    <>
      <LeftPanelContainer $isOpen={isOpen} $race={race}>
        <PanelHeader $race={race}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
            <HeaderOrbe $race={race}>
              {currentRace.icon}
            </HeaderOrbe>
            <PanelTitle $race={race}>
              Army
            </PanelTitle>
          </div>
        </PanelHeader>

        <Tabs $race={race}>
          <TabButton
            $active={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            $race={race}
          >
            All
          </TabButton>
          {unitTypes.map((type) => (
            <TabButton
              key={type}
              $active={activeTab === type}
              onClick={() => setActiveTab(type)}
              $race={race}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </TabButton>
          ))}
        </Tabs>

        <UnitsContainer>
          {displayUnits.map((unit) => (
            <UnitCard
              key={unit.id}
              $race={race}
              $isSelected={selectedUnits.includes(unit.id)}
              onClick={() => onUnitSelect && onUnitSelect(unit.id)}
            >
              <UnitImageContainer>
                <UnitImageDisplay unit={unit} onUnitClick={handleUnitClick} />
              </UnitImageContainer>

              <UnitInfo>
                <UnitNameContainer>
                  <UnitName $race={race}>{formatName(unit.name).toUpperCase()}</UnitName>
                  <UnitAvailable $race={race}>{unit.available}</UnitAvailable>
                </UnitNameContainer>

                <UnitStats $race={race}>
                  <StatItem title="Health Points">
                    <StatLabel $race={race}>❤️</StatLabel>
                    <StatValue>{unit.hp}</StatValue>
                  </StatItem>
                  <StatItem title="Mana">
                    <StatLabel $race={race}>⚡</StatLabel>
                    <StatValue>{unit.mana || 100}</StatValue>
                  </StatItem>
                  <StatItem title="Attack Damage">
                    <StatLabel $race={race}>⚔️</StatLabel>
                    <StatValue>
                      {unit.attack}
                      {unit.attackBonus ? <span style={{color: '#ffd700', fontSize: '0.8em', marginLeft: '4px'}}>(+{unit.attackBonus})</span> : null}
                    </StatValue>
                  </StatItem>
                  <StatItem title="Armor / Defense">
                    <StatLabel $race={race}>🛡️</StatLabel>
                    <StatValue>
                      {unit.armor}
                      {unit.armorBonus ? <span style={{color: '#ffd700', fontSize: '0.8em', marginLeft: '4px'}}>(+{unit.armorBonus})</span> : null}
                    </StatValue>
                  </StatItem>
                </UnitStats>

                <UnitCost $race={race}>
                  <CostValue>
                    {unit.cost.gold ? `${unit.cost.gold} 💰 ` : ''}
                    {unit.cost.supplies ? `${unit.cost.supplies} 📦 ` : ''}
                    {unit.cost.food ? `${unit.cost.food} 🍖 ` : ''}
                    {unit.cost.chrono ? `${unit.cost.chrono} ⏳ ` : ''}
                  </CostValue>
                </UnitCost>
              </UnitInfo>
            </UnitCard>
          ))}
        </UnitsContainer>
      </LeftPanelContainer>

      {isModalOpen && selectedUnit && (
        <ArmyModal
          unit={selectedUnit}
          race={race}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onBuildingClick={onBuildingClick}
        />
      )}
    </>
  );
};

export default ArmyPanel;