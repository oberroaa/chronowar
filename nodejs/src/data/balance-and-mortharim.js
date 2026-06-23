const fs = require('fs');
const path = require('path');
const p = path.resolve(__dirname, 'data.json');
const d = JSON.parse(fs.readFileSync(p));

const updateStats = (name, gold, wood, time, food, hp, dmg, armor) => {
    const u = d.Unit.find(u => u.Name === name);
    if (u) {
        if(gold !== null) u.Gold = String(gold);
        if(wood !== null) u.Wood = String(wood);
        if(time !== null) u.Time = String(time);
        if(food !== null) u.Food = String(food);
        if(hp !== null) u['Hit Points'] = String(hp);
        if(dmg !== null) u.Damage = String(dmg);
        if(armor !== null) u.Armor = String(armor);
    }
};

// Valdari
// Workers/Pop
updateStats('Men', 50, 0, 20, 1, 220, 5, 0);
updateStats('Woman', 50, 0, 20, 1, 220, 5, 0);
updateStats('Emisario', 50, 0, 20, 1, 220, 5, 0);
updateStats('Obrero', 50, 0, 15, 1, 180, 3, 0);
// Tier 1
updateStats('Centinela', 140, 15, 20, 2, 400, 15, 3);
updateStats('Francotirador', 150, 25, 25, 2, 350, 20, 1);
// Tier 2
updateStats('Caballero', 240, 40, 35, 3, 750, 30, 5);
updateStats('Falange', 200, 30, 30, 3, 600, 35, 4);
updateStats('Cirujano', 150, 30, 30, 2, 300, 10, 1);
updateStats('Arcanista', 160, 40, 30, 2, 280, 15, 1);
updateStats('Disruptor', 220, 30, 30, 3, 500, 20, 2);
// Tier 3
updateStats('Jinetes', 280, 60, 45, 4, 850, 45, 2);
// Heroes Valdari
updateStats('Dawnforged', 500, 100, 55, 5, 650, 30, 4);
updateStats('Arconte', 500, 100, 55, 5, 550, 28, 2);
updateStats('Thane', 500, 100, 55, 5, 750, 35, 5);
updateStats('Vastago', 500, 100, 55, 5, 500, 25, 2);

// GorKar
// Pop
updateStats('Goblin', 50, 0, 20, 1, 220, 5, 0);
updateStats('Korg', 50, 0, 20, 1, 220, 5, 0);
updateStats('Korga', 50, 0, 20, 1, 220, 5, 0);
// Tier 1
updateStats('Cazacabezas', 135, 20, 20, 2, 350, 20, 0);
// Tier 2
updateStats('Raider', 180, 40, 28, 3, 650, 25, 1);
updateStats('Berserker', 200, 30, 30, 3, 750, 30, 1);
updateStats('Chaman', 150, 25, 30, 2, 350, 12, 0);
updateStats('Invocador', 160, 30, 30, 2, 320, 15, 0);
// Tier 3/Cav
updateStats('Jinete', 265, 40, 40, 4, 800, 40, 1);
updateStats('Rompehueso', 240, 50, 40, 3, 600, 50, 1);
updateStats('Machacador', 350, 80, 55, 5, 1300, 50, 2);
updateStats('Vigía', 280, 60, 40, 4, 1000, 35, 1);
// Heroes Gorkar
updateStats('Gorruk', 500, 100, 55, 5, 650, 32, 3);
updateStats('Kargath', 500, 100, 55, 5, 550, 28, 1);
updateStats('Urzok', 500, 100, 55, 5, 750, 35, 4);
updateStats('Valka', 500, 100, 55, 5, 600, 28, 2);

// Sylvaran (just fixing Heroes Wood cost to 100, was 200)
updateStats('Lunarion', null, 100, null, null, null, null, null);
updateStats('Moonwhisper', null, 100, null, null, null, null, null);
updateStats('Shadowleaf', null, 100, null, null, null, null, null);
updateStats('Stormbark', null, 100, null, null, null, null, null);

