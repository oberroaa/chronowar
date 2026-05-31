// FormationPanel - Componente principal de formaciones
import React, { useState, useEffect } from 'react';
import { savedFormations } from '../../types/jsonResponse';
import type { FormationPanelProps, SelectedUnit, SlotPosition, FormationType } from './types';
import {
  CompactPanel,
  PanelHeader,
  CloseButton,
  SaveButton,
  FormationsContainer,
  FormationGroup,
  FormationTitle,
  UnitsRow,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseModalButton,
  UnitsList,
  Subtitle,
  AvailableUnit,
  UnitImage,
  UnitDetails,
  UnitName,
  UnitStats,
  Stat,
  UnitInfoContainer,
  UnitImageLarge,
  UnitStatsContainer,
  StatItem,
  StatLabel,
  StatValue,
  FormationButton,
} from './FormationPanel.styles';
import UnitSlot from './UnitSlot';

const FormationPanel: React.FC<FormationPanelProps> = ({
  isOpen, onClose, race, gameUnits
}) => {
  const [unitsMap] = useState(() => {
    const map = new Map<number, any>();
    gameUnits.forEach(unit => map.set(unit.id, unit));
    return map;
  });

  const raceData = {
    unit: gameUnits.filter(u => u.unitType === 'unit'),
    heroe: gameUnits.filter(u => u.unitType === 'heroe'),
    // comun: gameUnits.filter(u => u.unitType === 'comun'),
    poblation: gameUnits.filter(u => u.unitType === 'poblation')
  };

  const [selectedUnit, setSelectedUnit] = useState<SelectedUnit | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotPosition | null>(null);
  const [showUnitInfo, setShowUnitInfo] = useState<any | null>(null);

  // Bloquear scroll del body cuando hay un modal abierto
  useEffect(() => {
    const modalOpen = !!(selectedSlot || showUnitInfo);
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedSlot, showUnitInfo]);

  const [formations, setFormations] = useState<FormationType[]>([
    { name: "Ataque Principal", units: Array(5).fill(null) },
    { name: "Defensa Ciudad", units: Array(5).fill(null) },
    { name: "Reserva Estratégica", units: Array(5).fill(null) }
  ]);

  useEffect(() => {
    if (isOpen) {
      const loadedFormations = [
        {
          name: savedFormations.principal.name,
          units: savedFormations.principal.units.slice(0, 5).map(unit =>
            unit ? unitsMap.get(unit.id) || null : null
          )
        },
        {
          name: savedFormations.secondary.name,
          units: savedFormations.secondary.units.slice(0, 5).map(unit =>
            unit ? unitsMap.get(unit.id) || null : null
          )
        },
        {
          name: savedFormations.reserve.name,
          units: savedFormations.reserve.units.slice(0, 5).map(unit =>
            unit ? unitsMap.get(unit.id) || null : null
          )
        }
      ];
      setFormations(loadedFormations);
    }
  }, [isOpen, unitsMap]);

  const saveFormations = () => {
    const formationsToSave = {
      principal: {
        name: formations[0].name,
        units: formations[0].units.slice(0, 5).map(unit => unit ? { id: unit.id } : null)
      },
      secondary: {
        name: formations[1].name,
        units: formations[1].units.slice(0, 5).map(unit => unit ? { id: unit.id } : null)
      },
      reserve: {
        name: formations[2].name,
        units: formations[2].units.slice(0, 5).map(unit => unit ? { id: unit.id } : null)
      },
      lastUpdated: new Date().toISOString(),
    };

    savedFormations.principal = formationsToSave.principal;
    savedFormations.secondary = formationsToSave.secondary;
    savedFormations.reserve = formationsToSave.reserve;
    console.log("Formaciones guardadas:", formationsToSave);
    onClose();
  };

  const getAvailableUnits = () => {
    const usedCounts: Record<number, number> = {};
    formations.forEach(formation => {
      formation.units.forEach(unit => {
        if (unit) {
          usedCounts[unit.id] = (usedCounts[unit.id] || 0) + 1;
        }
      });
    });

    return gameUnits.map(unit => ({
      ...unit,
      available: unit.unitType === 'heroe'
        ? (usedCounts[unit.id] ? 0 : 1)
        : Math.max(0, (unit.available || 0) - (usedCounts[unit.id] || 0))
    }));
  };

  const availableUnits = getAvailableUnits();

  const handleUnitClick = (formationIndex: number, positionIndex: number) => {
    const clickedUnit = formations[formationIndex].units[positionIndex];

    if (clickedUnit) {
      setShowUnitInfo(clickedUnit);
      setSelectedUnit({
        ...clickedUnit,
        formationIndex,
        positionIndex
      });
    } else {
      setSelectedSlot({ formationIndex, positionIndex });
      setSelectedUnit(null);
    }
  };

  const handleAddUnit = (unit: any) => {
    if (!selectedSlot) return;

    if (unit.unitType === 'heroe' && selectedSlot.positionIndex !== 2) {
      return;
    }

    const available = getAvailableCount(unit.id);
    if (available <= 0) {
      return;
    }

    const newFormations = [...formations];
    newFormations[selectedSlot.formationIndex].units[selectedSlot.positionIndex] = { ...unit };
    setFormations(newFormations);

    setSelectedSlot(null);
  };

  const handleRemoveUnit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;

    const newFormations = [...formations];
    newFormations[selectedUnit.formationIndex].units[selectedUnit.positionIndex] = null;
    setFormations(newFormations);

    setShowUnitInfo(null);
    setSelectedUnit(null);
  };

  const closeModal = () => {
    setShowUnitInfo(null);
    setSelectedSlot(null);
    setSelectedUnit(null);
  };

  const getAvailableCount = (unitId: number) => {
    return availableUnits.find(u => u.id === unitId)?.available || 0;
  };

  const isHeroInUse = (heroId: number) => {
    return formations.some(formation =>
      formation.units.some(unit => unit?.id === heroId && unit?.unitType === 'heroe'));
  };

  return (
    <>
      <CompactPanel $isOpen={isOpen} $race={race}>
        <PanelHeader $race={race}>
          <CloseButton $race={race} onClick={onClose}>▲ Close ▲</CloseButton>
          <SaveButton $race={race} onClick={saveFormations}>💾 Guardar</SaveButton>
        </PanelHeader>

        <FormationsContainer>
          {formations.map((formation, formationIndex) => (
            <FormationGroup key={formationIndex} $race={race}>
              <FormationTitle $race={race}>{formation.name}</FormationTitle>

              <UnitsRow>
                {formation.units.slice(0, 5).map((unit, positionIndex) => (
                  <UnitSlot
                    key={`${formationIndex}-${positionIndex}`}
                    unit={unit}
                    formationIndex={formationIndex}
                    positionIndex={positionIndex}
                    onUnitClick={handleUnitClick}
                    isSelected={selectedUnit?.formationIndex === formationIndex && selectedUnit?.positionIndex === positionIndex}
                    isHero={unit?.unitType === 'heroe'}
                    isEmpty={!unit}
                    isCenter={positionIndex === 2}
                    race={race}
                  />
                ))}
              </UnitsRow>
            </FormationGroup>
          ))}
        </FormationsContainer>
      </CompactPanel>
    
      {selectedSlot && (
        <ModalOverlay>
          <ModalContent $race={race}>
            <ModalHeader $race={race}>
              <ModalTitle $race={race}>
                {formations[selectedSlot.formationIndex].name} - Slot {selectedSlot.positionIndex + 1}
              </ModalTitle>
              <CloseModalButton $race={race} onClick={closeModal}>×</CloseModalButton>
            </ModalHeader>

            <UnitsList>
              {(selectedSlot.positionIndex === 2) ? (
                <>
                  <Subtitle $race={race}>Héroes Disponibles</Subtitle>
                  {raceData.heroe.map(hero => {
                    const available = getAvailableCount(hero.id);
                    const inUse = isHeroInUse(hero.id);

                    return (
                      <AvailableUnit
                        key={hero.id}
                        onClick={() => !inUse && available > 0 && handleAddUnit(hero)}
                        $race={race}
                        $disabled={inUse || available <= 0}
                      >
                        <UnitImage src={hero.image} alt={hero.name} />
                        <UnitDetails>
                          <UnitName $race={race}>{hero.name}</UnitName>
                          <UnitStats>
                            <Stat $race={race}>❤️ {hero.hp}</Stat>
                            <Stat $race={race}>⚔️ {hero.attack}{hero.attackBonus ? <span style={{color:'#ffd700',marginLeft:'3px'}}>(+{hero.attackBonus})</span> : null}</Stat>
                            <Stat $race={race}>🛡️ {hero.armor}{hero.armorBonus ? <span style={{color:'#ffd700',marginLeft:'3px'}}>(+{hero.armorBonus})</span> : null}</Stat>
                            {inUse && <Stat $race={race} style={{ color: 'red', fontWeight: 'bold' }}>EN USO</Stat>}
                            {!inUse && available <= 0 && <Stat $race={race} style={{ color: '#ff4444', fontWeight: 'bold' }}>AGOTADO</Stat>}
                          </UnitStats>
                        </UnitDetails>
                      </AvailableUnit>
                    );
                  })}
                </>
              ) : (
                <>
                  <Subtitle $race={race}>Unidades Disponibles</Subtitle>
                  {raceData.unit.map(unit => {
                    const available = getAvailableCount(unit.id);
                    const total = unit.available || 0;

                    return (
                      <AvailableUnit
                        key={unit.id}
                        onClick={() => available > 0 && handleAddUnit(unit)}
                        $race={race}
                        $disabled={available <= 0}
                      >
                        <UnitImage src={unit.image} alt={unit.name} />
                        <UnitDetails>
                          <UnitName $race={race}>{unit.name}</UnitName>
                          <UnitStats>
                            <Stat $race={race}>❤️ {unit.hp}</Stat>
                            <Stat $race={race}>⚔️ {unit.attack}{unit.attackBonus ? <span style={{color:'#ffd700',marginLeft:'3px'}}>(+{unit.attackBonus})</span> : null}</Stat>
                            <Stat $race={race}>🛡️ {unit.armor}{unit.armorBonus ? <span style={{color:'#ffd700',marginLeft:'3px'}}>(+{unit.armorBonus})</span> : null}</Stat>
                            <Stat $race={race} style={{ 
                              color: available > 0 ? '#aaa' : '#ff4444',
                              fontWeight: available > 0 ? 'normal' : 'bold',
                              marginLeft: 'auto'
                            }}>
                              {available > 0 ? `Stock: ${available} / ${total}` : 'SIN STOCK'}
                            </Stat>
                          </UnitStats>
                        </UnitDetails>
                      </AvailableUnit>
                    );
                  })}
                </>
              )}
            </UnitsList>
          </ModalContent>
        </ModalOverlay>
      )}

      {showUnitInfo && selectedUnit && (
        <ModalOverlay>
          <ModalContent $race={race}>
            <ModalHeader $race={race}>
              <ModalTitle $race={race}>{showUnitInfo.name}</ModalTitle>
              <CloseModalButton $race={race} onClick={closeModal}>×</CloseModalButton>
            </ModalHeader>

            <UnitInfoContainer>
              <UnitImageLarge src={showUnitInfo.image} alt={showUnitInfo.name} $race={race} />

              <UnitStatsContainer>
                <StatItem $race={race}>
                  <StatLabel $race={race}>❤️ SALUD</StatLabel>
                  <StatValue $race={race}>{showUnitInfo.hp}</StatValue>
                </StatItem>
                <StatItem $race={race}>
                  <StatLabel $race={race}>⚔️ ATAQUE</StatLabel>
                  <StatValue $race={race}>{showUnitInfo.attack}{showUnitInfo.attackBonus ? <span style={{color:'#ffd700',marginLeft:'4px'}}>(+{showUnitInfo.attackBonus})</span> : null}</StatValue>
                </StatItem>
                <StatItem $race={race}>
                  <StatLabel $race={race}>🛡️ ARMADURA</StatLabel>
                  <StatValue $race={race}>{showUnitInfo.armor}{showUnitInfo.armorBonus ? <span style={{color:'#ffd700',marginLeft:'4px'}}>(+{showUnitInfo.armorBonus})</span> : null}</StatValue>
                </StatItem>
                <StatItem $race={race}>
                  <StatLabel $race={race}>🏹 ARMA</StatLabel>
                  <StatValue $race={race}>{showUnitInfo.weaponType}</StatValue>
                </StatItem>
                <StatItem $race={race}>
                  <StatLabel $race={race}>📦 CARGA</StatLabel>
                  <StatValue $race={race}>{showUnitInfo.carryCapacity}</StatValue>
                </StatItem>
                <StatItem $race={race}>
                  <StatLabel $race={race}>✨ HABILIDAD</StatLabel>
                  <StatValue $race={race} style={{ fontSize: '0.8rem' }}>{showUnitInfo.special}</StatValue>
                </StatItem>

                <FormationButton 
                  $race={race} 
                  $formationType="attack"
                  onClick={handleRemoveUnit}
                >
                  Quitar de Formación
                </FormationButton>
              </UnitStatsContainer>
            </UnitInfoContainer>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default FormationPanel;