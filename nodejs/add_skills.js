const fs = require('fs');
const dataPath = 'src/data/data.json';
const data = JSON.parse(fs.readFileSync(dataPath));

const skillMap = {
  "PEON": { skillName: "Reparar", skillDesc: "Repara una estructura aliada", skillAction: "repair_building" },
  "Berserker": { skillName: "Golpe Pesado", skillDesc: "Golpe brutal que causa más daño", skillAction: "heavy_strike" },
  "Cazacabezas": { skillName: "Lanza Envenenada", skillDesc: "Aplica veneno al enemigo", skillAction: "poison_spear" },
  "Chaman": { skillName: "Sed de Sangre", skillDesc: "Aumenta la velocidad de ataque", skillAction: "bloodlust" },
  "Invocador": { skillName: "Guardián Sanador", skillDesc: "Cura en área a los aliados", skillAction: "healing_ward" },
  "Machacador": { skillName: "Pulverizar", skillDesc: "Daño de área aplastante", skillAction: "pulverize" },
  "Jinete": { skillName: "", skillDesc: "", skillAction: "" },
  "Raider": { skillName: "Atrapar", skillDesc: "Inmoviliza a la unidad", skillAction: "ensnare" },
  "Rompehueso": { skillName: "Aceite Hirviente", skillDesc: "Daño continuo por fuego", skillAction: "burning_oil" },
  "Vigía": { skillName: "Aura de Tambores", skillDesc: "Aumenta el ataque de los aliados", skillAction: "war_drums" },
  "Gorruk": { skillName: "Tormenta de Espadas", skillDesc: "Gira haciendo daño masivo", skillAction: "bladestorm" },
  "Kargath": { skillName: "Cadena de Relámpagos", skillDesc: "Daña a varios enemigos seguidos", skillAction: "chain_lightning" },
  "Urzok": { skillName: "Onda de Choque", skillDesc: "Daña a los enemigos en línea", skillAction: "shockwave" },
  "Valka": { skillName: "Ola Sanadora", skillDesc: "Cura a varios aliados rebotando", skillAction: "healing_wave" }
};

let changed = false;

data.Unit.forEach(u => {
  if (u.Race === 'gorkar' && skillMap[u.Name]) {
    const s = skillMap[u.Name];
    if (s.skillName) {
      u.skillName = s.skillName;
      u.skillDesc = s.skillDesc;
      u.skillAction = s.skillAction;
      changed = true;
    }
  }
});

if (changed) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log('Skills added to GorKar units.');
} else {
  console.log('No skills updated.');
}
