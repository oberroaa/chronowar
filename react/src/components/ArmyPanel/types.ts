import type { RaceType, UnitProduction } from '../../types/gameData';

export type ArmyPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  race: RaceType;
  onUnitSelect?: (unitId: number) => void;
  selectedUnits?: number[];
  gameUnits: UnitProduction[];
};

export type UnitImageDisplayProps = {
  unit: UnitProduction;
  onUnitClick: (unit: UnitProduction) => void;
};

export type ArmyModalProps = {
  unit: UnitProduction;
  race: RaceType;
  isOpen: boolean;
  onClose: () => void;
  getAbilityDescription: (abilityName: string) => string;
};