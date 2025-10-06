import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { supabase } from './supabase';

const allowedOrigins = process.env.WEB_ORIGIN?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

@WebSocketGateway({
  cors: {
    origin: allowedOrigins?.length ? allowedOrigins : '*',
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  roomUsers: Record<string, { email: string; name?: string; image?: string }[]> = {};

  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    for (const roomId in this.roomUsers) {
      this.roomUsers[roomId] = this.roomUsers[roomId].filter(
        (u) => u.email !== client.data.email,
      );
      this.server.to(roomId).emit('roomUsers', this.roomUsers[roomId]);
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody()
    data: { roomId: string; email: string; name?: string; image?: string },
    @ConnectedSocket() client: Socket,
  ) {
    // 1. Check if the room exists in Supabase
    const { data: roomExists } = await supabase
      .from('rooms')
      .select('id')
      .eq('id', data.roomId)
      .single();

    if (!roomExists) {
      client.emit('joinError', 'Room does not exist');
      return;
    }

    client.join(data.roomId);
    client.data.email = data.email;

    if (!this.roomUsers[data.roomId]) this.roomUsers[data.roomId] = [];
    if (!this.roomUsers[data.roomId].some((u) => u.email === data.email)) {
      this.roomUsers[data.roomId].push({
        email: data.email,
        name: data.name,
        image: data.image,
      });
    }
    this.server.to(data.roomId).emit('roomUsers', this.roomUsers[data.roomId]);

    // Send initial code state
    const { data: codeData } = await supabase
      .from('room_code')
      .select('code, language')
      .eq('room_id', data.roomId)
      .single();

    if (codeData) {
      client.emit('codeUpdate', {
        code: codeData.code,
        language: codeData.language || 'javascript',
        editedBy: 'loaded',
        editedAt: new Date().toISOString(),
      });
    }

    // Send chat history
    const { data: chatHistory } = await supabase
      .from('room_chat')
      .select('sender, message, created_at')
      .eq('room_id', data.roomId)
      .order('created_at', { ascending: true })
      .limit(50);

    client.emit('chatHistory', chatHistory || []);
  }

  @SubscribeMessage('codeChange')
  async handleCodeChange(
    @MessageBody()
    payload: { roomId: string; code: string; language?: string; editedBy?: string; editedAt?: string },
    @ConnectedSocket() client: Socket,
  ) {
    await supabase.from('room_code').upsert([
      {
        room_id: payload.roomId,
        code: payload.code,
        language: payload.language || 'javascript',
      },
    ]);

    client.broadcast.to(payload.roomId).emit('codeUpdate', {
      code: payload.code,
      language: payload.language || 'javascript',
      editedBy: payload.editedBy,
      editedAt: payload.editedAt,
    });
  }

  @SubscribeMessage('chatMessage')
  async handleChatMessage(
    @MessageBody() data: { roomId: string; sender: string; message: string },
  ) {
    await supabase.from('room_chat').insert([
      {
        room_id: data.roomId,
        sender: data.sender,
        message: data.message,
      },
    ]);
    this.server.to(data.roomId).emit('newChatMessage', {
      sender: data.sender,
      message: data.message,
      created_at: new Date().toISOString(),
    });
  }
}
