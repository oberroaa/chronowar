import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { RaceService } from './race.service';
import { Race } from './race.entity';

@Controller('race')
export class RaceController {
  constructor(private readonly raceService: RaceService) {}

  @Get()
  getAllRaces(): Promise<Race[]> {
    return this.raceService.getAll();
  }

  @Get(':id')
  getRaceById(@Param('id') id: number): Promise<Race> {
    return this.raceService.getById(id);
  }

  @Post()
  createRace(@Body() race: Race): Promise<Race> {
    return this.raceService.create(race);
  }

  @Put(':id')
  updateRace(@Param('id') id: number, @Body() race: Partial<Race>): Promise<Race> {
    return this.raceService.update(id, race);
  }

  @Delete(':id')
  deleteRace(@Param('id') id: number): Promise<void> {
    return this.raceService.delete(id);
  }
}
