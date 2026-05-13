import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TradingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected to TradingGateway: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected from TradingGateway: ${client.id}`);
  }

  // Sends new tick/candle data to all connected clients
  broadcastTradingData(data: any) {
    this.server.emit('tradingData', data);
  }
}
