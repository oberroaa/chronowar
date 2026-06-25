const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'src/data/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const unitMap = {
  'Men': 'Siervo', 'Woman': 'Doncella', 'Emisario': 'Emisario', 'Obrero': 'Artesano',
  'Centinela': 'Guardia_del_Sol', 'Francotirador': 'Saetero_de_Plata', 'Caballero': 'Jinete_de_la_Alborada',
  'Cirujano': 'Clerigo_de_la_Luz', 'Arcanista': 'Evocador_Arcano', 'Disruptor': 'Alabardero',
  'Falange': 'Templario_Radiante', 'Jinetes': 'Jinete_de_Pegaso', 'Dawnforged': 'Valerius_el_Justo',
  'Arconte': 'Seraphina_Tejeluz', 'Thane': 'Caelen_Hoja_Alba', 'Vastago': 'Ignis_Portador_del_Alba',
  'Goblin': 'Comerciante_Nomada', 'Korg': 'Peon_Gor', 'Korga': 'Recolectora_Gor',
  'Berserker': 'Furia_de_Ceniza', 'Cazacabezas': 'Lanzador_de_Escorias', 'Chaman': 'Chaman_de_Magma',
  'Invocador': 'Clamatormentas', 'Machacador': 'Quebrantahuesos', "Drak'Tharon": 'Jinete_de_Draco',
  'Raider': 'Jinete_de_Bestia', 'Rompehueso': 'Caminante_del_Crater', 'Vigía': 'Rastreador',
  'Gorruk': 'Kaelen_Quebrantamundos', 'Kargath': 'Vaelia_Furia_Roja', 'Urzok': 'Rokh_Vidente_de_Fuego',
  'Valka': 'Borgh_Cazador_de_Sombras',
  'Sylron': 'Espiritu_de_Hoja', 'Sylwen': 'Tejedora_de_Luz', 'Emissary': 'Susurro_del_Bosque',
  'Archer': 'Exploradora_Lunar', 'Huntress': 'Hoja_de_Ebano', 'Sentinel': 'Danzante_de_Sombras',
  'Druid': 'Sabio_de_las_Raices', 'SpiritWalker': 'Clamabosques', 'Dryad': 'Jinete_de_Venado',
  'Hippogryph': 'Guardian_Primigenio', 'Treant': 'Cuidador_de_Raices', 'Quimera': 'Jinete_de_Buho_Lunar',
  'Lunarion': 'Oakhaven_el_Ancestral', 'Moonwhisper': 'Sacerdotisa_Moonwhisper',
  'Shadowleaf': 'Sylas_Viento_Otonal', 'Stormbark': 'Lyra_Sombraluna',
  'Acolyte': 'Siervo_del_Vacio', 'Shade': 'Sombra', 'Ghoul': 'Desgarrador',
  'Fiend': 'Caminante_de_la_Cripta', 'Gargoyle': 'Necro_Raptor', 'Abomination': 'Coloso_de_Hueso',
  'MeatWagon': 'Caballero_del_Abismo', 'Necromancer': 'Tejedor_de_Almas', 'Banshee': 'Lamento_Espectral',
  'FrostWyrm': 'Horror_Alado', 'DeathKnight': 'Malakor_el_Invicto', 'Lich': 'Xyrelia_Canta_Almas',
  'Dreadlord': 'Vane_el_Segador', 'CryptLord': 'Noctis_Portador_del_Vacio'
};

for (let b of data.building) {
  if (b.Builds && b.Builds !== 'null') {
    const newBuilds = b.Builds.split(',').map(name => {
      const trimmed = name.trim();
      return unitMap[trimmed] ? unitMap[trimmed] : trimmed;
    });
    b.Builds = newBuilds.join(', ');
  }
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Fixed Builds in data.json!');
