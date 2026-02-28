import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataService } from './data.service';
import * as path from 'path';
import * as fs from 'fs';

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


    console.log("Importación de datos completada correctamente.");
  } catch (error) {
    console.error("Error al importar datos:", error);
  }

  await app.close();
}

bootstrap();
