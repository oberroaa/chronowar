import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataService } from './data.service';
import * as path from 'path';
import * as fs from 'fs';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Player } from '../player/player.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataService = app.get(DataService);

  console.log("Iniciando la importación de datos...");

  try {
    // Construir la ruta correcta del archivo JSON
    const filePath = path.resolve(__dirname, '../../src/data/data.json');

    // Verificar si el archivo existe antes de leerlo
    if (!fs.existsSync(filePath)) {
      throw new Error(`Archivo JSON no encontrado en: ${filePath}`);
    }

    // Leer el archivo JSON
    const rawData = fs.readFileSync(filePath, 'utf8');
    console.log("Contenido del archivo JSON:", rawData);

    // Convertir a objeto
    const jsonData = JSON.parse(rawData);

    if (!jsonData.race) {
      throw new Error("El objeto 'race' no está definido en el JSON.");
    }

   await dataService.importData(); // ✅ No pasar argumento si el método no lo espera

    /*
    // Seed Players
    console.log("Seeding Players...");
    const playerRepo = app.get(getRepositoryToken(Player));
    await playerRepo.query('TRUNCATE TABLE "player" RESTART IDENTITY CASCADE');

    const emptyFormation = new Array(10).fill(null);
    const savedFormations = {
      principal: { name: "Ataque Principal", units: emptyFormation },
      secondary: { name: "Defensa Ciudad", units: emptyFormation },
      reserve: { name: "Reserva Estratégica", units: emptyFormation },
      lastUpdated: new Date().toISOString()
    };

    const playersData = [
      { id: 1, name: 'Player1', level: 5, race: 'valdari', isSystem: false, resources: { gold: 150000, wood: 50000, stone: 30000, food: 20000, chrono: 5000 }, formations: savedFormations, gameUnits: [] },
      { id: 2, name: 'Player2', level: 3, race: 'gorkar', isSystem: false, resources: { gold: 1000, wood: 1000, stone: 1000, food: 1000, chrono: 0 }, formations: savedFormations, gameUnits: [] },
      { id: 3, name: 'Player3', level: 7, race: 'sylvaran', isSystem: false, resources: { gold: 1000, wood: 1000, stone: 1000, food: 1000, chrono: 0 }, formations: savedFormations, gameUnits: [] },
      { id: 4, name: 'Player4', level: 4, race: 'mortharim', isSystem: false, resources: { gold: 1000, wood: 1000, stone: 1000, food: 1000, chrono: 0 }, formations: savedFormations, gameUnits: [] },
      { id: 5, name: 'Player5', level: 6, race: 'valdari', isSystem: false, resources: { gold: 1000, wood: 1000, stone: 1000, food: 1000, chrono: 0 }, formations: savedFormations, gameUnits: [] },
      { id: 101, name: 'Abandoned Village', level: 1, race: 'valdari', isSystem: true, resources: { gold: 500, wood: 500, stone: 500, food: 500, chrono: 0 }, formations: savedFormations, gameUnits: [] },
      { id: 102, name: 'Ruined Castle', level: 3, race: 'gorkar', isSystem: true, resources: { gold: 500, wood: 500, stone: 500, food: 500, chrono: 0 }, formations: savedFormations, gameUnits: [] },
      { id: 103, name: 'Lost Mine', level: 2, race: 'mortharim', isSystem: true, resources: { gold: 500, wood: 500, stone: 500, food: 500, chrono: 0 }, formations: savedFormations, gameUnits: [] },
    ];

    await playerRepo.save(playersData);
    console.log("Players seeded correctly.");
    */

    console.log("Importación de datos completada correctamente.");
  } catch (error) {
    console.error("Error al importar datos:", error);
  }

  await app.close();
}

bootstrap();
