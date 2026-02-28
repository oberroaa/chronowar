import type {  RaceType, UnitProduction, ResourceType   } from '../types/gameData';

export const recursosPlayer = {
    gold: 1500,
    wood: 500,
    stone: 300,
    food: 200,
    chrono: 50,  
};


type UpgradeInfo = {
  name: string;
  cost: Partial<Record<ResourceType, number>>;
  time: number;
  description: string;
};

type CostInfo = {  
  gold: number;
  wood: number;
  stone: number;
};

export type BuildingInfo = {
  id:number;
  race:string;
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

export const buildingsData: Record<string, BuildingInfo> = {
  1: {
    id: 1,
    race: "valdari",
    name: "Palace",  
    main: true, 
    description: "The Palace is the heart of your kingdom.",
    level: 1,
    buildCost: { gold: 1000, wood: 500, stone: 300 },
    buildTime: 120,
    image: '/images/Valdari/construcciones/palacio.png',
    unitsProduced: [    
      {
        id: 1,        
        available: 1,
        name: "Men",        
        unitType: "poblation",
        cost: { gold: 50, food: 1 },
        buildTime: 20,
        image: '/images/Valdari/poblation/Men.png',
        gif: '',
        special: "Call to Arms",
        attack: 5.5,
        weaponType: "Normal",
        armorType: "Medium",
        armor: 0,
        hp: 220,
        hpRegen: 1,
        mana: 0.0,
        manaRegen: 0.0,
        transportSize: 1,
      },
      {
        id: 2,        
        available: 1,
        name: "Woman",
        unitType: "poblation",
        cost: { gold: 50, food: 1 },
        buildTime: 20,
        image: '/images/Valdari/poblation/Woman.png',
        gif: '',
        special: "Call to Arms",
        attack: 5.5,
        weaponType: "Normal",
        armorType: "Medium",
        armor: 0,
        hp: 220,
        hpRegen: 1,
        mana: 0.0,
        manaRegen: 0.0,
        transportSize: 1,
      }
    ],
    upgradesAvailable: [
      {
        name: "Royal Guard Training",
        cost: { gold: 500, wood: 200, chrono: 5 },
        time: 60,
        description: "Increases palace defense by 50%"
      },
      {
        name: "Tax Collection",
        cost: { gold: 300, chrono: 10 },
        time: 45,
        description: "Increases gold production by 20%"
      }
    ]
  },
  2: {
    id: 2,
    race: "valdari",
    name: "Farm",  
    main: false, 
    description: "Produces food for your population.",
    level: 1,
    buildCost: { gold: 300, wood: 150, stone: 50 },
    buildTime: 45,
    image: '/images/Valdari/construcciones/granja.png',
    unitsProduced: [
      {
        id: 3,        
        available: 10,
        name: "Obrero",
        unitType: "unit",
        cost: { gold: 30, food: 1 },
        buildTime: 15,
        image: '/images/Valdari/units/Obrero.png',
        gif: '',
        special: "Construction",
        attack: 3.0,
        weaponType: "Normal",
        armorType: "Light",
        armor: 0,
        hp: 150,
        hpRegen: 0.5,
        mana: 0.0,
        manaRegen: 0.0,
        transportSize: 1,
      }
    ],
    upgradesAvailable: [
      {
        name: "Improved Irrigation",
        cost: { gold: 150, wood: 100 },
        time: 30,
        description: "Increases food production by 30%"
      }
    ]
  },
  3: {
    id: 3,
    race: "valdari",
    name: "Barracks",  
    main: false, 
    description: "Train Footmen, Riflemen, and Knights here.",
    level: 1,
    buildCost: { gold: 600, wood: 300, stone: 150 },
    buildTime: 90,
    image: '/images/Valdari/construcciones/cuartel.png',
    unitsProduced: [
      {
        id: 4,          
        available: 1,
        name: "Centinela",
        unitType: "unit",
        cost: { gold: 50, food: 1 },
        buildTime: 20,
        image: '/images/Valdari/units/Centinela.png',
        gif: '',
        special: "Guard Duty",
        attack: 8.0,
        weaponType: "Normal",
        armorType: "Medium",
        armor: 2,
        hp: 250,
        hpRegen: 1.5,
        mana: 0.0,
        manaRegen: 0.0,
        transportSize: 1,
      },
      {
        id: 5,          
        available: 1,
        name: "Francotirador",
        unitType: "unit",
        cost: { gold: 75, food: 1 },
        buildTime: 30,
        image: '/images/Valdari/units/Francotirador.png',
        gif: '',
        special: "Precision Shot",
        attack: 15.0,
        weaponType: "Piercing",
        armorType: "Light",
        armor: 1,
        hp: 180,
        hpRegen: 1.0,
        mana: 0.0,
        manaRegen: 0.0,
        transportSize: 1,
      },
      {
        id: 6,        
        available: 1,
        name: "Caballero",
        unitType: "unit",
        cost: { gold: 120, food: 2 },
        buildTime: 45,
        image: '/images/Valdari/units/Caballero.png',
        gif: '',
        special: "Charge",
        attack: 12.0,
        weaponType: "Normal",
        armorType: "Heavy",
        armor: 4,
        hp: 350,
        hpRegen: 2.0,
        mana: 0.0,
        manaRegen: 0.0,
        transportSize: 2,
      }
    ],
    upgradesAvailable: [
      {
        name: "Defensive Training",
        cost: { gold: 100, wood: 50 },
        time: 40,
        description: "Increases armor of trained units by 2"
      },
      {
        name: "Long Rifles",
        cost: { gold: 150, stone: 30, chrono: 5 },
        time: 50,
        description: "Increases range of riflemen by 20%"
      }
    ]
  },
  4: {
    id: 4,
    race: "valdari",
    name: "Temple",  
    main: false, 
    description: "Train Priests and Sorceresses here.",
    level: 1,
    buildCost: { gold: 500, wood: 200, stone: 100 },
    buildTime: 80,
    image: '/images/Valdari/construcciones/templo.png',
    unitsProduced: [
      {
        id: 7,        
        available: 1,
        name: "Cirujano",
        unitType: "unit",
        cost: { gold: 80, food: 1 },
        buildTime: 35,
        image: '/images/Valdari/units/Cirujano.png',
        gif: '',
        special: "Heal",
        attack: 3.0,
        weaponType: "Magic",
        armorType: "Light",
        armor: 0,
        hp: 200,
        hpRegen: 2.0,
        mana: 100.0,
        manaRegen: 1.5,
        transportSize: 1,
      },
      {
        id: 8,        
        available: 1,
        name: "Arcanista",
        unitType: "unit",
        cost: { gold: 100, food: 1 },
        buildTime: 40,
        image: '/images/Valdari/units/Arcanista.png',
        gif: '',
        special: "Arcane Blast",
        attack: 10.0,
        weaponType: "Magic",
        armorType: "Unarmored",
        armor: 0,
        hp: 180,
        hpRegen: 1.0,
        mana: 150.0,
        manaRegen: 2.0,
        transportSize: 1,
      },
      {
        id: 9,        
        available: 1,
        name: "Disruptor",
        unitType: "unit",
        cost: { gold: 100, food: 1 },
        buildTime: 40,
        image: '/images/Valdari/units/Disruptor.png',
        gif: '',
        special: "Mana Drain",
        attack: 8.0,
        weaponType: "Magic",
        armorType: "Unarmored",
        armor: 0,
        hp: 220,
        hpRegen: 1.5,
        mana: 120.0,
        manaRegen: 1.8,
        transportSize: 1,
      }
    ],
    upgradesAvailable: [
      {
        name: "Holy Light",
        cost: { gold: 120, chrono: 10 },
        time: 45,
        description: "Increases healing power of priests by 30%"
      },
      {
        name: "Mana Surge",
        cost: { gold: 150, wood: 30, chrono: 5 },
        time: 50,
        description: "Reduces mana costs by 20%"
      }
    ]
  },
  5: {
    id: 5,
    race: "valdari",
    name: "Aviary",   
    main: false, 
    description: "Train Flying Machines and Dragonhawk Riders here.",
    level: 1,
    buildCost: { gold: 700, wood: 400, stone: 100 },
    buildTime: 100,
    image: '/images/Valdari/construcciones/aviary.png',
    unitsProduced: [
      {
        id: 10,        
        available: 1,
        name: "Falange",
        unitType: "unit",
        cost: { gold: 90, food: 1 },
        buildTime: 30,
        image: '/images/Valdari/units/Falange.png',
        gif: '',
        special: "Aerial Recon",
        attack: 7.0,
        weaponType: "Piercing",
        armorType: "Light",
        armor: 1,
        hp: 200,
        hpRegen: 1.2,
        mana: 0.0,
        manaRegen: 0.0,
        transportSize: 1,
      },
      {
        id: 11,        
        available: 1,
        name: "Jinetes",
        unitType: "unit",
        cost: { gold: 150, food: 2 },
        buildTime: 50,
        image: '/images/Valdari/units/Jinetes.png',
        gif: '',
        special: "Dive Bomb",
        attack: 18.0,
        weaponType: "Piercing",
        armorType: "Medium",
        armor: 3,
        hp: 280,
        hpRegen: 1.8,
        mana: 0.0,
        manaRegen: 0.0,
        transportSize: 2,
      }
    ],
    upgradesAvailable: [
      {
        name: "Aerial Superiority",
        cost: { gold: 200, wood: 50, chrono: 8 },
        time: 60,
        description: "Increases flying units' attack by 25%"
      },
      {
        name: "Dive Bomb",
        cost: { gold: 180, stone: 20 },
        time: 45,
        description: "Adds splash damage to flying attacks"
      }
    ]
  },
  6: {
    id: 6,
    race: "valdari",
    name: "Altar",   
    main: false, 
    description: "Revive your fallen heroes here.",
    level: 1,
    buildCost: { gold: 800, wood: 300, stone: 200 },
    buildTime: 110,
    image: '/images/Valdari/construcciones/altar.png',
    unitsProduced: [
      {
        id: 12,        
        available: 1,
        name: "Dawnforged",
        unitType: "heroe",
        cost: { gold: 150, food: 2 },
        buildTime: 50,
        image: '/images/Valdari/heroes/Dawnforged.png',
        gif: '',
        special: "Divine Strike",
        attack: 25.0,
        weaponType: "Normal",
        armorType: "Heavy",
        armor: 6,
        hp: 500,
        hpRegen: 3.0,
        mana: 200.0,
        manaRegen: 2.5,
        transportSize: 2,
      },
      {
        id: 13,        
        available: 1,
        name: "Arconte",
        unitType: "heroe",
        cost: { gold: 150, food: 2 },
        buildTime: 50,
        image: '/images/Valdari/heroes/Arconte.png',
        gif: '',
        special: "Arcane Mastery",
        attack: 18.0,
        weaponType: "Magic",
        armorType: "Divine",
        armor: 1,
        hp: 400,
        hpRegen: 2.0,
        mana: 300.0,
        manaRegen: 3.0,
        transportSize: 1,
      },
      {
        id: 14,        
        available: 1,
        name: "Thane",
        unitType: "heroe",
        cost: { gold: 150, food: 2 },
        buildTime: 50,
        image: '/images/Valdari/heroes/Thane.png',
        gif: '',
        special: "Thunder Clap",
        attack: 22.0,
        weaponType: "Normal",
        armorType: "Heavy",
        armor: 5,
        hp: 550,
        hpRegen: 3.5,
        mana: 150.0,
        manaRegen: 2.0,
        transportSize: 2,
      },
      {
        id: 15,        
        available: 1,
        name: "Vastago",
        unitType: "heroe",
        cost: { gold: 150, food: 2 },
        buildTime: 50,
        image: '/images/Valdari/heroes/Vastago.png',
        gif: '',
        special: "Shadow Step",
        attack: 20.0,
        weaponType: "Normal",
        armorType: "Medium",
        armor: 3,
        hp: 450,
        hpRegen: 2.5,
        mana: 250.0,
        manaRegen: 2.8,
        transportSize: 1,
      }
    ],
    upgradesAvailable: [
      {
        name: "Resurrection",
        cost: { gold: 250, chrono: 15 },
        time: 90,
        description: "Reduces hero revival time by 50%"
      },
      {
        name: "Divine Shield",
        cost: { gold: 300, stone: 50, chrono: 10 },
        time: 60,
        description: "Gives heroes temporary invulnerability"
      }
    ]
  },
  7: {
    id: 7,
    race: "valdari",
    name: "Market",  
    main: false,  
    description: "Trade resources and buy items here.",
    level: 1,
    buildCost: { gold: 400, wood: 200, stone: 100 },
    buildTime: 60,
    image: '/images/Valdari/construcciones/mercado.png',
    unitsProduced: [
      {
        id: 16,        
        available: 1,
        name: "Emisario",
        unitType: "comun",
        cost: { gold: 50, food: 1 },
        buildTime: 20,
        image: '/images/Valdari/comun/Emisario.png',
        gif: '',
        special: "Diplomacy",
        attack: 2.0,
        weaponType: "Normal",
        armorType: "Unarmored",
        armor: 0,
        hp: 180,
        hpRegen: 1.0,
        mana: 0.0,
        manaRegen: 0.0,
        transportSize: 1,
      }
    ],
    upgradesAvailable: [
      {
        name: "Trade Routes",
        cost: { gold: 200, wood: 100 },
        time: 40,
        description: "Increases resource trading efficiency by 25%"
      },
      {
        name: "Bulk Discount",
        cost: { gold: 150, stone: 30, chrono: 5 },
        time: 35,
        description: "Reduces item costs by 15%"
      }
    ]
  },
  8: {
    id: 8,
    race: "valdari",
    name: "Tower",  
    main: false, 
    description: "Defensive structure to protect your kingdom.",
    level: 1,
    buildCost: { gold: 450, wood: 150, stone: 300 },
    buildTime: 70,
    image: '/images/Valdari/construcciones/torre.png',
    unitsProduced: [
      {
        id: 17,        
        available: 1,
        name: "Guardian",
        unitType: "comun",
        cost: { gold: 60, food: 1 },
        buildTime: 25,
        image: '/images/Valdari/comun/Guardian.png',
        gif: '',
        special: "Tower Defense",
        attack: 12.0,
        weaponType: "Siege",
        armorType: "Medium",
        armor: 3,
        hp: 300,
        hpRegen: 2.0,
        mana: 0.0,
        manaRegen: 0.0,
        transportSize: 1,
      }
    ],
    upgradesAvailable: [
      {
        name: "Arrow Volley",
        cost: { gold: 120, wood: 40 },
        time: 45,
        description: "Increases attack speed by 30%"
      },
      {
        name: "Reinforced Walls",
        cost: { gold: 150, stone: 80, chrono: 5 },
        time: 60,
        description: "Increases tower HP by 40%"
      }
    ]
  }
};

export type PlayerType = {
  id: number;
  name: string;
  level: number;
  race: RaceType;
};

export const jsonPlayersData: PlayerType[] = [
  { id: 1, name: 'Player1', level: 5, race: 'valdari' },
  { id: 2, name: 'Player2', level: 3, race: 'gorkar' },
  { id: 3, name: 'Player3', level: 7, race: 'sylvaran' },
  { id: 4, name: 'Player4', level: 4, race: 'mortharim' },
  { id: 5, name: 'Player5', level: 6, race: 'valdari' },
];

export const jsonSystemPlayersData: PlayerType[] = [
  { id: 101, name: 'Abandoned Village', level: 1, race: 'valdari' },
  { id: 102, name: 'Ruined Castle', level: 3, race: 'gorkar' },
  { id: 103, name: 'Lost Mine', level: 2, race: 'mortharim' },
];

export const savedFormations = {
  principal: {
    name: "Ataque Principal",
    units: [
      {
        id: 4,      
      },
      {
        id: 3,      
      },
      {
        id: 6,       
      },
      {
        id: 5,      
      },
      {
        id: 8,      
      },
      {
        id: 7,       
      },
      {
        id: 9,      
      },
     null,
     null,
     null
    ]
  },
  secondary: {
    name: "Defensa Ciudad",
     units: Array(10).fill(null)
  },
  reserve: {
    name: "Reserva Estratégica",
    units: Array(10).fill(null)
  },
  lastUpdated: "2025-07-13T19:00:00Z"
};
