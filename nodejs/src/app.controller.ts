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
      { name: 'Artesano', skillName: 'Milicia de Emergencia', skillDesc: 'Se arma con picos y palas, infligiendo 45 daño a un enemigo aleatorio', skillAction: 'obrero_strike' },
      { name: 'Guardia_del_Sol', skillName: 'Golpe de Escudo', skillDesc: 'Golpea con su escudo, infligiendo 60 daño al enemigo más débil', skillAction: 'centinela_bash' },
      { name: 'Saetero_de_Plata', skillName: 'Tiro Certero', skillDesc: '80 de daño crítico al enemigo con menos HP', skillAction: 'sniper_shot' },
      { name: 'Jinete_de_la_Alborada', skillName: 'Carga de Caballería', skillDesc: '50 de daño arrollador a 2 enemigos aleatorios', skillAction: 'knight_charge' },
      { name: 'Clerigo_de_la_Luz', skillName: 'Luz Sagrada', skillDesc: 'Restaura 80 HP a todos los aliados en batalla', skillAction: 'priest_heal' },
      { name: 'Evocador_Arcano', skillName: 'Tormenta de Nieve', skillDesc: '60 de daño mágico a TODOS los enemigos y los congela', skillAction: 'sorceress_blizzard' },
      { name: 'Alabardero', skillName: 'Robo de Hechizo', skillDesc: 'Drena 60 de Maná a todos los enemigos', skillAction: 'spellbreaker_drain' },
      { name: 'Templario_Radiante', skillName: 'Grilletes Aéreos', skillDesc: '45 daño y silencia a 2 enemigos aleatorios', skillAction: 'dragonhawk_shackles' },
      { name: 'Jinete_de_Pegaso', skillName: 'Martillo Tormenta', skillDesc: '70 daño al objetivo principal y salpicadura a otros 2', skillAction: 'gryphon_hammer' }
    ];

    for (const data of skillsToUpdate) {
      await unitRepo.update({ name: data.name }, { 
        skillName: data.skillName, 
        skillDesc: data.skillDesc, 
        skillAction: data.skillAction 
      });
    }

    // Heroes
    const heroesToUpdate = [
      { name: 'Valerius_el_Justo', skillName: 'Aura de Devoción', skillDesc: 'Cura 150 HP masiva a todos los aliados', skillAction: 'paladin_aura' },
      { name: 'Seraphina_Tejeluz', skillName: 'Ventisca Gélida', skillDesc: '90 de daño masivo a TODOS los enemigos', skillAction: 'archmage_blizzard' },
      { name: 'Caelen_Hoja_Alba', skillName: 'Avatar de Batalla', skillDesc: '150 de daño devastador a un solo enemigo', skillAction: 'mountain_king_avatar' },
      { name: 'Ignis_Portador_del_Alba', skillName: 'Fogonazo', skillDesc: '100 de daño de fuego a 3 enemigos aleatorios', skillAction: 'bloodmage_flamestrike' }
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
    try {
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
                 trainedAt: b.name,
                 unitType: unit.type,
                 cost: { gold: unit.gold || 0, food: unit.food || 0, chrono: unit.chrono || 0 },
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
                 mana: unit.mana || 100,
                 transportSize: unit.time <= 20 ? 1 : (unit.time <= 40 ? 2 : 3),

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
          buildCost: { gold: b.gold || 0, supplies: b.supplies || 0 },
          buildTime: b.time || 30,
          image: b.img,
          unitsProduced: buildingUnits,
          upgradesAvailable: []
        };
        idCounter++;
      });
      
      return { buildingsData };
    } catch (e) {
      return { statusCode: 500, message: e.message, stack: e.stack };
    }
  }
}
