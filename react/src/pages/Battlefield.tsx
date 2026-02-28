import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';

type Race = 'valdari' | 'gorkar';

interface BattlefieldProps {
  race: Race;
  backgroundImage?: string;
}

interface UnitStatus {
  type: 'defense' | 'poison' | 'buff' | 'debuff';
  duration: number;
}

interface BattlefieldUnit {
  id: string;
  name: string;
  image: string;
  position: { top: string; left: string };
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  special: string;
  race: Race;
  isHero?: boolean;
  statuses?: UnitStatus[];
  isAttacker?: boolean;
  specialUsed?: boolean;
  cooldown: number;
}

interface UnitDetailsPanelProps {
  unit: BattlefieldUnit;
  currentTurn: Race;
  onAction: (action: 'attack' | 'defend' | 'special') => void;
  onClose: () => void;
  isProcessingAction: boolean;
}

interface VictoryModalProps {
  winner: Race;
  onRestart: () => void;
  onExit: () => void;
}

export const PlayerFormationPositions = {
  Attack1: { top: '63%', left: '20%' },
  Attack2: { top: '63%', left: '35%' },
  Attack3: { top: '63%', left: '50%' },
  Attack4: { top: '63%', left: '65%' },
  Attack5: { top: '63%', left: '80%' },
  Defense1: { top: '78%', left: '20%' },
  Defense2: { top: '78%', left: '35%' },
  Defense3: { top: '78%', left: '50%' },
  Defense4: { top: '78%', left: '65%' },
  Defense5: { top: '78%', left: '80%' }
};

export const EnemyFormationPositions = {
  Attack1: { top: '37%', left: '20%' },
  Attack2: { top: '37%', left: '35%' },
  Attack3: { top: '37%', left: '50%' },
  Attack4: { top: '37%', left: '65%' },
  Attack5: { top: '37%', left: '80%' },
  Defense1: { top: '22%', left: '20%' },
  Defense2: { top: '22%', left: '35%' },
  Defense3: { top: '22%', left: '50%' },
  Defense4: { top: '22%', left: '65%' },
  Defense5: { top: '22%', left: '80%' }
};

const raceColors = {
  valdari: {
    primary: '#1e3a8a',
    secondary: '#3b82f6',
    accent: '#60a5fa',
    gold: '#fbbf24',
    cardBg: 'rgba(30, 58, 138, 0.9)',
    border: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.4)',
    shadow: 'rgba(30, 58, 138, 0.6)'
  },
  gorkar: {
    primary: '#7f1d1d',
    secondary: '#dc2626',
    accent: '#ef4444',
    gold: '#f59e0b',
    cardBg: 'rgba(127, 29, 29, 0.9)',
    border: '#dc2626',
    glow: 'rgba(220, 38, 38, 0.4)',
    shadow: 'rgba(127, 29, 29, 0.6)'
  }
};

const cardDrawAnimation = keyframes`
  0% { 
    transform: translate(-50%, -50%) scale(0.8) rotate(-5deg);
    opacity: 0;
  }
  60% {
    transform: translate(-50%, -50%) scale(1.05) rotate(2deg);
  }
  100% { 
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
    opacity: 1;
  }
`;

const cardHoverAnimation = keyframes`
  0% { transform: translate(-50%, -50%) scale(1) translateY(0) rotate(0deg); }
  50% { transform: translate(-50%, -50%) scale(1.08) translateY(-8px) rotate(1deg); }
  100% { transform: translate(-50%, -50%) scale(1.05) translateY(-5px) rotate(0deg); }
`;

// Animación de ataque más reservada
const actionMoveAnimation = keyframes`
  0% { 
    transform: translate(-50%, -50%) scale(1);
  }
  30% {
    transform: translate(-50%, calc(-50% - 25px)) scale(1.05);
  }
  70% {
    transform: translate(-50%, calc(-50% - 15px)) scale(1.02);
  }
  100% { 
    transform: translate(-50%, -50%) scale(1);
  }
`;

const glowPulse = keyframes`
  0%, 100% { 
    box-shadow: 0 0 15px currentColor,
                0 0 30px currentColor;
  }
  50% { 
    box-shadow: 0 0 25px currentColor,
                0 0 50px currentColor;
  }
`;

const turnIndicatorGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px currentColor,
                0 0 40px currentColor;
  }
  50% { 
    box-shadow: 0 0 30px currentColor,
                0 0 60px currentColor;
  }
`;

const damageFlash = keyframes`
  0%, 100% { 
    filter: brightness(1) saturate(1);
    transform: translate(-50%, -50%) scale(1);
  }
  25% { 
    filter: brightness(2) saturate(3);
    transform: translate(-50%, -50%) scale(1.2);
  }
  50% { 
    filter: brightness(1.5) saturate(2);
    transform: translate(-50%, -50%) scale(0.95);
  }
  75% {
    filter: brightness(1.8) saturate(2.5);
    transform: translate(-50%, -50%) scale(1.1);
  }
`;

const damageShake = keyframes`
  0%, 100% { 
    transform: translate(-50%, -50%) translateX(0);
  }
  10%, 30%, 50%, 70%, 90% { 
    transform: translate(-50%, -50%) translateX(-8px);
  }
  20%, 40%, 60%, 80% { 
    transform: translate(-50%, -50%) translateX(8px);
  }
`;

const floatUp = keyframes`
  0% { 
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
  100% { 
    opacity: 0;
    transform: translateX(-50%) translateY(-50px) scale(1.2);
  }
`;

const specialEffectGlow = keyframes`
  0% {
    background-position: 0% 50%;
    opacity: 0.8;
  }
  50% {
    background-position: 100% 50%;
    opacity: 1;
  }
  100% {
    background-position: 0% 50%;
    opacity: 0.8;
  }
`;

const gridMove = keyframes`
  0% {
    background-position: 0 0, 0 0;
  }
  100% {
    background-position: 30px 30px, 30px 30px;
  }
`;

const buttonPulse = keyframes`
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
  }
  50% { 
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.8);
  }
`;

const aiButtonPulse = keyframes`
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
  }
  50% { 
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(34, 197, 94, 0.8);
  }
`;

const victoryAnimation = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }
  60% {
    transform: translate(-50%, -50%) scale(1.1);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
`;

const confettiAnimation = keyframes`
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
`;

// Interfaces para las props de los componentes styled
interface BattlefieldContainerProps {
  $race: Race;
}

interface GameBoardProps {
  $bgImage?: string;
  $race: Race;
}

interface BattlefieldCardProps {
  $race: Race;
  $isSelected: boolean;
  $isPlayerUnit: boolean;
  $isHero?: boolean;
  $isTakingDamage?: boolean;
  $isDead?: boolean;
  $isMoving?: boolean;
  $isOnCooldown?: boolean;
}

interface HealthBarProps {
  $percentage: number;
}

interface HealthTextProps {
  $percentage: number;
}

interface DamageNumberProps {
  $race: Race;
  $isHero?: boolean;
  $isHeal?: boolean;
}

interface SpecialEffectOverlayProps {
  $race: Race;
  $type: string;
}

interface StatusBadgeProps {
  $type: string;
}

interface CooldownBadgeProps {
  $race: Race;
}

interface TurnIndicatorProps {
  $race: Race;
  $isPlayerTurn: boolean;
}

interface RoundCounterProps {
  $race: Race;
}

interface DefendButtonProps {
  $race: Race;
  $isPlayerTurn: boolean;
}

interface AIPlayButtonProps {
  $race: Race;
  $isPlayerTurn: boolean;
  $isActive: boolean;
}

interface VictoryModalContainerProps {
  $winnerRace: Race;
}

