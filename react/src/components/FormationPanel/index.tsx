// FormationPanel - Componente principal de formaciones
import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../../store/useGameStore';
import type { FormationPanelProps, SelectedUnit, SlotPosition, FormationType } from './types';
import type { UnitProduction } from '../../types/gameData';
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
  const unitsMap = React.useMemo(() => {
    const map = new Map<number, any>();
    gameUnits.forEach(unit => map.set(unit.id, unit));
    return map;
  }, [gameUnits]);

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false, message: '', type: 'success'
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }, []);

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

  const [formations, setFormations] = useState<Record<string, FormationType>>({
    principal: { name: "Ataque Principal", units: Array(5).fill(null) },
    secondary: { name: "Defensa Ciudad", units: Array(5).fill(null) },
    reserve: { name: "Escuadra Recolectora", units: Array(5).fill(null) }
  });

  const { playerData, syncPlayerState } = useGameStore();

  useEffect(() => {
    if (playerData?.formations) {
      setFormations({
        principal: {
          name: playerData.formations.principal?.name || "Ataque Principal",
          units: (playerData.formations.principal?.units || Array(10).fill(null)).slice(0, 5).map((unit: any) => {
            if (!unit) return null;
            const u = unitsMap.get(unit.id);
            return (u && u.available > 0) ? u : null;
          })
        },
        secondary: {
          name: playerData.formations.secondary?.name || "Defensa Ciudad",
          units: (playerData.formations.secondary?.units || Array(10).fill(null)).slice(0, 5).map((unit: any) => {
            if (!unit) return null;
            const u = unitsMap.get(unit.id);
            return (u && u.available > 0) ? u : null;
          })
        },
        reserve: {
          name: "Escuadra Recolectora",
          units: (playerData.formations.reserve?.units || Array(10).fill(null)).slice(0, 5).map((unit: any) => {
            if (!unit) return null;
            const u = unitsMap.get(unit.id);
            return (u && u.available > 0) ? u : null;
          })
        }
      });
    } else {
      setFormations({
        principal: { name: "Ataque Principal", units: Array(5).fill(null) },
        secondary: { name: "Defensa Ciudad", units: Array(5).fill(null) },
        reserve: { name: "Escuadra Recolectora", units: Array(5).fill(null) }
      });
    }
  }, [isOpen, unitsMap, playerData]);

  const padUnits = (units: Array<UnitProduction | null>) => {
    const padded = [...units];
    while(padded.length < 10) padded.push(null);
    return padded;
  };

  const saveFormations = () => {
    const formationsToSave = {
      principal: { ...formations.principal, units: padUnits(formations.principal.units) },
      secondary: { ...formations.secondary, units: padUnits(formations.secondary.units) },
      reserve: { ...formations.reserve, units: padUnits(formations.reserve.units) },
      lastUpdated: new Date().toISOString()
    };
    
    if (playerData) {
      useGameStore.setState({
        playerData: {
          ...playerData,
          formations: formationsToSave
        }
      });
      syncPlayerState();
    }
    
    showToast('⚔️ ¡Formación guardada!');
    setTimeout(() => onClose(), 1500);
  };

  const getAvailableUnits = () => {
    const usedCounts: Record<number, number> = {};
    Object.values(formations).forEach((formation: FormationType) => {
      formation.units.forEach((unit: UnitProduction | null) => {
        if (unit) {
          usedCounts[unit.id] = (usedCounts[unit.id] || 0) + 1;
        }
      });
    });

    return gameUnits.map(unit => ({
      ...unit,
      available: Math.max(0, (unit.available || 0) - (usedCounts[unit.id] || 0))
    }));
  };

  const availableUnits = getAvailableUnits();

  const handleUnitClick = (formationKey: string, positionIndex: number) => {
    const clickedUnit = formations[formationKey].units[positionIndex];

    if (clickedUnit) {
      setShowUnitInfo(clickedUnit);
      setSelectedUnit({
        ...clickedUnit,
        formationIndex: formationKey,
        positionIndex
      });
    } else {
      setSelectedSlot({ formationIndex: formationKey, positionIndex });
      setSelectedUnit(null);
    }
  };

  const handleAddUnit = (unit: UnitProduction) => {
    if (!selectedSlot) return;

    if (unit.unitType === 'heroe' && selectedSlot.positionIndex !== 2) {
      return;
    }

    const available = getAvailableCount(unit.id);
    if (available <= 0) {
      return;
    }

    const newFormations = { ...formations };
    newFormations[selectedSlot.formationIndex].units[selectedSlot.positionIndex] = { ...unit };
    setFormations(newFormations);

    setSelectedSlot(null);
  };

  const handleRemoveUnit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;

    const newFormations = { ...formations };
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
    return Object.values(formations).some(formation =>
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
          {Object.entries(formations).map(([formationKey, formation]) => (
            <FormationGroup key={formationKey} $race={race}>
              <FormationTitle $race={race}>{formation.name}</FormationTitle>

              <UnitsRow>
                {formation.units.slice(0, 5).map((unit, positionIndex) => (
                  <UnitSlot
                    key={`${formationKey}-${positionIndex}`}
                    unit={unit as any}
                    formationIndex={formationKey as any}
                    positionIndex={positionIndex}
                    onUnitClick={handleUnitClick}
                    isSelected={selectedUnit?.formationIndex === formationKey && selectedUnit?.positionIndex === positionIndex}
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
                    const total = hero.available || 0;
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
                            <Stat $race={race} style={{ 
                              color: available > 0 ? '#aaa' : '#ff4444',
                              fontWeight: available > 0 ? 'normal' : 'bold',
                              marginLeft: 'auto'
                            }}>
                              {inUse ? 'EN USO' : available > 0 ? `Stock: ${available} / ${total}` : 'SIN STOCK'}
                            </Stat>
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
      {toast.visible && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: toast.type === 'success'
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
            : 'linear-gradient(135deg, #3a0a0a 0%, #5a1010 100%)',
          border: `1px solid ${toast.type === 'success' ? '#e94560' : '#ff4444'}`,
          borderRadius: '12px',
          padding: '1rem 2rem',
          color: '#fff',
          fontSize: '1.1rem',
          fontWeight: '600',
          letterSpacing: '0.05em',
          boxShadow: toast.type === 'success'
            ? '0 0 30px rgba(233,69,96,0.6), 0 4px 20px rgba(0,0,0,0.5)'
            : '0 0 30px rgba(255,68,68,0.6)',
          zIndex: 99999,
          animation: 'toastIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <span style={{ fontSize: '1.4rem' }}>⚔️</span>
          <span>¡Formación guardada exitosamente!</span>
          <span style={{ fontSize: '1.4rem' }}>🛡️</span>
        </div>
      )}
      <style>{`
        @keyframes toastIn {
          0%   { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.9); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
};

export default FormationPanel;