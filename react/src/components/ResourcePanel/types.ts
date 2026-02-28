import { raceColors } from '../../types/raceColors';
import type { ResourcePanelProps, ResourceType } from '../../types/gameData';

export type RaceType = keyof typeof raceColors;

export type ResourcePanelComponentProps = ResourcePanelProps & { 
  race: RaceType 
};

export type ResourceItemProps = {
  type: ResourceType;
  value: number;
  race: RaceType;
};