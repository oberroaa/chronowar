import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradingGateway } from './trading.gateway';
import { TradingController } from './trading.controller';
import { TradingOrder } from './trading-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TradingOrder])],
  controllers: [TradingController],
  providers: [TradingGateway],
})
export class TradingModule {}
