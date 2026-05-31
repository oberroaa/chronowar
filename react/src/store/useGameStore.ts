import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type RaceType, type ResourceType } from '../types/gameData';
import { recursosPlayer } from '../types/jsonResponse';

interface GameState {
  // State
  view: 'home' | 'city' | 'battle';
  race: RaceType;
  resources: Record<ResourceType, number>;
  buildingLevels: Record<string, number>;

  // Actions
  setView: (view: 'home' | 'city' | 'battle') => void;
  setRace: (race: RaceType) => void;
  setResources: (resources: Record<ResourceType, number>) => void;
  updateResource: (type: ResourceType, amount: number) => void;
  addResources: (newResources: Partial<Record<ResourceType, number>>) => void;
  startGame: (selectedRace: RaceType) => void;
  setBuildingLevel: (buildingId: string, level: number) => void;
  initBuildingLevels: (initialLevels: Record<string, number>) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      // Initial State
      view: 'home',
      race: 'valdari',
      resources: recursosPlayer,
      buildingLevels: {},

      // Actions
      setView: (view) => set({ view }),
      setRace: (race) => set({ race }),
      setResources: (resources) => set({ resources }),

      updateResource: (type, amount) => set((state) => ({
        resources: {
          ...state.resources,
          [type]: state.resources[type] + amount
        }
      })),

      addResources: (newResources) => set((state) => {
        const updatedResources = { ...state.resources };
        (Object.keys(newResources) as ResourceType[]).forEach((key) => {
          if (newResources[key] !== undefined) {
            updatedResources[key] += newResources[key]!;
          }
        });
        return { resources: updatedResources };
      }),

      startGame: (selectedRace) => set({
        race: selectedRace,
        view: 'city'
      }),

      setBuildingLevel: (buildingId, level) => set((state) => ({
        buildingLevels: {
          ...state.buildingLevels,
          [buildingId.toLowerCase()]: level
        }
      })),

      initBuildingLevels: (initialLevels) => set((state) => {
        if (Object.keys(state.buildingLevels).length === 0) {
          return { buildingLevels: initialLevels };
        }
        return { buildingLevels: state.buildingLevels };
      }),
    }),
    {
      name: 'chronowar-game-storage', // Nombre de la clave en LocalStorage
    }
  )
);

