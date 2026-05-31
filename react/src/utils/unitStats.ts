import { buildingsData } from '../types/jsonResponse';
import type { UnitProduction } from '../types/gameData';

/**
 * Gets a fresh array of all units with bonuses applied.
 * Useful for Battlefield or initial load.
 */
export const getUpgradedUnits = (buildingLevels: Record<string, number>): UnitProduction[] => {
  const allUnits: UnitProduction[] = [];

  Object.values(buildingsData).forEach(building => {
    const currentLevel = buildingLevels[building.name.toLowerCase()] || 1;
    const bonus = currentLevel;

    building.unitsProduced.forEach(unit => {
      allUnits.push({
        ...unit,
        attack: unit.attack + bonus,
        attackBonus: bonus,
        armor: unit.armor + bonus,
        armorBonus: bonus,
      });
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
  buildingLevels: Record<string, number>
): UnitProduction[] => {
  const unitLevelMap: Record<number, number> = {};
  
  Object.values(buildingsData).forEach(building => {
    const level = buildingLevels[building.name.toLowerCase()] || 1;
    building.unitsProduced.forEach(unit => {
      unitLevelMap[unit.id] = level;
    });
  });

  return currentUnits.map(unit => {
    const level = unitLevelMap[unit.id] || 1;
    let baseAttack = unit.attack;
    let baseArmor = unit.armor;
    
    // Find base stats
    for (const b of Object.values(buildingsData)) {
      const found = b.unitsProduced.find(u => u.id === unit.id);
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