// Mortharim
// I will create the Mortharim race units and buildings directly here as well.
const mortharimBuildings = [
  { Race: "mortharim", Name: "Necropolis", Img: "/images/Mortharim/construcciones/Necropolis.png", Builds: "Acolyte", Requisito: "null" },
  { Race: "mortharim", Name: "Crypt", Img: "/images/Mortharim/construcciones/Crypt.png", Builds: "Ghoul, Fiend, Gargoyle", Requisito: "Necropolis" },
  { Race: "mortharim", Name: "Graveyard", Img: "/images/Mortharim/construcciones/Graveyard.png", Builds: "null", Requisito: "Necropolis" },
  { Race: "mortharim", Name: "Slaughterhouse", Img: "/images/Mortharim/construcciones/Slaughterhouse.png", Builds: "Abomination, MeatWagon", Requisito: "Crypt" },
  { Race: "mortharim", Name: "TempleOfTheDamned", Img: "/images/Mortharim/construcciones/TempleOfTheDamned.png", Builds: "Necromancer, Banshee", Requisito: "Graveyard" },
  { Race: "mortharim", Name: "Boneyard", Img: "/images/Mortharim/construcciones/Boneyard.png", Builds: "FrostWyrm", Requisito: "Slaughterhouse" },
  { Race: "mortharim", Name: "AltarOfDarkness", Img: "/images/Mortharim/construcciones/AltarOfDarkness.png", Builds: "DeathKnight, Lich, Dreadlord, CryptLord", Requisito: "Necropolis" },
  { Race: "mortharim", Name: "TombOfRelics", Img: "/images/Mortharim/construcciones/TombOfRelics.png", Builds: "Shade", Requisito: "Graveyard" }
];

mortharimBuildings.forEach(b => {
    b.Gold = "1000"; b.Wood = "500"; b.Stone = "300"; b.Time = "120"; b.Type = "Structure";
});

