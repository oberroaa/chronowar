import styled, { css } from 'styled-components';
import { raceColors } from '../../types/raceColors';
import type { 
  RaceType, 
  UnitSlotProps, 
  AvailableUnitProps, 
  FormationButtonProps 
} from './types';

// Función helper para convertir HEX a RGB
export const hexToRgb = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
};

// Estilos base para cada raza
export const raceStyles = (race: RaceType) => {
  const colors = raceColors[race];
  return css`
    color: ${colors.text};
    background: ${colors.background};
    border-color: ${colors.secondary};
    
    h1, h2, h3, h4, strong {
      color: ${colors.primary};
    }
    
    button {
      background: linear-gradient(to bottom, ${colors.secondary}, ${colors.background});
      border-color: ${colors.primary};
      color: ${colors.text};
      
      &:hover {
        background: linear-gradient(to bottom, ${colors.primary}, ${colors.secondary});
        color: white;
      }
    }
    
    .selected {
      border-color: ${colors.accent};
      box-shadow: 0 0 10px ${colors.accent};
    }
    
    .hero {
      border-color: ${colors.accent};
      background: rgba(${hexToRgb(colors.primary)}, 0.2);
    }
  `;
};

// Panel compacto que aparece desde abajo
export const CompactPanel = styled.div<{ isOpen: boolean, race: RaceType }>`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  min-width: ${5 * 46 + 4 * 6 + 32}px;
  max-width: 95%;
  height: ${({ isOpen }) => isOpen ? 'auto' : '0'};
  max-height: 55vh;
  border-radius: 8px 8px 0 0;
  padding: 4px 5px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.6);
  z-index: 100;
  overflow-y: auto;
  transition: all 0.25s ease;
  
  ${({ race }) => raceStyles(race)};
  background: ${({ race }) => raceColors[race].background};
  border: 1px solid ${({ race }) => raceColors[race].secondary};
`;

// Encabezado del panel
export const PanelHeader = styled.div<{ race: RaceType }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 8px;
  color: ${({ race }) => raceColors[race].text};
  width: 100%;
  flex-wrap: wrap;
`;

// Botón de guardar
export const SaveButton = styled.button<{ race: RaceType }>`
  background: linear-gradient(to bottom, ${({ race }) => raceColors[race].accent}, 
    ${({ race }) => raceColors[race].secondary});
  color: white;
  border: 1px solid ${({ race }) => raceColors[race].primary};
  border-radius: 12px;
  padding: 4px 12px;
  font-size: 0.75rem;
  cursor: pointer;
  margin-left: 0;
  margin-top: 0;
  
  &:hover {
    background: linear-gradient(to bottom, ${({ race }) => raceColors[race].primary}, 
      ${({ race }) => raceColors[race].accent});
    transform: translateY(-1px);
  }
`;

// Botón de cerrar panel
export const CloseButton = styled.button<{ race: RaceType }>`
  background: linear-gradient(to bottom, ${({ race }) => raceColors[race].secondary}, 
    ${({ race }) => raceColors[race].background});
  color: ${({ race }) => raceColors[race].text};
  border: 1px solid ${({ race }) => raceColors[race].primary};
  border-radius: 12px;
  padding: 4px 12px;
  font-size: 0.75rem;
  cursor: pointer;
  
  &:hover {
    background: linear-gradient(to bottom, ${({ race }) => raceColors[race].primary}, 
      ${({ race }) => raceColors[race].secondary});
    color: white;
  }
`;

// Contenedor de formaciones
export const FormationsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

// Grupo de formación individual
export const FormationGroup = styled.div<{ race: RaceType }>`
  border-radius: 6px;
  padding: 8px;
  border: 1px solid ${({ race }) => raceColors[race].secondary};
  background: rgba(${({ race }) => hexToRgb(raceColors[race].secondary)}, 0.3);
`;

// Título de formación
export const FormationTitle = styled.div<{ race: RaceType }>`
  text-align: center;
  font-size: 0.75rem;
  margin-bottom: 8px;
  font-weight: 500;
  color: ${({ race }) => raceColors[race].primary};
`;

// Fila de unidades
export const UnitsRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 6px;
`;

// Slot individual de unidad
export const UnitSlot = styled.div<UnitSlotProps>`
  width: 46px;
  height: 46px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
  overflow: hidden;
  
  border: 1px solid ${({ $isSelected, $isHero, $isCenter, race }) => 
    $isSelected ? raceColors[race].accent :
    $isHero ? raceColors[race].accent : 
    $isCenter ? raceColors[race].primary : raceColors[race].secondary};

  ${({ $isCenter, race }) => $isCenter && `
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, transparent, ${raceColors[race].accent}, transparent);
    }
  `}

  &:hover {
    transform: scale(1.05);
    z-index: 1;
    box-shadow: 0 0 8px ${({ race }) => raceColors[race].accent};
  }

  ${({ $isSelected, race }) => $isSelected && `
    box-shadow: 0 0 10px ${raceColors[race].accent};
    transform: scale(1.05);
    z-index: 2;
  `}
`;

// Imagen de unidad
export const UnitImage = styled.img`
  width: 30px;
  height: 30px;
  object-fit: contain;
  filter: drop-shadow(0 0 2px #000);
`;

// Nombre de unidad
export const UnitName = styled.span<{ race: RaceType }>`
  font-size: 0.55rem;
  color: ${({ race }) => raceColors[race].text};
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90%;
  text-shadow: 0 0 2px #000;
`;

