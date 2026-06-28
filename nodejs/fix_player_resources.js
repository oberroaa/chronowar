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

async function run() {
  await client.connect();
  console.log('Connected');

  // Fix player resources
  const res = await client.query('SELECT id, resources FROM player');
  for (const r of res.rows) {
    let resJson = r.resources;
    resJson.supplies = (resJson.wood || 0) + (resJson.stone || 0) + (resJson.supplies || 0);
    delete resJson.wood;
    delete resJson.stone;
    await client.query('UPDATE player SET resources = $1 WHERE id = $2', [JSON.stringify(resJson), r.id]);
  }
  console.log('Player resources updated');

  // Fix CamposAbastecimiento cost in building table
  await client.query('UPDATE building SET gold = 300, supplies = 150 WHERE name = $1', ['CamposAbastecimiento']);
  console.log('CamposAbastecimiento updated');

  // Update data.json for CamposAbastecimiento
  const fs = require('fs');
  const dataPath = './src/data/data.json';
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  for (let b of data.building) {
    if (b.Name === 'CamposAbastecimiento') {
      b.Gold = '300';
      b.Supplies = '150';
      delete b.Wood;
      delete b.Stone;
    }
  }
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log('data.json updated for CamposAbastecimiento');

  await client.end();
}

run().catch(console.error);
