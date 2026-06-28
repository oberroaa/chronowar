const fs = require('fs');

const dataPath = './src/data/data.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
let units = data.Unit;

// Add Recolector_de_Almas
if (!units.find(u => u.Name === 'Recolector_de_Almas')) {
  const sombra = units.find(u => u.Name === 'Sombra');
  const newUnit = { ...sombra };
  newUnit.Name = 'Recolector_de_Almas';
  newUnit.Img = '/images/Mortharim/poblation/Recolector_de_Almas.png';
  units.push(newUnit);
}

const updates = {
  // Valdari
  'Siervo': { skillName: 'Recolección de Oro', skillDesc: 'Aumenta la recolección de oro un 4%.' },
  'Doncella': { skillName: 'Cuidado de la Tierra', skillDesc: 'Aumenta la recolección de comida un 4%.' },
  'Emisario': { skillName: 'Operador de Mercado', skillDesc: 'Permitirá realizar transacciones comerciales en el futuro.', Gold: "150", Food: "100", Chrono: "50" },

  // GorKar
  'Peon_Gor': { skillName: 'Fuerza Bruta', skillDesc: 'Extrae suministros un 4% más rápido.' },
  'Recolectora_Gor': { skillName: 'Carne de Caza', skillDesc: 'Extrae comida un 4% más rápido.' },
  'Comerciante_Nomada': { skillName: 'Operador de Mercado', skillDesc: 'Permitirá realizar transacciones comerciales en el futuro.', Gold: "150", Food: "100", Chrono: "50" },

  // Sylvaran
  'Espiritu_de_Hoja': { skillName: 'Camuflaje Natural', skillDesc: 'Aumenta la recolección de suministros un 4%.' },
  'Tejedora_de_Luz': { skillName: 'Bendición Solar', skillDesc: 'Aumenta la recolección de comida un 4%.' },
  'Susurro_del_Bosque': { skillName: 'Operador de Mercado', skillDesc: 'Permitirá realizar transacciones comerciales en el futuro.', Gold: "150", Food: "100", Chrono: "50" },

  // Mortharim
  'Siervo_del_Vacio': { skillName: 'Aura Letal', skillDesc: 'Extrae suministros un 4% más rápido.' },
  'Sombra': { skillName: 'Paso Umbrío', skillDesc: 'Aumenta la recolección de oro un 4%.' },
  'Recolector_de_Almas': { skillName: 'Operador de Mercado', skillDesc: 'Permitirá realizar transacciones comerciales en el futuro.', Gold: "150", Food: "100", Chrono: "50" }
};

for (let u of units) {
  const up = updates[u.Name];
  if (up) {
    if (up.skillName) u.skillName = up.skillName;
    if (up.skillDesc) u.skillDesc = up.skillDesc;
    if (up.Gold) u.Gold = up.Gold;
    if (up.Food) u.Food = up.Food;
    if (up.Chrono) u.Chrono = up.Chrono;
  }
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('data.json updated');
