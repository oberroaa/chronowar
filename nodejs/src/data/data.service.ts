import { Injectable } from '@nestjs/common';
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

  async importData(): Promise<void> {
    try {
      console.log("Iniciando la importación de datos...");

      // Leer el archivo JSON
      const rawData = fs.readFileSync(`${__dirname}/../../src/data/data.json`, 'utf8');
      const jsonData = JSON.parse(rawData);

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
            gold: Number(buildingData.Gold),
            wood: Number(buildingData.Wood),
            stone: Number(buildingData.Stone),
            time: Number(buildingData.Time),
            hitPoints: Number(buildingData["Hit Points"]),
            hpRegen: Number(buildingData["HP Regen"]),
            armor: Number(buildingData.Armor),
            armorType: buildingData["Armor Type"],
            food: Number(buildingData.Food),
            builds: buildingData.Builds,
            upgrades: buildingData.Upgrades,
            requisito: buildingData.Requisito !== "null" ? buildingData.Requisito : null,
            type: buildingData.Type,
            damage: Number(buildingData.Damage),
            range: Number(buildingData.Range),
            weapon: buildingData.Weapon !== "null" ? buildingData.Weapon : null,
            cooldown: Number(buildingData.Cooldown),
            targets: buildingData.Targets !== "null" ? buildingData.Targets : null,
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
            gold: Number(unitData.Gold),
            wood: Number(unitData.Wood),
            iron: Number(unitData.Iron),
            time: Number(unitData.Time),
            hitPoints: Number(unitData["Hit Points"]),
            hpRegen: Number(unitData["HP Regen"]),
            mana: Number(unitData.Mana),
            manaRegen: Number(unitData["Mana Regen"]),
            armor: Number(unitData.Armor),
            armorType: unitData["Armor Type"],
            food: Number(unitData.Food),
            builds: unitData.Builds,
            requisito: unitData.Requisito !== "null" ? unitData.Requisito : null,
            speed: Number(unitData.Speed),
            type: unitData.Type,
            damage: Number(unitData.Damage),
            range: Number(unitData.Range),
            weaponType: unitData.WeaponType !== "null" ? unitData.WeaponType : null,
            cooldown: Number(unitData.Cooldown),
            targets: unitData.Targets !== "null" ? unitData.Targets : null,
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
