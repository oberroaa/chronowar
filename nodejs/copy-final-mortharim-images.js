const fs = require('fs');
const path = require('path');

const publicDir = 'd:/MPC/chronowar/react/public/images/Mortharim';
const brainDir = 'C:/Users/Otto/.gemini/antigravity-ide/brain/e3fae5fd-08c9-4125-b6e8-87c58e2ddb01';

const filesToCopy = [
  { source: 'desgarrador_1782380705429.png', dest: 'units/Desgarrador.png' },
  { source: 'caminante_cripta_1782380714262.png', dest: 'units/Caminante_de_la_Cripta.png' },
  { source: 'necro_raptor_1782380724175.png', dest: 'units/Necro_Raptor.png' },
  { source: 'coloso_hueso_1782380734000.png', dest: 'units/Coloso_de_Hueso.png' },
  { source: 'caballero_abismo_1782380743779.png', dest: 'units/Caballero_del_Abismo.png' },
  { source: 'tejedor_almas_1782380753597.png', dest: 'units/Tejedor_de_Almas.png' },
  { source: 'lamento_espectral_1782380762212.png', dest: 'units/Lamento_Espectral.png' },
  { source: 'horror_alado_1782380773117.png', dest: 'units/Horror_Alado.png' },
  { source: 'xyrelia_1782380782194.png', dest: 'heroes/Xyrelia_Canta_Almas.png' },
  { source: 'vane_segador_1782380791807.png', dest: 'heroes/Vane_el_Segador.png' },
  { source: 'noctis_1782380799142.png', dest: 'heroes/Noctis_Portador_del_Vacio.png' },
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
console.log('Final images updated!');
