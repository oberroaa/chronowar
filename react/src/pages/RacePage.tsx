import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  SquaresValdari,
  SquaresGorkar,
  SquaresSylvaran,
  SquaresMortharim,
  type ResourceType,
  type UnitProduction,
  type RaceType,
  raceOptions
} from '../types/gameData';
import ResourcePanel from '../components/ResourcePanel/index';
import ArmyPanel from '../components/ArmyPanel/index';
import PortalPanel from '../components/PortalPanel/index';
import BuildingInfoPanel from '../components/BuildingInfoPanel/index';
import FormationPanel from '../components/FormationPanel/index';
import {
  recursosPlayer,
  buildingsData,
} from '../types/jsonResponse';
import { raceColors } from '../types/raceColors';
import { jsonPlayersData, jsonSystemPlayersData } from '../types/jsonResponse';

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

// Tipo para los datos de edificios (imagen y nivel)
type BuildingData = {
  image: string;
  level: number;
};

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
const getInitialBuildings = (race: RaceType): Record<string, BuildingData> => {
  const buildings: Record<string, BuildingData> = {};

  // Filtramos los edificios por raza y creamos el objeto inicial
  Object.values(buildingsData) // Convierte el objeto buildingsData en un array de sus valores
    .filter(building => building.race === race) // Filtra solo los edificios de la raza actual
    .forEach(building => {
      buildings[building.name.toLowerCase()] = { // Crea una propiedad con el nombre del edificio
        image: building.image, // Guarda la imagen del edificio
        level: building.level // Guarda el nivel inicial del edificio
      };
    });

  return buildings; // Devuelve el objeto con todos los edificios de la raza
};

// Obtener datos específicos para cada raza
const getRaceOption = (race: RaceType) => {
  const option = raceOptions.find(r => r.value === race); // Busca la raza en las opciones
  if (!option) throw new Error(`Race ${race} not found in options`); // Error si no se encuentra
  return option; // Devuelve los datos de la raza
};

// Datos específicos para cada raza
const raceData = {
  valdari: {
    backgroundImage: getRaceOption('valdari').backgroundImage, // Imagen de fondo Valdari
    squares: SquaresValdari, // Cuadros de construcción Valdari
    description: getRaceOption('valdari').desc // Descripción Valdari
  },
  gorkar: {
    backgroundImage: getRaceOption('gorkar').backgroundImage, // Imagen de fondo Gorkar
    squares: SquaresGorkar, // Cuadros de construcción Gorkar
    description: getRaceOption('gorkar').desc // Descripción Gorkar
  },
  sylvaran: {
    backgroundImage: getRaceOption('sylvaran').backgroundImage, // Imagen de fondo Sylvaran
    squares: SquaresSylvaran, // Cuadros de construcción Sylvaran
    description: getRaceOption('sylvaran').desc // Descripción Sylvaran
  },
  mortharim: {
    backgroundImage: getRaceOption('mortharim').backgroundImage, // Imagen de fondo Mortharim
    squares: SquaresMortharim, // Cuadros de construcción Mortharim
    description: getRaceOption('mortharim').desc // Descripción Mortharim
  }
};

// Función para extraer unidades de buildingsData
const getUnitsFromBuildings = (): UnitProduction[] => {
  const allUnits: UnitProduction[] = []; // Array para almacenar todas las unidades

  // Recorre todos los edificios
  Object.values(buildingsData).forEach(building => {
    // Por cada edificio, recorre sus unidades producidas
    building.unitsProduced.forEach(unit => {
      // Agrega la unidad al array
      allUnits.push({
        id: unit.id, // ID de la unidad
        name: unit.name, // Nombre de la unidad
        unitType: unit.unitType, // Tipo de unidad
        cost: unit.cost, // Costo de producción
        buildTime: unit.buildTime, // Tiempo de construcción
        image: unit.image, // Imagen de la unidad
        gif: unit.gif || '', // Animación GIF (si existe)
        special: unit.special, // Habilidades especiales
        attack: unit.attack, // Poder de ataque
        weaponType: unit.weaponType, // Tipo de arma
        armorType: unit.armorType, // Tipo de armadura
        armor: unit.armor, // Nivel de armadura
        hp: unit.hp, // Puntos de vida
        hpRegen: unit.hpRegen, // Regeneración de vida
        mana: unit.mana, // Puntos de maná
        manaRegen: unit.manaRegen, // Regeneración de maná
        transportSize: unit.transportSize, // Capacidad de transporte
        available: unit.available // Disponibilidad inicial
      });
    });
  });

  return allUnits; // Devuelve todas las unidades
};

