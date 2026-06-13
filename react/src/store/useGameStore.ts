import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type RaceType, type ResourceType, type BuildingInfo, type ProductionQueueItem } from '../types/gameData';
import { fetchGameData, fetchPlayerData, fetchPlayersList, updatePlayerState } from '../api/gameApi';

export interface UpgradeQueueItem {
  upgrade: string;
  timeLeft: number;
  buildingId: string;
  startedAt: number;
}

interface GameState {
  view: 'home' | 'city' | 'battle';
  race: RaceType;
  resources: Record<ResourceType, number>;
  buildingLevels: Record<string, number>;
  upgradeQueue: UpgradeQueueItem[];
  gameData: Record<string, BuildingInfo> | null;
  playerData: any;
  playersList: any[];
  productionQueue: ProductionQueueItem[];

  setView: (view: 'home' | 'city' | 'battle') => void;
  setRace: (race: RaceType) => void;
  setResources: (resources: Record<ResourceType, number>) => void;
  updateResource: (type: ResourceType, amount: number) => void;
  addResources: (newResources: Partial<Record<ResourceType, number>>) => void;
  startGame: (selectedRace: RaceType) => Promise<void>;
  setBuildingLevel: (buildingId: string, level: number) => void;
  initBuildingLevels: (initialLevels: Record<string, number>) => void;
  addUpgradeToQueue: (item: UpgradeQueueItem) => void;
  tickUpgradeQueue: () => UpgradeQueueItem[];
  addProductionQueueItem: (item: ProductionQueueItem) => void;
  tickProductionQueue: () => ProductionQueueItem[];
  loadGameData: () => Promise<void>;
  loadPlayerState: () => Promise<void>;
  syncPlayerState: () => Promise<void>;
  addCompletedUnit: (unitName: string, amount: number) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      view: 'home',
      race: 'valdari',
      resources: { gold: 0, wood: 0, stone: 0, food: 0, chrono: 0 },
      buildingLevels: {},
      upgradeQueue: [],
      gameData: null,
      playerData: null,
      playersList: [],
      productionQueue: [],

      setView: (view) => set({ view }),
      setRace: (race) => set({ race }),
      setResources: (resources) => {
        set({ resources });
        get().syncPlayerState();
      },

      updateResource: (type, amount) => {
        set((state) => ({
          resources: {
            ...state.resources,
            [type]: state.resources[type] + amount
          }
        }));
        get().syncPlayerState();
      },

      addResources: (newResources) => {
        set((state) => {
          const updatedResources = { ...state.resources };
          (Object.keys(newResources) as ResourceType[]).forEach((key) => {
            if (newResources[key] !== undefined) {
              updatedResources[key] += newResources[key]!;
            }
          });
          return { resources: updatedResources };
        });
        get().syncPlayerState();
      },

      startGame: async (selectedRace) => {
        try {
          await get().loadPlayerState();
        } catch {
          // Si el backend falla, igual entramos al juego con datos locales
        }
        set({ race: selectedRace, view: 'city' });
      },

      setBuildingLevel: (buildingId, level) => {
        set((state) => ({
          buildingLevels: {
            ...state.buildingLevels,
            [buildingId.toLowerCase()]: level
          }
        }));
        get().syncPlayerState();
      },

      initBuildingLevels: (initialLevels) => set(() => ({
        buildingLevels: { ...initialLevels }
      })),

      addUpgradeToQueue: (item) => set((state) => ({
        upgradeQueue: [...state.upgradeQueue, item]
      })),

      addProductionQueueItem: (item) => set((state) => ({
        productionQueue: [...state.productionQueue, item]
      })),

      // Descuenta 1 segundo a cada item, devuelve los completados
      tickUpgradeQueue: () => {
        const state = get();
        const ticked = state.upgradeQueue.map(i => ({ ...i, timeLeft: i.timeLeft - 1 }));
        const completed = ticked.filter(i => i.timeLeft <= 0);
        set({ upgradeQueue: ticked.filter(i => i.timeLeft > 0) });
        return completed;
      },

      tickProductionQueue: () => {
        const state = get();
        const ticked = state.productionQueue.map(i => ({ ...i, timeLeft: i.timeLeft - 1 }));
        const completed = ticked.filter(i => i.timeLeft <= 0);
        set({ productionQueue: ticked.filter(i => i.timeLeft > 0) });
        return completed;
      },

      loadGameData: async () => {
        const data = await fetchGameData();
        if (data) {
          set({ gameData: data.buildingsData });
        }
      },
      loadPlayerState: async () => {
        const [me, all] = await Promise.all([fetchPlayerData(), fetchPlayersList()]);
        if (me) {
          set(() => ({
            playerData: me,
            resources: me.resources,
            race: me.race as RaceType,
            buildingLevels: me.buildingLevels ?? {}
          }));
        }
        if (all) {
          set({ playersList: all });
        }
      },
      syncPlayerState: async () => {
        const state = get();
        if (state.playerData) {
          await updatePlayerState({
            resources: state.resources,
            formations: state.playerData.formations,
            gameUnits: state.playerData.gameUnits,
            buildingLevels: state.buildingLevels
          });
        }
      },
      addCompletedUnit: (unitName: string, amount: number) => {
        set((state) => {
          if (!state.playerData) return state;
          const gameUnits = [...(state.playerData.gameUnits || [])];
          const existingIndex = gameUnits.findIndex((u: any) => u.name === unitName);
          if (existingIndex >= 0) {
            gameUnits[existingIndex] = {
              ...gameUnits[existingIndex],
              available: (gameUnits[existingIndex].available || 0) + amount
            };
          } else {
            gameUnits.push({ name: unitName, available: amount });
          }
          return { playerData: { ...state.playerData, gameUnits } };
        });
        get().syncPlayerState();
      }
    }),
    {
      name: 'chronowar-game-storage',
      version: 2,
      migrate: () => ({ buildingLevels: {}, upgradeQueue: [], productionQueue: [] }),
    }
  )
);
