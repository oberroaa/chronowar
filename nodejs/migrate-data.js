const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'src/data/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const buildingMap = {
  // Valdari
  'Palace': 'BastionAlborada',
  'Farm': 'CamposAbastecimiento',
  'Barracks': 'FuerteValor',
  'Temple': 'SagrarioLuminoso',
  'Aviary': 'CupulaCielos',
  'Altar': 'SantuarioCaidos',
  'Market': 'GranBazar',
  'Tower': null, // delete

  // Gorkar
  'BloodHall': 'BastionSangre',
  'WarHut': 'FuerteCeniza',
  'ShamanTent': 'CirculoIgneo',
  'HuntCamp': 'FosoDepredadores',
  'SkyPerch': 'NidoCumbres',
  'TotemCircle': 'TotemsTierra',
  'TradeHut': 'PuestoTrueque',
  'BoneWatch': null,

  // Sylvaran
  'TreeOfLife': 'CorazonBosque',
  'Moonwell': 'ManantialEstelar',
  'DruidsCircle': 'EnclaveSabios',
  'HuntersLodge': 'RefugioCazador',
  'AncientWonder': 'RaizPrimigenia',
  'SentinelPost': 'AtalayaHojas',
  'LunarAltar': 'AltarLuna',

  // Mortharim
  'Necropolis': 'PinaculoVacio',
  'Crypt': 'CriptaLamentos',
  'Slaughterhouse': 'FosoAlmas',
  'AltarDarkness': 'AltarCondenados',
  'TombRelics': 'MausoleoReliquias',
  'SpiritTower': 'ObeliscoSombras',
  'BlackCitadel': 'BastionEbano',
  'Zigurat': null
};

const unitMap = {
  // Valdari
  "Men": "Siervo",
  "Woman": "Doncella",
  "Emisario": "Emisario",
  "Obrero": "Artesano",
  "Centinela": "Guardia_del_Sol",
  "Francotirador": "Saetero_de_Plata",
  "Caballero": "Jinete_de_la_Alborada",
  "Cirujano": "Clerigo_de_la_Luz",
  "Arcanista": "Evocador_Arcano",
  "Disruptor": "Alabardero",
  "Falange": "Templario_Radiante",
  "Jinetes": "Jinete_de_Pegaso",
  "Dawnforged": "Valerius_el_Justo",
  "Arconte": "Seraphina_Tejeluz",
  "Thane": "Caelen_Hoja_Alba",
  "Vastago": "Ignis_Portador_del_Alba",

  // GorKar
  "Goblin": "Comerciante_Nomada",
  "Korg": "Peon_Gor",
  "Korga": "Recolectora_Gor",
  "Berserker": "Furia_de_Ceniza",
  "Cazacabezas": "Lanzador_de_Escorias",
  "Chaman": "Chaman_de_Magma",
  "Invocador": "Clamatormentas",
  "Machacador": "Quebrantahuesos",
  "Drak'Tharon": "Jinete_de_Draco",
  "Raider": "Jinete_de_Bestia",
  "Rompehueso": "Caminante_del_Crater",
  "Vigía": "Rastreador",
  "Gorruk": "Kaelen_Quebrantamundos",
  "Kargath": "Vaelia_Furia_Roja",
  "Urzok": "Rokh_Vidente_de_Fuego",
  "Valka": "Borgh_Cazador_de_Sombras",

  // Sylvaran
  "Sylron": "Espiritu_de_Hoja",
  "Sylwen": "Tejedora_de_Luz",
  "Emissary": "Susurro_del_Bosque",
  "Archer": "Exploradora_Lunar",
  "Huntress": "Hoja_de_Ebano",
  "Sentinel": "Danzante_de_Sombras",
  "Druid": "Sabio_de_las_Raices",
  "SpiritWalker": "Clamabosques",
  "Dryad": "Jinete_de_Venado",
  "Hippogryph": "Guardian_Primigenio",
  "Treant": "Cuidador_de_Raices",
  "Quimera": "Jinete_de_Buho_Lunar",
  "Lunarion": "Oakhaven_el_Ancestral",
  "Moonwhisper": "Sacerdotisa_Moonwhisper",
  "Shadowleaf": "Sylas_Viento_Otonal",
  "Stormbark": "Lyra_Sombraluna",

  // Mortharim
  "Acolyte": "Siervo_del_Vacio",
  "Shade": "Sombra",
  "Ghoul": "Desgarrador",
  "Fiend": "Caminante_de_la_Cripta",
  "Gargoyle": "Necro_Raptor",
  "Abomination": "Coloso_de_Hueso",
  "MeatWagon": "Caballero_del_Abismo",
  "Necromancer": "Tejedor_de_Almas",
  "Banshee": "Lamento_Espectral",
  "FrostWyrm": "Horror_Alado",
  "DeathKnight": "Malakor_el_Invicto",
  "Lich": "Xyrelia_Canta_Almas",
  "Dreadlord": "Vane_el_Segador",
  "CryptLord": "Noctis_Portador_del_Vacio"
};

// 1. Process Buildings
const newBuildings = [];
for (let b of data.building) {
  if (buildingMap[b.Name] === null) {
    continue; // delete
  }
  if (buildingMap[b.Name]) {
    b.Name = buildingMap[b.Name];
    // update img path logic
    const imgParts = b.Img.split('/');
    // keep the original folder, just change the filename
    imgParts[imgParts.length - 1] = b.Name + '.png';
    b.Img = imgParts.join('/');
  }
  
  if (buildingMap[b.Requisito]) {
    b.Requisito = buildingMap[b.Requisito];
  }

  // Estandarizar nombre de raza
  b.Race = b.Race.toLowerCase();

  newBuildings.push(b);
}
data.building = newBuildings;

// 2. Process Units
for (let u of data.Unit) {
  if (unitMap[u.Name]) {
    u.Name = unitMap[u.Name];
    const imgParts = u.Img.split('/');
    imgParts[imgParts.length - 1] = u.Name + '.png';
    u.Img = imgParts.join('/');
  }

  // Update Requisito
  if (buildingMap[u.Requisito]) {
    u.Requisito = buildingMap[u.Requisito];
  } else if (u.Type === 'poblation' || buildingMap[u.Requisito] === null) {
    // Si es poblacion o el requisito fue eliminado, poner requisito en null (Tier 1)
    u.Requisito = 'null';
  }

  // Estandarizar raza
  u.Race = u.Race.toLowerCase();
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log("Migration complete!");
