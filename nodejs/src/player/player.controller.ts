import { Controller, Get, Put, Body } from '@nestjs/common';
import { PlayerService } from './player.service';

@Controller('api/player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get('me')
  async getMe() {
    return this.playerService.findMe();
  }

  @Get('all')
  async getAll() {
    return this.playerService.findAll();
  }

  @Put('me')
  async updateMe(@Body() body: any) {
    return this.playerService.updateMe(body);
  }
}
