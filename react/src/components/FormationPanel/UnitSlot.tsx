import React from 'react';
import type { UnitProduction } from '../../types/gameData';
import { StyledUnitSlot, UnitImage, UnitName, EmptySlot } from './FormationPanel.styles';

interface UnitSlotComponentProps {
  unit: UnitProduction | null;
  formationIndex: number;
  positionIndex: number;
  onUnitClick: (formationIndex: number, positionIndex: number) => void;
  isSelected: boolean;
  isHero?: boolean;
  isEmpty: boolean;
  isCenter: boolean;
  race: any;
}

const UnitSlot: React.FC<UnitSlotComponentProps> = ({
  unit,
  formationIndex,
  positionIndex,
  onUnitClick,
  isSelected,
  isHero,
  isEmpty,
  isCenter,
  race
}) => {
  return (
    <StyledUnitSlot
      $isSelected={isSelected}
      $isHero={isHero}
      $isEmpty={isEmpty}
      $isCenter={isCenter}
      $race={race}
      onClick={() => onUnitClick(formationIndex, positionIndex)}
    >
      {unit ? (
        <>
          <UnitImage src={unit.image} alt={unit.name} />
          <UnitName $race={race}>{unit.name}</UnitName>
        </>
      ) : (
        <EmptySlot $race={race}>+</EmptySlot>
      )}
    </StyledUnitSlot>
  );
};

export default UnitSlot;