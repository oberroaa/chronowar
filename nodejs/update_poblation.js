const fs = require('fs');

const dataPath = 'src/data/data.json';
const data = JSON.parse(fs.readFileSync(dataPath));

// Eliminar PEON
data.Unit = data.Unit.filter(u => u.Name !== 'PEON');

// Actualizar Vigía
const vigia = data.Unit.find(u => u.Name === 'Vigía');
if (vigia) {
  vigia.Requisito = 'BloodHall';
  vigia.Type = 'unit';
  vigia.skillName = 'Reparar';
  vigia.skillDesc = 'Repara una estructura aliada';
  vigia.skillAction = 'repair_building';
}

// Añadir Poblation
const poblationNames = ['Goblin', 'Korg', 'Korga'];
poblationNames.forEach(name => {
  data.Unit.push({
    Race: 'gorkar',
    Name: name,
    Img: `/images/GorKar/Poblation/${name}.png`,
    Gold: '50',
    Wood: '0',
    Stone: '0',
    Time: '20',
    'Hit Points': '220',
    Armor: '0',
    Food: '1',
    Builds: 'null',
    Requisito: 'BloodHall',
    Type: 'poblation',
    Damage: '5.5',
    Range: '0',
    Cooldown: '1.5'
  });
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Update complete.');
