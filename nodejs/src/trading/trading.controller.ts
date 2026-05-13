import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { TradingGateway } from './trading.gateway';

@Controller('api/trading')
export class TradingController {
  constructor(private readonly tradingGateway: TradingGateway) {}

  @Post('data')
  @HttpCode(200)
  receiveTradingData(@Body() data: any) {
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
    
    // Broadcast data to connected React clients
    this.tradingGateway.broadcastTradingData(parsedData);
    
    return { success: true };
  }
}
