import { scale } from "framer-motion";

export type RaceType = 'valdari' | 'gorkar' | 'sylvaran' | 'mortharim';

export type ResourceType = 'gold' | 'wood' | 'stone' | 'food' | 'chrono';

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
    case 'wood': return '🪵';     // Madera
    case 'stone': return '🪨';    // Piedra
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
        wood: level * 15,
        food: level * 10
      });
    case 'gorkar':
      return ({
        gold: level * 10,
        wood: level * 15,
        food: level * 20
      });     // Madera
    case 'mortharim':
      return ({
        gold: level * 15,
        wood: level * 20,
        food: level * 10
      });    // Piedra
    case 'sylvaran':
      return ({
        gold: level * 15,
        wood: level * 10,
        food: level * 15
      });     // Comida    
    default: return ({
      gold: level * 10,
      wood: level * 10,
      food: level * 10
    });           // Por si se recibe un tipo no reconocido
  }
};

export type UnitProduction = {
  id: number;
  name: string;
  unitType: UnitType;
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
  carryCapacity: number,  // Cantidad de recursos que puede cargar al saquear/recolectar
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
  wood: number;
  stone: number;
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


export const SquaresValdari = [
  { name: 'Palace', top: '48%', left: '47%' },
  { name: 'Farm', top: '74%', left: '77%' },
  { name: 'Barracks', top: '60%', left: '23%' },
  { name: 'Temple', top: '72%', left: '9%' },
  { name: 'Aviary', top: '60%', left: '65%' },
  { name: 'Altar', top: '71%', left: '41%' },
  { name: 'Market', top: '39%', left: '59%' }
];

export const SquaresGorkar = [
  { name: 'BloodHall', top: '52%', left: '41%', scale: 1.6 },
  { name: 'WarHut', top: '45%', left: '24%' },
  { name: 'ShamanTent', top: '44.5%', left: '66%' },
  { name: 'HuntCamp', top: '55%', left: '11%' },
  { name: 'SkyPerch', top: '53.5%', left: '78%' },
  { name: 'TotemCircle', top: '40%', left: '47%', scale: 1.0 },
  { name: 'TradeHut', top: '32.5%', left: '59%', scale: 1.0 }

];

export const SquaresSylvaran = [
  { name: 'TreeOfLife', top: '55%', left: '41%' },
  { name: 'Moonwell', top: '48%', left: '63%', scale: 1.2 },
  { name: 'DruidsCircle', top: '71%', left: '58%' },
  { name: 'HuntersLodge', top: '58%', left: '14%' },
  { name: 'AncientWonder', top: '57%', left: '74%', scale: 1.2 },
  { name: 'LunarAltar', top: '71%', left: '27%' },
  { name: 'SentinelPost', top: '45%', left: '26%' },
];

export const SquaresMortharim = [
  { name: 'Necropolis', top: '33%', left: '45%' },
  { name: 'Crypt', top: '65%', left: '13%' },
  { name: 'Slaughterhouse', top: '51%', left: '30%' },
  { name: 'AltarDarkness', top: '73%', left: '10%' },
  { name: 'TombRelics', top: '60%', left: '65%' },
  { name: 'Zigurat', top: '71%', left: '41%' },
  { name: 'SpiritTower', top: '33%', left: '21%' },
  { name: 'BlackCitadel', top: '38%', left: '60%' },
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