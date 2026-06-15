import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  SquaresValdari,
  SquaresGorkar,
  SquaresSylvaran,
  SquaresMortharim,
  type RaceType,
  type BuildingInfo,
  type UnitProduction,
  raceOptions
} from '../types/gameData';
import ResourcePanel from '../components/ResourcePanel/index';
import ArmyPanel from '../components/ArmyPanel/index';
import PortalPanel from '../components/PortalPanel/index';
import BuildingInfoPanel from '../components/BuildingInfoPanel/index';
import FormationPanel from '../components/FormationPanel/index';
import { getUpgradedUnits, applyBuildingLevelBonuses } from '../utils/unitStats';
// import {
//   buildingsData as fallbackBuildingsData,
// } from '../types/jsonResponse';
import { raceColors } from '../types/raceColors';
import { useGameStore } from '../store/useGameStore';

// Props para los cuadros de construcción (con la raza)
type ConstructionSquareProps = {
  $race: RaceType;
};

// Props para componentes que necesitan la raza (estilización)
interface RaceStyledProps {
  $race: RaceType;
}

// Props principales del componente RacePage (recibe la raza)
interface RacePageProps {
  race: RaceType;
  onBattle: () => void;
  onExit: () => void;
}


// Tipo para los resultados de batalla/recolección
type BattleResultType = {
  success: boolean;
  message: string;
  rewards?: {
    experience: number;
    resources?: number;
    items?: string[];
  };
};

// Función para obtener los edificios iniciales de cada raza
const getInitialBuildings = (race: RaceType): Record<string, number> => {
  const buildings: Record<string, number> = {};

  const activeBuildingsData: Record<string, BuildingInfo> = useGameStore.getState().gameData || {};
  Object.values(activeBuildingsData)
    .filter((building: BuildingInfo) => building.race === race)
    .forEach((building: BuildingInfo) => {
      buildings[building.name.toLowerCase()] = building.level;
    });

  return buildings;
};

const getRaceOption = (race: RaceType) => {
  const option = raceOptions.find(r => r.value === race);
  if (!option) throw new Error(`Race ${race} not found in options`);
  return option;
};

const raceData = {
  valdari: {
    backgroundImage: getRaceOption('valdari').backgroundImage,
    squares: SquaresValdari,
    description: getRaceOption('valdari').desc
  },
  gorkar: {
    backgroundImage: getRaceOption('gorkar').backgroundImage,
    squares: SquaresGorkar,
    description: getRaceOption('gorkar').desc
  },
  sylvaran: {
    backgroundImage: getRaceOption('sylvaran').backgroundImage,
    squares: SquaresSylvaran,
    description: getRaceOption('sylvaran').desc
  },
  mortharim: {
    backgroundImage: getRaceOption('mortharim').backgroundImage,
    squares: SquaresMortharim,
    description: getRaceOption('mortharim').desc
  }
};


const simulateBattle = (action: 'attack' | 'gather', targetLevel: number): BattleResultType => {
  const successRate = 0.7 - (targetLevel * 0.05);
  const isSuccess = Math.random() < successRate;

  if (action === 'attack') {
    return {
      success: isSuccess,
      message: isSuccess
        ? '¡Victoria! Has derrotado a tu oponente'
        : 'Derrota... Tu oponente fue más fuerte',
      rewards: {
        experience: isSuccess ? Math.floor(targetLevel * 15 * Math.random()) : Math.floor(targetLevel * 5 * Math.random()),
        items: isSuccess ? ['Material de guerra'] : undefined
      }
    };
  } else {
    return {
      success: isSuccess,
      message: isSuccess
        ? '¡Recolección exitosa! Has obtenido recursos'
        : 'Recolección fallida... Algunos recursos se perdieron',
      rewards: {
        experience: Math.floor(targetLevel * 10 * Math.random()),
        resources: isSuccess ? Math.floor(targetLevel * 20 * Math.random()) : Math.floor(targetLevel * 5 * Math.random())
      }
    };
  }
};

