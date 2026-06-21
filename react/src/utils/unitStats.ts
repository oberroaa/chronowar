import type { UnitProduction, BuildingInfo, RaceType } from '../types/gameData';

/**
 * Gets a fresh array of all units with bonuses applied.
 * Useful for Battlefield or initial load.
 */
export const getUpgradedUnits = (buildingLevels: Record<string, number>, buildingsData: Record<string, any>, race: RaceType): UnitProduction[] => {
  const allUnits: UnitProduction[] = [];

  Object.values(buildingsData).forEach((building: BuildingInfo) => {
    if (building.race !== race) return;
    
    const currentLevel = buildingLevels[building.name.toLowerCase()] ?? 0;
    const bonus = currentLevel;

    building.unitsProduced?.forEach((unit: UnitProduction) => {
      // Avoid duplicates if multiple buildings produce the same unit
      if (!allUnits.some(u => u.id === unit.id)) {
        allUnits.push({
          ...unit,
          attack: unit.attack + bonus,
          attackBonus: bonus,
          armor: unit.armor + bonus,
          armorBonus: bonus,
        });
      }
    });
  });

  return allUnits;
};

/**
 * Updates an existing array of units (preserving their 'available' count) 
 * with new stats based on the current building levels.
 */
export const applyBuildingLevelBonuses = (
  currentUnits: UnitProduction[],
  buildingLevels: Record<string, number>,
  buildingsData: Record<string, any>,
  race: RaceType
): UnitProduction[] => {
  const unitLevelMap: Record<number, number> = {};
  
  Object.values(buildingsData).forEach((building: BuildingInfo) => {
    if (building.race !== race) return;
    
    const level = buildingLevels[building.name.toLowerCase()] ?? 0;
    building.unitsProduced?.forEach((unit: UnitProduction) => {
      unitLevelMap[unit.id] = level;
    });
  });

  return currentUnits.map(unit => {
    const level = unitLevelMap[unit.id] ?? 0;
    let baseAttack = unit.attack;
    let baseArmor = unit.armor;
    
    // Find base stats
    for (const b of Object.values(buildingsData)) {
      const bInfo = b as BuildingInfo;
      if (bInfo.race !== race) continue;
      const found = bInfo.unitsProduced?.find((u: UnitProduction) => u.id === unit.id);
      if (found) {
        baseAttack = found.attack;
        baseArmor = found.armor;
        break;
      }
    }

    return {
      ...unit,
      attack: baseAttack + level,
      attackBonus: level,
      armor: baseArmor + level,
      armorBonus: level
    };
  });
};
