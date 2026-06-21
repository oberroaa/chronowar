const fs = require('fs');
const dataPath = 'src/data/data.json';
const data = JSON.parse(fs.readFileSync(dataPath));

const valdariSkills = {
  "Obrero": { skillName: "Milicia de Emergencia", skillDesc: "Se arma con picos y palas, infligiendo 45 daño a un enemigo aleatorio", skillAction: "obrero_strike" },
  "Centinela": { skillName: "Golpe de Escudo", skillDesc: "Golpea con su escudo, infligiendo 60 daño al enemigo más débil", skillAction: "centinela_bash" },
  "Francotirador": { skillName: "Tiro Certero", skillDesc: "80 de daño crítico al enemigo con menos HP", skillAction: "sniper_shot" },
  "Caballero": { skillName: "Carga de Caballería", skillDesc: "50 de daño arrollador a 2 enemigos aleatorios", skillAction: "knight_charge" },
  "Cirujano": { skillName: "Luz Sagrada", skillDesc: "Restaura 80 HP a todos los aliados en batalla", skillAction: "priest_heal" },
  "Arcanista": { skillName: "Tormenta de Nieve", skillDesc: "60 de daño mágico a TODOS los enemigos y los congela", skillAction: "sorceress_blizzard" },
  "Disruptor": { skillName: "Robo de Hechizo", skillDesc: "Drena 60 de Maná a todos los enemigos", skillAction: "spellbreaker_drain" },
  "Falange": { skillName: "Grilletes Aéreos", skillDesc: "45 daño y silencia a 2 enemigos aleatorios", skillAction: "dragonhawk_shackles" },
  "Jinetes": { skillName: "Martillo Tormenta", skillDesc: "70 daño al objetivo principal y salpicadura a otros 2", skillAction: "gryphon_hammer" },
  "Dawnforged": { skillName: "Aura de Devoción", skillDesc: "Cura 150 HP masiva a todos los aliados", skillAction: "paladin_aura" },
  "Arconte": { skillName: "Ventisca Gélida", skillDesc: "90 de daño masivo a TODOS los enemigos", skillAction: "archmage_blizzard" },
  "Thane": { skillName: "Avatar de Batalla", skillDesc: "150 de daño devastador a un solo enemigo", skillAction: "mountain_king_avatar" },
  "Vastago": { skillName: "Fogonazo", skillDesc: "100 de daño de fuego a 3 enemigos aleatorios", skillAction: "bloodmage_flamestrike" }
};

let changed = false;
data.Unit.forEach(u => {
  if (u.Race === 'valdari' && valdariSkills[u.Name]) {
    const s = valdariSkills[u.Name];
    u.skillName = s.skillName;
    u.skillDesc = s.skillDesc;
    u.skillAction = s.skillAction;
    changed = true;
  }
});

if (changed) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log('Valdari skills updated in JSON.');
} else {
  console.log('No changes.');
}
