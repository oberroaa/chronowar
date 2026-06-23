const fs = require('fs');
const path = require('path');
const p = path.resolve(__dirname, 'data.json');
const d = JSON.parse(fs.readFileSync(p));

const sylBuildings = [
  { Race: "sylvaran", Name: "TreeOfLife", Img: "/images/Sylvaran/construcciones/TreeOfLife.png", Builds: "Sylron, Sylwen, Emissary", Requisito: "null" },
  { Race: "sylvaran", Name: "Moonwell", Img: "/images/Sylvaran/construcciones/Moonwell.png", Builds: "Dryad", Requisito: "TreeOfLife" },
  { Race: "sylvaran", Name: "DruidsCircle", Img: "/images/Sylvaran/construcciones/DruidsCircle.png", Builds: "Druid, SpiritWalker", Requisito: "TreeOfLife" },
  { Race: "sylvaran", Name: "HuntersLodge", Img: "/images/Sylvaran/construcciones/HuntersLodge.png", Builds: "Archer, Huntress, Sentinel", Requisito: "TreeOfLife" },
  { Race: "sylvaran", Name: "AncientWonder", Img: "/images/Sylvaran/construcciones/AncientWonder.png", Builds: "Treant, Quimera", Requisito: "DruidsCircle" },
  { Race: "sylvaran", Name: "SentinelPost", Img: "/images/Sylvaran/construcciones/SentinelPost.png", Builds: "Hippogryph", Requisito: "HuntersLodge" },
  { Race: "sylvaran", Name: "LunarAltar", Img: "/images/Sylvaran/construcciones/LunarAltar.png", Builds: "Lunarion, Moonwhisper, Shadowleaf, Stormbark", Requisito: "Moonwell" }
];

sylBuildings.forEach(b => {
    b.Gold = "1000"; b.Wood = "500"; b.Stone = "300"; b.Time = "120"; b.Type = "Structure";
});

