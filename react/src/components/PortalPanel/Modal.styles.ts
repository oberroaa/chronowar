import styled from 'styled-components';
import { raceColors } from '../../types/raceColors';
import type { 
  StyledRaceProps, 
  StyledSuccessProps 
} from './types';

// Función auxiliar para convertir color HEX a RGB
export const hexToRgb = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
};

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(5px);
`;

export const ModalContainer = styled.div<StyledRaceProps & StyledSuccessProps>`
  background: ${({ $race, $isSuccess }) => 
    $isSuccess 
      ? `linear-gradient(135deg, ${raceColors[$race].background} 0%, #1a3a1a 100%)`
      : `linear-gradient(135deg, ${raceColors[$race].background} 0%, #3a1a1a 100%)`};
  border: 3px solid ${({ $isSuccess }) => 
    $isSuccess ? '#4ade80' : '#f87171'};
  border-radius: 16px;
  width: 100%;
  max-width: 450px;
  padding: 0;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.5),
    0 0 30px ${({ $isSuccess }) => 
      $isSuccess ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ $race, $isSuccess }) => 
      $isSuccess 
        ? `linear-gradient(90deg, ${raceColors[$race].color}, #4ade80)`
        : `linear-gradient(90deg, ${raceColors[$race].color}, #f87171)`};
  }
`;

export const ModalCloseButton = styled.button<StyledRaceProps>`
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid ${({ $race }) => raceColors[$race].color};
  color: ${({ $race }) => raceColors[$race].color};
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
  
  &:hover {
    background: ${({ $race }) => raceColors[$race].color};
    color: white;
    transform: scale(1.1);
  }
`;

export const ModalHeader = styled.div<StyledSuccessProps & StyledRaceProps>`
  padding: 30px 30px 20px;
  text-align: center;
  background: ${({ $isSuccess }) => 
    $isSuccess 
      ? 'linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, transparent 100%)'
      : 'linear-gradient(135deg, rgba(248, 113, 113, 0.1) 0%, transparent 100%)'};
  position: relative;
`;

export const ModalIcon = styled.div<StyledSuccessProps>`
  font-size: 4rem;
  margin-bottom: 15px;
  filter: ${({ $isSuccess }) => 
    $isSuccess ? 'drop-shadow(0 4px 8px rgba(74, 222, 128, 0.4))' 
               : 'drop-shadow(0 4px 8px rgba(248, 113, 113, 0.4))'};
  animation: bounce 0.6s ease-in-out;
  
  @keyframes bounce {
    0%, 20%, 60%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    80% { transform: translateY(-5px); }
  }
`;

export const ModalTitle = styled.h3<StyledSuccessProps & StyledRaceProps>`
  color: ${({ $isSuccess }) => $isSuccess ? '#4ade80' : '#f87171'};
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 1px;
`;

export const Divider = styled.div<StyledRaceProps>`
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    ${({ $race }) => raceColors[$race].color} 50%, 
    transparent 100%);
  margin: 0 30px;
  opacity: 0.6;
`;

export const ModalContent = styled.div`
  padding: 25px 30px;
`;

export const ModalText = styled.p<StyledSuccessProps>`
  margin: 0 0 25px;
  text-align: center;
  font-size: 1.1rem;
  line-height: 1.5;
  color: ${({ $isSuccess }) => $isSuccess ? '#d1fae5' : '#fecaca'};
  font-weight: 500;
`;

export const ModalRewardsSection = styled.div`
  margin-top: 20px;
`;

export const RewardsTitle = styled.h4<StyledRaceProps>`
  color: ${({ $race }) => raceColors[$race].color};
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.2rem;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

export const ModalStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 15px;
  margin-top: 15px;

  @media (max-width: 350px) {
    grid-template-columns: 1fr;
  }
`;

export const ModalStat = styled.div<StyledRaceProps & StyledSuccessProps>`
  background: ${({ $isSuccess }) => 
    $isSuccess 
      ? 'linear-gradient(135deg, rgba(74, 222, 128, 0.15) 0%, rgba(74, 222, 128, 0.05) 100%)'
      : 'linear-gradient(135deg, rgba(248, 113, 113, 0.15) 0%, rgba(248, 113, 113, 0.05) 100%)'};
  border-radius: 12px;
  padding: 15px;
  border: 1px solid ${({ $isSuccess }) => 
    $isSuccess ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'};
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ $isSuccess }) => 
      $isSuccess ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'};
  }
`;

export const StatIcon = styled.span`
  font-size: 1.8rem;
  flex-shrink: 0;
`;

export const StatContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const StatLabel = styled.div<StyledRaceProps>`
  font-size: 0.8rem;
  color: ${({ $race }) => raceColors[$race].color};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const StatValue = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px 30px 30px;
`;

export const ModalButton = styled.button<StyledRaceProps & StyledSuccessProps>`
  padding: 12px 35px;
  background: ${({ $isSuccess }) => 
    $isSuccess 
      ? 'linear-gradient(135deg, #4ade80, #22c55e)'
      : 'linear-gradient(135deg, #f87171, #ef4444)'};
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-family: 'Arial', sans-serif;
  font-size: 1.1rem;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px ${({ $isSuccess }) => 
    $isSuccess ? 'rgba(74, 222, 128, 0.4)' : 'rgba(248, 113, 113, 0.4)'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${({ $isSuccess }) => 
      $isSuccess ? 'rgba(74, 222, 128, 0.6)' : 'rgba(248, 113, 113, 0.6)'};
  }
  
  &:active {
    transform: translateY(0);
  }

  @media (max-width: 400px) {
    padding: 10px 30px;
    font-size: 1rem;
  }
`;