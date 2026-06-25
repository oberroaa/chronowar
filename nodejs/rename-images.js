const fs = require('fs');
const path = require('path');

const publicDir = 'd:/MPC/chronowar/react/public/images';

const map = {
  // Valdari
  'palacio.png': 'BastionAlborada.png',
  'granja.png': 'CamposAbastecimiento.png',
  'cuartel.png': 'FuerteValor.png',
  'templo.png': 'SagrarioLuminoso.png',
  'aviary.png': 'CupulaCielos.png',
  'altar.png': 'SantuarioCaidos.png',
  'mercado.png': 'GranBazar.png',

  // Gorkar
  'BloodHall.png': 'BastionSangre.png',
  'WarHut.png': 'FuerteCeniza.png',
  'ShamanTent.png': 'CirculoIgneo.png',
  'HuntCamp.png': 'FosoDepredadores.png',
  'SkyPerch.png': 'NidoCumbres.png',
  'TotemCircle.png': 'TotemsTierra.png',
  'TradeHut.png': 'PuestoTrueque.png',

  // Sylvaran
  'TreeOfLife.png': 'CorazonBosque.png',
  'Moonwell.png': 'ManantialEstelar.png',
  'DruidsCircle.png': 'EnclaveSabios.png',
  'HuntersLodge.png': 'RefugioCazador.png',
  'AncientWonder.png': 'RaizPrimigenia.png',
  'SentinelPost.png': 'AtalayaHojas.png',
  'LunarAltar.png': 'AltarLuna.png',

  // Mortharim
  'Necropolis.png': 'PinaculoVacio.png',
  'Crypt.png': 'CriptaLamentos.png',
  'Slaughterhouse.png': 'FosoAlmas.png',
  'AltarDarkness.png': 'AltarCondenados.png',
  'TombRelics.png': 'MausoleoReliquias.png',
  'SpiritTower.png': 'ObeliscoSombras.png',
  'BlackCitadel.png': 'BastionEbano.png',

  // Valdari Units
  "Men.png": "Siervo.png",
  "Woman.png": "Doncella.png",
  "Emisario.png": "Emisario.png",
  "Obrero.png": "Artesano.png",
  "Centinela.png": "Guardia_del_Sol.png",
  "Francotirador.png": "Saetero_de_Plata.png",
  "Caballero.png": "Jinete_de_la_Alborada.png",
  "Cirujano.png": "Clerigo_de_la_Luz.png",
  "Arcanista.png": "Evocador_Arcano.png",
  "Disruptor.png": "Alabardero.png",
  "Falange.png": "Templario_Radiante.png",
  "Jinetes.png": "Jinete_de_Pegaso.png",
  "Dawnforged.png": "Valerius_el_Justo.png",
  "Arconte.png": "Seraphina_Tejeluz.png",
  "Thane.png": "Caelen_Hoja_Alba.png",
  "Vastago.png": "Ignis_Portador_del_Alba.png",

  // GorKar Units
  "Goblin.png": "Comerciante_Nomada.png",
  "Korg.png": "Peon_Gor.png",
  "Korga.png": "Recolectora_Gor.png",
  "Berserker.png": "Furia_de_Ceniza.png",
  "Cazacabezas.png": "Lanzador_de_Escorias.png",
  "Chaman.png": "Chaman_de_Magma.png",
  "Invocador.png": "Clamatormentas.png",
  "Machacador.png": "Quebrantahuesos.png",
  "Drak'Tharon.png": "Jinete_de_Draco.png",
  "Raider.png": "Jinete_de_Bestia.png",
  "Rompehueso.png": "Caminante_del_Crater.png",
  "Vigía.png": "Rastreador.png",
  "Gorruk.png": "Kaelen_Quebrantamundos.png",
  "Kargath.png": "Vaelia_Furia_Roja.png",
  "Urzok.png": "Rokh_Vidente_de_Fuego.png",
  "Valka.png": "Borgh_Cazador_de_Sombras.png",

  // Sylvaran Units
  "Sylron.png": "Espiritu_de_Hoja.png",
  "Sylwen.png": "Tejedora_de_Luz.png",
  "Emissary.png": "Susurro_del_Bosque.png",
  "Archer.png": "Exploradora_Lunar.png",
  "Huntress.png": "Hoja_de_Ebano.png",
  "Sentinel.png": "Danzante_de_Sombras.png", // NOTE: Valdari and Sylvaran both had "Sentinel.png"!
  // Wait, the folders are separated by race: public/images/Valdari/..., public/images/Sylvaran/...
  // So it's fine.
  "Druid.png": "Sabio_de_las_Raices.png",
  "SpiritWalker.png": "Clamabosques.png",
  "Dryad.png": "Jinete_de_Venado.png",
  "Hippogryph.png": "Guardian_Primigenio.png",
  "Treant.png": "Cuidador_de_Raices.png",
  "Quimera.png": "Jinete_de_Buho_Lunar.png",
  "Lunarion.png": "Oakhaven_el_Ancestral.png",
  "Moonwhisper.png": "Sacerdotisa_Moonwhisper.png",
  "Shadowleaf.png": "Sylas_Viento_Otonal.png",
  "Stormbark.png": "Lyra_Sombraluna.png",

  // Mortharim Units
  "Acolyte.png": "Siervo_del_Vacio.png",
  "Shade.png": "Sombra.png",
  "Ghoul.png": "Desgarrador.png",
  "Fiend.png": "Caminante_de_la_Cripta.png",
  "Gargoyle.png": "Necro_Raptor.png",
  "Abomination.png": "Coloso_de_Hueso.png",
  "MeatWagon.png": "Caballero_del_Abismo.png",
  "Necromancer.png": "Tejedor_de_Almas.png",
  "Banshee.png": "Lamento_Espectral.png",
  "FrostWyrm.png": "Horror_Alado.png",
  "DeathKnight.png": "Malakor_el_Invicto.png",
  "Lich.png": "Xyrelia_Canta_Almas.png",
  "Dreadlord.png": "Vane_el_Segador.png",
  "CryptLord.png": "Noctis_Portador_del_Vacio.png"
};

function renameFilesInDir(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      renameFilesInDir(fullPath);
    } else if (stat.isFile()) {
      // Case insensitive match
      const key = Object.keys(map).find(k => k.toLowerCase() === item.toLowerCase());
      if (key) {
        const newPath = path.join(dir, map[key]);
        if (fullPath !== newPath) {
          try {
            fs.renameSync(fullPath, newPath);
            console.log(`Renamed: ${fullPath} -> ${newPath}`);
          } catch(e) {
            console.log("Failed to rename", fullPath, e);
          }
        }
      }
    }
  }
}

renameFilesInDir(publicDir);
console.log("Image rename complete!");
