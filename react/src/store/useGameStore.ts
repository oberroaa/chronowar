import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type RaceType, type ResourceType, type BuildingInfo } from '../types/gameData';
import { fetchGameData, fetchPlayerData, fetchPlayersList, updatePlayerState } from '../api/gameApi';

interface GameState {
  view: 'home' | 'city' | 'battle';
  race: RaceType;
  resources: Record<ResourceType, number>;
  buildingLevels: Record<string, number>;
  gameData: Record<string, BuildingInfo> | null;
  playerData: any;
  playersList: any[];

  setView: (view: 'home' | 'city' | 'battle') => void;
  setRace: (race: RaceType) => void;
  setResources: (resources: Record<ResourceType, number>) => void;
  updateResource: (type: ResourceType, amount: number) => void;
  addResources: (newResources: Partial<Record<ResourceType, number>>) => void;
  startGame: (selectedRace: RaceType) => Promise<void>;
  setBuildingLevel: (buildingId: string, level: number) => void;
  initBuildingLevels: (initialLevels: Record<string, number>) => void;
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
      gameData: null,
      playerData: null,
      playersList: [],

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
        set({
          race: selectedRace,
          view: 'city'
        });
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

      initBuildingLevels: (initialLevels) => set((state) => ({
        buildingLevels: { ...initialLevels, ...state.buildingLevels }
      })),

      loadGameData: async () => {
        const data = await fetchGameData();
        if (data) {
          set({ gameData: data.buildingsData });
        }
      },
      loadPlayerState: async () => {
        const [me, all] = await Promise.all([fetchPlayerData(), fetchPlayersList()]);
        if (me) {
          set((state) => ({ 
            playerData: me, 
            resources: me.resources, 
            race: me.race as RaceType,
            buildingLevels: me.buildingLevels && Object.keys(me.buildingLevels).length > 0 
              ? me.buildingLevels 
              : state.buildingLevels
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
          
          return {
            playerData: {
              ...state.playerData,
              gameUnits
            }
          };
        });
        get().syncPlayerState();
      }
    }),
    {
      name: 'chronowar-game-storage',
    }
  )
);

