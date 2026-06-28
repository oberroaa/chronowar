require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

const costs = {
  "BastionAlborada": { "g": 1000, "s": 800 },
  "FuerteValor": { "g": 600, "s": 450 },
  "SagrarioLuminoso": { "g": 500, "s": 300 },
  "CupulaCielos": { "g": 700, "s": 500 },
  "SantuarioCaidos": { "g": 800, "s": 500 },
  "GranBazar": { "g": 400, "s": 300 },

  "BastionSangre": { "g": 1000, "s": 800 },
  "FuerteCeniza": { "g": 400, "s": 350 },
  "CirculoIgneo": { "g": 350, "s": 400 },
  "FosoDepredadores": { "g": 450, "s": 500 },
  "NidoCumbres": { "g": 500, "s": 550 },
  "TotemsTierra": { "g": 600, "s": 550 },
  "PuestoTrueque": { "g": 400, "s": 300 },

  "CorazonBosque": { "g": 1000, "s": 800 },
  "RefugioCazador": { "g": 500, "s": 350 },
  "EnclaveSabios": { "g": 700, "s": 400 },
  "RaizPrimigenia": { "g": 600, "s": 600 },
  "AtalayaHojas": { "g": 650, "s": 450 },
  "AltarLuna": { "g": 800, "s": 450 },
  "ManantialEstelar": { "g": 400, "s": 200 },

  "PinaculoVacio": { "g": 1000, "s": 800 },
  "CriptaLamentos": { "g": 450, "s": 300 },
  "ObeliscoSombras": { "g": 750, "s": 500 },
  "FosoAlmas": { "g": 650, "s": 400 },
  "BastionEbano": { "g": 650, "s": 400 },
  "AltarCondenados": { "g": 850, "s": 600 },
  "MausoleoReliquias": { "g": 500, "s": 250 }
};

async function run() {
  await client.connect();
  console.log('Connected to DB');

  try {
    await client.query(`ALTER TABLE building ADD COLUMN IF NOT EXISTS supplies int4;`);
    console.log('Added supplies column');
  } catch (e) {
    console.log('Column might already exist');
  }

  for (const [name, cost] of Object.entries(costs)) {
    await client.query(
      `UPDATE building SET gold = $1, supplies = $2 WHERE name = $3`,
      [cost.g, cost.s, name]
    );
    console.log(`Updated ${name} to ${cost.g}G, ${cost.s}S`);
  }

  // Also update data.json just so it stays in sync
  const fs = require('fs');
  const data = JSON.parse(fs.readFileSync('./src/data/data.json', 'utf8'));
  for (let b of data.building) {
    if (costs[b.Name]) {
      b.Gold = costs[b.Name].g.toString();
      b.Supplies = costs[b.Name].s.toString();
      delete b.Wood;
      delete b.Stone;
    }
  }
  fs.writeFileSync('./src/data/data.json', JSON.stringify(data, null, 2));
  console.log('Updated data.json');

  await client.end();
}

run().catch(console.error);
