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
  left: ${({ $isOpen }) => $isOpen ? '0' : '-350px'};
  top: 0;
  width: 350px;
  height: 100vh;
  background: ${({ $race }) => raceColors[$race].background || 'rgba(0, 0, 0, 0.9)'};
  border-right: 2px solid ${({ $race }) => raceColors[$race].color};
  z-index: 98;
  transition: left 0.3s ease;
  padding: 20px;
  box-shadow: 5px 0 15px rgba(0, 0, 0, 0.5);
  color: ${({ $race }) => raceColors[$race].textColor || 'white'};
  overflow-y: auto;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, 
      ${({ $race }) => raceColors[$race].color} 0%, 
      ${({ $race }) => raceColors[$race].secondaryColor} 100%);
  }

  @media (max-width: 400px) {
    width: 300px;
    padding: 15px;
  }
`;

// Botón para cerrar el panel
export const CloseButton = styled.button<{ $race: RaceType }>`
  position: absolute;
  left: 50%;
  top: 10px;
  transform: translateX(-50%);
  background: none;
  border: none;
  color: ${({ $race }) => raceColors[$race].color};
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 99;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${({ $race }) => raceColors[$race].secondaryColor || 'white'};
    text-shadow: 0 0 5px ${({ $race }) => raceColors[$race].color};
    transform: translateX(-50%) scale(1.2);
  }
`;

// Título del panel
export const PanelTitle = styled.h2<{ $race: RaceType }>`
  color: ${({ $race }) => raceColors[$race].color};
  text-align: center;
  margin-bottom: 20px;
  font-family: ${({ $race }) => raceColors[$race].textColor || "'Arial', sans-serif"};
  text-shadow: 1px 1px 2px black;
  position: relative;
  font-size: 1.5rem;
  letter-spacing: 1px;
  
  &::before, &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 30px;
    height: 2px;
    background: ${({ $race }) => raceColors[$race].color};
    opacity: 0.7;
  }
  
  &::before {
    left: 10px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      ${({ $race }) => raceColors[$race].color} 100%);
  }
  
  &::after {
    right: 10px;
    background: linear-gradient(90deg, 
      ${({ $race }) => raceColors[$race].color} 0%, 
      transparent 100%);
  }

  @media (max-width: 400px) {
    font-size: 1.3rem;
    
    &::before, &::after {
      width: 20px;
    }
  }
`;

// Contenedor de pestañas
export const Tabs = styled.div<{ $race: RaceType }>`
  display: flex;
  margin-bottom: 15px;
  border-bottom: 1px solid ${({ $race }) => raceColors[$race].secondaryColor};
  gap: 5px;
  overflow-x: auto;
  padding-bottom: 5px;
`;

// Botones de pestaña
export const TabButton = styled.button<{ $active: boolean; $race: RaceType }>`
  padding: 8px 12px;
  background: ${({ $active, $race }) => $active ? 
    `rgba(${hexToRgb(raceColors[$race].color)}, 0.3)` : 
    'transparent'};
  color: ${({ $active, $race }) => $active ? 
    raceColors[$race].color : 
    raceColors[$race].textColor || '#ccc'};
  border: none;
  border-bottom: ${({ $active, $race }) => $active ? 
    `2px solid ${raceColors[$race].color}` : 
    'none'};
  cursor: pointer;
  font-weight: ${({ $active }) => $active ? 'bold' : 'normal'};
  font-family: ${({ $race }) => raceColors[$race].textColor || "'Arial', sans-serif"};
  transition: all 0.2s ease;
  border-radius: 4px 4px 0 0;
  white-space: nowrap;
  
  &:hover {
    background: ${({ $race }) => `rgba(${hexToRgb(raceColors[$race].color)}, 0.2)`};
    color: ${({ $race }) => raceColors[$race].color};
  }

  @media (max-width: 400px) {
    padding: 6px 10px;
    font-size: 0.8rem;
  }
`;

// Contenedor de unidades
export const UnitsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  padding: 5px;
`;

// Tarjeta de unidad individual
export const UnitCard = styled.div<{ $race: RaceType; $isSelected: boolean }>`
  display: flex;
  background: ${({ $race, $isSelected }) => 
    $isSelected 
      ? `rgba(${hexToRgb(raceColors[$race].color)}, 0.2)` 
      : `rgba(${hexToRgb(raceColors[$race].secondaryColor)}, 0.1)`};
  border: 1px solid ${({ $race, $isSelected }) => 
    $isSelected 
      ? raceColors[$race].color 
      : raceColors[$race].secondaryColor};
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    border-color: ${({ $race }) => raceColors[$race].color};
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
  object-fit: contain;
  image-rendering: crisp-edges;
`;

// Imagen GIF de unidad
export const UnitGif = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
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
  font-size: 0.8rem;
  color: ${({ $race }) => raceColors[$race].secondaryColor};
`;

// Estadísticas de la unidad
export const UnitStats = styled.div<{ $race: RaceType }>`
  display: flex;
  gap: 10px;
  margin: 5px 0;
  padding: 5px 0;
  border-top: 1px dashed ${({ $race }) => raceColors[$race].secondaryColor};
  border-bottom: 1px dashed ${({ $race }) => raceColors[$race].secondaryColor};
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