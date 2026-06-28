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

  // Fix Doncella
  await client.query(
    'UPDATE unit SET "skillDesc" = $1 WHERE name = $2', 
    ['Aumenta la recolección de comida en un 5%.', 'Doncella']
  );
  
  console.log('DB updated');

  // Update data.json
  const fs = require('fs');
  const dataPath = './src/data/data.json';
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  for (let u of data.Unit) {
    if (u.Name === 'Doncella') {
      u.skillDesc = 'Aumenta la recolección de comida en un 5%.';
    }
  }
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log('data.json updated');

  await client.end();
}

run().catch(console.error);
