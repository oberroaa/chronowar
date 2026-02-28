import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Race } from './race.entity';

@Injectable()
export class RaceService {
   constructor(
    @InjectRepository(Race)
    private readonly raceRepository: Repository<Race>, // ✅ Esto es lo que faltaba
  ) {}

  async getAll(): Promise<Race[]> {
    return this.raceRepository.find({ relations: ['heroes', 'buildings', 'units'] });
  }


async getById(id: number): Promise<Race> {
  const race = await this.raceRepository.findOne({ where: { id }, relations: ['heroes', 'buildings', 'units'] });
  if (!race) throw new Error(`Race with ID ${id} not found`);
  return race;
}


  async create(race: Race): Promise<Race> {
    return this.raceRepository.save(race);
  }

  async update(id: number, race: Partial<Race>): Promise<Race> {
    await this.raceRepository.update(id, race);
    return this.getById(id);
  }

  async delete(id: number): Promise<void> {
    await this.raceRepository.delete(id);
  }
}
