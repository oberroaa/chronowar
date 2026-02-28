import styled from 'styled-components';
import { raceColors } from '../../types/raceColors';
import type { 
  StyledRaceProps, 
  StyledOpenProps,
  StyledActiveProps,
  StyledActionProps,
  StyledDisabledProps,
  StyledLowProps,
  StyledCriticalProps
} from './types';
import { hexToRgb } from './Modal.styles';

/* Contenedor principal del panel derecho */
export const RightPanelContainer = styled.div<StyledOpenProps & StyledRaceProps>`
  position: fixed;
  right: ${({ $isOpen }) => $isOpen ? '0' : '-350px'};
  top: 0;
  width: 350px;
  height: 100vh;
  background: ${({ $race }) => raceColors[$race].background || 'rgba(0, 0, 0, 0.9)'};
  border-left: 2px solid ${({ $race }) => raceColors[$race].color};
  z-index: 98;
  transition: right 0.3s ease;
  padding: 20px;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.5);
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

/* Botón de cerrar el panel */
export const CloseButton = styled.button<StyledRaceProps>`
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: translateX(-50%);
  }
`;

/* Título del panel */
export const PanelTitle = styled.h2<StyledRaceProps>`
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

/* Estilo base para las tablas */
export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
`;

/* Cabeceras de las tablas */
export const TableHeader = styled.th<StyledRaceProps>`
  background: ${({ $race }) => `rgba(${hexToRgb(raceColors[$race].color)}, 0.3)`};
  color: ${({ $race }) => raceColors[$race].color};
  padding: 10px;
  text-align: left;
  border-bottom: 2px solid ${({ $race }) => raceColors[$race].secondaryColor};
  font-family: ${({ $race }) => raceColors[$race].textColor || "'Arial', sans-serif"};
  font-weight: bold;
  letter-spacing: 0.5px;

  @media (max-width: 400px) {
    padding: 8px;
    font-size: 0.9rem;
  }
`;

/* Filas de las tablas */
export const TableRow = styled.tr<StyledRaceProps>`
  &:nth-child(even) {
    background: ${({ $race }) => raceColors[$race].background || 'rgba(50, 50, 50, 0.5)'};
  }
  
  &:nth-child(odd) {
    background: ${({ $race }) => raceColors[$race].background || 'transparent'};
  }
  
  &:hover {
    background: ${({ $race }) => `rgba(${hexToRgb(raceColors[$race].color)}, 0.1)`};
    box-shadow: inset 0 0 10px ${({ $race }) => raceColors[$race].secondaryColor};
  }
`;

/* Celdas de las tablas */
export const TableCell = styled.td`
  padding: 10px;
  border-bottom: 1px solid #444;

  @media (max-width: 400px) {
    padding: 8px;
    font-size: 0.9rem;
  }
`;

/* Contenedor de las pestañas */
export const Tabs = styled.div<StyledRaceProps>`
  display: flex;
  margin-bottom: 15px;
  border-bottom: 1px solid ${({ $race }) => raceColors[$race].secondaryColor};
  gap: 5px;
`;

/* Botones de las pestañas */
export const TabButton = styled.button<StyledActiveProps & StyledRaceProps>`
  flex: 1;
  padding: 10px;
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
  
  &:hover {
    background: ${({ $race, disabled }) => !disabled ? `rgba(${hexToRgb(raceColors[$race].color)}, 0.2)` : 'transparent'};
    color: ${({ $race, disabled }) => !disabled ? raceColors[$race].color : raceColors[$race].textColor};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 400px) {
    padding: 8px;
    font-size: 0.9rem;
  }