// Slot vacío
export const EmptySlot = styled.span<{ race: RaceType }>`
  color: ${({ race }) => raceColors[race].secondary};
  font-size: 0.9rem;
  opacity: 0.6;
`;

// Fondo del modal
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
  z-index: 200;
`;

// Contenido del modal
export const ModalContent = styled.div<{ race: RaceType }>`
  background: ${({ race }) => raceColors[race].background};
  border: 1px solid ${({ race }) => raceColors[race].secondary};
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.7);
`;

// Encabezado del modal
export const ModalHeader = styled.div<{ race: RaceType }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid ${({ race }) => raceColors[race].secondary};
  padding-bottom: 10px;
`;

// Título del modal
export const ModalTitle = styled.h3<{ race: RaceType }>`
  color: ${({ race }) => raceColors[race].primary};
  margin: 0;
  font-size: 1.2rem;
`;

// Botón para cerrar modal
export const CloseModalButton = styled.button<{ race: RaceType }>`
  background: none;
  border: none;
  color: ${({ race }) => raceColors[race].secondary};
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 5px;
  
  &:hover {
    color: ${({ race }) => raceColors[race].primary};
  }
`;

// Lista de unidades
export const UnitsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// Subtítulo
export const Subtitle = styled.h4<{ race: RaceType }>`
  color: ${({ race }) => raceColors[race].primary};
  margin: 10px 0 5px;
  font-size: 0.9rem;
`;

// Unidad disponible para seleccionar
export const AvailableUnit = styled.div<AvailableUnitProps>`
  display: flex;
  align-items: center;
  background: rgba(${({ race }) => hexToRgb(raceColors[race].secondary)}, 
    ${({ $disabled }) => $disabled ? '0.2' : '0.5'});
  border: 1px solid ${({ race, $disabled }) => 
    $disabled ? 'red' : raceColors[race].secondary};
  border-radius: 4px;
  padding: 8px;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${({ $disabled }) => $disabled ? 0.6 : 1};
  
  &:hover {
    background: rgba(${({ race, $disabled }) => 
      $disabled ? hexToRgb(raceColors[race].secondary) : 
      hexToRgb(raceColors[race].primary)}, 
      ${({ $disabled }) => $disabled ? '0.2' : '0.3'});
    transform: ${({ $disabled }) => $disabled ? 'none' : 'translateX(5px)'};
  }
`;

// Detalles de unidad
export const UnitDetails = styled.div`
  margin-left: 10px;
  flex-grow: 1;
`;

// Estadísticas de unidad
export const UnitStats = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 3px;
`;

// Estadística individual
export const Stat = styled.span<{ race: RaceType }>`
  font-size: 0.7rem;
  color: ${({ race }) => raceColors[race].text};
`;

// Contenedor de información de unidad
export const UnitInfoContainer = styled.div`
  display: flex;
  gap: 20px;
`;

// Imagen grande de unidad
export const UnitImageLarge = styled.img<{ race: RaceType }>`
  width: 100px;
  height: 100px;
  object-fit: contain;
  border: 2px solid ${({ race }) => raceColors[race].secondary};
  border-radius: 4px;
`;

// Contenedor de estadísticas
export const UnitStatsContainer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

// Item de estadística
export const StatItem = styled.div<{ race: RaceType }>`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: ${({ race }) => raceColors[race].text};
`;

// Etiqueta de estadística
export const StatLabel = styled.span<{ race: RaceType }>`
  color: ${({ race }) => raceColors[race].primary};
  font-size: 0.9rem;
`;

// Valor de estadística
export const StatValue = styled.span<{ race: RaceType }>`
  color: ${({ race }) => raceColors[race].text};
  font-weight: bold;
`;

// Botón de formación (quitar unidad)
export const FormationButton = styled.button<FormationButtonProps>`
  background: ${({ race, $formationType }) => 
    $formationType === 'attack' 
      ? `linear-gradient(to bottom, ${raceColors[race].primary}, #a02020)`
      : `linear-gradient(to bottom, ${raceColors[race].secondary}, #2040a0)`};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  margin-top: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &::before {
    content: ${({ $formationType }) => 
      $formationType === 'attack' ? '"⚔️"' : '"🛡️"'};
    font-size: 1.1rem;
  }
`;

// Subtítulo con botón de cerrar
export const SubtitleWithClose = styled.div<{ race: RaceType }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 10px 0 5px;
  padding-bottom: 5px;
  padding-top: 50px;
  border-bottom: 1px solid ${({ race }) => raceColors[race].secondary};
`;

// Botón para cerrar lista
export const CloseListButton = styled.button<{ race: RaceType }>`
  background: linear-gradient(to bottom, ${({ race }) => raceColors[race].secondary}, 
    ${({ race }) => raceColors[race].background});
  color: ${({ race }) => raceColors[race].primary};
  border: 1px solid ${({ race }) => raceColors[race].primary};
  border-radius: 15px;
  padding: 4px 12px;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  
  &:hover {
    background: linear-gradient(to bottom, ${({ race }) => raceColors[race].primary}, 
      ${({ race }) => raceColors[race].secondary});
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
`;

// Icono pequeño de cerrar
export const CloseIconSmall = styled.span<{ race: RaceType }>`
  font-size: 0.9rem;
  font-weight: bold;
  color: ${({ race }) => raceColors[race].accent};
`;