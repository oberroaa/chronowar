


export type RaceType = 'valdari' | 'gorkar' | 'sylvaran' | 'mortharim';

export type ResourceType = 'gold' | 'supplies' | 'food' | 'chrono';

export type UnitType = 'unit' | 'poblation' | 'heroe';

export type ArmorType = 'Heavy' | 'Medium' | 'Light' | 'Unarmored' | 'Fortified' | 'Divine';

export type weaponType = 'Normal' | 'Piercing' | 'Magic' | 'Siege' | 'Chaos' | 'Spell';

export const raceOptions: { value: RaceType; backgroundImage: string; label: string; desc: string }[] = [
  {
    value: 'valdari',
    backgroundImage: '/images/Valdari/FondoValdari.png',
    label: '⚡ Valdari (Maestros de la Luz)',
    desc: 'Los Guardianes del Sol. Maestros de la estrategia, la luz y la ingeniería, los Valdari fundaron poderosos reinos impulsados por su fe y sabiduría arcana. Su avance tecnológico y disciplina militar los convierten en una fuerza imparable.'
  },
  {
    value: 'gorkar',
    backgroundImage: '/images/GorKar/FondoGorkar.png',
    label: '🔥 GorKar (Horda de Sangre)',
    desc: 'La Horda de Sangre. Hijos del fuego y la furia, los GorKar viven para la batalla. Guiados por chamanes y clanes de sangre ancestral, desatan su poder salvaje para conquistar con honor y destrucción.'
  },
  {
    value: 'sylvaran',
    backgroundImage: '/images/Sylvaran/FondoSylvaran.png',
    label: '🌿 Sylvaran (Guardianes del Bosque)',
    desc: 'Hijos del Bosque Eterno. Vinculados a los espíritus del bosque y la luna, los Sylvaran son guardianes eternos de la naturaleza. Su magia druídica y su sigilo les permite vencer sin ser vistos, protegiendo lo sagrado a cualquier costo.'
  },
  {
    value: 'mortharim',
    backgroundImage: '/images/Mortharim/FondoMortharim.png',
    label: '💀 Mortharim (Señores del Olvido)',
    desc: 'Señores del Olvido. Desde las profundidades de la muerte, los Mortharim emergen con un solo propósito: consumir el mundo. Controlan la nigromancia y levantan ejércitos de cadáveres para extender su oscuridad por todos los tiempos.'
  },
];

export interface ResourcePanelProps {
  resources: Record<ResourceType, number>;
}

export const getResourceIcon = (type: ResourceType): string => {
  switch (type) {
    case 'gold': return '💰';     // Oro
    case 'supplies': return '📦'; // Suministros
    case 'food': return '🍖';     // Comida
    case 'chrono': return '⏳';  // chrono
    default: return '';           // Por si se recibe un tipo no reconocido
  }
};


export const getTravelCost = (race: RaceType, level: number) => {
  switch (race) {
    case 'valdari':
      return ({
        gold: level * 20,
        supplies: level * 15,
        food: level * 10
      });
    case 'gorkar':
      return ({
        gold: level * 10,
        supplies: level * 15,
        food: level * 20
      });     // Suministros
    case 'mortharim':
      return ({
        gold: level * 15,
        supplies: level * 20,
        food: level * 10
      });
    case 'sylvaran':
      return ({
        gold: level * 15,
        supplies: level * 10,
        food: level * 15
      });     // Comida    
    default: return ({
      gold: level * 10,
      supplies: level * 10,
      food: level * 10
    });           // Por si se recibe un tipo no reconocido
  }
};

export type UnitProduction = {
  id: number;
  name: string;
  unitType: UnitType;
  trainedAt?: string;
  cost: Partial<Record<ResourceType, number>>;
  buildTime: number;
  image: string;
  gif: string;
  special: string,
  attack: number,
  armor: number,
  hp: number,
  mana?: number,
  transportSize: number,
  available: number,
  skillName?: string;
  skillDesc?: string;
  skillAction?: string;
  skillName2?: string;
  skillDesc2?: string;
  skillAction2?: string;
  attackBonus?: number;
  armorBonus?: number;
};

export type ProductionQueueItem = {
  unit: string;
  timeLeft: number;
  buildingId: string;
  startedAt: number;
  duration?: number;
};

export type CostInfo = {
  gold: number;
  supplies: number;
};

export type UpgradeInfo = {
  name: string;
  cost: Partial<Record<ResourceType, number>>;
  time: number;
  description: string;
};

export type BuildingInfo = {
  id: number;
  race: string;
  name: string;
  main: boolean;
  description: string;
  level: number;
  image: string;
  unitsProduced: UnitProduction[];
  upgradesAvailable: UpgradeInfo[];
  buildCost: CostInfo;
  buildTime: number;
};

//{ name: 'BastionAlborada', top: '50%', left: '47%', scale: 1.1, rotate: 5 },
export const SquaresValdari = [
  { name: 'BastionAlborada', top: '71%', left: '41%' },
  { name: 'CamposAbastecimiento', top: '75%', left: '77%', rotate: -8 },
  { name: 'FuerteValor', top: '62%', left: '23%', rotate: 2, scale: 1.2 },
  { name: 'SagrarioLuminoso', top: '73%', left: '11%', rotate: 2 },
  { name: 'CupulaCielos', top: '58%', left: '65%' },
  { name: 'SantuarioCaidos', top: '51%', left: '47%', scale: 1.1 },
  { name: 'GranBazar', top: '41%', left: '59%', scale: 1.1 }
];

export const SquaresGorkar = [
  { name: 'BastionSangre', top: '53%', left: '41%', scale: 1.6 },
  { name: 'FuerteCeniza', top: '48%', left: '24%', scale: 1.2, rotate: 5 },
  { name: 'CirculoIgneo', top: '56%', left: '78%' },
  { name: 'FosoDepredadores', top: '57%', left: '10%', rotate: 6 },
  { name: 'NidoCumbres', top: '40%', left: '47%', scale: 1.1 },
  { name: 'TotemsTierra', top: '35%', left: '60%', scale: 0.9 },
  { name: 'PuestoTrueque', top: '47%', left: '65%', scale: 1.1 }
];

export const SquaresSylvaran = [
  { name: 'CorazonBosque', top: '55%', left: '41%' },
  { name: 'ManantialEstelar', top: '48%', left: '63%', scale: 1.2 },
  { name: 'EnclaveSabios', top: '71%', left: '58%' },
  { name: 'RefugioCazador', top: '58%', left: '14%' },
  { name: 'RaizPrimigenia', top: '57%', left: '74%', scale: 1.2 },
  { name: 'AltarLuna', top: '71%', left: '27%' },
  { name: 'AtalayaHojas', top: '45%', left: '26%' }
];

export const SquaresMortharim = [
  { name: 'PinaculoVacio', top: '57%', left: '41%' },
  { name: 'CriptaLamentos', top: '59%', left: '13%' },
  { name: 'FosoAlmas', top: '47%', left: '25%' },
  { name: 'AltarCondenados', top: '61%', left: '75%', scale: 1.1 },
  { name: 'MausoleoReliquias', top: '41%', left: '47%', scale: 1.1 },
  { name: 'ObeliscoSombras', top: '32%', left: '58%', scale: 1.0 },
  { name: 'BastionEbano', top: '48%', left: '64%', scale: 1.1 }
];

// types/gameData.ts (extender las interfaces existentes)
export interface Formation {
  name: string;
  units: (UnitProduction | null)[];
}

export interface SavedFormations {
  principal: Formation;
  secondary: Formation;
  reserve: Formation;
  lastUpdated?: string; // Fecha de última actualización
}