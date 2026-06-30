import styled from 'styled-components';
import type { RaceType } from '../../types/gameData';
import { raceColors } from '../../types/raceColors';

// Función helper para convertir HEX a RGB
export const hexToRgb = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
};

// Contenedor principal del panel izquierdo
export const LeftPanelContainer = styled.div<{ $isOpen: boolean; $race: RaceType }>`
  position: fixed;
  left: ${({ $isOpen }) => $isOpen ? '0' : '-400px'};
  top: 0;
  width: 400px;
  height: 100vh;
  background: ${({ $race }) => raceColors[$race].background || 'rgba(10, 10, 15, 0.98)'};
  border-right: 2px solid ${({ $race }) => raceColors[$race].color};
  z-index: 98;
  transition: left 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 0; /* Quitamos padding global para el HUD */
  box-shadow: 10px 0 30px rgba(0, 0, 0, 0.8);
  color: ${({ $race }) => raceColors[$race].textColor || 'white'};
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
  &::-webkit-scrollbar-thumb { 
    background: ${({ $race }) => raceColors[$race].color};
    border-radius: 10px;
  }
`;

/* Cabecera HUD - Sincronizado con Portal */
export const PanelHeader = styled.div<{ $race: RaceType }>`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between; /* Mantiene la población a la derecha */
  gap: 12px;
  padding: 14px 16px;
  background: rgba(12, 12, 18, 0.98);
  border-bottom: 1px solid ${({ $race }) => `rgba(${hexToRgb(raceColors[$race].color)}, 0.4)`};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
`;

export const HeaderOrbe = styled.div<{ $race: RaceType }>`
  width: 32px;
  height: 32px;
  background: radial-gradient(circle, #fff 20%, ${({ $race }) => raceColors[$race].color} 100%);
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  box-shadow: 0 0 12px ${({ $race }) => raceColors[$race].color};
`;

// Título del panel
export const PanelTitle = styled.h2<{ $race: RaceType }>`
  color: #fff;
  font-family: 'Cinzel', serif;
  font-size: 0.8rem;
  letter-spacing: 3px;
  text-transform: uppercase;
  font-weight: 300;
  margin: 0;
  flex: 1;
  text-align: center;
  text-shadow: 0 0 8px ${({ $race }) => raceColors[$race].color};
  opacity: 0.85;
`;

// Contenedor de pestañas - Sincronizado
export const Tabs = styled.div<{ $race: RaceType }>`
  display: flex;
  margin-bottom: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  gap: 0;
  background: rgba(5, 5, 10, 0.6);
  padding: 0;
  overflow-x: auto;
  
  /* Elegant scrollbar for desktop users */
  &::-webkit-scrollbar {
    height: 3px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ $race }) => raceColors[$race].color};
    border-radius: 2px;
  }
`;

// Botones de pestaña
export const TabButton = styled.button<{ $active: boolean; $race: RaceType }>`
  flex: 1;
  min-width: max-content;
  white-space: nowrap;
  padding: 12px 16px;
  background: ${({ $active, $race }) => $active ? 
    `rgba(${hexToRgb(raceColors[$race].color)}, 0.1)` : 
    'transparent'};
  color: ${({ $active, $race }) => $active ? 
    raceColors[$race].color : 
    'rgba(255,255,255,0.6)'};
  border: none;
  border-bottom: ${({ $active, $race }) => $active ? 
    `2px solid ${raceColors[$race].color}` : 
    '1px solid transparent'};
  cursor: pointer;
  font-weight: ${({ $active }) => $active ? '600' : '400'};
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 1px;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
  }
`;

// Contenedor de unidades
export const UnitsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  padding: 12px 16px 16px;
`;

// Tarjeta de unidad individual
export const UnitCard = styled.div<{ $race: RaceType; $isSelected: boolean }>`
  display: flex;
  background: ${({ $race, $isSelected }) => 
    $isSelected 
      ? `rgba(${hexToRgb(raceColors[$race].color)}, 0.15)` 
      : 'rgba(255, 255, 255, 0.04)'};
  border: 1px solid ${({ $race, $isSelected }) => 
    $isSelected 
      ? raceColors[$race].color 
      : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: ${({ $race }) => `rgba(${hexToRgb(raceColors[$race].color)}, 0.5)`};
    transform: translateX(4px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  }
`;

// Contenedor de imagen de unidad
export const UnitImageContainer = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  margin-right: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: hidden;
`;

// Contenedor de imagen (para manejar hover)
export const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
`;

// Imagen estática de unidad
export const UnitStaticImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

// Imagen GIF de unidad
export const UnitGif = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

// Fallback para imagen (cuando hay error)
export const ImageFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0,0,0,0.5);
  color: white;
  font-size: 0.7rem;
  text-align: center;
  padding: 5px;
`;

// Contenedor de información de unidad
export const UnitInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

// Contenedor de nombre y disponibilidad
export const UnitNameContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

// Nombre de la unidad
export const UnitName = styled.h3<{ $race: RaceType }>`
  margin: 0;
  color: ${({ $race }) => raceColors[$race].color};
  font-size: 1.1rem;
`;

// Disponibilidad de la unidad
export const UnitAvailable = styled.span<{ $race: RaceType }>`
  font-size: 0.7rem;
  color: ${({ $race }) => raceColors[$race].color};
  background: ${({ $race }) => `rgba(${hexToRgb(raceColors[$race].color)}, 0.1)`};
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid ${({ $race }) => `rgba(${hexToRgb(raceColors[$race].color)}, 0.2)`};
  font-family: 'Orbitron', sans-serif;
`;

// Estadísticas de la unidad
export const UnitStats = styled.div<{ $race: RaceType }>`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin: 6px 0;
  padding: 6px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

// Item individual de estadística
export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// Etiqueta de estadística
export const StatLabel = styled.div<{ $race: RaceType }>`
  font-size: 0.7rem;
  color: ${({ $race }) => raceColors[$race].color};
  margin-bottom: 2px;
`;

// Valor de estadística
export const StatValue = styled.div`
  font-weight: bold;
  font-size: 0.9rem;
`;

// Costo de la unidad
export const UnitCost = styled.div<{ $race: RaceType }>`
  display: flex;
  align-items: center;
  margin-top: auto;
  font-size: 0.8rem;
`;

// Etiqueta de costo
export const CostLabel = styled.span<{ $race: RaceType }>`
  color: ${({ $race }) => raceColors[$race].color};
  margin-right: 5px;
`;

// Valor del costo
export const CostValue = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
`;

// Icono de oro
export const GoldIcon = styled.span`
  color: gold;
`;