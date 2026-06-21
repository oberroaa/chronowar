import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Building } from './building/building.entity';
import { Unit } from './unit/unit.entity';
import { Race } from './race/race.entity';

@Controller('api')
export class AppController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('seed-skills')
  async seedSkills() {
    const unitRepo = this.dataSource.getRepository(Unit);
    const skillsToUpdate = [
      { name: 'Obrero', skillName: 'Milicia de Emergencia', skillDesc: 'Se arma con picos y palas, infligiendo 45 daño a un enemigo aleatorio', skillAction: 'obrero_strike' },
      { name: 'Centinela', skillName: 'Golpe de Escudo', skillDesc: 'Golpea con su escudo, infligiendo 60 daño al enemigo más débil', skillAction: 'centinela_bash' },
      { name: 'Francotirador', skillName: 'Tiro Certero', skillDesc: '80 de daño crítico al enemigo con menos HP', skillAction: 'sniper_shot' },
      { name: 'Caballero', skillName: 'Carga de Caballería', skillDesc: '50 de daño arrollador a 2 enemigos aleatorios', skillAction: 'knight_charge' },
      { name: 'Cirujano', skillName: 'Luz Sagrada', skillDesc: 'Restaura 80 HP a todos los aliados en batalla', skillAction: 'priest_heal' },
      { name: 'Arcanista', skillName: 'Tormenta de Nieve', skillDesc: '60 de daño mágico a TODOS los enemigos y los congela', skillAction: 'sorceress_blizzard' },
      { name: 'Disruptor', skillName: 'Robo de Hechizo', skillDesc: 'Drena 60 de Maná a todos los enemigos', skillAction: 'spellbreaker_drain' },
      { name: 'Falange', skillName: 'Grilletes Aéreos', skillDesc: '45 daño y silencia a 2 enemigos aleatorios', skillAction: 'dragonhawk_shackles' },
      { name: 'Jinetes', skillName: 'Martillo Tormenta', skillDesc: '70 daño al objetivo principal y salpicadura a otros 2', skillAction: 'gryphon_hammer' }
    ];

    for (const data of skillsToUpdate) {
      await unitRepo.update({ name: data.name }, { 
        skillName: data.skillName, 
        skillDesc: data.skillDesc, 
        skillAction: data.skillAction 
      });
    }

    // Heroes are not updated here since they use fallback in Battlefield if not found or we can also update them if they exist in Unit. 
    // Are heroes in Unit? The getGameData uses units.find(u => u.name === uName). Let's update heroes too just in case.
    const heroesToUpdate = [
      { name: 'Dawnforged', skillName: 'Aura de Devoción', skillDesc: 'Cura 150 HP masiva a todos los aliados', skillAction: 'paladin_aura' },
      { name: 'Arconte', skillName: 'Ventisca Gélida', skillDesc: '90 de daño masivo a TODOS los enemigos', skillAction: 'archmage_blizzard' },
      { name: 'Thane', skillName: 'Avatar de Batalla', skillDesc: '150 de daño devastador a un solo enemigo', skillAction: 'mountain_king_avatar' },
      { name: 'Vastago', skillName: 'Fogonazo', skillDesc: '100 de daño de fuego a 3 enemigos aleatorios', skillAction: 'bloodmage_flamestrike' }
    ];
    for (const data of heroesToUpdate) {
      await unitRepo.update({ name: data.name }, { 
        skillName: data.skillName, 
        skillDesc: data.skillDesc, 
        skillAction: data.skillAction 
      });
    }

    return { success: true, message: 'Skills updated in database' };
  }

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
               skillName: unit.skillName || "",
               skillDesc: unit.skillDesc || "",
               skillAction: unit.skillAction || "none",
               skillName2: unit.skillName2 || "",
               skillDesc2: unit.skillDesc2 || "",
               skillAction2: unit.skillAction2 || "none",
               attack: unit.damage || 0,
               armor: unit.armor || 0,
               hp: unit.hitPoints || 100,
               transportSize: 1,
               carryCapacity: (unit.name === 'Obrero' || unit.name === 'Vigía') ? 50 : 10,
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
        level: 0,
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
