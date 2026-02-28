import styled from 'styled-components';
import { raceColors } from '../../types/raceColors';
import type { RaceType } from './types';
import type { ResourceType } from '../../types/gameData';

// Contenedor principal con estilos basados en la raza
export const ResourcesContainer = styled.div<{ $race: RaceType }>`
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  background: ${props => raceColors[props.$race].background};
  border: ${props => raceColors[props.$race].border};
  border-radius: 10px;
  padding: 8px 15px;
  z-index: 100;
  box-shadow: ${props => raceColors[props.$race].shadow};
  backdrop-filter: blur(5px);
  max-width: 95vw;

  @media (max-width: 768px) {
    top: 5px;
    padding: 5px 10px;
    gap: 8px;
  }

  @media (max-width: 480px) {
    gap: 5px;
    padding: 5px;
  }

  @keyframes shine {
    0% { opacity: 0.8; }
    50% { 
      opacity: 1; 
      text-shadow: 
        0 0 10px ${props => raceColors[props.$race].iconGlow},
        0 0 20px white; 
    }
    100% { opacity: 0.8; }
  }
`;

// Contenedor individual para cada recurso
export const ResourceItem = styled.div<{ $race: RaceType }>`
  display: flex;
  align-items: center;
  gap: 5px;
  color: ${props => raceColors[props.$race].textColor};
  font-family: 'Arial', sans-serif;
  font-weight: bold;
  text-shadow: 1px 1px 2px #000;

  @media (max-width: 768px) {
    gap: 4px;
  }
`;

// Estilo para los iconos de recursos
export const ResourceIcon = styled.span<{ $type: ResourceType; $race: RaceType }>`
  color: ${props => raceColors[props.$race].resourceColors[props.$type]};
  font-size: 1.2rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

// Estilo para los valores numéricos de los recursos
export const ResourceValue = styled.span<{ $race: RaceType }>`
  font-size: 1.1rem;
  min-width: 40px;
  text-align: right;
  color: ${props => raceColors[props.$race].textColor};

  @media (max-width: 768px) {
    font-size: 0.9rem;
    min-width: 30px;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
    min-width: 25px;
  }
`;