const RacePage: React.FC<RacePageProps> = ({ race, onBattle, onExit }) => {
  const currentRaceData = raceData[race];
  const { resources, setResources, buildingLevels, setBuildingLevel, initBuildingLevels, gameData, loadGameData, playersList, playerData } = useGameStore();
  const storeGameUnits = useGameStore(s => s.playerData?.gameUnits);
  const activeBuildingsData: Record<string, BuildingInfo> = gameData || {};

  const jsonPlayersData = playersList?.filter(p => !p.isSystem) || [];
  const jsonSystemPlayersData = playersList?.filter(p => p.isSystem) || [];

  const [showTroops, setShowTroops] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [showUnits, setShowUnits] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);

  const [gameUnits, setGameUnits] = useState<UnitProduction[]>(() => {
    const initialLevels = Object.keys(buildingLevels).length > 0 ? buildingLevels : getInitialBuildings(race);
    const baseUnits = getUpgradedUnits(initialLevels, activeBuildingsData);
    const savedUnits = playerData?.gameUnits || [];
    
    return baseUnits.map(unit => {
      const saved = savedUnits.find((u: any) => u.name === unit.name);
      if (saved && saved.available !== undefined) {
        return { ...unit, available: saved.available };
      }
      return { ...unit, available: 0 };
    });
  });

  // Load gameUnits from backend when playerData becomes available
  useEffect(() => {
    if (playerData?.gameUnits) {
      setGameUnits(prevUnits => {
        let changed = false;
        const newUnits = prevUnits.map(unit => {
          const saved = playerData.gameUnits.find((u: any) => u.name === unit.name);
          const savedAvail = saved?.available ?? 0;
          if (savedAvail !== unit.available) {
            changed = true;
            return { ...unit, available: savedAvail };
          }
          return unit;
        });
        return changed ? newUnits : prevUnits;
      });
    }
  }, [playerData?.gameUnits]);

  const isFirstRender = useRef(true);

  // Recalculate stats when building levels or game data changes
  useEffect(() => {
    setGameUnits(prevUnits => {
      if (prevUnits.length === 0) return prevUnits;
      return applyBuildingLevelBonuses(prevUnits, buildingLevels, activeBuildingsData);
    });
  }, [buildingLevels, activeBuildingsData]);

  // Sync gameUnits to store when they change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const storeState = useGameStore.getState();
    if (storeState.playerData) {
      const unitsToSave = gameUnits.map(u => ({ name: u.name, available: u.available || 0 }));
      
      const currentSavedStr = JSON.stringify(storeState.playerData.gameUnits || []);
      const newSavedStr = JSON.stringify(unitsToSave);
      
      if (currentSavedStr !== newSavedStr) {
        useGameStore.setState({
          playerData: {
            ...storeState.playerData,
            gameUnits: unitsToSave
          }
        });
        storeState.syncPlayerState();
      }
    }
  }, [gameUnits]);

  // Sync local gameUnits from store when addCompletedUnit updates playerData.gameUnits
  useEffect(() => {
    if (!storeGameUnits) return;
    setGameUnits(prevUnits => {
      let changed = false;
      const newUnits = prevUnits.map(unit => {
        const saved = storeGameUnits.find((u: any) => u.name === unit.name);
        const savedAvail = saved?.available ?? 0;
        if (savedAvail !== unit.available) {
          changed = true;
          return { ...unit, available: savedAvail };
        }
        return unit;
      });
      return changed ? newUnits : prevUnits;
    });
  }, [storeGameUnits]);

  const [portalCountdown, setPortalCountdown] = useState<number | null>(null);
  const [portalCurrentTarget, setPortalCurrentTarget] = useState<number | null>(null);
  const [portalBattleResult, setPortalBattleResult] = useState<BattleResultType | null>(null);
  const [portalActiveTab, setPortalActiveTab] = useState<'players' | 'system'>('players');

  const [travelCount, setTravelCount] = useState(5);
  const maxTravels = 5;

  const handleTravelUsed = () => {
    setTravelCount(prev => Math.max(0, prev - 1));
  };

  useEffect(() => {
    if (portalCountdown === null) return;

    const timer = setTimeout(() => {
      if (portalCountdown > 0) {
        setPortalCountdown(portalCountdown - 1);
      } else {
        const target = portalCurrentTarget !== null ?
          (portalActiveTab === 'players'
            ? jsonPlayersData.find(p => p.id === portalCurrentTarget)
            : jsonSystemPlayersData.find(p => p.id === portalCurrentTarget)
          ) : null;

        if (target) {
          const result = simulateBattle(
            portalActiveTab === 'players' ? 'attack' : 'gather',
            target.level
          );
          setPortalBattleResult(result);
        }
        setPortalCountdown(null);
        setPortalCurrentTarget(null);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [portalCountdown, portalCurrentTarget, portalActiveTab]);

  useEffect(() => {
    (async () => {
      // Load game data; only set initial building levels if store has none yet
      await loadGameData();
      const currentLevels = useGameStore.getState().buildingLevels;
      if (Object.keys(currentLevels).length === 0) {
        initBuildingLevels(getInitialBuildings(race));
      }
    })();
  }, [race, loadGameData, initBuildingLevels]);



  const handleAddConstruction = (name: string) => {
    setSelectedBuilding(name);
  };

  const handleBuildingUpgraded = (buildingName: string, newLevel: number) => {
    setBuildingLevel(buildingName.toLowerCase(), newLevel);
  };

  const toggleTroopsPanel = () => {
    setShowTroops(!showTroops);
    setShowPortal(false);
    setShowUnits(false);
    setSelectedBuilding(null);
  };

  const togglePortalPanel = () => {
    setShowPortal(!showPortal);
    setShowTroops(false);
    setShowUnits(false);
    setSelectedBuilding(null);
  };

  const toggleUnitsPanel = () => {
    setShowUnits(!showUnits);
    setShowTroops(false);
    setShowPortal(false);
    setSelectedBuilding(null);
  };

  const handlePortalActionStart = (targetId: number) => {
    setPortalCurrentTarget(targetId);
    onBattle();
  };

  const handlePortalResultClose = () => {
    setPortalBattleResult(null);
    setPortalCurrentTarget(null);
    setPortalCountdown(null);
  };

  return (
    <PageContainer>
      <ResourcePanel resources={resources} race={race} />

      <LeftPanelButton onClick={toggleTroopsPanel} $race={race}>
        {showTroops ? '◄' : '►'} Army
      </LeftPanelButton>

      <RightPanelButton onClick={togglePortalPanel} $race={race}>
        {showPortal ? '►' : '◄'} Portal
      </RightPanelButton>

      <BottomPanelButton onClick={toggleUnitsPanel} $race={race}>
        {showUnits ? '▼' : '▲'} Formation
      </BottomPanelButton>

      <ExitGameButton onClick={onExit} $race={race}>
        ⏏ Salir
      </ExitGameButton>

      <ArmyPanel
        isOpen={showTroops}
        onClose={toggleTroopsPanel}
        race={race}
        gameUnits={gameUnits}
      />

      <PortalPanel
        isOpen={showPortal}
        onClose={togglePortalPanel}
        race={race}
        playersData={jsonPlayersData}
        systemPlayersData={jsonSystemPlayersData}
        countdown={portalCountdown}
        currentTarget={portalCurrentTarget}
        battleResult={portalBattleResult}
        onActionStart={handlePortalActionStart}
        onResultClose={handlePortalResultClose}
        activeTab={portalActiveTab}
        onTabChange={setPortalActiveTab}
        travelCount={travelCount}
        maxTravels={maxTravels}
        onTravelUsed={handleTravelUsed}
        formations={playerData?.formations}
      />

      <FormationPanel
        isOpen={showUnits}
        onClose={toggleUnitsPanel}
        race={race}
        gameUnits={gameUnits}
      />

      <MapWrapper $bg={currentRaceData.backgroundImage}>
        <MapStage>
          <BackgroundImage src={currentRaceData.backgroundImage} alt={`${race} city`} />
          <SquaresOverlay>
            {currentRaceData.squares.map((square) => {
              const bName = square.name.toLowerCase();
              const isBuilt = buildingLevels[bName] !== undefined;
              const bData = Object.values(activeBuildingsData).find((b: BuildingInfo) => b.name.toLowerCase() === bName);

              return (
                <ConstructionSquare
                  key={square.name}
                  style={{ top: square.top, left: square.left }}
                  onClick={() => handleAddConstruction(square.name)}
                  $race={race}
                >
                  <SquareInner>
                    {isBuilt && bData ? (
                      <BuildingImage
                        src={bData.image}
                        alt={`${square.name} building`}
                        $race={race}
                      />
                    ) : (
                      <ArcaneSymbol $race={race}>
                        {race === 'valdari' && '⚡'}
                        {race === 'gorkar' && '🔥'}
                        {race === 'sylvaran' && '🌿'}
                        {race === 'mortharim' && '💀'}
                      </ArcaneSymbol>
                    )}
                  </SquareInner>
                </ConstructionSquare>
              );
            })}
          </SquaresOverlay>
        </MapStage>
      </MapWrapper>

      <BuildingInfoPanel
        buildingId={selectedBuilding}
        onClose={() => setSelectedBuilding(null)}
        resources={resources}
        setResources={setResources}
        race={race}
        buildings={Object.entries(buildingLevels).map(([name, level]) => ({
          id: name,
          level: level
        }))}
        onBuildingUpgraded={handleBuildingUpgraded}
        currentLevel={selectedBuilding ? buildingLevels[selectedBuilding.toLowerCase()] || 1 : 1}
        gameUnits={gameUnits}
        setGameUnits={setGameUnits}
      />
    </PageContainer>
  );
};

/* =========================================================
   ESTILOS ACTUALIZADOS (UI Mejorada)
========================================================= */

const PageContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: 'Cinzel', 'Trajan Pro', 'Georgia', serif; /* Tipografía más épica */
  
  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: radial-gradient(circle, transparent 50%, rgba(0,0,0,0.9) 100%);
    pointer-events: none;
    z-index: 5; /* Por encima del mapa, por debajo de la UI */
  }
`;

const ambientMotion = keyframes`
  0% { transform: scale(1.05) translate(0, 0); }
  50% { transform: scale(1.15) translate(-1%, 1%); }
  100% { transform: scale(1.05) translate(0, 0); }
`;

const MapWrapper = styled.div<{ $bg: string }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
  background: #0a0805; /* Fondo más cálido en lugar de negro puro */
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -5%;
    left: -5%;
    right: -5%;
    bottom: -5%;
    background-image: url(${props => props.$bg});
    background-size: cover;
    background-position: center;
    filter: blur(40px) brightness(0.35) saturate(1.2);
    z-index: -1;
    animation: ${ambientMotion} 20s ease-in-out infinite;
  }
`;

const MapStage = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  height: fit-content;
  max-width: 100vw;
  max-height: 100vh;
  
  /* MÁSCARA CUADRADA: Degradados lineales cruzados para difuminar en línea recta los 4 bordes */
  mask-image: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%), 
              linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%), 
                      linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
  mask-composite: intersect;
  -webkit-mask-composite: source-in;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    box-shadow: inset 0 0 150px 60px rgba(0, 0, 0, 0.8), inset 0 0 300px rgba(0,0,0,0.4);
    pointer-events: none;
    z-index: 1;
  }
