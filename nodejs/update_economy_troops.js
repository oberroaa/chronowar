const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  const units = ['Emisario', 'Comerciante_Nomada', 'Susurro_del_Bosque', 'Recolector_de_Almas'];
  for (const u of units) {
    await client.query('UPDATE unit SET chrono = 50, gold = 150, food = 100 WHERE name = $1', [u]);
    console.log('Updated ' + u);
  }
  await client.end();
}

run().catch(console.error);
