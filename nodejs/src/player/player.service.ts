import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './player.entity';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {}

  async findMe(): Promise<Player> {
    let player = await this.playerRepository.findOne({ where: { id: 1 } });
    if (!player) {
      player = this.playerRepository.create({
        id: 1,
        name: 'Player One',
        level: 1,
        race: 'valdari',
        isSystem: false,
        resources: { gold: 5000, wood: 5000, stone: 5000, food: 5000, chrono: 1000 },
        formations: {},
        gameUnits: []
      });
      await this.playerRepository.save(player);
    }
    return player;
  }

  async findAll(): Promise<Player[]> {
    return this.playerRepository.find();
  }

  async updateMe(updateData: Partial<Player>): Promise<Player | null> {
    const player = await this.findMe();
    if (!player) return null;
    Object.assign(player, updateData);
    return this.playerRepository.save(player);
  }
}
