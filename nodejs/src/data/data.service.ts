import { Injectable } from '@nestjs/common';
// Test de botones directos
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Race } from '../race/race.entity';
import { Hero } from '../hero/hero.entity';
import { Building } from '../building/building.entity';
import { Unit } from '../unit/unit.entity';
import * as fs from 'fs';

@Injectable()
export class DataService {
  constructor(
    @InjectRepository(Race) private raceRepository: Repository<Race>,
    @InjectRepository(Hero) private heroRepository: Repository<Hero>,
    @InjectRepository(Building) private buildingRepository: Repository<Building>,
    @InjectRepository(Unit) private unitRepository: Repository<Unit>,
  ) {}

  // Método principal para limpiar e importar todos los datos del juego
  async importData(): Promise<void> {
    try {
      console.log("Iniciando la limpieza y posterior importación de datos...");

      // Leer el archivo JSON
      const rawData = fs.readFileSync(`${__dirname}/../../src/data/data.json`, 'utf8');
      const jsonData = JSON.parse(rawData);

      // Limpiar tablas existentes en cascada (borra todo lo relacionado)
      await this.raceRepository.query('TRUNCATE TABLE "race" RESTART IDENTITY CASCADE');
      
      console.log("Tablas limpiadas en cascada correctamente.");

      // Insertar razas
      const raceEntities = await this.raceRepository.save(
        jsonData.race.map((raceData) => this.raceRepository.create(raceData))
      );
      console.log(`Razas insertadas correctamente.`);

      // Insertar edificios con raza correcta
      const buildings = await Promise.all(
        jsonData.building.map(async (buildingData) => {
          const raceEntity = await this.raceRepository.findOne({ where: { name: buildingData.Race } });

          if (!raceEntity) {
            throw new Error(`No se encontró la raza con el nombre: ${buildingData.Race}`);
          }

          return this.buildingRepository.create({
            name: buildingData.Name,
            img: buildingData.Img,
            upgradable: buildingData.Upgradable === "true",
            gold: Number(buildingData.Gold) || 0,
            wood: Number(buildingData.Wood) || 0,
            stone: Number(buildingData.Stone) || 0,
            time: Number(buildingData.Time) || 30,
            hitPoints: Number(buildingData["Hit Points"]) || 500,
            hpRegen: Number(buildingData["HP Regen"]) || 0,
            armor: Number(buildingData.Armor) || 0,
            armorType: buildingData["Armor Type"] || null,
            food: Number(buildingData.Food) || 0,
            builds: buildingData.Builds || null,
            upgrades: buildingData.Upgrades || null,
            requisito: buildingData.Requisito !== "null" && buildingData.Requisito ? buildingData.Requisito : null,
            type: buildingData.Type || 'Structure',
            damage: Number(buildingData.Damage) || 0,
            range: Number(buildingData.Range) || 0,
            weapon: buildingData.Weapon && buildingData.Weapon !== "null" ? buildingData.Weapon : null,
            cooldown: Number(buildingData.Cooldown) || 0,
            targets: buildingData.Targets && buildingData.Targets !== "null" ? buildingData.Targets : null,
            race: { id: raceEntity.id }, // ✅ Asignamos la raza por ID
          });
        })
      );

      await this.buildingRepository.save(buildings);
      console.log(`Edificios insertados correctamente.`);

      // Insertar unidades con raza correcta
      const units = await Promise.all(
        jsonData.Unit.map(async (unitData) => {
          const raceEntity = await this.raceRepository.findOne({ where: { name: unitData.Race } });

          if (!raceEntity) {
            throw new Error(`No se encontró la raza con el nombre: ${unitData.Race}`);
          }

          return this.unitRepository.create({
            name: unitData.Name,
            img: unitData.Img,
            upgradable: unitData.Upgradable === "true",
            gold: Number(unitData.Gold || 0),
            wood: Number(unitData.Wood || 0),
            stone: Number(unitData.Stone || 0),
            time: Number(unitData.Time || 10),
            hitPoints: Number(unitData["Hit Points"] || 100),
            armor: Number(unitData.Armor || 0),
            food: Number(unitData.Food || 0),
            builds: unitData.Builds !== "null" && unitData.Builds !== undefined ? unitData.Builds : null,
            requisito: unitData.Requisito !== "null" && unitData.Requisito !== undefined ? unitData.Requisito : null,
            type: unitData.Type,
            damage: Number(unitData.Damage || 0),
            range: Number(unitData.Range || 0),
            cooldown: Number(unitData.Cooldown || 1.5),
            skillName: unitData.skillName || null,
            skillDesc: unitData.skillDesc || null,
            skillAction: unitData.skillAction || null,
            skillName2: unitData.skillName2 || null,
            skillDesc2: unitData.skillDesc2 || null,
            skillAction2: unitData.skillAction2 || null,
            race: { id: raceEntity.id }, // ✅ Asignamos la raza por ID
          });
        })
      );

      await this.unitRepository.save(units);
      console.log(`Unidades insertadas correctamente.`);

      console.log("Todos los datos fueron insertados correctamente en la base de datos.");
    } catch (error) {
      console.error("Error al importar datos:", error);
    }
  }
}
