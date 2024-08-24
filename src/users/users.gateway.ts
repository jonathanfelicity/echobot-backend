import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from './users.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  constructor(private readonly usersService: UsersService) {}

  private async getTotalUsers(): Promise<number> {
    try {
      return await this.usersService.getTotalUsers();
    } catch (error) {
      console.error('Error getting total users:', error);
      return 0; // Return 0 or handle as appropriate
    }
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): string {
    console.log('Message received from client:', client.id, payload);
    return 'Hello world!';
  }

  /**
   * Emits an event to all connected clients.
   *
   * @param event - The name of the event to emit.
   * @param data - The data to include with the event.
   * @returns Void.
   */
  emitToAll(event: string, data: any): void {
    this.server.emit(event, data);
  }

  /**
   * Emits an event to a specific connected client.
   *
   * @param clientId - The ID of the client to emit the event to.
   * @param event - The name of the event to emit.
   * @param data - The data to include with the event.
   * @returns A Promise that resolves when the event has been emitted.
   */
  async emitToClient(
    clientId: string,
    event: string,
    data: any,
  ): Promise<void> {
    try {
      const client = this.server.sockets.sockets.get(clientId);
      if (client) {
        client.emit(event, data);
      } else {
        console.warn(`Client with ID ${clientId} not found`);
      }
    } catch (error) {
      console.error('Error emitting event to client:', error);
    }
  }

  // Automatically emit an event when a client connects
  async handleConnection(client: Socket): Promise<void> {
    console.log('Client connected:', client.id);

    try {
      const totalUsers = await this.getTotalUsers();
      client.emit('count-update', totalUsers);
    } catch (error) {
      console.error('Error handling connection:', error);
    }
  }

  // Handle client disconnect
  handleDisconnect(client: Socket): void {
    console.log('Client disconnected:', client.id);
  }
}
