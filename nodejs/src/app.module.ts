import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RaceModule } from './race/race.module';
import { HeroModule } from './hero/hero.module';
import { BuildingModule } from './building/building.module';
import { UnitModule } from './unit/unit.module';
import { TradingModule } from './trading/trading.module';

import { Race } from './race/race.entity';
import { Hero } from './hero/hero.entity';
import { Building } from './building/building.entity';
import { Unit } from './unit/unit.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RaceModule, 
    HeroModule, 
    BuildingModule, 
    UnitModule,
    TradingModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [Race, Hero, Building, Unit],
        synchronize: true, // Solo en desarrollo
        ssl: {
          rejectUnauthorized: false, // Requerido para Supabase en algunos entornos
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


