import { Controller, Post, Get, Body, HttpCode } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TradingGateway } from './trading.gateway';
import { TradingOrder } from './trading-order.entity';

@Controller('api/trading')
export class TradingController {
  constructor(
    private readonly tradingGateway: TradingGateway,
    @InjectRepository(TradingOrder)
    private readonly tradingOrderRepository: Repository<TradingOrder>,
  ) {}

  @Get('orders')
  async getOrders() {
    return await this.tradingOrderRepository.find({
      order: { openTime: 'DESC' },
    });
  }

  @Post('data')
  @HttpCode(200)
  async receiveTradingData(@Body() data: any) {
    let parsedData = data;
    
    // Si MT4 envía el JSON como x-www-form-urlencoded, llegará como una clave con valor vacío
    if (data && Object.keys(data).length === 1 && Object.values(data)[0] === '') {
      try {
        const rawKey = Object.keys(data)[0];
        const cleanJson = rawKey.replace(/\x00/g, ''); // Quitar el byte nulo si viene de MQL4
        parsedData = JSON.parse(cleanJson);
      } catch (e) {
        console.error('Error parseando JSON de MT4:', e);
      }
    }

    // Expected data from MT4: { time: number, open: number, high: number, low: number, close: number, signal?: string }
    console.log('Received trading data from MT4:', parsedData);

    if (parsedData && parsedData.isOrder) {
      const ticket = Number(parsedData.ticket);
      const type = parsedData.type;
      const price = Number(parsedData.price);
      const lots = Number(parsedData.lots);
      const profit = parsedData.profit ? Number(parsedData.profit) : 0;
      const time = parsedData.time ? new Date(parsedData.time * 1000) : new Date();

      if (parsedData.isClose) {
        // Cierre de orden
        let order = await this.tradingOrderRepository.findOne({ where: { ticket } });
        if (order) {
          order.closeTime = time;
          order.profit = profit;
          order.status = 'CLOSED';
          await this.tradingOrderRepository.save(order);
          console.log(`Order #${ticket} updated to CLOSED with profit: ${profit}`);
        } else {
          // Si no existía, la creamos cerrada (failsafe)
          order = this.tradingOrderRepository.create({
            ticket,
            type,
            price,
            lots,
            openTime: time,
            closeTime: time,
            profit,
            status: 'CLOSED',
          });
          await this.tradingOrderRepository.save(order);
          console.log(`Order #${ticket} created directly as CLOSED`);
        }
      } else {
        // Apertura de orden
        let order = await this.tradingOrderRepository.findOne({ where: { ticket } });
        if (!order) {
          order = this.tradingOrderRepository.create({
            ticket,
            type,
            price,
            lots,
            openTime: time,
            status: 'OPEN',
          });
          await this.tradingOrderRepository.save(order);
          console.log(`Order #${ticket} created as OPEN`);
        } else {
          console.log(`Order #${ticket} already exists in DB`);
        }
      }
    }
    
    // Broadcast data to connected React clients
    this.tradingGateway.broadcastTradingData(parsedData);
    
    return { success: true };
  }
}
