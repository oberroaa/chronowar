const fs = require('fs');
const path = require('path');

const publicDir = 'd:/MPC/chronowar/react/public/images/Mortharim';
const brainDir = 'C:/Users/Otto/.gemini/antigravity-ide/brain/e3fae5fd-08c9-4125-b6e8-87c58e2ddb01';

// The images we successfully generated
const siervoImg = path.join(brainDir, 'siervo_del_vacio_1782349507715.png');
const sombraImg = path.join(brainDir, 'sombra_1782349516366.png');
const malakorImg = path.join(brainDir, 'malakor_1782349526522.png');

// Make dirs if they don't exist
const poblationDir = path.join(publicDir, 'poblation');
const unitsDir = path.join(publicDir, 'units');
const heroesDir = path.join(publicDir, 'heroes');

if (!fs.existsSync(poblationDir)) fs.mkdirSync(poblationDir, { recursive: true });
if (!fs.existsSync(unitsDir)) fs.mkdirSync(unitsDir, { recursive: true });
if (!fs.existsSync(heroesDir)) fs.mkdirSync(heroesDir, { recursive: true });

// Copy poblation
fs.copyFileSync(siervoImg, path.join(poblationDir, 'Siervo_del_Vacio.png'));
fs.copyFileSync(sombraImg, path.join(poblationDir, 'Sombra.png'));

// Copy units (using Sombra and Siervo as placeholders for now because of quota)
fs.copyFileSync(sombraImg, path.join(unitsDir, 'Desgarrador.png'));
fs.copyFileSync(sombraImg, path.join(unitsDir, 'Caminante_de_la_Cripta.png'));
fs.copyFileSync(sombraImg, path.join(unitsDir, 'Necro_Raptor.png'));
fs.copyFileSync(malakorImg, path.join(unitsDir, 'Coloso_de_Hueso.png')); // big guy
fs.copyFileSync(malakorImg, path.join(unitsDir, 'Caballero_del_Abismo.png')); // knight
fs.copyFileSync(siervoImg, path.join(unitsDir, 'Tejedor_de_Almas.png'));
fs.copyFileSync(sombraImg, path.join(unitsDir, 'Lamento_Espectral.png'));
fs.copyFileSync(sombraImg, path.join(unitsDir, 'Horror_Alado.png'));

// Copy heroes (using Malakor for all temporarily)
fs.copyFileSync(malakorImg, path.join(heroesDir, 'Malakor_el_Invicto.png'));
fs.copyFileSync(siervoImg, path.join(heroesDir, 'Xyrelia_Canta_Almas.png'));
fs.copyFileSync(malakorImg, path.join(heroesDir, 'Vane_el_Segador.png'));
fs.copyFileSync(malakorImg, path.join(heroesDir, 'Noctis_Portador_del_Vacio.png'));

console.log('Images copied successfully for Mortharim!');