const sylUnits = [
  { Race: "sylvaran", Name: "Sylron", Img: "/images/Sylvaran/poblation/Sylron.png", Builds: "null", Requisito: "TreeOfLife", Type: "poblation", Gold: "50", Wood: "0", Stone: "0", Time: "20", "Hit Points": "200", Food: "1", Damage: "5", Range: "0" },
  { Race: "sylvaran", Name: "Sylwen", Img: "/images/Sylvaran/poblation/Sylwen.png", Builds: "null", Requisito: "TreeOfLife", Type: "poblation", Gold: "50", Wood: "0", Stone: "0", Time: "20", "Hit Points": "200", Food: "1", Damage: "5", Range: "0" },
  { Race: "sylvaran", Name: "Emissary", Img: "/images/Sylvaran/poblation/Emissary.png", Builds: "null", Requisito: "TreeOfLife", Type: "poblation", Gold: "70", Wood: "0", Stone: "0", Time: "25", "Hit Points": "250", Food: "1", Damage: "5", Range: "0" },
  { Race: "sylvaran", Name: "Archer", Img: "/images/Sylvaran/units/Archer.png", Builds: "null", Requisito: "HuntersLodge", Type: "unit", Gold: "150", Wood: "20", Time: "25", "Hit Points": "300", Food: "1", Damage: "25", Range: "500", skillName: "Flecha Certera", skillAction: "piercing_arrow" },
  { Race: "sylvaran", Name: "Huntress", Img: "/images/Sylvaran/units/Huntress.png", Builds: "null", Requisito: "HuntersLodge", Type: "unit", Gold: "200", Wood: "30", Time: "30", "Hit Points": "400", Food: "2", Damage: "30", Range: "400", skillName: "Guja Rebote", skillAction: "glaive_bounce" },
  { Race: "sylvaran", Name: "Sentinel", Img: "/images/Sylvaran/units/Sentinel.png", Builds: "null", Requisito: "HuntersLodge", Type: "unit", Gold: "220", Wood: "40", Time: "35", "Hit Points": "500", Food: "2", Damage: "35", Range: "0", skillName: "Camuflaje", skillAction: "shadowmeld" },
  { Race: "sylvaran", Name: "Druid", Img: "/images/Sylvaran/units/Druid.png", Builds: "null", Requisito: "DruidsCircle", Type: "unit", Gold: "180", Wood: "50", Time: "30", "Hit Points": "350", Food: "2", Damage: "15", Range: "600", skillName: "Rejuvenecer", skillAction: "rejuvenation" },
  { Race: "sylvaran", Name: "SpiritWalker", Img: "/images/Sylvaran/units/SpiritWalker.png", Builds: "null", Requisito: "DruidsCircle", Type: "unit", Gold: "200", Wood: "60", Time: "35", "Hit Points": "400", Food: "2", Damage: "20", Range: "500", skillName: "Enlace Espiritual", skillAction: "spirit_link" },
  { Race: "sylvaran", Name: "Dryad", Img: "/images/Sylvaran/units/Dryad.png", Builds: "null", Requisito: "Moonwell", Type: "unit", Gold: "160", Wood: "40", Time: "28", "Hit Points": "380", Food: "2", Damage: "22", Range: "450", skillName: "Veneno Lento", skillAction: "slow_poison" },
  { Race: "sylvaran", Name: "Hippogryph", Img: "/images/Sylvaran/units/Hippogryph.png", Builds: "null", Requisito: "SentinelPost", Type: "unit", Gold: "250", Wood: "80", Time: "40", "Hit Points": "600", Food: "3", Damage: "45", Range: "100", skillName: "Ataque Aéreo", skillAction: "aerial_assault" },
  { Race: "sylvaran", Name: "Treant", Img: "/images/Sylvaran/units/Treant.png", Builds: "null", Requisito: "AncientWonder", Type: "unit", Gold: "300", Wood: "150", Time: "50", "Hit Points": "1200", Food: "4", Damage: "60", Range: "0", skillName: "Raíces Enredaderas", skillAction: "entangling_roots" },
  { Race: "sylvaran", Name: "Quimera", Img: "/images/Sylvaran/units/Quimera.png", Builds: "null", Requisito: "AncientWonder", Type: "unit", Gold: "450", Wood: "200", Time: "60", "Hit Points": "1500", Food: "5", Damage: "80", Range: "700", skillName: "Aliento Corrosivo", skillAction: "corrosive_breath" },
  { Race: "sylvaran", Name: "Lunarion", Img: "/images/Sylvaran/heroes/Lunarion.png", Builds: "null", Requisito: "LunarAltar", Type: "heroe", Gold: "500", Wood: "200", Time: "70", "Hit Points": "1000", Food: "5", Damage: "100", Range: "500", skillName: "Lluvia de Estrellas", skillAction: "starfall" },
  { Race: "sylvaran", Name: "Moonwhisper", Img: "/images/Sylvaran/heroes/Moonwhisper.png", Builds: "null", Requisito: "LunarAltar", Type: "heroe", Gold: "500", Wood: "200", Time: "70", "Hit Points": "1100", Food: "5", Damage: "95", Range: "600", skillName: "Aura de Trueshot", skillAction: "trueshot_aura" },
  { Race: "sylvaran", Name: "Shadowleaf", Img: "/images/Sylvaran/heroes/Shadowleaf.png", Builds: "null", Requisito: "LunarAltar", Type: "heroe", Gold: "500", Wood: "200", Time: "70", "Hit Points": "1200", Food: "5", Damage: "110", Range: "0", skillName: "Abanico de Cuchillos", skillAction: "fan_of_knives" },
  { Race: "sylvaran", Name: "Stormbark", Img: "/images/Sylvaran/heroes/Stormbark.png", Builds: "null", Requisito: "LunarAltar", Type: "heroe", Gold: "500", Wood: "200", Time: "70", "Hit Points": "1500", Food: "5", Damage: "85", Range: "0", skillName: "Fuerza de la Naturaleza", skillAction: "force_of_nature" }
];

sylUnits.forEach(u => {
   if(!u.Stone) u.Stone = "0";
   if(!u.Armor) u.Armor = "1";
   if(!u.Cooldown) u.Cooldown = "1.5";
});

d.building.push(...sylBuildings);
d.Unit.push(...sylUnits);
fs.writeFileSync(p, JSON.stringify(d, null, 2));
console.log('Sylvaran data added successfully');
