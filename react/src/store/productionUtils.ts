

export const calculateProductionRates = (
  race: string,
  buildingLevels: Record<string, number>,
  gameUnits: { name: string, available: number }[]
) => {
  // Encuentra el nivel del edificio principal
  const mainBuildings: Record<string, string> = {
    'valdari': 'bastionalborada',
    'gorkar': 'bastionsangre',
    'sylvaran': 'corazondelbosque',
    'mortharim': 'necropolis'
  };
  
  const mainBuildingId = mainBuildings[race] || 'bastionalborada';
  const mainLevel = buildingLevels[mainBuildingId] ?? 0;

  // Base
  let rates = { gold: 1 + mainLevel, supplies: 1 + mainLevel, food: 1 + mainLevel, chrono: 0 };

  // Pasivas de Raza
  const racePassives: Record<string, { gold: number, supplies: number, food: number }> = {
    'valdari': { gold: 0.10, supplies: 0.02, food: 0.05 },
    'gorkar': { gold: 0.02, supplies: 0.10, food: 0.05 },
    'sylvaran': { gold: 0.02, supplies: 0.05, food: 0.10 },
    'mortharim': { gold: 0.10, supplies: 0.05, food: 0.02 }
  };

  const passives = racePassives[race] || { gold: 0, supplies: 0, food: 0 };

  // Multiplicadores de trabajadores (+4% = 0.04 por unidad)
  let workerMultipliers = { gold: 0, supplies: 0, food: 0 };

  const workerRoles: Record<string, 'gold' | 'supplies' | 'food'> = {
    // Valdari
    'Siervo': 'gold',
    'Doncella': 'food',
    'Artesano': 'supplies',
    // GorKar
    'Peon_Gor': 'supplies',
    'Recolectora_Gor': 'food',
    // Sylvaran
    'Espiritu_de_Hoja': 'supplies',
    'Tejedora_de_Luz': 'food',
    // Mortharim
    'Siervo_del_Vacio': 'supplies',
    'Sombra': 'gold'
  };

  if (gameUnits) {
    gameUnits.forEach(unit => {
      const role = workerRoles[unit.name];
      if (role) {
        workerMultipliers[role] += (unit.available * 0.04);
      }
    });
  }

  // Calculo final (Base + Base * (Pasiva + Trabajadores))
  return {
    gold: rates.gold + (rates.gold * (passives.gold + workerMultipliers.gold)),
    supplies: rates.supplies + (rates.supplies * (passives.supplies + workerMultipliers.supplies)),
    food: rates.food + (rates.food * (passives.food + workerMultipliers.food)),
    chrono: 0
  };
};
