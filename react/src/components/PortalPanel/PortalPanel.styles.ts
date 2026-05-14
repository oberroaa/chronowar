import styled, { keyframes } from 'styled-components';
import type { RaceType } from '../../types/gameData';
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

export const RightPanelContainer = styled.div<StyledOpenProps & StyledRaceProps>`
  position: fixed;
  right: ${({ $isOpen }) => $isOpen ? '0' : '-400px'};
  top: 0;
  width: 400px;
  height: 100vh;
  background: ${({ $race }) => (raceColors[$race as keyof typeof raceColors] as any).background || 'rgba(10, 10, 20, 0.98)'};
  border-left: 2px solid ${({ $race }) => (raceColors[$race as keyof typeof raceColors] as any).color};
  z-index: 98;
  transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 0;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.8);
  color: ${({ $race }) => raceColors[$race].textColor || 'white'};
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.2);
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ $race }) => raceColors[$race].color};
    border-radius: 10px;
  }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 0.5; }
`;

export const PortalHeader = styled.div<StyledRaceProps>`
  height: 260px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(180deg, 
    ${({ $race }) => `rgba(${hexToRgb(raceColors[$race as keyof typeof raceColors].color)}, 0.15)`} 0%, 
    transparent 100%);
`;

export const PortalVortex = styled.div<StyledRaceProps>`
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  border: 1px solid ${({ $race }) => `rgba(${hexToRgb(raceColors[$race as keyof typeof raceColors].color)}, 0.1)`};
  animation: ${rotate} 30s linear infinite;
  
  &::before, &::after {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    width: 100%; height: 100%;
    border-radius: 50%;
    border: 1px solid ${({ $race }) => `rgba(${hexToRgb(raceColors[$race as keyof typeof raceColors].secondaryColor)}, 0.15)`};
    transform: translate(-50%, -50%);
  }
  
  &::after {
    width: 80%; height: 80%;
    border: 1px dashed ${({ $race }) => `rgba(${hexToRgb(raceColors[$race as keyof typeof raceColors].color)}, 0.2)`};
    animation: ${rotate} 20s linear infinite reverse;
  }
`;

export const PortalCore = styled.div<StyledRaceProps>`
  width: 100px;
  height: 100px;
  background: #fff;
  border-radius: 50%;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  position: relative;
  box-shadow: 
    0 0 30px #fff,
    0 0 60px ${({ $race }) => raceColors[$race as keyof typeof raceColors].color},
    0 0 100px ${({ $race }) => raceColors[$race as keyof typeof raceColors].secondaryColor};
  
  &::before {
    content: '';
    position: absolute;
    top: -20px; left: -20px; right: -20px; bottom: -20px;
    background: ${({ $race }) => `rgba(${hexToRgb(raceColors[$race as keyof typeof raceColors].color)}, 0.3)`};
    border-radius: 50%;
    filter: blur(20px);
    animation: ${pulse} 4s ease-in-out infinite;
  }
`;

export const PanelContent = styled.div`
  padding: 20px;
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
  color: #fff;
  text-align: center;
  margin-top: 25px;
  font-family: 'Cinzel', serif;
  font-size: 1.4rem;
  letter-spacing: 4px;
  text-transform: uppercase;
  font-weight: 300;
  z-index: 2;
  text-shadow: 0 0 10px ${({ $race }) => raceColors[$race as keyof typeof raceColors].color};
`;

