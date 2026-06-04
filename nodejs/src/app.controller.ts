import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Building } from './building/building.entity';
import { Unit } from './unit/unit.entity';
import { Race } from './race/race.entity';

@Controller('api')
export class AppController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('game-data')
  async getGameData() {
    const buildings = await this.dataSource.getRepository(Building).find({ relations: ['race'] });
    const units = await this.dataSource.getRepository(Unit).find({ relations: ['race'] });
    
    const buildingsData: Record<string, any> = {};
    let idCounter = 1;
    
    buildings.forEach(b => {
      const buildingUnits: any[] = [];
      if (b.builds && b.builds !== 'null') {
        const buildNames = b.builds.split(',').map(n => n.trim());
        buildNames.forEach(uName => {
           const unit = units.find(u => u.name === uName);
           if (unit) {
             buildingUnits.push({
               id: unit.id,
               available: 0,
               name: unit.name,
               unitType: unit.type,
               cost: { gold: unit.gold || 0, food: unit.food || 0, stone: unit.stone || 0, wood: unit.wood || 0 },
               buildTime: unit.time || 10,
               image: unit.img,
               gif: '',
               special: "Skill",
               skillName: "Habilidad",
               skillDesc: "Desc",
               skillAction: "single_light",
               attack: unit.damage || 0,
               weaponType: unit.weaponType || "Normal",
               armorType: unit.armorType || "Light",
               armor: unit.armor || 0,
               hp: unit.hitPoints || 100,
               hpRegen: unit.hpRegen || 1,
               mana: unit.mana || 0,
               manaRegen: unit.manaRegen || 0,
               transportSize: 1,
               carryCapacity: 10,
             });
           }
        });
      }
      
      buildingsData[idCounter] = {
        id: idCounter,
        race: b.race ? b.race.name : 'valdari',
        name: b.name,
        main: !b.requisito || b.requisito === "null",
        description: b.name,
        level: 1,
        buildCost: { gold: b.gold || 0, wood: b.wood || 0, stone: b.stone || 0 },
        buildTime: b.time || 30,
        image: b.img,
        unitsProduced: buildingUnits,
        upgradesAvailable: []
      };
      idCounter++;
    });
    
    return { buildingsData };
  }
}