const BattlefieldContainer = styled.div<BattlefieldContainerProps>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: ${props => props.$race === 'valdari' ?
    'linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #334155 100%)' :
    'linear-gradient(160deg, #1c1917 0%, #292524 50%, #44403c 100%)'};
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const GameBoard = styled.div<GameBoardProps>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  height: 85vh;
  max-width: 1200px;
  background: 
    ${props => props.$bgImage ? `url(${props.$bgImage})` :
    props.$race === 'valdari' ?
      'linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #334155 100%)' :
      'linear-gradient(160deg, #1c1917 0%, #292524 50%, #44403c 100%)'},
    linear-gradient(rgba(15, 23, 42, 0.7) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.7) 1px, transparent 1px),
    linear-gradient(160deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 50%, rgba(51, 65, 85, 0.8) 100%);
  background-size: cover, 30px 30px, 30px 30px, cover;
  background-position: center;
  background-blend-mode: overlay;
  animation: ${gridMove} 20s linear infinite;
  border: 3px solid #3b82f6;
  border-radius: 20px;
  box-shadow: 
    0 0 60px rgba(59, 130, 246, 0.4),
    inset 0 0 60px rgba(59, 130, 246, 0.1);
  overflow: hidden;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(220, 38, 38, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    width: 95vw;
    height: 90vh;
    background-size: cover, 20px 20px, 20px 20px, cover;
  }
`;

const PlayerZone = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 45%;
  background: linear-gradient(to top, 
    rgba(30, 58, 138, 0.3) 0%,
    transparent 60%);
  border-top: 2px dashed rgba(59, 130, 246, 0.5);
  z-index: 2;
`;

const EnemyZone = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 45%;
  background: linear-gradient(to bottom, 
    rgba(127, 29, 29, 0.3) 0%,
    transparent 60%);
  border-bottom: 2px dashed rgba(220, 38, 38, 0.5);
  z-index: 2;
`;

const BattleLine = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 3px;
  background: linear-gradient(90deg, 
    transparent 0%,
    #3b82f6 20%,
    #dc2626 80%,
    transparent 100%);
  z-index: 3;
  
  &::before {
    content: 'VS';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #0f172a;
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 1.1rem;
    border: 2px solid #64748b;
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  }
`;

const BattlefieldCard = styled.div<BattlefieldCardProps>`
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: ${props => props.$isHero ? '10' : '5'};
  border-radius: 12px;
  animation: ${cardDrawAnimation} 0.6s ease-out;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  
  background: linear-gradient(145deg, 
    ${props => raceColors[props.$race].cardBg} 0%,
    rgba(255, 255, 255, 0.15) 100%);
  border: 2px solid ${props => raceColors[props.$race].border};
  
  box-shadow: 
    0 8px 25px ${props => props.$isPlayerUnit ? 'rgba(30, 58, 138, 0.6)' : 'rgba(127, 29, 29, 0.6)'},
    0 4px 12px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    ${props => props.$isPlayerUnit ?
    '0 -5px 20px rgba(59, 130, 246, 0.3)' :
    '0 5px 20px rgba(220, 38, 38, 0.3)'};
  
  &:hover {
    animation: ${cardHoverAnimation} 0.4s ease-out forwards;
    z-index: ${props => props.$isHero ? '15' : '12'};
    box-shadow: 
      0 12px 35px ${props => props.$isPlayerUnit ? 'rgba(30, 58, 138, 0.8)' : 'rgba(127, 29, 29, 0.8)'},
      0 6px 20px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.3),
      ${props => props.$isPlayerUnit ?
    '0 -8px 25px rgba(59, 130, 246, 0.5)' :
    '0 8px 25px rgba(220, 38, 38, 0.5)'};
  }
  
  ${props => props.$isSelected && css`
    border-color: ${raceColors[props.$race].gold};
    box-shadow: 
      0 0 25px ${raceColors[props.$race].gold},
       0 8px 25px rgba(0, 0, 0, 0.6),
      inset 0 0 20px ${raceColors[props.$race].gold}33;
    transform: translate(-50%, -50%) scale(1.12);
    z-index: ${props.$isHero ? '20' : '18'};
  `}
  
  ${props => props.$isHero && css`
    border-width: 3px;
    border-color: ${raceColors[props.$race].gold};
    animation: ${glowPulse} 2s ease-in-out infinite;
    
    &::before {
      content: '★ HÉROE';
      position: absolute;
      top: 8px;
      left: 50%;
      transform: translateX(-50%);
      background: ${raceColors[props.$race].gold};
      color: ${props.$race === 'valdari' ? '#1e3a8a' : '#7f1d1d'};
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 0.6rem;
      font-weight: bold;
      z-index: 6;
      white-space: nowrap;
    }
  `}
  
  ${props => props.$isMoving && css`
    animation: ${actionMoveAnimation} 0.8s ease-in-out;
    z-index: 25;
    border-color: ${raceColors[props.$race].accent};
    box-shadow: 
      0 0 20px ${raceColors[props.$race].accent},
      0 8px 25px rgba(0, 0, 0, 0.6);
  `}
  
  ${props => props.$isTakingDamage && css`
    animation: ${damageFlash} 0.8s ease-in-out, ${damageShake} 0.8s ease-in-out;
    border-color: #ff4444;
    box-shadow: 
      0 0 40px rgba(255, 68, 68, 0.8),
      0 0 80px rgba(255, 68, 68, 0.4);
    z-index: 30;
  `}
  
  ${props => props.$isDead && css`
    opacity: 0;
    transform: translate(-50%, -50%) scale(0) rotate(180deg);
    pointer-events: none;
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  `}

  ${props => {
    const isPlayerUnit = props.$isPlayerUnit;
    return props.$isOnCooldown && css`
      filter: brightness(0.7) saturate(0.8);
      cursor: not-allowed;
      
      &:hover {
        animation: none;
        transform: translate(-50%, -50%) scale(1);
        box-shadow: 
          0 8px 25px ${isPlayerUnit ? 'rgba(30, 58, 138, 0.6)' : 'rgba(127, 29, 29, 0.6)'},
          0 4px 12px rgba(0, 0, 0, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          ${isPlayerUnit ?
        '0 -5px 20px rgba(59, 130, 246, 0.3)' :
        '0 5px 20px rgba(220, 38, 38, 0.3)'};
      }
    `;
  }}
`;

const CardImageContainer = styled.div<{ $isHero?: boolean }>`
  width: ${props => props.$isHero ? '100px' : '85px'};
  height: ${props => props.$isHero ? '120px' : '105px'};
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: ${props => props.$isHero ? '70px' : '60px'};
    height: ${props => props.$isHero ? '90px' : '75px'};
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const HealthBarContainer = styled.div<{ $race: Race }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, 
    ${props => raceColors[props.$race].primary}dd,
    transparent);
  padding: 4px 4px 2px;
  z-index: 3;
`;

const HealthBar = styled.div<HealthBarProps>`
  width: 100%;
  height: 6px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => Math.max(0, props.$percentage)}%;
    background: linear-gradient(90deg, 
      ${props => props.$percentage > 50 ? '#4ade80' : props.$percentage > 25 ? '#fbbf24' : '#ef4444'},
      ${props => props.$percentage > 50 ? '#22c55e' : props.$percentage > 25 ? '#f59e0b' : '#dc2626'});
    border-radius: 3px;
    transition: width 0.3s ease, background 0.3s ease;
  }
`;

const HealthText = styled.div<HealthTextProps>`
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  text-align: center;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  margin-bottom: 2px;
  color: ${props => props.$percentage > 50 ? '#4ade80' : props.$percentage > 25 ? '#fbbf24' : '#ef4444'};
  
  @media (max-width: 768px) {
    font-size: 0.6rem;
  }
`;

const TurnIndicator = styled.div<TurnIndicatorProps>`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(145deg, 
    ${props => raceColors[props.$race].primary}ee,
    ${props => raceColors[props.$race].secondary}ee);
  color: white;
  padding: 12px 30px;
  border-radius: 25px;
  border: 2px solid ${props => raceColors[props.$race].gold};
  z-index: 100;
  font-size: 1.1rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  animation: ${turnIndicatorGlow} 2s infinite;
  backdrop-filter: blur(10px);
  color: ${props => props.$isPlayerTurn ? raceColors[props.$race].gold : 'white'};
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 12px;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => props.$isPlayerTurn ? '#4ade80' : '#ef4444'};
    animation: ${glowPulse} 1.5s infinite;
  }
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 10px 25px;
    top: 15px;
  }
`;

const RoundCounter = styled.div<RoundCounterProps>`
  position: fixed;
  top: 20px;
  right: 30px;
  background: linear-gradient(145deg, 
    ${props => raceColors[props.$race].primary}ee,
    ${props => raceColors[props.$race].secondary}ee);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  border: 2px solid ${props => raceColors[props.$race].gold};
  z-index: 100;
  font-size: 1rem;
  font-weight: bold;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 8px 16px;
    top: 15px;
    right: 20px;
  }
`;

const DamageNumber = styled.div<DamageNumberProps>`
  position: absolute;
  top: ${props => props.$isHero ? '-40px' : '-35px'};
  left: 50%;
  transform: translateX(-50%);
  font-size: ${props => props.$isHero ? '1.5rem' : '1.2rem'};
  font-weight: bold;
  color: ${props => props.$isHeal ? '#4ade80' : '#ef4444'};
  text-shadow: 
    0 3px 6px rgba(0, 0, 0, 0.9),
    0 0 12px ${props => props.$isHeal ? 'rgba(74, 222, 128, 0.7)' : 'rgba(239, 68, 68, 0.7)'};
  animation: ${floatUp} 1.5s ease-out forwards;
  z-index: 30;
  
  @media (max-width: 768px) {
    font-size: ${props => props.$isHero ? '1.2rem' : '1rem'};
    top: ${props => props.$isHero ? '-35px' : '-30px'};
  }
`;

const SpecialEffectOverlay = styled.div<SpecialEffectOverlayProps>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background: ${props => {
    switch (props.$type) {
      case 'heal': return 'linear-gradient(135deg, rgba(74, 222, 128, 0.4), rgba(34, 197, 94, 0.7))';
      case 'attack': return 'linear-gradient(135deg, rgba(239, 68, 68, 0.4), rgba(220, 38, 38, 0.7))';
      case 'buff': return 'linear-gradient(135deg, rgba(96, 165, 250, 0.4), rgba(59, 130, 246, 0.7))';
      case 'death': return 'linear-gradient(135deg, rgba(107, 114, 128, 0.4), rgba(55, 65, 81, 0.9))';
      default: return `linear-gradient(135deg, ${raceColors[props.$race].accent}44, ${raceColors[props.$race].secondary}77)`;
    }
  }};
  animation: ${specialEffectGlow} 2s ease-in-out infinite;
  pointer-events: none;
  z-index: 8;
`;

const StatusBadge = styled.div<StatusBadgeProps>`
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  z-index: 7;
  border: 1px solid white;
  background: ${props => {
    switch (props.$type) {
      case 'defense': return '#3b82f6';
      case 'poison': return '#8b5cf6';
      case 'buff': return '#10b981';
      case 'debuff': return '#ef4444';
      default: return '#f59e0b';
    }
  }};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  
  @media (max-width: 768px) {
    width: 18px;
    height: 18px;
    font-size: 9px;
    top: 3px;
    right: 3px;
  }
`;

const CooldownBadge = styled.div<CooldownBadgeProps>`
  position: absolute;
  top: 5px;
  left: 5px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  z-index: 7;
  border: 2px solid ${props => raceColors[props.$race].gold};
  background: rgba(0, 0, 0, 0.8);
  color: ${props => raceColors[props.$race].gold};
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.6);
  animation: ${glowPulse} 2s infinite;
  
  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
    font-size: 10px;
    top: 3px;
    left: 3px;
  }
