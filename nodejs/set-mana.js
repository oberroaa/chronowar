require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  console.log('Connected to DB');

  const res = await client.query('SELECT id, name, "hitPoints", mana FROM unit');
  const units = res.rows;

  for (const u of units) {
    let mana = 100;
    if (u.hitPoints >= 400 && u.hitPoints < 600) mana = 200;
    else if (u.hitPoints >= 600) mana = 400;

    await client.query('UPDATE unit SET mana = $1 WHERE id = $2', [mana, u.id]);
    console.log(`Updated ${u.name} (HP: ${u.hitPoints}) to Mana: ${mana}`);
  }

  await client.end();
}
run();
