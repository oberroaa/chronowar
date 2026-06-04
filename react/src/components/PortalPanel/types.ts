import type { RaceType } from '../../types/gameData';

export type FormationsData = {
  principal?: { units: (any | null)[] };
  secondary?: { units: (any | null)[] };
  reserve?: { units: (any | null)[] };
};

// Tipo para los datos de jugador
export type PlayerType = {
  id: number;
  name: string;
  race: RaceType;
};

// Tipo para los datos de jugadores del sistema (ubicaciones)
export type SystemPlayerType = {
  id: number;
  name: string;
  race: RaceType;
};

// Tipo para los resultados de batalla/recolección
export type BattleResultType = {
  success: boolean;
  message: string;
  rewards?: {
    experience: number;
    resources?: number;
    items?: string[];
  };
};

// Props del componente PortalPanel
export type PortalPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  playersData?: PlayerType[];
  systemPlayersData?: SystemPlayerType[];
  playerRace?: RaceType;
  race: RaceType;
  countdown: number | null;
  currentTarget: number | null;
  battleResult: BattleResultType | null;
  onActionStart: (targetId: number) => void;
  onResultClose: () => void;
  activeTab: 'players' | 'system';
  onTabChange: (tab: 'players' | 'system') => void;
  travelCount: number;
  maxTravels: number;
  onTravelUsed: () => void;
  formations?: FormationsData;
};

// Props para componentes styled
export type StyledRaceProps = {
  $race: RaceType;
};

export type StyledSuccessProps = {
  $isSuccess: boolean;
};

export type StyledActionProps = {
  $action: 'attack' | 'gather';
};

export type StyledDisabledProps = {
  $isDisabled?: boolean;
};

export type StyledLowProps = {
  $isLow: boolean;
};

export type StyledCriticalProps = {
  $isCritical: boolean;
};

export type StyledActiveProps = {
  $active: boolean;
};

export type StyledOpenProps = {
  $isOpen: boolean;
};