import React, { useEffect } from 'react';
import { raceColors } from '../../types/raceColors';


// Importar tipos
import type { PortalPanelProps } from './types';

// Importar estilos
import * as PanelStyles from './PortalPanel.styles';
import * as ModalStyles from './Modal.styles';

// Componente principal del panel del portal
const PortalPanel: React.FC<PortalPanelProps> = ({
  isOpen,
  playersData,
  systemPlayersData,
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
  formations,
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
  const handleAction = (targetId: number, tab: 'players' | 'system') => {
    if (travelCount > 0) {
      if (tab === 'players' && !hasAttackFormation) return;
      if (tab === 'system' && !hasCollectFormation) return;
      onActionStart(targetId);
      onTravelUsed();
    }
  };



  // Verificar si hay viajes disponibles
  const hasTravelsAvailable = travelCount > 0;

  // Verificar si las formaciones tienen 5 tropas
  const filledSlots = (units: (any | null)[] = []) =>
    units.filter(u => u !== null && u !== undefined).length;

  const hasAttackFormation = filledSlots(formations?.principal?.units) >= 5;
  const hasCollectFormation = filledSlots(formations?.reserve?.units) >= 5;

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
        <PanelStyles.PortalHeader $race={race}>
          <PanelStyles.PortalCore $race={race}>
            {currentRace.icon}
          </PanelStyles.PortalCore>
          <PanelStyles.PanelTitle $race={race}>
            Portal Dimensional
          </PanelStyles.PanelTitle>
          <PanelStyles.TravelsSection $race={race}>
            <PanelStyles.TravelsCounter $race={race} $isLow={travelCount <= 2}>
              <PanelStyles.TravelsNumber $isCritical={travelCount === 0}>
                {travelCount} / {maxTravels}
              </PanelStyles.TravelsNumber>
            </PanelStyles.TravelsCounter>
          </PanelStyles.TravelsSection>
        </PanelStyles.PortalHeader>

        <PanelStyles.PanelContent>
          {travelCount === 0 && (
            <PanelStyles.NoTravelsWarning $race={race}>
              ⚠️ Energía agotada. Esperando estabilización...
            </PanelStyles.NoTravelsWarning>
          )}

          {travelCount > 0 && activeTab === 'players' && !hasAttackFormation && (
            <PanelStyles.NoTravelsWarning $race={race}>
              ⚔️ Necesitas 5 tropas en <strong>Ataque Principal</strong> para atacar
            </PanelStyles.NoTravelsWarning>
          )}

          {travelCount > 0 && activeTab === 'system' && !hasCollectFormation && (
            <PanelStyles.NoTravelsWarning $race={race}>
              ⛏️ Necesitas 5 tropas en <strong>Escuadra Recolectora</strong> para recolectar
            </PanelStyles.NoTravelsWarning>
          )}

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
            {(activeTab === 'players' ? playersData || [] : systemPlayersData || []).map((target, idx) => {
              const targetRace = (target as any).race ? raceColors[(target as any).race as keyof typeof raceColors] : currentRace;
              const isCurrent = currentTarget === (target?.id ?? null) && countdown !== null;
              const formationOk = activeTab === 'players' ? hasAttackFormation : hasCollectFormation;
              const formationMsg = activeTab === 'players'
                ? 'Necesitas 5 tropas en Ataque Principal'
                : 'Necesitas 5 tropas en Escuadra Recolectora';

              const isDisabled = (countdown !== null && !isCurrent) || !hasTravelsAvailable || !formationOk;
              const progress = isCurrent && countdown ? ((20 - countdown) / 20) * 100 : 0;

              return (
                <PanelStyles.TargetCard key={target?.id ?? idx} $race={race}>
                  <PanelStyles.CardMainRow>
                    <PanelStyles.TargetAvatar $race={(target as any).race || race}>
                      {targetRace.icon}
                    </PanelStyles.TargetAvatar>

                    <PanelStyles.TargetInfo>
                      <PanelStyles.TargetName>{target?.name ?? ''}</PanelStyles.TargetName>
                    </PanelStyles.TargetInfo>

                    <PanelStyles.IconButton
                      $action={activeTab === 'players' ? 'attack' : 'gather'}
                      $race={race}
                      onClick={() => handleAction(target?.id ?? 0, activeTab)}
                      disabled={isDisabled}
                      $isDisabled={isDisabled}
                      title={!formationOk ? formationMsg : activeTab === 'players' ? 'Atacar' : 'Recolectar'}
                    >
                      {isCurrent
                        ? '⏳'
                        : activeTab === 'players' ? '⚔️' : '⛏️'}
                    </PanelStyles.IconButton>
                  </PanelStyles.CardMainRow>


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