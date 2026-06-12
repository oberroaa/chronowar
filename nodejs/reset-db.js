/**
 * reset-db.js  –  Resetea el jugador (id=1) a valores iniciales
 * 
 * Uso:
 *   node reset-db.js
 *
 * Requisito: tener el paquete 'pg' instalado (ya viene con NestJS/TypeORM).
 */

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

const INITIAL_RESOURCES = JSON.stringify({
  gold: 5000,
  wood: 5000,
  stone: 5000,
  food: 5000,
  chrono: 1000,
});

async function reset() {
  await client.connect();
  console.log('✅ Conectado a Supabase (PostgreSQL)');

  const res = await client.query(
    `UPDATE player
     SET
       resources      = $1,
       formations     = $2,
       "gameUnits"    = $3,
       "buildingLevels" = $4,
       level          = 1,
       race           = 'valdari'
     WHERE id = 1`,
    [
      INITIAL_RESOURCES,
      '{}',
      '[]',
      '{}',
    ]
  );

  if (res.rowCount > 0) {
    console.log('✅ Jugador reseteado a valores iniciales:');
    console.log('   - Recursos: 5000 oro / madera / piedra / comida, 1000 chrono');
    console.log('   - Tropas: vacías (available = 0)');
    console.log('   - Edificios: nivel 0');
    console.log('   - Formaciones: vacías');
    console.log('   - Raza: valdari');
  } else {
    console.log('⚠️  No se encontró el jugador con id=1. Creando uno nuevo...');
    await client.query(
      `INSERT INTO player (id, name, level, race, "isSystem", resources, formations, "gameUnits", "buildingLevels")
       VALUES (1, 'Player One', 1, 'valdari', false, $1, '{}', '[]', '{}')`,
      [INITIAL_RESOURCES]
    );
    console.log('✅ Jugador creado con valores iniciales.');
  }

  await client.end();
  console.log('🔌 Desconectado');
}

reset().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