/* Card Layout System */
export const TargetGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  margin-top: 15px;
`;

export const TargetCard = styled.div<StyledRaceProps>`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 16px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &::after {
    content: '';
    position: absolute;
    top: -50%; left: -50%; width: 200%; height: 200%;
    background: radial-gradient(circle at center, 
      ${({ $race }) => `rgba(${hexToRgb(raceColors[$race as keyof typeof raceColors].color)}, 0.05)`} 0%, 
      transparent 70%);
    pointer-events: none;
    transition: all 0.5s ease;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: ${({ $race }) => `rgba(${hexToRgb(raceColors[$race as keyof typeof raceColors].color)}, 0.4)`};
    transform: translateY(-4px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
    
    &::after { transform: scale(1.2); }
  }
`;

export const CardMainRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const TargetAvatar = styled.div<StyledRaceProps>`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: ${({ $race }) => `rgba(${hexToRgb(raceColors[$race as keyof typeof raceColors].color)}, 0.2)`};
  border: 1px solid ${({ $race }) => raceColors[$race as keyof typeof raceColors].color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 0 15px ${({ $race }) => `rgba(${hexToRgb(raceColors[$race as keyof typeof raceColors].color)}, 0.3)`};
  flex-shrink: 0;
`;

export const TargetInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

export const TargetName = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 4px;
`;

export const CardStats = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
`;

export const RiskBadge = styled.span<{ $level: 'low' | 'medium' | 'high' }>`
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 10px;
  text-transform: uppercase;
  font-weight: 900;
  background: ${({ $level }) => 
    $level === 'high' ? 'rgba(255, 50, 50, 0.2)' : 
    $level === 'medium' ? 'rgba(255, 200, 50, 0.2)' : 
    'rgba(50, 255, 50, 0.2)'};
  color: ${({ $level }) => 
    $level === 'high' ? '#ff4d4d' : 
    $level === 'medium' ? '#ffd700' : 
    '#4ade80'};
  border: 1px solid currentColor;
`;

export const LootPreview = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

export const LootItem = styled.div`
  font-size: 0.8rem;
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const ProgressWrapper = styled.div<StyledRaceProps>`
  height: 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  margin-top: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

export const ProgressBar = styled.div<{ $progress: number; $race: RaceType }>`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: linear-gradient(90deg, 
    ${({ $race }) => (raceColors[$race as keyof typeof raceColors] as any).color}, 
    ${({ $race }) => (raceColors[$race as keyof typeof raceColors] as any).secondaryColor});
  box-shadow: 0 0 10px ${({ $race }) => (raceColors[$race as keyof typeof raceColors] as any).color};
  transition: width 1s linear;
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

/* Botones de acción minimalistas */
export const IconButton = styled.button<StyledActionProps & StyledRaceProps & StyledDisabledProps>`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  background: ${({ $isDisabled, $race }) => $isDisabled ? 'rgba(255,255,255,0.05)' : `rgba(${hexToRgb(raceColors[$race as keyof typeof raceColors].color)}, 0.15)`};
  border: 1px solid ${({ $isDisabled, $race }) => $isDisabled ? 'rgba(255,255,255,0.1)' : raceColors[$race as keyof typeof raceColors].color};
  color: ${({ $isDisabled, $race }) => $isDisabled ? 'rgba(255,255,255,0.3)' : raceColors[$race as keyof typeof raceColors].color};
  cursor: ${({ $isDisabled }) => $isDisabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  flex-shrink: 0;
  position: relative;

  &:hover:not(:disabled) {
    background: ${({ $race }) => raceColors[$race as keyof typeof raceColors].color};
    color: #fff;
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 0 20px ${({ $race }) => raceColors[$race as keyof typeof raceColors].color};
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
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
  margin-bottom: 25px;
  padding: 20px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.05) 0%, 
    rgba(0, 0, 0, 0.2) 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  position: relative;
  overflow: hidden;
`;

export const TravelsTitle = styled.div<StyledRaceProps>`
  margin-bottom: 15px;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: ${({ $race }) => raceColors[$race as keyof typeof raceColors].color};
  font-size: 0.85rem;
  opacity: 0.8;
`;

export const TravelsCounter = styled.div<StyledRaceProps & StyledLowProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 25px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 30px;
  border: 1px solid ${({ $isLow, $race }) => 
    $isLow ? raceColors[$race as keyof typeof raceColors].secondaryColor : `rgba(${hexToRgb(raceColors[$race as keyof typeof raceColors].color)}, 0.3)`};
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
`;

export const TravelsNumber = styled.div<StyledCriticalProps>`
  font-size: 1.5rem;
  font-family: 'Orbitron', sans-serif;
  font-weight: bold;
  color: ${({ $isCritical }) => $isCritical ? '#ff4d4d' : '#fff'};
  text-shadow: 0 0 10px ${({ $isCritical }) => $isCritical ? '#ff4d4d' : '#4ade80'};
  
  &::after {
    content: ' CHARGES';
    font-size: 0.7rem;
    letter-spacing: 1px;
    opacity: 0.5;
  }
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