`;

/* Botones de acción (ataque o recolección) */
export const ActionButton = styled.button<StyledActionProps & StyledRaceProps & StyledDisabledProps>`
  padding: 5px 10px;
  background: ${({ $action, $race, $isDisabled }) => $isDisabled 
    ? 'rgba(100, 100, 100, 0.2)' 
    : $action === 'attack' 
      ? `rgba(${hexToRgb(raceColors[$race].secondaryColor)}, 0.3)` 
      : `rgba(${hexToRgb(raceColors[$race].color)}, 0.3)`};
  color: ${({ $race, $isDisabled }) => $isDisabled 
    ? '#666' 
    : raceColors[$race].textColor || 'white'};
  border: 1px solid ${({ $action, $race, $isDisabled }) => $isDisabled 
    ? '#666' 
    : $action === 'attack' 
      ? raceColors[$race].secondaryColor 
      : raceColors[$race].color};
  border-radius: 4px;
  cursor: ${({ $isDisabled }) => $isDisabled ? 'not-allowed' : 'pointer'};
  font-family: ${({ $race }) => raceColors[$race].textColor || "'Arial', sans-serif"};
  transition: all 0.2s ease;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  &:hover {
    background: ${({ $action, $race, $isDisabled }) => !$isDisabled 
      ? $action === 'attack' 
        ? `rgba(${hexToRgb(raceColors[$race].secondaryColor)}, 0.5)` 
        : `rgba(${hexToRgb(raceColors[$race].color)}, 0.5)` 
      : 'rgba(100, 100, 100, 0.2)'};
    box-shadow: ${({ $action, $race, $isDisabled }) => !$isDisabled 
      ? $action === 'attack' 
        ? `0 0 5px ${raceColors[$race].secondaryColor}` 
        : `0 0 5px ${raceColors[$race].color}`
      : 'none'};
    transform: ${({ $isDisabled }) => !$isDisabled ? 'translateY(-1px)' : 'none'};
  }
  
  &:active {
    transform: ${({ $isDisabled }) => !$isDisabled ? 'translateY(1px)' : 'none'};
  }

  @media (max-width: 400px) {
    font-size: 0.8rem;
    padding: 4px 8px;
  }
`;

/* Badge que muestra la raza */
export const RaceBadge = styled.span<StyledRaceProps>`
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${({ $race }) => `rgba(${hexToRgb(raceColors[$race].color)}, 0.2)`};
  border: 1px solid ${({ $race }) => raceColors[$race].color};
  color: ${({ $race }) => raceColors[$race].color};
  font-size: 0.8rem;
  font-family: ${({ $race }) => raceColors[$race].textColor || "'Arial', sans-serif"};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $race }) => `rgba(${hexToRgb(raceColors[$race].color)}, 0.4)`};
    box-shadow: 0 0 5px ${({ $race }) => raceColors[$race].color};
  }

  @media (max-width: 400px) {
    font-size: 0.7rem;
  }
`;

/* Contenedor del contador */
export const CountdownContainer = styled.div<StyledRaceProps>`
  background: ${({ $race }) => `rgba(${hexToRgb(raceColors[$race].color)}, 0.2)`};
  border: 1px solid ${({ $race }) => raceColors[$race].color};
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 15px;
  text-align: center;

  @media (max-width: 400px) {
    padding: 8px;
  }
`;

/* Texto del contador */
export const CountdownText = styled.p`
  margin: 0;
  font-weight: bold;
`;

/* Valor del contador */
export const CountdownValue = styled.span`
  margin-left: 5px;
  color: #ff6b6b;
  font-weight: bold;
`;

/* Estilos para la sección de viajes disponibles */
export const TravelsSection = styled.div<StyledRaceProps>`
  margin-bottom: 15px;
  padding: 15px;
  background: ${({ $race }) => `rgba(${hexToRgb(raceColors[$race].color)}, 0.1)`};
  border-radius: 8px;
  border: 1px solid ${({ $race }) => raceColors[$race].secondaryColor};
  text-align: center;
`;

export const TravelsTitle = styled.div<StyledRaceProps>`
  margin-bottom: 10px;
  font-weight: bold;
  color: ${({ $race }) => raceColors[$race].color};
  font-size: 1rem;
`;

export const TravelsCounter = styled.div<StyledRaceProps & StyledLowProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px;
  background: ${({ $isLow, $race }) => 
    $isLow 
      ? `rgba(${hexToRgb(raceColors[$race].secondaryColor)}, 0.2)` 
      : `rgba(${hexToRgb(raceColors[$race].color)}, 0.2)`};
  border-radius: 6px;
  border: 1px solid ${({ $isLow, $race }) => 
    $isLow ? raceColors[$race].secondaryColor : raceColors[$race].color};
`;

export const TravelsNumber = styled.div<StyledCriticalProps>`
  font-size: 1.8rem;
  font-weight: bold;
  color: ${({ $isCritical }) => $isCritical ? '#ff6b6b' : '#4ade80'};
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

export const NoTravelsWarning = styled.div<StyledRaceProps>`
  margin-top: 10px;
  padding: 8px;
  background: rgba(255, 107, 107, 0.2);
  border: 1px solid #ff6b6b;
  border-radius: 4px;
  color: #ff6b6b;
  font-size: 0.8rem;
  font-weight: bold;
`;