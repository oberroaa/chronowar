import React from 'react';
import type { UnitProduction } from '../../types/gameData';
import type { UnitSlotProps } from './types';
import { UnitSlot as StyledUnitSlot, UnitImage, UnitName, EmptySlot } from './FormationPanel.styles';

interface UnitSlotComponentProps extends UnitSlotProps {
  unit: UnitProduction | null;
  formationIndex: number;
  positionIndex: number;
  onUnitClick: (formationIndex: number, positionIndex: number) => void;
}

const UnitSlot: React.FC<UnitSlotComponentProps> = ({
  unit,
  formationIndex,
  positionIndex,
  onUnitClick,
  ...slotProps
}) => {
  return (
    <StyledUnitSlot
      {...slotProps}
      onClick={() => onUnitClick(formationIndex, positionIndex)}
    >
      {unit ? (
        <>
          <UnitImage src={unit.image} alt={unit.name} />
          <UnitName race={slotProps.race}>{unit.name}</UnitName>
        </>
      ) : (
        <EmptySlot race={slotProps.race}>+</EmptySlot>
      )}
    </StyledUnitSlot>
  );
};

export default UnitSlot;