`;

const BackgroundImage = styled.img`
  max-width: 100vw;
  max-height: 100vh;
  object-fit: contain;
  display: block;
`;

const SquaresOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  
  & > * {
    pointer-events: auto;
  }
`;

/* EDIFICIOS: Interacción y Sombras mejoradas */
const ConstructionSquare = styled.div<ConstructionSquareProps>`
  position: absolute;
  width: 15%; 
  height: 15%;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  z-index: 2;
  border-radius: ${props => props.$race === 'sylvaran' ? '50%' : '0'};
  
  /* Sombra base para asentar el edificio en el terreno */
  filter: drop-shadow(0px 15px 15px rgba(0,0,0,0.7));

  &:hover {
    transform: translateY(-8px); /* Efecto de flotación al pasar el ratón */
    z-index: 10;
  }

  /* Aplica un brillo al edificio hijo cuando se hace hover */
  &:hover img {
    filter: drop-shadow(0 0 15px ${props => raceColors[props.$race].primary}) brightness(1.2) ${props => props.$race === 'mortharim' ? 'sepia(50%) hue-rotate(240deg)' : ''};
  }
`;

const SquareInner = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(45deg); 
  position: relative;
`;

const ArcaneSymbol = styled.span<RaceStyledProps>`
  font-size: 2vw;
  color: ${props => raceColors[props.$race].primary};
  text-shadow: 0 0 10px ${props => raceColors[props.$race].primary};
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% { opacity: 0.6; transform: scale(0.9); }
    50% { opacity: 1; transform: scale(1.1); }
    100% { opacity: 0.6; transform: scale(0.9); }
  }
