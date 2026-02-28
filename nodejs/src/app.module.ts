import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RaceModule } from './race/race.module';
import { HeroModule } from './hero/hero.module';
import { BuildingModule } from './building/building.module';
import { UnitModule } from './unit/unit.module';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Race } from './race/race.entity';
import { Hero } from './hero/hero.entity';
import { Building } from './building/building.entity';
import { Unit } from './unit/unit.entity';

@Module({
  imports: [RaceModule, HeroModule, BuildingModule, UnitModule,
TypeOrmModule.forRoot({
      type: 'mysql', // Cambia a 'postgres' si usas PostgreSQL
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'game_db',
      entities: [Race, Hero, Building, Unit], // Agrega todas las entidades aquí
      synchronize: true, // Solo en desarrollo
    }),

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


