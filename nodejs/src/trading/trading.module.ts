import { Module } from '@nestjs/common';
import { TradingGateway } from './trading.gateway';
import { TradingController } from './trading.controller';

@Module({
  controllers: [TradingController],
  providers: [TradingGateway],
})
export class TradingModule {}