`;

const BuildingImage = styled.img<RaceStyledProps>`
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform: rotate(-45deg) scale(1.4);
  filter: ${props => props.$race === 'mortharim' ? 'sepia(50%) hue-rotate(240deg)' : 'none'};
  transition: filter 0.3s ease;
`;

/* HUD BOTONES: Estilo Glassmorphism / UI Cima de juego */
const PanelButtonBase = styled.button<RaceStyledProps>`
  position: fixed;
  background: rgba(15, 15, 20, 0.6); 
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  
  color: ${props => raceColors[props.$race].primary};
  border: 1px solid rgba(255, 255, 255, 0.1); 
  border-bottom: 2px solid ${props => raceColors[props.$race].primary};
  
  cursor: pointer;
  z-index: 99;
  font-weight: 700;
  font-size: 1.1rem;
  font-family: 'Almendra', 'Cinzel', serif;
  text-transform: capitalize;
  letter-spacing: 0.5px;
  font-size: 1.25rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background: rgba(30, 30, 40, 0.8);
    box-shadow: 0 0 20px ${props => raceColors[props.$race].primary}40;
    text-shadow: 0 0 8px ${props => raceColors[props.$race].primary};
  }
`;

const LeftPanelButton = styled(PanelButtonBase)`
  left: 0;
  top: 5%;
  transform: translateY(-50%);
  border-left: none;
  border-radius: 0 8px 8px 0;
  padding: 12px 16px;
  
  &:hover {
    padding-left: 20px; 
  }
