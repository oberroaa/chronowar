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
        
        <PanelStyles.PanelTitle $race={race}>
          {currentRace.icon} Portal {currentRace.icon}
        </PanelStyles.PanelTitle>
        
        {/* Sección de viajes disponibles */}
        <PanelStyles.TravelsSection $race={race}>
          <PanelStyles.TravelsTitle $race={race}>Viajes Disponibles:</PanelStyles.TravelsTitle>
          <PanelStyles.TravelsCounter $race={race} $isLow={travelCount <= 2}>
            <PanelStyles.TravelsNumber $isCritical={travelCount === 0}>
              {travelCount} / {maxTravels}
            </PanelStyles.TravelsNumber>
          </PanelStyles.TravelsCounter>
          {travelCount === 0 && (
            <PanelStyles.NoTravelsWarning $race={race}>
              No tienes viajes disponibles. Espera a que se recarguen.
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
            Players
          </PanelStyles.TabButton>
          <PanelStyles.TabButton 
            $active={activeTab === 'system'} 
            onClick={() => onTabChange('system')}
            $race={race}
            disabled={countdown !== null || !hasTravelsAvailable}
          >
            Locations
          </PanelStyles.TabButton>
        </PanelStyles.Tabs>
        
        {/* Mostrar contador cuando hay una acción en progreso */}
        {countdown !== null && (
          <PanelStyles.CountdownContainer $race={race}>
            <PanelStyles.CountdownText>
              {activeTab === 'players' ? 'Atacando...' : 'Recolectando...'} 
              <PanelStyles.CountdownValue>{countdown}s</PanelStyles.CountdownValue>
            </PanelStyles.CountdownText>
          </PanelStyles.CountdownContainer>
        )}
        
        {/* Tabla de Players */}
        {activeTab === 'players' ? (
          <PanelStyles.Table>
            <thead>
              <tr>
                <PanelStyles.TableHeader $race={race}>Player</PanelStyles.TableHeader>
                <PanelStyles.TableHeader $race={race}>Race</PanelStyles.TableHeader>
                <PanelStyles.TableHeader $race={race}>Action</PanelStyles.TableHeader>
              </tr>
            </thead>
            <tbody>
              {playersData.map((player) => {
                const playerRaceData = raceColors[player.race];
                const isDisabled = countdown !== null || !hasTravelsAvailable;
                
                return (
                  <PanelStyles.TableRow key={player.id} $race={race}>
                    <PanelStyles.TableCell>{player.name}</PanelStyles.TableCell>
                    <PanelStyles.TableCell>
                      <PanelStyles.RaceBadge $race={player.race}>
                        {playerRaceData.icon} 
                      </PanelStyles.RaceBadge>
                    </PanelStyles.TableCell>
                    <PanelStyles.TableCell>
                      <PanelStyles.ActionButton 
                        $action="attack" 
                        $race={race}
                        onClick={() => handleAction(player.id)}
                        disabled={isDisabled}
                        $isDisabled={isDisabled}
                      >
                        {currentTarget === player.id && countdown !== null 
                          ? `Atacando... (${countdown}s)` 
                          : hasTravelsAvailable ? 'Attack' : 'Sin Viajes'}
                      </PanelStyles.ActionButton>
                    </PanelStyles.TableCell>
                  </PanelStyles.TableRow>
                );
              })}
            </tbody>
          </PanelStyles.Table>
        ) : (
          // Tabla de Locations (System Players)
          <PanelStyles.Table>
            <thead>
              <tr>
                <PanelStyles.TableHeader $race={race}>Location</PanelStyles.TableHeader>
                <PanelStyles.TableHeader $race={race}>Race</PanelStyles.TableHeader>
                <PanelStyles.TableHeader $race={race}>Action</PanelStyles.TableHeader>
              </tr>
            </thead>
            <tbody>
              {systemPlayersData.map((location) => {
                const locationRaceData = raceColors[location.race];
                const isDisabled = countdown !== null || !hasTravelsAvailable;
                
                return (
                  <PanelStyles.TableRow key={location.id} $race={race}>
                    <PanelStyles.TableCell>{location.name}</PanelStyles.TableCell>
                    <PanelStyles.TableCell>
                      <PanelStyles.RaceBadge $race={location.race}>
                        {locationRaceData.icon} 
                      </PanelStyles.RaceBadge>
                    </PanelStyles.TableCell>
                    <PanelStyles.TableCell>
                      <PanelStyles.ActionButton 
                        $action="gather" 
                        $race={race}
                        onClick={() => handleAction(location.id)}
                        disabled={isDisabled}
                        $isDisabled={isDisabled}
                      >
                        {currentTarget === location.id && countdown !== null 
                          ? `Recolectando... (${countdown}s)` 
                          : hasTravelsAvailable ? 'Gather' : 'Sin Viajes'}
                      </PanelStyles.ActionButton>
                    </PanelStyles.TableCell>
                  </PanelStyles.TableRow>
                );
              })}
            </tbody>
          </PanelStyles.Table>
        )}
      </PanelStyles.RightPanelContainer>
    </>
  );
};

export default PortalPanel;