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

  // Fix Rastreador skill in DB
  await client.query(
    'UPDATE unit SET "skillName" = $1, "skillDesc" = $2, "skillAction" = $3 WHERE name = $4', 
    ['Tiro Letal', 'Disparo certero al enemigo más herido, infligiendo 80 de daño', 'sniper_shot', 'Rastreador']
  );
  console.log('Rastreador updated in DB');

  // Update data.json
  const fs = require('fs');
  const dataPath = './src/data/data.json';
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  for (let u of data.Unit) {
    if (u.Name === 'Rastreador') {
      u.skillName = 'Tiro Letal';
      u.skillDesc = 'Disparo certero al enemigo más herido, infligiendo 80 de daño';
      u.skillAction = 'sniper_shot';
    }
  }
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log('data.json updated for Rastreador');

  await client.end();
}

run().catch(console.error);