`;

const RightPanelButton = styled(PanelButtonBase)`
  right: 0;
  top: 5%;
  transform: translateY(-50%);
  border-right: none;
  border-radius: 8px 0 0 8px;
  padding: 12px 16px;
  
  &:hover {
    padding-right: 20px;
  }
`;

const BottomPanelButton = styled(PanelButtonBase)`
  bottom: 1%;
  left: 50%;
  transform: translateX(-50%);
  border-bottom: none;
  border-top: 2px solid ${props => raceColors[props.$race].primary};
  border-radius: 8px 8px 0 0;
  padding: 12px 24px;
  
  &:hover {
    padding-bottom: 18px;
    transform: translateX(-50%) translateY(-2px);
  }
`;

/* Botón de Salir - Estilo de Peligro / Advertencia */
const ExitGameButton = styled(PanelButtonBase)`
  bottom: 20px;
  left: 20px;
  border-radius: 8px;
  padding: 10px 20px;
  background: rgba(40, 10, 10, 0.6); 
  border: 1px solid rgba(255, 68, 68, 0.3);
  border-left: 3px solid #ff4444; 
  color: #ffcccc;
  border-bottom: 1px solid rgba(255, 68, 68, 0.3); /* Sobrescribe la línea de raza */
  
  &:hover {
    background: rgba(80, 20, 20, 0.8);
    border-color: #ff4444;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 68, 68, 0.4);
    text-shadow: 0 0 8px #ff4444;
  }
`;

export default RacePage;