`;

const DefendButton = styled.button<DefendButtonProps>`
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: linear-gradient(145deg, 
    ${props => raceColors[props.$race].secondary},
    ${props => raceColors[props.$race].primary});
  color: white;
  border: none;
  border-radius: 50px;
  padding: 15px 25px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  z-index: 90;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
  transition: all 0.3s ease;
  animation: ${buttonPulse} 2s infinite;
  display: flex;
  align-items: center;
  gap: 10px;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.9);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: scale(1);
    animation: none;
  }
  
  &::before {
    content: '🛡️';
    font-size: 1.3rem;
  }
  
  @media (max-width: 768px) {
    bottom: 20px;
    right: 20px;
    padding: 12px 20px;
    font-size: 1rem;
  }
`;

const AIPlayButton = styled.button<AIPlayButtonProps>`
  position: fixed;
  bottom: 30px;
  left: 30px;
  background: ${props => props.$isActive
    ? 'linear-gradient(145deg, #ef4444, #dc2626)'
    : 'linear-gradient(145deg, #10b981, #059669)'};
  color: white;
  border: none;
  border-radius: 50px;
  padding: 15px 25px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  z-index: 90;
  box-shadow: 0 0 20px ${props => props.$isActive
    ? 'rgba(239, 68, 68, 0.6)'
    : 'rgba(16, 185, 129, 0.6)'};
  transition: all 0.3s ease;
  animation: ${props => props.$isActive ? 'none' : css`${aiButtonPulse} 2s infinite`};
  display: flex;
  align-items: center;
  gap: 10px;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 30px ${props => props.$isActive
    ? 'rgba(239, 68, 68, 0.9)'
    : 'rgba(16, 185, 129, 0.9)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: scale(1);
    animation: none;
  }
  
  &::before {
    content: '${props => props.$isActive ? '⏹️' : '🤖'}';
    font-size: 1.3rem;
  }
  
  @media (max-width: 768px) {
    bottom: 20px;
    left: 20px;
    padding: 12px 20px;
    font-size: 1rem;
  }
`;

const VictoryModalContainer = styled.div<VictoryModalContainerProps>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const VictoryContent = styled.div<VictoryModalContainerProps>`
  background: linear-gradient(145deg, 
    ${props => raceColors[props.$winnerRace].primary}ee,
    ${props => raceColors[props.$winnerRace].secondary}ee);
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  color: white;
  border: 3px solid ${props => raceColors[props.$winnerRace].gold};
  box-shadow: 0 0 50px ${props => raceColors[props.$winnerRace].glow};
  animation: ${victoryAnimation} 0.8s ease-out;
  backdrop-filter: blur(10px);
  max-width: 500px;
  width: 90%;
`;

const VictoryTitle = styled.h2<VictoryModalContainerProps>`
  font-size: 2.5rem;
  margin: 0 0 20px;
  color: ${props => raceColors[props.$winnerRace].gold};
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.8);
`;

const VictoryText = styled.p`
  font-size: 1.2rem;
  margin: 0 0 30px;
  opacity: 0.9;
`;

const VictoryButtons = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const VictoryButton = styled.button<{ $variant: 'primary' | 'secondary'; $winnerRace: Race }>`
  padding: 15px 30px;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.$variant === 'primary' && css`
    background: linear-gradient(145deg, 
      ${raceColors[props.$winnerRace].gold},
      #f59e0b);
    color: ${props.$winnerRace === 'valdari' ? '#1e3a8a' : '#7f1d1d'};
    
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 0 20px rgba(251, 191, 36, 0.6);
    }
  `}
  
  ${props => props.$variant === 'secondary' && css`
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid ${raceColors[props.$winnerRace].gold};
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.05);
    }
  `}
  
  @media (max-width: 768px) {
    padding: 12px 25px;
    font-size: 1rem;
    width: 200px;
  }
`;

const Confetti = styled.div`
  position: fixed;
  width: 10px;
  height: 10px;
  background: ${props => props.color || '#fbbf24'};
  top: -10px;
  animation: ${confettiAnimation} 3s linear forwards;
  z-index: 999;
