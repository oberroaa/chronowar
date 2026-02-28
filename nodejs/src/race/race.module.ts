import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Race } from './race.entity';
import { Hero } from '../hero/hero.entity';
import { Building } from '../building/building.entity';
import { Unit } from '../unit/unit.entity';
import { RaceService } from './race.service';
import { RaceController } from './race.controller';
import { DataService } from '../data/data.service';
@Module({
  imports: [
     TypeOrmModule.forFeature([Race, Hero, Building, Unit]) // 🔥 Agregar Hero aquí
  ], // ¡Aquí se debe incluir Race!
  providers: [RaceService, DataService],
  controllers: [RaceController],
  exports: [RaceService], // Exportamos RaceService si lo usas en otros módulos
})
export class RaceModule {}
