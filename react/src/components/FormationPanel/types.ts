
import type { RaceType, UnitProduction } from '../../types/gameData';

export type { RaceType };

export type SelectedUnit = UnitProduction & {
  formationIndex: number;
  positionIndex: number;
};

export type FormationPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  race: RaceType;
  gameUnits: UnitProduction[];
};

export type FormationType = {
  name: string;
  units: Array<UnitProduction | null>;
};

export type SlotPosition = {
  formationIndex: number;
  positionIndex: number;
};

export type UnitSlotProps = {
  $isSelected: boolean;
  $isHero?: boolean;
  $isEmpty: boolean;
  $isCenter: boolean;
  race: RaceType;
};

export type AvailableUnitProps = {
  race: RaceType;
  $disabled?: boolean;
};

export type FormationButtonProps = {
  race: RaceType;
  $formationType: 'attack' | 'defense';
};