`;

const valdariUnits: BattlefieldUnit[] = [
  {
    id: 'v1',
    name: 'Obrero',
    image: '/images/Valdari/units/Obrero.png',
    position: PlayerFormationPositions.Attack1,
    health: 200,
    maxHealth: 200,
    attack: 30,
    defense: 15,
    special: 'Aliento de luz',
    race: 'valdari',
    isAttacker: true,
    statuses: [
      { type: 'buff', duration: 2 }
    ],
    specialUsed: false,
    cooldown: 0
  },
  {
    id: 'v2',
    name: 'Centinela',
    image: '/images/Valdari/units/Centinela.png',
    position: PlayerFormationPositions.Attack2,
    health: 100,
    maxHealth: 100,
    attack: 15,
    defense: 10,
    special: 'Escudo luminoso',
    race: 'valdari',
    isAttacker: true,
    specialUsed: false,
    cooldown: 0
  },
  {
    id: 'v3',
    name: 'Francotirador',
    image: '/images/Valdari/units/Francotirador.png',
    position: PlayerFormationPositions.Attack3,
    health: 80,
    maxHealth: 80,
    attack: 20,
    defense: 5,
    special: 'Disparo certero',
    race: 'valdari',
    isAttacker: true,
    statuses: [
      { type: 'buff', duration: 3 }
    ],
    specialUsed: false,
    cooldown: 0
  },
  {
    id: 'v4',
    name: 'Caballero',
    image: '/images/Valdari/units/Caballero.png',
    position: PlayerFormationPositions.Attack4,
    health: 70,
    maxHealth: 70,
    attack: 25,
    defense: 3,
    special: 'Hechizo solar',
    race: 'valdari',
    isAttacker: true,
    specialUsed: false,
    cooldown: 0
  },
  {
    id: 'v5',
    name: 'Cirujano',
    image: '/images/Valdari/units/Cirujano.png',
    position: PlayerFormationPositions.Attack5,
    health: 120,
    maxHealth: 120,
    attack: 12,
    defense: 15,
    special: 'Carga sagrada',
    race: 'valdari',
    isAttacker: true,
    specialUsed: false,
    cooldown: 0
  },
  {
    id: 'v6',
    name: 'Arcanista',
    image: '/images/Valdari/units/Arcanista.png',
    position: PlayerFormationPositions.Defense1,
    health: 90,
    maxHealth: 90,
    attack: 22,
    defense: 8,
    special: 'Golpe sombrío',
    race: 'valdari',
    specialUsed: false,
    cooldown: 0
  },
  {
    id: 'v7',
    name: 'Disruptor',
    image: '/images/Valdari/units/Disruptor.png',
    position: PlayerFormationPositions.Defense2,
    health: 85,
    maxHealth: 85,
    attack: 18,
    defense: 6,
    special: 'Curación divina',
    race: 'valdari',
    specialUsed: false,
    cooldown: 0
  },
  {
    id: 'v10',
    name: 'Dawnforged',
    image: '/images/Valdari/heroes/Dawnforged.png',
    position: PlayerFormationPositions.Defense3,
    health: 150,
    maxHealth: 150,
    attack: 25,
    defense: 12,
    special: 'Aura solar',
    race: 'valdari',
    isHero: true,
    specialUsed: false,
    cooldown: 0
  },
  {
    id: 'v8',
    name: 'Falange',
    image: '/images/Valdari/units/Falange.png',
    position: PlayerFormationPositions.Defense4,
    health: 110,
    maxHealth: 110,
    attack: 18,
    defense: 12,
    special: 'Rugido solar',
    race: 'valdari',
    specialUsed: false,
    cooldown: 0
  },
  {
    id: 'v9',
    name: 'Jinetes',
    image: '/images/Valdari/units/Jinetes.png',
    position: PlayerFormationPositions.Defense5,
    health: 150,
    maxHealth: 150,
    attack: 10,
    defense: 20,
    special: 'Armadura brillante',
    race: 'valdari',
    specialUsed: false,
    cooldown: 0
  }
];

const gorkarUnits: BattlefieldUnit[] = [
  {
    id: 'g1',
    name: 'Machacador',
    image: '/images/GorKar/units/Machacador.png',
    position: EnemyFormationPositions.Attack1,
    health: 200,
    maxHealth: 200,
    attack: 30,
    defense: 15,
    special: 'Aliento de fuego',
    race: 'gorkar',
    isAttacker: true,
    specialUsed: false,
    cooldown: 0
  },
  {
    id: 'g2',
    name: 'Vigía',
    image: '/images/GorKar/units/Vigía.png',
    position: EnemyFormationPositions.Attack2,
    health: 100,
    maxHealth: 100,
    attack: 15,
    defense: 10,
    special: 'Escudo de huesos',
    race: 'gorkar',
    isAttacker: true,
    specialUsed: false,
    cooldown: 0
  },
  {
    id: 'g3',
    name: 'Cazacabezas',
    image: '/images/GorKar/units/Cazacabezas.png',
    position: EnemyFormationPositions.Attack3,
    health: 80,
    maxHealth: 80,
    attack: 20,
    defense: 5,
    special: 'Disparo letal',
    race: 'gorkar',
    isAttacker: true,
    specialUsed: false,
    cooldown: 0
  },
  {
    id: 'g4',
    name: 'Berserker',
    image: '/images/GorKar/units/Berserker.png',
    position: EnemyFormationPositions.Attack4,
    health: 70,
    maxHealth: 70,
    attack: 25,
    defense: 3,
    special: 'Furia sangrienta',
    race: 'gorkar',
    isAttacker: true,
    statuses: [
      { type: 'poison', duration: 2 }
    ],
    specialUsed: false,
    cooldown: 0
  },
  {
    id: 'g5',
    name: 'Chaman',
    image: '/images/GorKar/units/Chaman.png',
    position: EnemyFormationPositions.Attack5,
    health: 120,
    maxHealth: 120,
    attack: 12,
    defense: 15,
    special: 'Ritual de guerra',
    race: 'gorkar',
    isAttacker: true,
    specialUsed: false,
    cooldown: 0
  },
  {
    id: 'g6',
    name: 'Invocador',
    image: '/images/GorKar/units/Invocador.png',
    position: EnemyFormationPositions.Defense1,
    health: 90,
    maxHealth: 90,
    attack: 22,
    defense: 8,
    special: 'Llamar bestias',
    race: 'gorkar',
    specialUsed: false,
    cooldown: 0
  },
  {
    id: 'g7',
    name: 'Rompehueso',
    image: '/images/GorKar/units/Rompehueso.png',
    position: EnemyFormationPositions.Defense2,
    health: 85,
    maxHealth: 85,
    attack: 18,
    defense: 6,
    special: 'Golpe aplastante',
    race: 'gorkar',
    specialUsed: false,
    cooldown: 0
  },
  {
    id: 'g10',
    name: 'Kargath',
    image: '/images/GorKar/heroes/Kargath.png',
    position: EnemyFormationPositions.Defense3,
    health: 150,
    maxHealth: 150,
    attack: 25,
    defense: 12,
    special: 'Dominación',
    race: 'gorkar',
    isHero: true,
    specialUsed: false,
    cooldown: 0
  },
  {
    id: 'g8',
    name: 'Raider',
    image: '/images/GorKar/units/Raider.png',
    position: EnemyFormationPositions.Defense4,
    health: 110,
    maxHealth: 110,
    attack: 18,
    defense: 12,
    special: 'Asalto rápido',
    race: 'gorkar',
    specialUsed: false,
    cooldown: 0
  },
  {
    id: 'g9',
    name: 'Jinete',
    image: '/images/GorKar/units/Jinete.png',
    position: EnemyFormationPositions.Defense5,
    health: 150,
    maxHealth: 150,
    attack: 10,
    defense: 20,
    special: 'Carga feroz',
    race: 'gorkar',
    specialUsed: false,
    cooldown: 0
  }
];

const UnitDetailsPanel: React.FC<UnitDetailsPanelProps> = ({
  unit,
  currentTurn,
  onAction,
  onClose,
  isProcessingAction
}) => {
  const raceColor = raceColors[unit.race];
  const healthPercentage = (unit.health / unit.maxHealth) * 100;
  const isUnitAvailable = unit.cooldown === 0;

  return (
    <div style={{
      position: 'fixed',
      bottom: '15px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '85%',
      maxWidth: '350px',
      background: `linear-gradient(145deg, ${raceColor.cardBg}, rgba(255,255,255,0.1))`,
      border: `2px solid ${raceColor.border}`,
      borderRadius: '15px',
      padding: '15px',
      color: 'white',
      zIndex: 100,
      backdropFilter: 'blur(10px)',
      boxShadow: '0 15px 30px rgba(0,0,0,0.5)',
      fontSize: '0.9rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
        <img
          src={unit.image}
          alt={unit.name}
          style={{
            width: '80px',
            height: '100px',
            objectFit: 'cover',
            borderRadius: '8px',
            marginRight: '15px'
          }}
        />
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '1.1rem'
          }}>
            {unit.name}
            {unit.isHero && (
              <span style={{
                background: raceColor.gold,
                color: unit.race === 'valdari' ? '#1e3a8a' : '#7f1d1d',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}>
                HÉROE
              </span>
            )}
          </h3>
          <p style={{
            margin: '5px 0',
            opacity: 0.8,
            fontSize: '0.8rem'
          }}>
            {unit.special}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: 'white',
            fontSize: '1.2rem',
            cursor: 'pointer',
            width: '25px',
            height: '25px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '5px'
        }}>
          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Salud</span>
          <span style={{
            fontSize: '0.9rem',
            fontWeight: 'bold',
            color: healthPercentage > 50 ? '#4ade80' : healthPercentage > 25 ? '#fbbf24' : '#ef4444'
          }}>
            {unit.health}/{unit.maxHealth}
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${healthPercentage}%`,
            height: '100%',
            background: `linear-gradient(90deg, 
              ${healthPercentage > 50 ? '#4ade80' : healthPercentage > 25 ? '#fbbf24' : '#ef4444'},
              ${healthPercentage > 50 ? '#22c55e' : healthPercentage > 25 ? '#f59e0b' : '#dc2626'})`,
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        marginBottom: '15px'
      }}>
        <div style={{
          textAlign: 'center',
          background: 'rgba(255,255,255,0.1)',
          padding: '8px',
          borderRadius: '8px'
        }}>
          <div style={{ color: '#f87171', fontWeight: 'bold', fontSize: '1rem' }}>{unit.attack}</div>
          <div style={{ opacity: 0.7, fontSize: '0.75rem' }}>Ataque</div>
        </div>
        <div style={{
          textAlign: 'center',
          background: 'rgba(255,255,255,0.1)',
          padding: '8px',
          borderRadius: '8px'
        }}>
          <div style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '1rem' }}>{unit.defense}</div>
          <div style={{ opacity: 0.7, fontSize: '0.75rem' }}>Defensa</div>
        </div>
        <div style={{
          textAlign: 'center',
          background: 'rgba(255,255,255,0.1)',
          padding: '8px',
          borderRadius: '8px'
        }}>
          <div style={{
            color: isUnitAvailable ? raceColor.accent : '#9ca3af',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}>
            {isUnitAvailable ? "Disponible" : `CD: ${unit.cooldown}`}
          </div>
          <div style={{ opacity: 0.7, fontSize: '0.75rem' }}>
            {isUnitAvailable ? "Lista" : "En Cooldown"}
          </div>
        </div>
      </div>

      {unit.statuses && unit.statuses.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '5px' }}>Estados:</div>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {unit.statuses.map((status, index) => (
              <span
                key={index}
                style={{
                  background: status.type === 'defense' ? '#3b82f6' :
                    status.type === 'poison' ? '#8b5cf6' :
                      status.type === 'buff' ? '#10b981' : '#ef4444',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.7rem'
                }}
              >
                {status.type === 'defense' ? 'Defensa+' :
                  status.type === 'poison' ? 'Veneno' :
                    status.type === 'buff' ? 'Mejora' : 'Debuff'} ({status.duration})
              </span>
            ))}
          </div>
        </div>
      )}

      {unit.race === currentTurn && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          marginTop: '10px'
        }}>
          <button
            onClick={() => onAction('attack')}
            disabled={isProcessingAction || !isUnitAvailable}
            style={{
              padding: '10px',
              background: isUnitAvailable
                ? 'linear-gradient(145deg, #ef4444, #dc2626)'
                : 'linear-gradient(145deg, #6b7280, #4b5563)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontWeight: 'bold',
              cursor: (isProcessingAction || !isUnitAvailable) ? 'not-allowed' : 'pointer',
              opacity: (isProcessingAction || !isUnitAvailable) ? 0.5 : 1,
              fontSize: '0.8rem'
            }}
          >
            {isUnitAvailable ? 'Atacar' : 'En Cooldown'}
          </button>
          <button
            onClick={() => onAction('special')}
            disabled={isProcessingAction || unit.specialUsed || !isUnitAvailable}
            style={{
              padding: '10px',
              background: (isUnitAvailable && !unit.specialUsed)
                ? `linear-gradient(145deg, ${raceColor.secondary}, ${raceColor.accent})`
                : 'linear-gradient(145deg, #6b7280, #4b5563)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontWeight: 'bold',
              cursor: (isProcessingAction || unit.specialUsed || !isUnitAvailable) ? 'not-allowed' : 'pointer',
              opacity: (isProcessingAction || unit.specialUsed || !isUnitAvailable) ? 0.5 : 1,
              fontSize: '0.8rem'
            }}
          >
            {unit.specialUsed ? "Usada" : (isUnitAvailable ? unit.special.split(':')[0] : "En Cooldown")}
          </button>
        </div>
      )}
    </div>
  );
};

