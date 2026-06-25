const fs = require('fs');
const path = require('path');

const publicDir = 'd:/MPC/chronowar/react/public/images/Mortharim';
const brainDir = 'C:/Users/Otto/.gemini/antigravity-ide/brain/e3fae5fd-08c9-4125-b6e8-87c58e2ddb01';

const filesToCopy = [
  // Poblation
  { source: 'siervo_v2_1782422030560.png', dest: 'poblation/Siervo_del_Vacio.png' },
  { source: 'sombra_v2_1782422037848.png', dest: 'poblation/Sombra.png' },
  // Units
  { source: 'desgarrador_v2_1782421912918.png', dest: 'units/Desgarrador.png' },
  { source: 'caminante_v2_1782421921144.png', dest: 'units/Caminante_de_la_Cripta.png' },
  { source: 'necro_v2_1782421928898.png', dest: 'units/Necro_Raptor.png' },
  { source: 'coloso_v2_1782421941194.png', dest: 'units/Coloso_de_Hueso.png' },
  { source: 'caballero_v2_1782421949259.png', dest: 'units/Caballero_del_Abismo.png' },
  { source: 'tejedor_v2_1782421956976.png', dest: 'units/Tejedor_de_Almas.png' },
  { source: 'lamento_v2_1782421966346.png', dest: 'units/Lamento_Espectral.png' },
  { source: 'horror_v2_1782421976000.png', dest: 'units/Horror_Alado.png' },
  // Heroes
  { source: 'malakor_v2_1782422046795.png', dest: 'heroes/Malakor_el_Invicto.png' },
  { source: 'xyrelia_v2_1782421983746.png', dest: 'heroes/Xyrelia_Canta_Almas.png' },
  { source: 'vane_v2_1782421992137.png', dest: 'heroes/Vane_el_Segador.png' },
  { source: 'noctis_v2_1782422009280.png', dest: 'heroes/Noctis_Portador_del_Vacio.png' },
];

filesToCopy.forEach(f => {
  const srcPath = path.join(brainDir, f.source);
  const destPath = path.join(publicDir, f.dest);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${f.dest}`);
  } else {
    console.error(`Source not found: ${srcPath}`);
  }
});
console.log('Final V2 images updated!');