// Función para simular resultados de batalla/recolección
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

// Componente principal RacePage
const RacePage: React.FC<RacePageProps> = ({ race, onBattle, onExit }) => {
  // Obtiene los datos específicos de la raza actual
  const currentRaceData = raceData[race];

  // Estado para los edificios construidos (imagen y nivel)
  const [constructions, setConstructions] = useState<Record<string, BuildingData>>(
    getInitialBuildings(race) // Inicializa con los edificios de la raza
  );

  // Estado para los recursos del jugador
  const [resources, setResources] = useState<Record<ResourceType, number>>(recursosPlayer);

  // Estados para controlar la visibilidad de los paneles
  const [showTroops, setShowTroops] = useState(false); // Panel de ejército
  const [showPortal, setShowPortal] = useState(false); // Panel de portal
  const [showUnits, setShowUnits] = useState(false);   // Panel de formación
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null); // Edificio seleccionado

  // Estado para las unidades disponibles
  const [gameUnits, setGameUnits] = useState<UnitProduction[]>(getUnitsFromBuildings());

  // Estados para el portal (ahora en el componente padre)
  const [portalCountdown, setPortalCountdown] = useState<number | null>(null);
  const [portalCurrentTarget, setPortalCurrentTarget] = useState<number | null>(null);
  const [portalBattleResult, setPortalBattleResult] = useState<BattleResultType | null>(null);
  const [portalActiveTab, setPortalActiveTab] = useState<'players' | 'system'>('players');

  // NUEVOS ESTADOS PARA EL SISTEMA DE VIAJES
  const [travelCount, setTravelCount] = useState(5); // Inicia con 5 viajes
  const maxTravels = 5; // Máximo de viajes

  // Función que se ejecuta cuando se usa un viaje
  const handleTravelUsed = () => {
    setTravelCount(prev => Math.max(0, prev - 1));
  };


  // Efecto para manejar la cuenta regresiva del portal
  useEffect(() => {
    if (portalCountdown === null) return;

    const timer = setTimeout(() => {
      if (portalCountdown > 0) {
        setPortalCountdown(portalCountdown - 1);
      } else {
        // Cuando la cuenta regresiva termina, simular la batalla/recolección
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

  // Maneja la selección de un edificio
  const handleAddConstruction = (name: string) => {
    if (constructions[name.toLowerCase()]) { // Verifica si el edificio existe
      setSelectedBuilding(name); // Establece el edificio como seleccionado
    }
  };

  // Actualiza el nivel de un edificio
  const handleBuildingUpgraded = (buildingName: string, newLevel: number) => {
    setConstructions(prev => ({
      ...prev, // Mantiene los edificios existentes
      [buildingName.toLowerCase()]: { // Actualiza el edificio específico
        ...prev[buildingName.toLowerCase()], // Mantiene la imagen
        level: newLevel // Actualiza el nivel
      }
    }));
  };

  // Alternar visibilidad del panel de ejército
  const toggleTroopsPanel = () => {
    setShowTroops(!showTroops); // Cambia el estado de visibilidad
    setShowPortal(false); // Cierra otros paneles
    setShowUnits(false); // Cierra otros paneles
    setSelectedBuilding(null); // Deselecciona edificios
  };

  // Alternar visibilidad del panel de portal
  const togglePortalPanel = () => {
    setShowPortal(!showPortal); // Cambia el estado de visibilidad
    setShowTroops(false); // Cierra otros paneles
    setShowUnits(false); // Cierra otros paneles
    setSelectedBuilding(null); // Deselecciona edificios
  };

  // Alternar visibilidad del panel de formación
  const toggleUnitsPanel = () => {
    setShowUnits(!showUnits); // Cambia el estado de visibilidad
    setShowTroops(false); // Cierra otros paneles
    setShowPortal(false); // Cierra otros paneles
    setSelectedBuilding(null); // Deselecciona edificios
  };

  // Manejar inicio de acción en el portal
  const handlePortalActionStart = (targetId: number) => {
    setPortalCurrentTarget(targetId);
    // En lugar de esperar 60 segundos, vamos directo a la batalla
    onBattle(); 
  };

  // Cerrar resultado del portal
  const handlePortalResultClose = () => {
    setPortalBattleResult(null);
    setPortalCurrentTarget(null);
    setPortalCountdown(null);
  };

  return (
    <PageContainer>
      {/* Panel superior de recursos */}
      <ResourcePanel resources={resources} race={race} />

      {/* Botones para abrir/cerrar paneles laterales */}
      <LeftPanelButton onClick={toggleTroopsPanel} $race={race}>
        {showTroops ? '◄' : '►'} Army {/* Cambia el ícono según el estado */}
      </LeftPanelButton>

      <RightPanelButton onClick={togglePortalPanel} $race={race}>
        {showPortal ? '►' : '◄'} Portal {/* Cambia el ícono según el estado */}
      </RightPanelButton>

      <BottomPanelButton onClick={toggleUnitsPanel} $race={race}>
        {showUnits ? '▼' : '▲'} Formation {/* Cambia el ícono según el estado */}
      </BottomPanelButton>

      {/* Paneles desplegables */}
      <ArmyPanel
        isOpen={showTroops} // Estado de visibilidad
        onClose={toggleTroopsPanel} // Función para cerrar
        race={race} // Raza actual
        gameUnits={gameUnits} // Unidades disponibles
      />

      <PortalPanel
        isOpen={showPortal}
        onClose={togglePortalPanel}
        race={race}
        countdown={portalCountdown}
        currentTarget={portalCurrentTarget}
        battleResult={portalBattleResult}
        onActionStart={handlePortalActionStart}
        onResultClose={handlePortalResultClose}
        activeTab={portalActiveTab}
        onTabChange={setPortalActiveTab}
        // NUEVAS PROPS PARA EL SISTEMA DE VIAJES
        travelCount={travelCount}
        maxTravels={maxTravels}
        onTravelUsed={handleTravelUsed}
      />

      <FormationPanel
        isOpen={showUnits}
        onClose={toggleUnitsPanel}
        race={race}
        gameUnits={gameUnits} // ← Agrega esta línea
      />

      {/* Imagen de fondo de la ciudad */}
      <BackgroundImage src={currentRaceData.backgroundImage} alt={`${race} city`} />

      {/* Contenedor principal de los cuadros de construcción */}
      <ContentContainer>
        {/* Mapea cada square (cuadrado de construcción) de la raza actual */}
        {currentRaceData.squares.map((square) => (
          // Cuadrado de construcción individual
          <ConstructionSquare
            key={square.name} // Clave única para React
            style={{ top: square.top, left: square.left }} // Posición en pantalla
            onClick={() => handleAddConstruction(square.name)} // Al hacer click
            $race={race} // Propiedad de raza para estilos
          >
            {/* Contenedor interno del cuadrado */}
            <SquareInner>
              {/* Si el edificio existe en constructions, muestra su imagen */}
              {constructions[square.name.toLowerCase()] ? (
                // Imagen del edificio
                <BuildingImage
                  src={constructions[square.name.toLowerCase()].image}
                  alt={`${square.name} building`}
                  $race={race} // Propiedad de raza para estilos
                />
              ) : (
                // Si no hay edificio, muestra un símbolo según la raza
                <ArcaneSymbol $race={race}>
                  {race === 'valdari' && '⚡'} // Valdari: rayo
                  {race === 'gorkar' && '🔥'}  // Gorkar: fuego
                  {race === 'sylvaran' && '🌿'} // Sylvaran: planta
                  {race === 'mortharim' && '💀'} // Mortharim: calavera
                </ArcaneSymbol>
              )}
            </SquareInner>
          </ConstructionSquare>
        ))}
      </ContentContainer>

      {/* Panel de información del edificio seleccionado */}
      <BuildingInfoPanel
        buildingId={selectedBuilding} // ID del edificio seleccionado
        onClose={() => setSelectedBuilding(null)} // Función para cerrar
        resources={resources} // Recursos actuales
        setResources={setResources} // Función para actualizar recursos
        race={race} // Raza actual
        buildings={Object.entries(constructions).map(([name, data]) => ({
          id: name, // ID del edificio
          level: data.level // Nivel del edificio
        }))}
        onBuildingUpgraded={handleBuildingUpgraded} // Función para mejorar edificios
        currentLevel={selectedBuilding ? constructions[selectedBuilding.toLowerCase()]?.level || 1 : 1} // Nivel actual
        gameUnits={gameUnits} // Unidades disponibles
        setGameUnits={setGameUnits} // Función para actualizar unidades
      />
    </PageContainer>
  );
};

// Contenedor principal (full viewport)
const PageContainer = styled.div`
  position: fixed; // Posición fija en la pantalla
  top: 0; // Desde arriba
  left: 0; // Desde la izquierda
  width: 100vw; // Ancho completo del viewport
  height: 100vh; // Alto completo del viewport
  overflow: hidden; // Oculta el overflow
`;

// Imagen de fondo (ciudad)
const BackgroundImage = styled.img`
  position: fixed; // Posición fija
  top: 0; // Desde arriba
  left: 0; // Desde la izquierda
  width: 100vw; // Ancho completo
  height: 100vh; // Alto completo
  object-fit: fill; // Ajusta la imagen al contenedor
  z-index: -1; // Detrás de todo
`;

// Contenedor de los cuadros de construcción
const ContentContainer = styled.div`
  position: absolute; // Posición absoluta
  top: 0; // Desde arriba
  left: 0; // Desde la izquierda
  width: 100%; // Ancho completo
  height: 100%; // Alto completo
`;

// Cuadro individual de construcción
const ConstructionSquare = styled.div<ConstructionSquareProps>`
  position: absolute; // Posición absoluta
  width: 15%; // Ancho relativo
  height: 15%; // Alto relativo
  transform: rotate(90deg); // Rota 90 grados (efecto diamante)
  transition: all 0.3s ease; // Transición suave
  cursor: pointer; // Cursor de pointer
  z-index: 2; // Por encima del fondo
  border-radius: ${props => props.$race === 'sylvaran' ? '50%' : '0'}; // Redondo para Sylvaran
`;

// Contenido interno del cuadro
const SquareInner = styled.div`
  width: 100%; // Ancho completo
  height: 100%; // Alto completo
  display: flex; // Flexbox para centrar
  align-items: center; // Centrado vertical
  justify-content: center; // Centrado horizontal
  transform: rotate(-45deg); // Compensa la rotación exterior
  position: relative; // Posición relativa
`;

// Símbolo arcano (mostrado cuando no hay edificio)
const ArcaneSymbol = styled.span<RaceStyledProps>`
  font-size: 2vw; // Tamaño de fuente relativo
  color: ${props => raceColors[props.$race].primary}; // Color según la raza
  text-shadow: ${props => raceColors[props.$race].primary}; // Sombra según la raza
`;

// Imagen del edificio
const BuildingImage = styled.img<RaceStyledProps>`
  width: 100%; // Ancho completo
  height: 100%; // Alto completo
  object-fit: contain; // Mantiene la proporción
  transform: rotate(-45deg) scale(1.4); // Compensa rotación y escala
  filter: ${props => props.$race === 'mortharim' ? 'sepia(50%) hue-rotate(240deg)' : 'none'}; // Filtro para Mortharim
`;

// Estilo base para botones de panel
const PanelButtonBase = styled.button<RaceStyledProps>`
  position: fixed; // Posición fija
  background: rgba(0, 0, 0, 0.7); // Fondo semitransparente
  color: ${props => raceColors[props.$race].primary}; // Color según la raza
  border: 2px solid ${props => raceColors[props.$race].primary}; // Borde según la raza
  cursor: pointer; // Cursor de pointer
  z-index: 99; // Por encima de casi todo
  font-weight: bold; // Texto en negrita
  font-size: 1.2rem; // Tamaño de fuente
  transition: all 0.3s ease; // Transición suave
  
  &:hover {
    background: rgba(50, 50, 50, 0.8); // Fondo más claro al hover
  }
`;

// Botón del panel izquierdo (ejército)
const LeftPanelButton = styled(PanelButtonBase)`
  left: 0; // A la izquierda
  top: 5%; // 5% desde arriba
  transform: translateY(-50%); // Centrado vertical
  border-left: none; // Sin borde izquierdo
  border-radius: 0 10px 10px 0; // Bordes redondeados a la derecha
  padding: 15px 5px; // Espaciado interno
  
  &:hover {
    padding-left: 10px; // Efecto de expansión al hover
  }
`;

// Botón del panel derecho (portal)
const RightPanelButton = styled(PanelButtonBase)`
  right: 0; // A la derecha
  top: 5%; // 5% desde arriba
  transform: translateY(-50%); // Centrado vertical
  border-right: none; // Sin borde derecho
  border-radius: 10px 0 0 10px; // Bordes redondeados a la izquierda
  padding: 15px 5px; // Espaciado interno
  
  &:hover {
    padding-right: 10px; // Efecto de expansión al hover
  }
`;

// Botón del panel inferior (formación)
const BottomPanelButton = styled(PanelButtonBase)`
  bottom: 1%; // 1% desde abajo
  left: 50%; // Centrado horizontal
  transform: translateX(-50%); // Compensación para centrar
  border-bottom: none; // Sin borde inferior
  border-radius: 10px 10px 0 0; // Bordes redondeados arriba
  padding: 10px 20px; // Espaciado interno
  
  &:hover {
    padding-bottom: 15px; // Efecto de expansión al hover
  }
`;

export default RacePage;