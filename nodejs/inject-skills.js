const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'src/data/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const skillMap = {
  // Valdari
  'Siervo': { skillName: 'Recolección Rápida', skillDesc: 'Aumenta la velocidad de recolección de madera en un 10%.' },
  'Doncella': { skillName: 'Cuidado de la Tierra', skillDesc: 'Aumenta el rendimiento de las granjas en un 5%.' },
  'Emisario': { skillName: 'Impuestos', skillDesc: 'Genera 1 de oro extra cada 10 segundos.' },

  // GorKar
  'Jinete_de_Draco': { skillName: 'Fuego Cruzado', skillDesc: 'Sus ataques aplican quemadura que reduce la armadura temporalmente.' },
  'Comerciante_Nomada': { skillName: 'Regateo', skillDesc: 'Reduce el costo de unidades en edificios cercanos en 2%.' },
  'Peon_Gor': { skillName: 'Fuerza Bruta', skillDesc: 'Extrae piedra un 15% más rápido.' },
  'Recolectora_Gor': { skillName: 'Carne de Caza', skillDesc: 'Extrae comida un 15% más rápido.' },

  // Sylvaran
  'Espiritu_de_Hoja': { skillName: 'Camuflaje Natural', skillDesc: 'Invisible mientras no esté recolectando o moviéndose.' },
  'Tejedora_de_Luz': { skillName: 'Bendición Solar', skillDesc: 'Las estructuras cercanas regeneran salud lentamente.' },
  'Susurro_del_Bosque': { skillName: 'Explorador Alado', skillDesc: 'Otorga un campo de visión extendido.' },
  'Guardian_Primigenio': { skillName: 'Raíces Profundas', skillDesc: 'Al inmovilizarse, gana +5 de armadura.' },
  'Cuidador_de_Raices': { skillName: 'Simbiosis', skillDesc: 'Sana pasivamente a unidades biológicas cercanas.' },

  // Mortharim
  'Siervo_del_Vacio': { skillName: 'Aura Letal', skillDesc: 'Los atacantes cuerpo a cuerpo reciben un pequeño daño de vacío.' },
  'Sombra': { skillName: 'Paso Umbrío', skillDesc: 'Puede atravesar unidades para evitar ser bloqueada.' },
  'Desgarrador': { skillName: 'Frenesí de Sangre', skillDesc: 'Aumenta su velocidad de ataque un 20% tras matar a un enemigo.' },
  'Caminante_de_la_Cripta': { skillName: 'Red de Sombras', skillDesc: 'Atrapa a unidades aéreas obligándolas a bajar a tierra.' },
  'Necro_Raptor': { skillName: 'Forma de Piedra', skillDesc: 'Se convierte en piedra curándose pasivamente pero sin poder atacar.' },
  'Coloso_de_Hueso': { skillName: 'Nube de Enfermedad', skillDesc: 'Inflige daño continuo en área a todas las unidades enemigas cercanas.' },
  'Caballero_del_Abismo': { skillName: 'Impacto Profano', skillDesc: 'Sus ataques ignoran un porcentaje de la armadura del enemigo.' },
  'Tejedor_de_Almas': { skillName: 'Levantar Muertos', skillDesc: 'Invoca dos esqueletos oscuros a partir de los cadáveres cercanos.' },
  'Lamento_Espectral': { skillName: 'Posesión', skillDesc: 'Toma el control de una unidad enemiga, destruyendo al Lamento Espectral en el proceso.' },
  'Horror_Alado': { skillName: 'Aliento Gélido', skillDesc: 'Congela a los enemigos y estructuras ralentizando su velocidad de ataque y movimiento.' },
  'Malakor_el_Invicto': { skillName: 'Pacto de Muerte', skillDesc: 'Sacrifica una unidad aliada para curarse gran parte de su salud máxima.' },
  'Xyrelia_Canta_Almas': { skillName: 'Nova de Escarcha', skillDesc: 'Daña y ralentiza drásticamente a todos los enemigos en una gran área.' },
  'Vane_el_Segador': { skillName: 'Enjambre de Vampiros', skillDesc: 'Libera murciélagos de vacío que dañan enemigos y curan a Vane.' },
  'Noctis_Portador_del_Vacio': { skillName: 'Caparazón con Púas', skillDesc: 'Devuelve pasivamente un porcentaje del daño cuerpo a cuerpo a los atacantes.' }
};

let updated = 0;
for (const unit of data.Unit) {
  if (skillMap[unit.Name]) {
    unit.skillName = skillMap[unit.Name].skillName;
    unit.skillDesc = skillMap[unit.Name].skillDesc;
    updated++;
  }
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Successfully updated ${updated} units with new skills.`);
