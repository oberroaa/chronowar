import React, { useState } from 'react';
import type { UnitProduction } from '../../types/gameData';
import { raceColors } from '../../types/raceColors';
import { buildingsData } from '../../types/jsonResponse';
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
  CostValue,
  GoldIcon
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
  RegenText,
  SmallText,
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
          {unit.name}
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
  getAbilityDescription,
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
            <ModalTitle>{unit.name}</ModalTitle>

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
                <ModalInfoLabel $race={race}>Transport Size:</ModalInfoLabel>
                <ModalInfoValue>{unit.transportSize}</ModalInfoValue>
              </ModalInfoRow>

              <ModalInfoRow>
                <ModalInfoLabel $race={race}>Carry Capacity:</ModalInfoLabel>
                <ModalInfoValue>📦 {unit.carryCapacity}</ModalInfoValue>
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
                      {unit.hpRegen > 0 && (
                        <RegenText $race={race}> (+{unit.hpRegen}/s)</RegenText>
                      )}
                    </ModalStatValue>
                  </ModalStatItem>

                  <ModalStatItem>
                    <ModalStatLabel $race={race}>Attack:</ModalStatLabel>
                    <ModalStatValue>
                      {unit.attack} <SmallText>({unit.weaponType})</SmallText>
                    </ModalStatValue>
                  </ModalStatItem>
                </ModalStatsColumn>

                <ModalStatsColumn>
                  <ModalStatItem>
                    <ModalStatLabel $race={race}>Mana:</ModalStatLabel>
                    <ModalStatValue>
                      {unit.mana || 0} MP
                      {unit.manaRegen > 0 && (
                        <RegenText $race={race}> (+{unit.manaRegen}/s)</RegenText>
                      )}
                    </ModalStatValue>
                  </ModalStatItem>

                  <ModalStatItem>
                    <ModalStatLabel $race={race}>Armor:</ModalStatLabel>
                    <ModalStatValue>
                      {unit.armor} <SmallText>({unit.armorType})</SmallText>
                    </ModalStatValue>
                  </ModalStatItem>

                  <ModalStatItem>
                    <ModalStatLabel $race={race}>Carry Capacity:</ModalStatLabel>
                    <ModalStatValue>
                      📦 {unit.carryCapacity} <SmallText>resources</SmallText>
                    </ModalStatValue>
                  </ModalStatItem>
                </ModalStatsColumn>
              </ModalStatsContainer>
            </ModalSection>

            <ModalSection>
              <ModalSectionTitle $race={race}>
                <AbilityIcon $race={race}>✨</AbilityIcon> SPECIAL ABILITY
              </ModalSectionTitle>
              <ModalAbilityBox $race={race}>
                <ModalAbilityName $race={race}>{unit.special}</ModalAbilityName>
                <ModalAbilityDesc>
                  {getAbilityDescription(unit.special)}
                </ModalAbilityDesc>
              </ModalAbilityBox>
            </ModalSection>

            <ModalSection>
              <ModalSectionTitle $race={race}>
                <CostIcon $race={race}>📦</CostIcon> PRODUCTION COSTS
              </ModalSectionTitle>
              <ModalCostGrid>
                <ModalCostItem $race={race}>
                  <ModalCostIcon>💰</ModalCostIcon>
                  <ModalCostDetails>
                    <ModalCostAmount>{unit.cost.gold}</ModalCostAmount>
                    <ModalCostResource>Gold</ModalCostResource>
                  </ModalCostDetails>
                </ModalCostItem>

                {unit.cost.wood && (
                  <ModalCostItem $race={race}>
                    <ModalCostIcon>🪵</ModalCostIcon>
                    <ModalCostDetails>
                      <ModalCostAmount>{unit.cost.wood}</ModalCostAmount>
                      <ModalCostResource>Wood</ModalCostResource>
                    </ModalCostDetails>
                  </ModalCostItem>
                )}

                {unit.cost.stone && (
                  <ModalCostItem $race={race}>
                    <ModalCostIcon>🪨</ModalCostIcon>
                    <ModalCostDetails>
                      <ModalCostAmount>{unit.cost.stone}</ModalCostAmount>
                      <ModalCostResource>Stone</ModalCostResource>
                    </ModalCostDetails>
                  </ModalCostItem>
                )}

                {unit.cost.food && (
                  <ModalCostItem $race={race}>
                    <ModalCostIcon>🍖</ModalCostIcon>
                    <ModalCostDetails>
                      <ModalCostAmount>{unit.cost.food}</ModalCostAmount>
                      <ModalCostResource>Food</ModalCostResource>
                    </ModalCostDetails>
                  </ModalCostItem>
                )}
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
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<UnitProduction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentRace = raceColors[race];

  // Función para obtener todas las unidades de los edificios
  const getAllUnits = () => {
    const allUnits: UnitProduction[] = [];
    Object.values(buildingsData).forEach(building => {
      if (building.race === race && building.unitsProduced) {
        building.unitsProduced.forEach(unit => {
          const unitWithMana = {
            ...unit,
            mana: unit.mana || 0,
            manaRegen: unit.manaRegen || 0
          };
          allUnits.push(unitWithMana);
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

  // Tipos de unidades disponibles
  const unitTypes = Object.keys(groupedUnits);
  const displayUnits = activeTab === 'all' ? availableUnits : groupedUnits[activeTab] || [];

  // Maneja el clic en una unidad
  const handleUnitClick = (unit: UnitProduction) => {
    setSelectedUnit(unit);
    setIsModalOpen(true);
  };

  // Obtiene la descripción de una habilidad especial
  const getAbilityDescription = (abilityName: string) => {
    const descriptions: Record<string, string> = {
      "Call to Arms": "Can rally nearby units, increasing their attack speed by 15% for 10 seconds.",
    };
    return descriptions[abilityName] || "Special ability unique to this unit.";
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
                  <UnitName $race={race}>{unit.name}</UnitName>
                  <UnitAvailable $race={race}>{unit.available}</UnitAvailable>
                </UnitNameContainer>

                <UnitStats $race={race}>
                  <StatItem title="Health Points">
                    <StatLabel $race={race}>❤️</StatLabel>
                    <StatValue>{unit.hp}</StatValue>
                  </StatItem>
                  <StatItem title="Attack Damage">
                    <StatLabel $race={race}>⚔️</StatLabel>
                    <StatValue>{unit.attack}</StatValue>
                  </StatItem>
                  <StatItem title="Armor / Defense">
                    <StatLabel $race={race}>🛡️</StatLabel>
                    <StatValue>{unit.armor}</StatValue>
                  </StatItem>
                  <StatItem title="Mana / Special Points">
                    <StatLabel $race={race}>✨</StatLabel>
                    <StatValue>{unit.mana || 0}</StatValue>
                  </StatItem>
                  <StatItem title="Carry Capacity">
                    <StatLabel $race={race}>📦</StatLabel>
                    <StatValue>{unit.carryCapacity}</StatValue>
                  </StatItem>
                </UnitStats>

                <UnitCost $race={race}>
                  <CostValue>
                    {unit.cost.gold} <GoldIcon>💰</GoldIcon>
                    {unit.cost.wood && ` ${unit.cost.wood} 🪵`}
                    {unit.cost.stone && ` ${unit.cost.stone} 🪨`}
                    {unit.cost.food && ` ${unit.cost.food} 🍖`}
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
          getAbilityDescription={getAbilityDescription}
        />
      )}
    </>
  );
};

export default ArmyPanel;