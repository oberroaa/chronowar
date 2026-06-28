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

  // Fix Siervo
  await client.query(
    'UPDATE unit SET "skillDesc" = $1 WHERE name = $2', 
    ['Aumenta la velocidad de recolección de suministros en un 10%.', 'Siervo']
  );
  
  // Fix Peon_Gor
  await client.query(
    'UPDATE unit SET "skillDesc" = $1 WHERE name = $2', 
    ['Extrae suministros un 15% más rápido.', 'Peon_Gor']
  );

  console.log('DB updated');

  // Update data.json
  const fs = require('fs');
  const dataPath = './src/data/data.json';
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  for (let u of data.Unit) {
    if (u.Name === 'Siervo') {
      u.skillDesc = 'Aumenta la velocidad de recolección de suministros en un 10%.';
    }
    if (u.Name === 'Peon_Gor') {
      u.skillDesc = 'Extrae suministros un 15% más rápido.';
    }
  }
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log('data.json updated');

  await client.end();
}

run().catch(console.error);
