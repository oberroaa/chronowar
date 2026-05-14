import React, { useEffect } from 'react';
import { raceColors } from '../../types/raceColors';
import { jsonPlayersData, jsonSystemPlayersData } from '../../types/jsonResponse';

// Importar tipos
import type { PortalPanelProps } from './types';

// Importar estilos
import * as PanelStyles from './PortalPanel.styles';
import * as ModalStyles from './Modal.styles';

// Componente principal del panel del portal
const PortalPanel: React.FC<PortalPanelProps> = ({ 
  isOpen, 
  onClose,
  playersData = jsonPlayersData,
  systemPlayersData = jsonSystemPlayersData,
  race,
  countdown,
  currentTarget,
  battleResult,
  onActionStart,
  onResultClose,
  activeTab,
  onTabChange,
  travelCount,
  maxTravels,
  onTravelUsed,
}) => {
  // Obtener datos de la raza actual
  const currentRace = raceColors[race];

  // Efecto para limpiar estados cuando se cierra el panel
  useEffect(() => {
    if (!isOpen) {
      onTabChange('players');
    }
  }, [isOpen, onTabChange]);

  // Manejar la acción (ataque o recolección)
  const handleAction = (targetId: number) => {
    if (travelCount > 0) {
      onActionStart(targetId);
      onTravelUsed();
    }
  };

  // Helper para generar datos visuales aleatorios (pero consistentes)
  const getTargetMeta = (id: number) => {
    const risks: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    const loots = [
      { icon: '💰', label: 'Oro' },
      { icon: '🪵', label: 'Madera' },
      { icon: '🪨', label: 'Piedra' },
      { icon: '🍖', label: 'Comida' },
      { icon: '🎁', label: 'Items' }
    ];
    
    const seed = (id * 12345) % 1000;
    const risk = risks[seed % 3];
    const lootCount = (seed % 2) + 2;
    const selectedLoot = loots.slice(seed % 2, (seed % 2) + lootCount);
    
    return { risk, selectedLoot };
  };

  // Verificar si hay viajes disponibles
  const hasTravelsAvailable = travelCount > 0;

  return (
    <>
      {/* Modal de resultados de batalla/recolección */}
      {battleResult && (
        <ModalStyles.ModalOverlay onClick={onResultClose}>
          <ModalStyles.ModalContainer 
            onClick={(e) => e.stopPropagation()} 
            $race={race} 
            $isSuccess={battleResult.success}
          >
            <ModalStyles.ModalCloseButton $race={race} onClick={onResultClose}>
              ×
            </ModalStyles.ModalCloseButton>
            
            <ModalStyles.ModalHeader $isSuccess={battleResult.success} $race={race}>
              <ModalStyles.ModalIcon $isSuccess={battleResult.success}>
                {battleResult.success ? '🎉' : '💥'}
              </ModalStyles.ModalIcon>
              <ModalStyles.ModalTitle $isSuccess={battleResult.success} $race={race}>
                {battleResult.success ? '¡Éxito!' : 'Fallo'}
              </ModalStyles.ModalTitle>
            </ModalStyles.ModalHeader>
            
            <ModalStyles.Divider $race={race} />
            
            <ModalStyles.ModalContent>
              <ModalStyles.ModalText $isSuccess={battleResult.success}>
                {battleResult.message}
              </ModalStyles.ModalText>
              
              {battleResult.rewards && (
                <ModalStyles.ModalRewardsSection>
                  <ModalStyles.RewardsTitle $race={race}>Recompensas Obtenidas:</ModalStyles.RewardsTitle>
                  <ModalStyles.ModalStatsGrid>
                    <ModalStyles.ModalStat $race={race} $isSuccess={battleResult.success}>
                      <ModalStyles.StatIcon>⭐</ModalStyles.StatIcon>
                      <ModalStyles.StatContent>
                        <ModalStyles.StatLabel $race={race}>Experiencia</ModalStyles.StatLabel>
                        <ModalStyles.StatValue>+{battleResult.rewards.experience}</ModalStyles.StatValue>
                      </ModalStyles.StatContent>
                    </ModalStyles.ModalStat>
                    
                    {battleResult.rewards.resources && (
                      <ModalStyles.ModalStat $race={race} $isSuccess={battleResult.success}>
                        <ModalStyles.StatIcon>💰</ModalStyles.StatIcon>
                        <ModalStyles.StatContent>
                          <ModalStyles.StatLabel $race={race}>Recursos</ModalStyles.StatLabel>
                          <ModalStyles.StatValue>+{battleResult.rewards.resources}</ModalStyles.StatValue>
                        </ModalStyles.StatContent>
                      </ModalStyles.ModalStat>
                    )}
                    
                    {battleResult.rewards.items && (
                      <ModalStyles.ModalStat $race={race} $isSuccess={battleResult.success}>
                        <ModalStyles.StatIcon>🎁</ModalStyles.StatIcon>
                        <ModalStyles.StatContent>
                          <ModalStyles.StatLabel $race={race}>Items</ModalStyles.StatLabel>
                          <ModalStyles.StatValue>{battleResult.rewards.items.join(', ')}</ModalStyles.StatValue>
                        </ModalStyles.StatContent>
                      </ModalStyles.ModalStat>
                    )}
                  </ModalStyles.ModalStatsGrid>
                </ModalStyles.ModalRewardsSection>
              )}
            </ModalStyles.ModalContent>
            
            <ModalStyles.Divider $race={race} />
            
            <ModalStyles.ModalFooter>
              <ModalStyles.ModalButton 
                $race={race} 
                $isSuccess={battleResult.success} 
                onClick={onResultClose}
              >
                Continuar
              </ModalStyles.ModalButton>
            </ModalStyles.ModalFooter>
          </ModalStyles.ModalContainer>
        </ModalStyles.ModalOverlay>
      )}

      {/* Panel principal del portal */}
      <PanelStyles.RightPanelContainer $isOpen={isOpen} $race={race}>
        <PanelStyles.CloseButton onClick={onClose} $race={race} disabled={countdown !== null}>
          ×
        </PanelStyles.CloseButton>
        
        <PanelStyles.PortalHeader $race={race}>
          <PanelStyles.PortalVortex $race={race} />
          <PanelStyles.PortalCore $race={race}>
            {currentRace.icon}
          </PanelStyles.PortalCore>
          <PanelStyles.PanelTitle $race={race} style={{ marginTop: '20px', marginBottom: '0' }}>
            PORTAL DIMENSIONAL
          </PanelStyles.PanelTitle>
        </PanelStyles.PortalHeader>

        <PanelStyles.PanelContent>
          {/* Sección de viajes disponibles */}
          <PanelStyles.TravelsSection $race={race}>
            <PanelStyles.TravelsTitle $race={race}>Cargas de Energía:</PanelStyles.TravelsTitle>
            <PanelStyles.TravelsCounter $race={race} $isLow={travelCount <= 2}>
              <PanelStyles.TravelsNumber $isCritical={travelCount === 0}>
                {travelCount} / {maxTravels}
              </PanelStyles.TravelsNumber>
            </PanelStyles.TravelsCounter>
            {travelCount === 0 && (
              <PanelStyles.NoTravelsWarning $race={race}>
                Energía agotada. Esperando estabilización...
              </PanelStyles.NoTravelsWarning>
            )}
          </PanelStyles.TravelsSection>
          
          {/* Tabs para cambiar entre Players y Locations */}
          <PanelStyles.Tabs $race={race}>
            <PanelStyles.TabButton 
              $active={activeTab === 'players'} 
              onClick={() => onTabChange('players')}
              $race={race}
              disabled={countdown !== null || !hasTravelsAvailable}
            >
              Jugadores
            </PanelStyles.TabButton>
            <PanelStyles.TabButton 
              $active={activeTab === 'system'} 
              onClick={() => onTabChange('system')}
              $race={race}
              disabled={countdown !== null || !hasTravelsAvailable}
            >
              Ubicaciones
            </PanelStyles.TabButton>
          </PanelStyles.Tabs>
          
          <PanelStyles.TargetGrid>
            {(activeTab === 'players' ? playersData : systemPlayersData).map((target) => {
              const meta = getTargetMeta(target.id);
              const targetRace = (target as any).race ? raceColors[(target as any).race as keyof typeof raceColors] : currentRace;
              const isCurrent = currentTarget === target.id && countdown !== null;
              const isDisabled = (countdown !== null && !isCurrent) || !hasTravelsAvailable;
              const progress = isCurrent && countdown ? ((20 - countdown) / 20) * 100 : 0;

              return (
                <PanelStyles.TargetCard key={target.id} $race={race}>
                  <PanelStyles.CardMainRow>
                    <PanelStyles.TargetAvatar $race={(target as any).race || race}>
                      {targetRace.icon}
                    </PanelStyles.TargetAvatar>

                    <PanelStyles.TargetInfo>
                      <PanelStyles.TargetName>{target.name}</PanelStyles.TargetName>
                      <PanelStyles.RiskBadge $level={meta.risk}>
                        {meta.risk}
                      </PanelStyles.RiskBadge>
                    </PanelStyles.TargetInfo>

                    <PanelStyles.IconButton 
                      $action={activeTab === 'players' ? 'attack' : 'gather'} 
                      $race={race}
                      onClick={() => handleAction(target.id)}
                      disabled={isDisabled}
                      $isDisabled={isDisabled}
                      title={activeTab === 'players' ? 'Atacar' : 'Recolectar'}
                    >
                      {isCurrent 
                        ? '⏳' 
                        : activeTab === 'players' ? '⚔️' : '⛏️'}
                    </PanelStyles.IconButton>
                  </PanelStyles.CardMainRow>

                  <PanelStyles.LootPreview>
                    {meta.selectedLoot.map((loot, idx) => (
                      <PanelStyles.LootItem key={idx} title={loot.label}>
                        {loot.icon}
                      </PanelStyles.LootItem>
                    ))}
                  </PanelStyles.LootPreview>

                  {isCurrent && (
                    <PanelStyles.ProgressWrapper $race={race}>
                      <PanelStyles.ProgressBar $progress={progress} $race={race} />
                    </PanelStyles.ProgressWrapper>
                  )}
                </PanelStyles.TargetCard>
              );
            })}
          </PanelStyles.TargetGrid>
        </PanelStyles.PanelContent>
      </PanelStyles.RightPanelContainer>
    </>
  );
};

export default PortalPanel;