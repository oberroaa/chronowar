import styled from 'styled-components';
import { type StyledProps, type ResourceCostProps, type ButtonStateProps } from './types';

// Título del edificio
export const BuildingTitle = styled.h2<{ $secondaryColor: string }>`
  color: ${props => props.$secondaryColor};
  text-align: center;
  margin: 0 0 15px 0;
  font-size: 1.8rem;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
`;

// Descripción del edificio
export const BuildingDescription = styled.p`
  margin: 0 0 20px 0;
  line-height: 1.5;
  color: #ddd;
  text-align: center;
  font-size: 1.1rem;
`;

// Estado de colas
export const QueueStatus = styled.div<{ $secondaryColor: string }>`
  background: rgba(50, 50, 50, 0.5);
  border-left: 3px solid ${props => props.$secondaryColor};
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 5px;
`;

// Item de cola
export const QueueItem = styled.div<{ $accentColor: string }>`
  padding: 5px 0;
  color: ${props => props.$accentColor};
  font-size: 0.9rem;
`;

// Sección de edificio
export const BuildingSection = styled.div<{ $primaryColor: string }>`
  margin-bottom: 25px;
  background: rgba(30, 30, 30, 0.7);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid ${props => props.$primaryColor};
`;

// Título de sección
export const SectionTitle = styled.h3<{ $secondaryColor: string; $accentColor: string }>`
  color: ${props => props.$secondaryColor};
  margin: 0 0 15px 0;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  
  &::before, &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid ${props => props.$accentColor};
    margin: 0 10px;
  }
`;

// Item de unidad
export const UnitItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(139, 109, 59, 0.3);

  &:last-child {
    border-bottom: none;
  }
`;

// Información de unidad
export const UnitInfo = styled.div`
  flex: 1;
  margin-right: 15px;
`;

// Contenedor de nombre de unidad
export const UnitNameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
`;

// Imagen de unidad
export const UnitImage = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

// Nombre de unidad
export const UnitName = styled.div<{ $secondaryColor: string }>`
  font-weight: bold;
  font-size: 1.1rem;
  color: ${props => props.$secondaryColor};
`;

// Costo de unidad
export const UnitCost = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
`;

// Item de mejora
export const UpgradeItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(139, 109, 59, 0.3);

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

// Información de mejora
export const UpgradeInfo = styled.div`
  flex: 1;
  margin-right: 15px;
  margin-bottom: 0;
`;

// Nombre de mejora
export const UpgradeName = styled.div<{ $secondaryColor: string }>`
  font-weight: bold;
  font-size: 1.1rem;
  color: ${props => props.$secondaryColor};
  margin-bottom: 5px;
`;

// Descripción de mejora
export const UpgradeDescription = styled.div`
  font-size: 0.9rem;
  color: #aaa;
  margin-bottom: 8px;
  line-height: 1.4;
`;

// Costo de mejora
export const UpgradeCost = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
`;

// Estado de mejora
export const UpgradeStatus = styled.span<{ $accentColor: string }>`
  display: block;
  font-size: 0.9rem;
  color: ${props => props.$accentColor};
  margin-top: 5px;
  font-style: italic;
  text-align: center;
  padding: 5px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 5px;
`;

// Sección de mejora de nivel
export const LevelUpSection = styled.div<{ $secondaryColor: string }>`
  margin-top: 25px;
  padding-top: 20px;
  border-top: 2px solid ${props => props.$secondaryColor};
  text-align: center;
`;

// Costo de mejora de nivel
export const LevelUpCost = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
  margin: 15px 0;
`;

// Costo de recurso
export const ResourceCost = styled.span<ResourceCostProps>`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  font-weight: bold;
  color: ${props => {
        switch (props.$type) {
            case 'gold': return '#FFD700';
            case 'supplies': return '#8B4513';
            case 'food': return '#32CD32';
            case 'chrono': return '#00BFFF';
            default: return 'white';
        }
    }};
  border: 1px solid ${props => {
        switch (props.$type) {
            case 'gold': return '#FFD700';
            case 'supplies': return '#8B4513';
            case 'food': return '#32CD32';
            case 'chrono': return '#00BFFF';
            default: return '#555';
        }
    }};
`;

// Badge de tiempo
export const TimeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  color: #ccc;
  border: 1px solid #555;
`;