const mortharimUnits = [
  { Race: "mortharim", Name: "Acolyte", Img: "/images/Mortharim/poblation/Acolyte.png", Builds: "null", Requisito: "Necropolis", Type: "poblation", Gold: "50", Wood: "0", Stone: "0", Time: "20", "Hit Points": "220", Food: "1", Damage: "5", Range: "0", Armor: "0", Cooldown: "1.5" },
  { Race: "mortharim", Name: "Ghoul", Img: "/images/Mortharim/units/Ghoul.png", Builds: "null", Requisito: "Crypt", Type: "unit", Gold: "120", Wood: "0", Stone: "0", Time: "20", "Hit Points": "340", Food: "2", Damage: "14", Range: "0", Armor: "0", Cooldown: "1.5", skillName: "Cannibalize", skillAction: "cannibalize" },
  { Race: "mortharim", Name: "Fiend", Img: "/images/Mortharim/units/Fiend.png", Builds: "null", Requisito: "Crypt", Type: "unit", Gold: "215", Wood: "40", Stone: "0", Time: "30", "Hit Points": "550", Food: "3", Damage: "28", Range: "400", Armor: "0", Cooldown: "1.5", skillName: "Web", skillAction: "web" },
  { Race: "mortharim", Name: "Gargoyle", Img: "/images/Mortharim/units/Gargoyle.png", Builds: "null", Requisito: "Crypt", Type: "unit", Gold: "185", Wood: "30", Stone: "0", Time: "35", "Hit Points": "410", Food: "2", Damage: "22", Range: "100", Armor: "3", Cooldown: "1.5", skillName: "Stone Form", skillAction: "stone_form" },
  { Race: "mortharim", Name: "Abomination", Img: "/images/Mortharim/units/Abomination.png", Builds: "null", Requisito: "Slaughterhouse", Type: "unit", Gold: "240", Wood: "70", Stone: "0", Time: "40", "Hit Points": "1175", Food: "4", Damage: "36", Range: "0", Armor: "2", Cooldown: "1.5", skillName: "Disease Cloud", skillAction: "disease_cloud" },
  { Race: "mortharim", Name: "MeatWagon", Img: "/images/Mortharim/units/MeatWagon.png", Builds: "null", Requisito: "Slaughterhouse", Type: "unit", Gold: "230", Wood: "50", Stone: "0", Time: "45", "Hit Points": "380", Food: "3", Damage: "80", Range: "800", Armor: "0", Cooldown: "3.0", skillName: "Exhume Corpses", skillAction: "exhume_corpses" },
  { Race: "mortharim", Name: "Necromancer", Img: "/images/Mortharim/units/Necromancer.png", Builds: "null", Requisito: "TempleOfTheDamned", Type: "unit", Gold: "145", Wood: "20", Stone: "0", Time: "28", "Hit Points": "305", Food: "2", Damage: "10", Range: "600", Armor: "0", Cooldown: "1.5", skillName: "Raise Dead", skillAction: "raise_dead", skillName2: "Unholy Frenzy", skillAction2: "unholy_frenzy" },
  { Race: "mortharim", Name: "Banshee", Img: "/images/Mortharim/units/Banshee.png", Builds: "null", Requisito: "TempleOfTheDamned", Type: "unit", Gold: "155", Wood: "30", Stone: "0", Time: "28", "Hit Points": "285", Food: "2", Damage: "12", Range: "600", Armor: "0", Cooldown: "1.5", skillName: "Curse", skillAction: "curse", skillName2: "Possession", skillAction2: "possession" },
  { Race: "mortharim", Name: "FrostWyrm", Img: "/images/Mortharim/units/FrostWyrm.png", Builds: "null", Requisito: "Boneyard", Type: "unit", Gold: "385", Wood: "120", Stone: "0", Time: "65", "Hit Points": "1350", Food: "5", Damage: "105", Range: "300", Armor: "1", Cooldown: "2.0", skillName: "Freezing Breath", skillAction: "freezing_breath" },
  { Race: "mortharim", Name: "Shade", Img: "/images/Mortharim/poblation/Shade.png", Builds: "null", Requisito: "TombOfRelics", Type: "poblation", Gold: "100", Wood: "0", Stone: "0", Time: "15", "Hit Points": "125", Food: "1", Damage: "0", Range: "0", Armor: "0", Cooldown: "1.5", skillName: "Invisibility", skillAction: "invisibility" },
  
  // Heroes
  { Race: "mortharim", Name: "DeathKnight", Img: "/images/Mortharim/heroes/DeathKnight.png", Builds: "null", Requisito: "AltarOfDarkness", Type: "heroe", Gold: "500", Wood: "100", Stone: "0", Time: "55", "Hit Points": "700", Food: "5", Damage: "30", Range: "0", Armor: "4", Cooldown: "1.5", skillName: "Death Coil", skillAction: "death_coil", skillName2: "Unholy Aura", skillAction2: "unholy_aura" },
  { Race: "mortharim", Name: "Lich", Img: "/images/Mortharim/heroes/Lich.png", Builds: "null", Requisito: "AltarOfDarkness", Type: "heroe", Gold: "500", Wood: "100", Stone: "0", Time: "55", "Hit Points": "550", Food: "5", Damage: "25", Range: "500", Armor: "1", Cooldown: "1.5", skillName: "Frost Nova", skillAction: "frost_nova", skillName2: "Dark Ritual", skillAction2: "dark_ritual" },
  { Race: "mortharim", Name: "Dreadlord", Img: "/images/Mortharim/heroes/Dreadlord.png", Builds: "null", Requisito: "AltarOfDarkness", Type: "heroe", Gold: "500", Wood: "100", Stone: "0", Time: "55", "Hit Points": "650", Food: "5", Damage: "28", Range: "0", Armor: "3", Cooldown: "1.5", skillName: "Carrion Swarm", skillAction: "carrion_swarm", skillName2: "Sleep", skillAction2: "sleep" },
  { Race: "mortharim", Name: "CryptLord", Img: "/images/Mortharim/heroes/CryptLord.png", Builds: "null", Requisito: "AltarOfDarkness", Type: "heroe", Gold: "500", Wood: "100", Stone: "0", Time: "55", "Hit Points": "750", Food: "5", Damage: "32", Range: "0", Armor: "5", Cooldown: "1.5", skillName: "Impale", skillAction: "impale", skillName2: "Spiked Carapace", skillAction2: "spiked_carapace" }
];

// Clean existing Mortharim data if any
d.building = d.building.filter(b => b.Race !== 'mortharim');
d.Unit = d.Unit.filter(u => u.Race !== 'mortharim');

d.building.push(...mortharimBuildings);
d.Unit.push(...mortharimUnits);

fs.writeFileSync(p, JSON.stringify(d, null, 2));
console.log('Balance applied and Mortharim race initialized successfully.');
