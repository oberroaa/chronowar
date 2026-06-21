import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type RaceType, type ResourceType, type BuildingInfo, type ProductionQueueItem } from '../types/gameData';
import { fetchGameData, fetchPlayerData, fetchPlayersList, updatePlayerState } from '../api/gameApi';

export interface UpgradeQueueItem {
  upgrade: string;
  timeLeft: number; // seconds
  buildingId: string;
  startedAt: number; // ms
  duration?: number;
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

// Implementation
export const useGameStore = create<GameState>()(
  persist(
    (set, get) => {
      let syncTimer: ReturnType<typeof setTimeout> | null = null;
      const scheduleSync = () => {
        if (syncTimer) clearTimeout(syncTimer);
        syncTimer = setTimeout(() => {
          // fire-and-forget
          void get().syncPlayerState();
          syncTimer = null;
        }, 5000);
      };

      return {
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
          scheduleSync();
        },

        updateResource: (type, amount) => {
          set((state) => ({ resources: { ...state.resources, [type]: state.resources[type] + amount } }));
          scheduleSync();
        },

        addResources: (newResources) => {
          set((state) => {
            const updatedResources = { ...state.resources };
            (Object.keys(newResources) as ResourceType[]).forEach((k) => {
              if (newResources[k] !== undefined) updatedResources[k] += newResources[k]!;
            });
            return { resources: updatedResources };
          });
          scheduleSync();
        },

        startGame: async (selectedRace) => {
          try {
            await get().loadPlayerState();
          } catch {
            // ignore
          }

          const currentRace = get().race;

          if (currentRace !== selectedRace) {
            // Si el usuario cambia de raza, reseteamos el progreso local para cargar los nuevos
            set({ 
              race: selectedRace, 
              view: 'city',
              buildingLevels: {},
              productionQueue: [],
              upgradeQueue: [],
              playerData: { ...get().playerData, gameUnits: [] }
            });
            void get().syncPlayerState();
          } else {
            set({ race: selectedRace, view: 'city' });
          }
        },

        setBuildingLevel: (buildingId, level) => {
          set((state) => ({ buildingLevels: { ...state.buildingLevels, [buildingId.toLowerCase()]: level } }));
          scheduleSync();
        },

        initBuildingLevels: (initialLevels) => set(() => ({ buildingLevels: { ...initialLevels } })),

        addUpgradeToQueue: (item) => {
          set((state) => ({
            upgradeQueue: [
              ...state.upgradeQueue,
              { ...item, duration: item.duration ?? item.timeLeft }
            ]
          }));
          scheduleSync();
        },

        addProductionQueueItem: (item) => {
          set((state) => ({
            productionQueue: [
              ...state.productionQueue,
              {
                ...item,
                startedAt: item.startedAt ?? Date.now(),
                duration: item.duration ?? item.timeLeft
              }
            ]
          }));
          scheduleSync();
        },

        // Ticking based on timestamps to avoid timer drift and persisted state mismatches
        tickUpgradeQueue: () => {
          const state = get();
          const now = Date.now();
          const completed: UpgradeQueueItem[] = [];
          const remaining = state.upgradeQueue.map((it) => {
            const elapsedMs = Math.max(0, now - it.startedAt);
            const durationMs = it.duration !== undefined ? it.duration * 1000 : elapsedMs + it.timeLeft * 1000;
            const end = it.startedAt + durationMs;
            if (end <= now) {
              completed.push(it);
              return null;
            }
            const remainingTime = Math.max(0, Math.ceil((end - now) / 1000));
            return { ...it, timeLeft: remainingTime, duration: it.duration ?? durationMs / 1000 };
          }).filter(Boolean) as UpgradeQueueItem[];
          set({ upgradeQueue: remaining });
          return completed;
        },

        tickProductionQueue: () => {
          const state = get();
          const now = Date.now();
          const completed: ProductionQueueItem[] = [];
          const remaining = state.productionQueue.map((it) => {
            const elapsedMs = Math.max(0, now - it.startedAt);
            const durationMs = it.duration !== undefined ? it.duration * 1000 : elapsedMs + it.timeLeft * 1000;
            const end = it.startedAt + durationMs;
            if (end <= now) {
              completed.push(it);
              return null;
            }
            const remainingTime = Math.max(0, Math.ceil((end - now) / 1000));
            return { ...it, timeLeft: remainingTime, duration: it.duration ?? durationMs / 1000 };
          }).filter(Boolean) as ProductionQueueItem[];
          set({ productionQueue: remaining });
          return completed;
        },

        loadGameData: async () => {
          const data = await fetchGameData();
          if (data) set({ gameData: data.buildingsData });
        },

        loadPlayerState: async () => {
          const [me, all] = await Promise.all([fetchPlayerData(), fetchPlayersList()]);
          if (me) {
            const updates: Partial<GameState> = {
              playerData: me,
              resources: me.resources,
              race: me.race as RaceType,
            };
            // Only overwrite buildingLevels if server has saved levels
            if (me.buildingLevels && Object.keys(me.buildingLevels).length > 0) {
              updates.buildingLevels = me.buildingLevels;
            }
            // Restore persisted queues from server if present and local is empty
            const state = get();
            if (me.upgradeQueue && me.upgradeQueue.length > 0 && state.upgradeQueue.length === 0) {
              updates.upgradeQueue = me.upgradeQueue;
            }
            if (me.productionQueue && me.productionQueue.length > 0 && state.productionQueue.length === 0) {
              updates.productionQueue = me.productionQueue;
            }
            set(updates as any);
          }
          if (all) set({ playersList: all });
        },

        syncPlayerState: async () => {
          const state = get();
          if (!state.playerData) return;
          await updatePlayerState({
            resources: state.resources,
            formations: state.playerData.formations,
            gameUnits: state.playerData.gameUnits,
            buildingLevels: state.buildingLevels,
            upgradeQueue: state.upgradeQueue,
            productionQueue: state.productionQueue
          });
        },

        addCompletedUnit: (unitName: string, amount: number) => {
          set((state) => {
            if (!state.playerData) return state;
            const gameUnits = [...(state.playerData.gameUnits || [])];
            const idx = gameUnits.findIndex((u: any) => u.name === unitName);
            if (idx >= 0) gameUnits[idx] = { ...gameUnits[idx], available: (gameUnits[idx].available || 0) + amount };
            else gameUnits.push({ name: unitName, available: amount });
            return { playerData: { ...state.playerData, gameUnits } };
          });
          scheduleSync();
        }
      };
    },
    {
      name: 'chronowar-game-storage',
      version: 2,
      migrate: (persistedState: any) => {
        if (!persistedState) return { buildingLevels: {}, upgradeQueue: [], productionQueue: [] };
        return {
          ...persistedState,
          buildingLevels: persistedState.buildingLevels ?? {},
          upgradeQueue: persistedState.upgradeQueue ?? [],
          productionQueue: persistedState.productionQueue ?? []
        };
      }
    }
  )
);

export default useGameStore;