// Botón de producción
export const ProductionButton = styled.button<StyledProps & ButtonStateProps>`
  padding: 8px 15px;
  min-width: 140px;
  background: ${props =>
        props.$producing ? props.$darkColor + '80' :
            props.$canAfford ? props.$primaryColor + '80' :
                'rgba(150, 50, 50, 0.3)'};
  color: white;
  border: 1px solid ${props =>
        props.$producing ? props.$accentColor :
            props.$canAfford ? props.$secondaryColor :
                '#ff5555'};
  border-radius: 6px;
  cursor: ${props => props.$canAfford && !props.$producing ? 'pointer' : 'not-allowed'};
  font-weight: bold;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: ${props =>
        props.$producing ? props.$darkColor + 'A0' :
            props.$canAfford ? props.$primaryColor + 'A0' :
                'rgba(150, 50, 50, 0.5)'};
    transform: ${props => props.$canAfford && !props.$producing ? 'translateY(-2px)' : 'none'};
  }
  
  &:disabled {
    opacity: 0.8;
  }
`;

// Botón de mejora
export const UpgradeButton = styled.button<StyledProps & ButtonStateProps>`
  padding: 8px 15px;
  min-width: 140px;
  background: ${props =>
        props.$upgrading ? props.$darkColor + '80' :
            props.$canAfford ? props.$primaryColor + '80' :
                'rgba(150, 50, 50, 0.3)'};
  color: white;
  border: 1px solid ${props =>
        props.$upgrading ? props.$accentColor :
            props.$canAfford ? props.$secondaryColor :
                '#ff5555'};
  border-radius: 6px;
  cursor: ${props => props.$canAfford && !props.$upgrading ? 'pointer' : 'not-allowed'};
  font-weight: bold;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: ${props =>
        props.$upgrading ? props.$darkColor + 'A0' :
            props.$canAfford ? props.$primaryColor + 'A0' :
                'rgba(150, 50, 50, 0.5)'};
    transform: ${props => props.$canAfford && !props.$upgrading ? 'translateY(-2px)' : 'none'};
  }
  
  &:disabled {
    opacity: 0.8;
  }
`;

// Botón de mejora de nivel
export const LevelUpButton = styled.button<{
    $primaryColor: string;
    $secondaryColor: string;
    $darkColor: string;
}>`
  display: block;
  width: 100%;
  padding: 12px;
  background: linear-gradient(
    to right,
    ${props => props.$darkColor + '80'},
    ${props => props.$primaryColor + '80'}
  );
  color: ${props => props.$secondaryColor};
  border: 1px solid ${props => props.$secondaryColor};
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  margin-top: 15px;
  
  &:hover:not(:disabled) {
    background: linear-gradient(
      to right,
      ${props => props.$darkColor + 'A0'},
      ${props => props.$primaryColor + 'A0'}
    );
    transform: translateY(-2px);
    box-shadow: 0 5px 15px ${props => props.$primaryColor + '50'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    color: #777;
    border-color: #555;
    background: linear-gradient(
      to right,
      rgba(50, 50, 50, 0.3),
      rgba(80, 80, 80, 0.3)
    );
  }
`;

// Advertencia de mejora
export const UpgradeWarning = styled.div<{ $accentColor: string }>`
  color: ${props => props.$accentColor};
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
`;

// Badge de cantidad
export const QuantityBadge = styled.span<{
    $secondaryColor: string;
    $primaryColor: string;
}>`
  margin-left: 8px;
  padding: 2px 8px;
  background: ${props => props.$primaryColor + '40'};
  color: ${props => props.$secondaryColor};
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: normal;
  border: 1px solid ${props => props.$secondaryColor};
`;

// Display de población
export const PopulationDisplay = styled.div<{ $secondaryColor: string }>`
  margin: 10px 0;
  padding: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  color: ${props => props.$secondaryColor};
  font-weight: bold;
  text-align: center;
`;

// Gráfico de Producción
export const ProductionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 10px;
`;

export const ProductionCard = styled.div<{ $secondaryColor: string; $accentColor: string }>`
  background: rgba(20, 20, 20, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);

  &:hover {
    border-color: ${props => props.$secondaryColor};
    box-shadow: 0 0 15px ${props => props.$accentColor + '60'};
    transform: translateY(-2px);
  }
`;

export const ProductionIconContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  font-weight: bold;
  color: #eee;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
`;

export const ProductionRate = styled.div`
  color: #32cd32;
  font-weight: bold;
  font-size: 1.1rem;
  text-shadow: 0 0 5px rgba(50, 205, 50, 0.4);
`;