const VictoryModal: React.FC<VictoryModalProps> = ({ winner, onRestart, onExit }) => {
  const [confetti, setConfetti] = useState<Array<{ id: number; color: string; left: string }>>([]);

  useEffect(() => {
    // Crear confeti
    const colors = ['#fbbf24', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6'];
    const newConfetti = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: `${Math.random() * 100}%`
    }));
    setConfetti(newConfetti);

    // Limpiar confeti después de la animación
    const timer = setTimeout(() => {
      setConfetti([]);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const winnerName = winner === 'valdari' ? 'Valdari' : 'Gorkar';
  const winnerText = winner === 'valdari'
    ? 'La luz prevalece sobre la oscuridad'
    : 'La fuerza bruta domina el campo de batalla';

  return (
    <VictoryModalContainer $winnerRace={winner}>
      {confetti.map(confetto => (
        <Confetti
          key={confetto.id}
          color={confetto.color}
          style={{ left: confetto.left }}
        />
      ))}
      <VictoryContent $winnerRace={winner}>
        <VictoryTitle $winnerRace={winner}>¡VICTORIA!</VictoryTitle>
        <VictoryText>
          <strong>{winnerName}</strong> ha ganado la batalla!
        </VictoryText>
        <VictoryText style={{ fontSize: '1rem', fontStyle: 'italic' }}>
          {winnerText}
        </VictoryText>
        <VictoryButtons>
          <VictoryButton
            $variant="primary"
            $winnerRace={winner}
            onClick={onRestart}
          >
            Jugar Otra Vez
          </VictoryButton>
          <VictoryButton
            $variant="secondary"
            $winnerRace={winner}
            onClick={onExit}
          >
            Salir
          </VictoryButton>
        </VictoryButtons>
      </VictoryContent>
    </VictoryModalContainer>
  );
};

const Battlefield: React.FC<BattlefieldProps> = ({ race, backgroundImage }) => {
  const [units, setUnits] = useState<BattlefieldUnit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<BattlefieldUnit | null>(null);
  const [attackEffects, setAttackEffects] = useState<{ id: string, unitId: string, type: 'damage' }[]>([]);
  const [specialEffects, setSpecialEffects] = useState<{ id: string, unitId: string, type: string }[]>([]);
  const [currentTurn, setCurrentTurn] = useState<Race>(race);
  const [turnCount, setTurnCount] = useState(1);
  const [damageNumbers, setDamageNumbers] = useState<{ id: string, unitId: string, amount: number, isHeal?: boolean }[]>([]);
  const [deadUnits, setDeadUnits] = useState<string[]>([]);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [movingUnits, setMovingUnits] = useState<string[]>([]);
  const [isAIActive, setIsAIActive] = useState(false);
  const [winner, setWinner] = useState<Race | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const effectTimeoutRefs = useRef<number[]>([]);

  // Verificar si hay un ganador - CORREGIDO
  useEffect(() => {
    // Solo verificar si hay unidades y el juego está inicializado
    if (units.length === 0 || !isInitialized) return;

    const playerUnitsAlive = units.filter(u => u.race === race && u.health > 0 && !deadUnits.includes(u.id)).length;
    const enemyUnitsAlive = units.filter(u => u.race !== race && u.health > 0 && !deadUnits.includes(u.id)).length;

    console.log('Checking winner - Player units alive:', playerUnitsAlive, 'Enemy units alive:', enemyUnitsAlive);

    if (playerUnitsAlive === 0 && enemyUnitsAlive === 0) {
      // Empate - el jugador pierde por defecto
      console.log('Empate detectado');
      setWinner(race === 'valdari' ? 'gorkar' : 'valdari');
    } else if (playerUnitsAlive === 0) {
      console.log('Enemigo gana');
      setWinner(race === 'valdari' ? 'gorkar' : 'valdari');
    } else if (enemyUnitsAlive === 0) {
      console.log('Jugador gana');
      setWinner(race);
    }
  }, [units, deadUnits, race, isInitialized]);

  const reduceAllCooldowns = () => {
    setUnits(prev => prev.map(unit => {
      if (deadUnits.includes(unit.id)) return unit;

      const newCooldown = Math.max(0, unit.cooldown - 1);
      return {
        ...unit,
        cooldown: newCooldown
      };
    }));
  };

  const applyCooldownToUnit = (unitId: string) => {
    const aliveUnitsCount = units.filter(unit => !deadUnits.includes(unit.id)).length;
    const newCooldown = Math.max(1, Math.ceil(aliveUnitsCount / 2));

    setUnits(prev => prev.map(unit =>
      unit.id === unitId ? { ...unit, cooldown: newCooldown } : unit
    ));
  };

  const performDefendAction = (defendingRace: Race) => {
    if (winner) return;

    console.log('Defend action for:', defendingRace);

    setIsProcessingAction(true);

    // Aumentar defensa en 1 para todas las cartas del bando
    setUnits(prev => prev.map(unit => {
      if (unit.race === defendingRace && !deadUnits.includes(unit.id)) {
        return {
          ...unit,
          defense: unit.defense + 1
        };
      }
      return unit;
    }));

    // Reducir cooldown de todas las cartas
    reduceAllCooldowns();

    // Efecto visual en todas las cartas del bando
    units.forEach(unit => {
      if (unit.race === defendingRace && !deadUnits.includes(unit.id)) {
        triggerSpecialEffect(unit.id, 'buff');
      }
    });

    // Cambiar turno después de un delay
    setTimeout(() => {
      setIsProcessingAction(false);
      setCurrentTurn(defendingRace === 'valdari' ? 'gorkar' : 'valdari');
      setTurnCount(prev => prev + 1);

      // Solo llamar aiTurn si es el turno del enemigo Y no estamos en modo IA del jugador
      if (currentTurn !== race && !isAIActive && !winner) {
        setTimeout(() => aiTurn(), 1000);
      }
    }, 1500);
  };

  const handleGlobalDefend = () => {
    if (isProcessingAction || currentTurn !== race || winner) return;
    performDefendAction(race);
  };

  const toggleAIActive = () => {
    if (winner) return;
    setIsAIActive(prev => !prev);
  };

  const handleAIPlay = () => {
    if (isProcessingAction || currentTurn !== race || winner) return;

    setIsProcessingAction(true);

    // Obtener unidades del jugador que estén vivas y no en cooldown
    const playerUnits = units.filter(u =>
      u.race === race &&
      u.health > 0 &&
      !deadUnits.includes(u.id) &&
      u.cooldown === 0
    );

    if (playerUnits.length === 0) {
      // Si no hay unidades disponibles, pasar turno
      setIsProcessingAction(false);
      setCurrentTurn(currentTurn === 'valdari' ? 'gorkar' : 'valdari');
      setTurnCount(prev => prev + 1);
      setTimeout(() => aiTurn(), 1000);
      return;
    }

    // Elegir una unidad al azar, con preferencia por las que tengan especial disponible
    const unitsWithSpecial = playerUnits.filter(u => !u.specialUsed);
    const chosenUnit = unitsWithSpecial.length > 0 && Math.random() > 0.5
      ? unitsWithSpecial[Math.floor(Math.random() * unitsWithSpecial.length)]
      : playerUnits[Math.floor(Math.random() * playerUnits.length)];

    // Decidir acción: atacar o especial (si está disponible y con probabilidad)
    const actions: ('attack' | 'special')[] = [];
    if (!chosenUnit.specialUsed) {
      actions.push('special');
    }
    actions.push('attack');

    const chosenAction = actions[Math.floor(Math.random() * actions.length)];

    // Realizar la acción
    if (chosenAction === 'attack') {
      reduceAllCooldowns();
      applyCooldownToUnit(chosenUnit.id);

      const enemyUnits = units.filter(u =>
        u.race !== race &&
        u.health > 0 &&
        !deadUnits.includes(u.id)
      );
      if (enemyUnits.length > 0) {
        // Priorizar unidades frontales del enemigo
        const attackUnits = enemyUnits.filter(u => u.isAttacker);
        const target = attackUnits.length > 0
          ? attackUnits[Math.floor(Math.random() * attackUnits.length)]
          : enemyUnits[Math.floor(Math.random() * enemyUnits.length)];

        triggerMovementEffect(chosenUnit.id);
        setTimeout(() => {
          performAttack(chosenUnit, target);
        }, 500);
      } else {
        // No hay enemigos, entonces pasamos turno
        setIsProcessingAction(false);
        setCurrentTurn(currentTurn === 'valdari' ? 'gorkar' : 'valdari');
        setTurnCount(prev => prev + 1);
        setTimeout(() => aiTurn(), 1000);
      }
    } else {
      reduceAllCooldowns();
      applyCooldownToUnit(chosenUnit.id);

      setUnits(prev => prev.map(u =>
        u.id === chosenUnit.id ? { ...u, specialUsed: true } : u
      ));
      triggerMovementEffect(chosenUnit.id);
      setTimeout(() => {
        performSpecialAction(chosenUnit);
      }, 500);
    }
  };

  useEffect(() => {
    return () => {
      effectTimeoutRefs.current.forEach(id => clearTimeout(id));
    };
  }, []);

  // Efecto para que la IA juegue automáticamente cuando está activa y es el turno del jugador
  useEffect(() => {
    if (isAIActive && currentTurn === race && !isProcessingAction && !winner) {
      const timer = setTimeout(() => {
        handleAIPlay();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAIActive, currentTurn, isProcessingAction, winner]);

  // Inicializar unidades - CORREGIDO
  useEffect(() => {
    console.log('Initializing units for race:', race);

    const playerUnits = race === 'valdari'
      ? [...valdariUnits].map((unit, index) => ({
        ...unit,
        position: Object.values(PlayerFormationPositions)[index],
        cooldown: 0
      }))
      : [...gorkarUnits].map((unit, index) => ({
        ...unit,
        position: Object.values(PlayerFormationPositions)[index],
        cooldown: 0
      }));

    const enemyUnits = race === 'valdari'
      ? [...gorkarUnits].map((unit, index) => ({
        ...unit,
        position: Object.values(EnemyFormationPositions)[index],
        cooldown: 0
      }))
      : [...valdariUnits].map((unit, index) => ({
        ...unit,
        position: Object.values(EnemyFormationPositions)[index],
        cooldown: 0
      }));

    const allUnits = [...playerUnits, ...enemyUnits];
    console.log('Setting units:', allUnits.length, 'total units');
    setUnits(allUnits);

    // Marcar como inicializado después de un breve delay para asegurar que las unidades se han cargado
    const timer = setTimeout(() => {
      console.log('Game initialized');
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [race]);

  const handleSelectUnit = (unit: BattlefieldUnit) => {
    if (isProcessingAction || deadUnits.includes(unit.id) || unit.cooldown > 0 || unit.race !== race || winner) return;
    setSelectedUnit(unit.id === selectedUnit?.id ? null : unit);
  };

  const triggerDamageEffect = (unitId: string) => {
    const effectId = `damage-${Date.now()}`;
    setAttackEffects(prev => [...prev, { id: effectId, unitId, type: 'damage' }]);

    const timeout = setTimeout(() => {
      setAttackEffects(prev => prev.filter(e => e.id !== effectId));
    }, 1000);

    effectTimeoutRefs.current.push(timeout as unknown as number);
  };

  const triggerSpecialEffect = (unitId: string, type: string) => {
    const effectId = `special-${Date.now()}`;
    setSpecialEffects(prev => [...prev, { id: effectId, unitId, type }]);

    const timeout = setTimeout(() => {
      setSpecialEffects(prev => prev.filter(e => e.id !== effectId));
    }, 1500);

    effectTimeoutRefs.current.push(timeout as unknown as number);
  };

  const triggerMovementEffect = (unitId: string) => {
    setMovingUnits(prev => [...prev, unitId]);

    const timeout = setTimeout(() => {
      setMovingUnits(prev => prev.filter(id => id !== unitId));
    }, 1500);

    effectTimeoutRefs.current.push(timeout as unknown as number);
  };

  const handleUnitDeath = (deadUnit: BattlefieldUnit) => {
    setDeadUnits(prev => [...prev, deadUnit.id]);
    triggerSpecialEffect(deadUnit.id, 'death');

    reduceAllCooldowns();

    const timeout = setTimeout(() => {
      setUnits(prev => prev.filter(u => u.id !== deadUnit.id));
      setDeadUnits(prev => prev.filter(id => id !== deadUnit.id));
    }, 1500);

    effectTimeoutRefs.current.push(timeout as unknown as number);
  };

  const handleUnitAction = (action: 'attack' | 'defend' | 'special') => {
    if (!selectedUnit || selectedUnit.race !== currentTurn || isProcessingAction || deadUnits.includes(selectedUnit.id) || winner) return;

    if (selectedUnit.cooldown > 0) {
      return;
    }

    setIsProcessingAction(true);

    if (action === 'attack') {
      reduceAllCooldowns();
      applyCooldownToUnit(selectedUnit.id);

      const enemyUnits = units.filter(u => u.race !== selectedUnit.race && u.health > 0 && !deadUnits.includes(u.id));
      if (enemyUnits.length > 0) {
        // Priorizar unidades frontales del enemigo
        const attackUnits = enemyUnits.filter(u => u.isAttacker);
        const target = attackUnits.length > 0
          ? attackUnits[Math.floor(Math.random() * attackUnits.length)]
          : enemyUnits[Math.floor(Math.random() * enemyUnits.length)];

        triggerMovementEffect(selectedUnit.id);
        setTimeout(() => {
          performAttack(selectedUnit, target);
        }, 500);
      } else {
        setIsProcessingAction(false);
      }
    } else if (action === 'special') {
      reduceAllCooldowns();
      applyCooldownToUnit(selectedUnit.id);

      setUnits(prev => prev.map(u =>
        u.id === selectedUnit.id ? { ...u, specialUsed: true } : u
      ));
      triggerMovementEffect(selectedUnit.id);
      setTimeout(() => {
        performSpecialAction(selectedUnit);
      }, 500);
    }
  };

  const performAttack = (attacker: BattlefieldUnit, target: BattlefieldUnit) => {
    setSelectedUnit(null);

    const damageAmount = Math.max(1, attacker.attack - target.defense);
    const newHealth = Math.max(0, target.health - damageAmount);

    setTimeout(() => {
      triggerDamageEffect(target.id);
      setDamageNumbers(prev => [...prev, {
        id: `dmg-${Date.now()}`,
        unitId: target.id,
        amount: damageAmount
      }]);

      setUnits(prev => prev.map(u =>
        u.id === target.id ? { ...u, health: newHealth } : u
      ));

      if (newHealth <= 0) {
        handleUnitDeath(target);
      }

      setTimeout(() => {
        setIsProcessingAction(false);

        if (attacker.race === race) {
          setCurrentTurn(currentTurn === 'valdari' ? 'gorkar' : 'valdari');
          setTurnCount(prev => prev + 1);
          setTimeout(() => aiTurn(), 1000);
        } else {
          setCurrentTurn(race);
          setTurnCount(prev => prev + 1);
          setIsProcessingAction(false);
        }
      }, 1000);
    }, 800);
  };

  const performSpecialAction = (unit: BattlefieldUnit) => {
    setSelectedUnit(null);

    if (unit.special.includes('curar') || unit.special.includes('Curación')) {
      setUnits(prev => prev.map(u =>
        u.race === unit.race && !deadUnits.includes(u.id)
          ? { ...u, health: Math.min(u.maxHealth, u.health + 20) }
          : u
      ));
    } else if (unit.special.includes('Escudo') || unit.special.includes('escudo')) {
      setUnits(prev => prev.map(u =>
        u.race === unit.race && !deadUnits.includes(u.id)
          ? {
            ...u,
            defense: u.defense + 5,
            statuses: [
              ...(u.statuses || []),
              { type: 'defense', duration: 2 }
            ]
          }
          : u
      ));
    } else {
      const enemyUnits = units.filter(u => u.race !== unit.race && !deadUnits.includes(u.id));
      enemyUnits.forEach(enemy => {
        const newHealth = Math.max(0, enemy.health - 15);

        triggerDamageEffect(enemy.id);
        setDamageNumbers(prev => [...prev, {
          id: `dmg-${Date.now()}`,
          unitId: enemy.id,
          amount: 15
        }]);

        setUnits(prev => prev.map(u =>
          u.id === enemy.id ? { ...u, health: newHealth } : u
        ));

        if (newHealth <= 0) {
          handleUnitDeath(enemy);
        }
      });
    }

    setTimeout(() => {
      setIsProcessingAction(false);
      if (unit.race === race) {
        setCurrentTurn(currentTurn === 'valdari' ? 'gorkar' : 'valdari');
        setTurnCount(prev => prev + 1);
        setTimeout(() => aiTurn(), 1000);
      } else {
        setCurrentTurn(race);
        setTurnCount(prev => prev + 1);
        setIsProcessingAction(false);
      }
    }, 1500);
  };

  const aiTurn = () => {
    if (winner) return;

    console.log('AI Turn started - Current turn:', currentTurn);

    // Obtener unidades de la IA que estén vivas y sin cooldown
    const aiUnits = units.filter(u =>
      u.race !== race &&
      u.health > 0 &&
      !deadUnits.includes(u.id) &&
      u.cooldown === 0
    );

    console.log('AI Units available:', aiUnits.length, aiUnits.map(u => u.name));

    // Si no hay unidades de IA disponibles, defender
    if (aiUnits.length === 0) {
      console.log('No AI units available, performing defend action');
      performDefendAction(race === 'valdari' ? 'gorkar' : 'valdari');
      return;
    }

    // Obtener unidades del jugador que estén vivas
    const playerUnits = units.filter(u =>
      u.race === race &&
      u.health > 0 &&
      !deadUnits.includes(u.id)
    );

    // Si no hay unidades del jugador, la IA gana, pero por si acaso, defender
    if (playerUnits.length === 0) {
      console.log('No player units left, AI wins, but performing defend action');
      performDefendAction(race === 'valdari' ? 'gorkar' : 'valdari');
      return;
    }

    // Seleccionar una unidad de IA al azar
    const aiUnit = aiUnits[Math.floor(Math.random() * aiUnits.length)];
    console.log('Selected AI unit:', aiUnit.name);

    // Decidir acción: atacar o usar habilidad especial (si está disponible)
    const canUseSpecial = !aiUnit.specialUsed;
    let action: 'attack' | 'special';

    if (canUseSpecial && Math.random() < 0.5) {
      action = 'special';
    } else {
      action = 'attack';
    }

    console.log('AI chosen action:', action);

    setIsProcessingAction(true);

    // Reducir cooldowns y aplicar cooldown a la unidad de IA
    reduceAllCooldowns();
    applyCooldownToUnit(aiUnit.id);

    if (action === 'attack') {
      // Priorizar unidades frontales del jugador
      const attackUnits = playerUnits.filter(u => u.isAttacker);
      const target = attackUnits.length > 0
        ? attackUnits[Math.floor(Math.random() * attackUnits.length)]
        : playerUnits[Math.floor(Math.random() * playerUnits.length)];

      console.log('AI attacking target:', target.name);

      triggerMovementEffect(aiUnit.id);
      setTimeout(() => {
        performAttack(aiUnit, target);
      }, 500);
    } else {
      // Usar habilidad especial
      setUnits(prev => prev.map(u =>
        u.id === aiUnit.id ? { ...u, specialUsed: true } : u
      ));
      console.log('AI using special:', aiUnit.special);
      triggerMovementEffect(aiUnit.id);
      setTimeout(() => {
        performSpecialAction(aiUnit);
      }, 500);
    }
  };

  const restartBattle = () => {
    console.log('Restarting battle');

    // Reiniciar todos los estados
    setUnits([]);
    setSelectedUnit(null);
    setAttackEffects([]);
    setSpecialEffects([]);
    setCurrentTurn(race);
    setTurnCount(1);
    setDamageNumbers([]);
    setDeadUnits([]);
    setIsProcessingAction(false);
    setMovingUnits([]);
    setIsAIActive(false);
    setWinner(null);
    setIsInitialized(false);

    // Recargar unidades después de un breve delay
    setTimeout(() => {
      const playerUnits = race === 'valdari'
        ? [...valdariUnits].map((unit, index) => ({
          ...unit,
          position: Object.values(PlayerFormationPositions)[index],
          cooldown: 0
        }))
        : [...gorkarUnits].map((unit, index) => ({
          ...unit,
          position: Object.values(PlayerFormationPositions)[index],
          cooldown: 0
        }));

      const enemyUnits = race === 'valdari'
        ? [...gorkarUnits].map((unit, index) => ({
          ...unit,
          position: Object.values(EnemyFormationPositions)[index],
          cooldown: 0
        }))
        : [...valdariUnits].map((unit, index) => ({
          ...unit,
          position: Object.values(EnemyFormationPositions)[index],
          cooldown: 0
        }));

      setUnits([...playerUnits, ...enemyUnits]);

      // Marcar como inicializado después de que las unidades se carguen
      setTimeout(() => {
        setIsInitialized(true);
      }, 100);
    }, 100);
  };

  const exitBattle = () => {
    // En una aplicación real, esto llevaría al menú principal
    // Por ahora, simplemente recargamos la página
    window.location.reload();
  };

  return (
    <BattlefieldContainer $race={race}>
      <GameBoard
        $bgImage={backgroundImage || (race === 'valdari'
          ? '/images/battlefields/valdari-battlefield.jpg'
          : '/images/battlefields/gorkar-battlefield.jpg')}
        $race={race}
      >
        <PlayerZone />
        <EnemyZone />
        <BattleLine />

        <TurnIndicator $race={currentTurn} $isPlayerTurn={currentTurn === race}>
          {currentTurn === 'valdari' ? 'Turno Valdari' : 'Turno Gorkar'}
        </TurnIndicator>

        <RoundCounter $race={race}>
          Ronda {turnCount}
        </RoundCounter>

        {units.map(unit => {
          if (deadUnits.includes(unit.id)) return null;

          const isTakingDamage = attackEffects.some(e => e.unitId === unit.id && e.type === 'damage');
          const hasSpecialEffect = specialEffects.some(e => e.unitId === unit.id);
          const currentDamageNumbers = damageNumbers.filter(d => d.unitId === unit.id);
          const isMoving = movingUnits.includes(unit.id);
          const isDead = deadUnits.includes(unit.id);
          const healthPercentage = (unit.health / unit.maxHealth) * 100;
          const isAvailable = unit.cooldown === 0;

          return (
            <React.Fragment key={unit.id}>
              <BattlefieldCard
                style={{
                  top: unit.position.top,
                  left: unit.position.left,
                }}
                $race={unit.race}
                $isSelected={unit.id === selectedUnit?.id}
                $isPlayerUnit={unit.race === race}
                $isHero={unit.isHero}
                $isTakingDamage={isTakingDamage}
                $isDead={isDead}
                $isMoving={isMoving}
                $isOnCooldown={!isAvailable}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isAvailable) {
                    handleSelectUnit(unit);
                  }
                }}
              >
                <CardImageContainer $isHero={unit.isHero}>
                  <CardImage src={unit.image} alt={unit.name} />

                  {!isAvailable && (
                    <CooldownBadge $race={unit.race}>
                      {unit.cooldown}
                    </CooldownBadge>
                  )}

                  <HealthBarContainer $race={unit.race}>
                    <HealthText $percentage={healthPercentage}>
                      {unit.health}/{unit.maxHealth}
                    </HealthText>
                    <HealthBar $percentage={healthPercentage} />
                  </HealthBarContainer>

                  {hasSpecialEffect && (
                    <SpecialEffectOverlay
                      $race={unit.race}
                      $type={specialEffects.find(e => e.unitId === unit.id)?.type || 'default'}
                    />
                  )}
                </CardImageContainer>

                {unit.statuses?.map((status, index) => (
                  <StatusBadge
                    key={index}
                    $type={status.type}
                  >
                    {status.type === 'defense' ? '🛡️' :
                      status.type === 'poison' ? '☠️' :
                        status.type === 'buff' ? '⬆️' : '⬇️'}
                  </StatusBadge>
                ))}
              </BattlefieldCard>

              {currentDamageNumbers.map(dmg => (
                <DamageNumber
                  key={dmg.id}
                  $race={unit.race}
                  $isHero={unit.isHero}
                  $isHeal={dmg.isHeal}
                >
                  {dmg.isHeal ? '+' : '-'}{dmg.amount}
                </DamageNumber>
              ))}
            </React.Fragment>
          );
        })}
      </GameBoard>

      {/* Botón de Jugar con IA - Ahora es un toggle */}
      <AIPlayButton
        $race={race}
        $isPlayerTurn={currentTurn === race}
        $isActive={isAIActive}
        onClick={toggleAIActive}
        disabled={isProcessingAction || currentTurn !== race || !!winner}
      >
        {isAIActive ? 'Detener IA' : 'Jugar con IA'}
      </AIPlayButton>

      {/* Botón de Defender Global */}
      <DefendButton
        $race={race}
        $isPlayerTurn={currentTurn === race}
        onClick={handleGlobalDefend}
        disabled={isProcessingAction || currentTurn !== race || !!winner}
      >
        Defender
      </DefendButton>

      {selectedUnit && !deadUnits.includes(selectedUnit.id) && (
        <UnitDetailsPanel
          unit={selectedUnit}
          currentTurn={currentTurn}
          onAction={handleUnitAction}
          onClose={() => setSelectedUnit(null)}
          isProcessingAction={isProcessingAction}
        />
      )}

      {winner && (
        <VictoryModal
          winner={winner}
          onRestart={restartBattle}
          onExit={exitBattle}
        />
      )}
    </BattlefieldContainer>
  );
};

export default Battlefield;