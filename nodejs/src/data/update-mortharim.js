const fs = require('fs');
const path = require('path');
const p = path.resolve(__dirname, 'data.json');
const d = JSON.parse(fs.readFileSync(p));

// We are replacing the previous Mortharim definition with the names found in gameData.tsx
const mortharimBuildings = [
  { Race: "mortharim", Name: "Necropolis", Img: "/images/Mortharim/construcciones/Necropolis.png", Builds: "Acolyte", Requisito: "null" },
  { Race: "mortharim", Name: "Crypt", Img: "/images/Mortharim/construcciones/Crypt.png", Builds: "Ghoul, Fiend, Gargoyle", Requisito: "Necropolis" },
  { Race: "mortharim", Name: "Zigurat", Img: "/images/Mortharim/construcciones/Zigurat.png", Builds: "null", Requisito: "Necropolis" }, // Was Graveyard
  { Race: "mortharim", Name: "Slaughterhouse", Img: "/images/Mortharim/construcciones/Slaughterhouse.png", Builds: "Abomination, MeatWagon", Requisito: "Crypt" },
  { Race: "mortharim", Name: "SpiritTower", Img: "/images/Mortharim/construcciones/SpiritTower.png", Builds: "Necromancer, Banshee", Requisito: "Zigurat" }, // Was TempleOfTheDamned
  { Race: "mortharim", Name: "BlackCitadel", Img: "/images/Mortharim/construcciones/BlackCitadel.png", Builds: "FrostWyrm", Requisito: "Slaughterhouse" }, // Was Boneyard
  { Race: "mortharim", Name: "AltarDarkness", Img: "/images/Mortharim/construcciones/AltarDarkness.png", Builds: "DeathKnight, Lich, Dreadlord, CryptLord", Requisito: "Necropolis" }, // Was AltarOfDarkness
  { Race: "mortharim", Name: "TombRelics", Img: "/images/Mortharim/construcciones/TombRelics.png", Builds: "Shade", Requisito: "Zigurat" } // Was TombOfRelics
];

mortharimBuildings.forEach(b => {
    b.Gold = "1000"; b.Wood = "500"; b.Stone = "300"; b.Time = "120"; b.Type = "Structure";
});

// Update the requirements in the units to match these new names
const mortharimUnits = d.Unit.filter(u => u.Race === 'mortharim');
mortharimUnits.forEach(u => {
    if (u.Requisito === 'Graveyard') u.Requisito = 'Zigurat';
    if (u.Requisito === 'TempleOfTheDamned') u.Requisito = 'SpiritTower';
    if (u.Requisito === 'Boneyard') u.Requisito = 'BlackCitadel';
    if (u.Requisito === 'AltarOfDarkness') u.Requisito = 'AltarDarkness';
    if (u.Requisito === 'TombOfRelics') u.Requisito = 'TombRelics';
});

// Clean existing Mortharim BUILDINGS data
d.building = d.building.filter(b => b.Race !== 'mortharim');
d.building.push(...mortharimBuildings);

fs.writeFileSync(p, JSON.stringify(d, null, 2));
console.log('Mortharim buildings renamed to match frontend.');
