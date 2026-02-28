import styled from 'styled-components';
import type { RaceType } from '../../types/gameData';
import { raceColors } from '../../types/raceColors';
import { hexToRgb } from './ArmyPanel.styles';

// Estilos del modal

// Fondo del modal
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

// Contenido del modal
export const ModalContent = styled.div<{ $race: RaceType }>`
  background: ${({ $race }) => raceColors[$race].background || 'rgba(0, 0, 0, 0.9)'};
  border: 2px solid ${({ $race }) => raceColors[$race].color};
  border-radius: 10px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  color: ${({ $race }) => raceColors[$race].textColor || 'white'};
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
`;

// Botón para cerrar el modal
export const ModalCloseButton = styled.button<{ $race: RaceType }>`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: ${({ $race }) => raceColors[$race].color};
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 101;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${({ $race }) => raceColors[$race].secondaryColor || 'white'};
    transform: scale(1.2);
  }
`;

// Contenedor flexible del modal
export const ModalFlexContainer = styled.div`
  display: flex;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

// Sección de imagen del modal
export const ModalImageSection = styled.div`
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

// Sección de información del modal
export const ModalInfoSection = styled.div`
  flex: 2;
  padding: 20px;
`;

// Imagen de unidad en el modal
export const ModalUnitImage = styled.img`
  width: 200px;
  height: 200px;
  object-fit: contain;
  margin-bottom: 20px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  @media (max-width: 768px) {
    width: 150px;
    height: 150px;
  }
`;

// Título del modal
export const ModalTitle = styled.h2`
  margin: 0;
  color: inherit;
  font-size: 1.8rem;
  text-align: center;
`;

// Caja de información del modal
export const ModalInfoBox = styled.div<{ $race: RaceType }>`
  width: 100%;
  padding: 12px;
  margin-top: 15px;
  background: rgba(${({ $race }) => hexToRgb(raceColors[$race].color)}, 0.1);
  border: 1px solid ${({ $race }) => raceColors[$race].color};
  border-radius: 6px;
`;

// Fila de información del modal
export const ModalInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  &:last-child {
    margin-bottom: 0;
  }
`;

// Etiqueta de información del modal
export const ModalInfoLabel = styled.span<{ $race: RaceType }>`
  font-weight: bold;
  color: ${({ $race }) => raceColors[$race].color};
`;

// Valor de información del modal
export const ModalInfoValue = styled.span`
  font-weight: normal;
`;

// Sección del modal
export const ModalSection = styled.div`
  margin-bottom: 20px;
`;

// Título de sección del modal
export const ModalSectionTitle = styled.h3<{ $race: RaceType }>`
  margin: 0 0 10px 0;
  color: ${({ $race }) => raceColors[$race].color};
  font-size: 1.2rem;
  border-bottom: 1px solid ${({ $race }) => raceColors[$race].secondaryColor};
  padding-bottom: 5px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
`;

// Icono de estadísticas
export const StatsIcon = styled.span<{ $race: RaceType }>`
  margin-right: 8px;
  color: ${({ $race }) => raceColors[$race].color};
`;

// Icono de habilidad
export const AbilityIcon = styled(StatsIcon)``;
// Icono de costo
export const CostIcon = styled(StatsIcon)``;

// Contenedor de estadísticas del modal
export const ModalStatsContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 10px;
  }
`;

// Columna de estadísticas del modal
export const ModalStatsColumn = styled.div`
  flex: 1;
`;

// Item de estadística del modal
export const ModalStatItem = styled.div`
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
`;

// Etiqueta de estadística del modal
export const ModalStatLabel = styled.div<{ $race: RaceType }>`
  font-size: 0.9rem;
  color: ${({ $race }) => raceColors[$race].color};
  margin-bottom: 3px;
  font-weight: bold;
`;

// Valor de estadística del modal
export const ModalStatValue = styled.div`
  font-weight: bold;
  font-size: 1rem;
`;

// Texto de regeneración
export const RegenText = styled.span<{ $race: RaceType }>`
  font-size: 0.8em;
  color: ${({ $race }) => raceColors[$race].secondaryColor};
`;

// Texto pequeño
export const SmallText = styled.span`
  font-size: 0.8em;
  opacity: 0.8;
`;

// Caja de habilidad del modal
export const ModalAbilityBox = styled.div<{ $race: RaceType }>`
  padding: 12px;
  background: rgba(${({ $race }) => hexToRgb(raceColors[$race].secondaryColor)}, 0.1);
  border-left: 3px solid ${({ $race }) => raceColors[$race].color};
  border-radius: 4px;
`;

// Nombre de habilidad del modal
export const ModalAbilityName = styled.div<{ $race: RaceType }>`
  font-weight: bold;
  color: ${({ $race }) => raceColors[$race].color};
  margin-bottom: 5px;
  font-size: 1.1rem;
`;

// Descripción de habilidad del modal
export const ModalAbilityDesc = styled.div`
  font-size: 0.9rem;
  line-height: 1.4;
`;

// Grid de costos del modal
export const ModalCostGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
`;

// Item de costo del modal
export const ModalCostItem = styled.div<{ $race: RaceType }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(${({ $race }) => hexToRgb(raceColors[$race].color)}, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(${({ $race }) => hexToRgb(raceColors[$race].color)}, 0.3);
`;

// Icono de costo del modal
export const ModalCostIcon = styled.span`
  font-size: 1.2rem;
`;

// Detalles de costo del modal
export const ModalCostDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

// Cantidad de costo del modal
export const ModalCostAmount = styled.span`
  font-weight: bold;
  font-size: 1.1rem;
`;

// Recurso de costo del modal
export const ModalCostResource = styled.span`
  font-size: 0.8rem;
  opacity: 0.8;
`;