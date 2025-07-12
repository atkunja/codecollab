import { Controller, Post, Body, Delete, Param, Get } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { supabase } from './supabase';

@Controller('rooms')
export class RoomController {
  @Post('create')
  async createRoom(@Body() body: any) {
    const roomId = body.id || randomUUID();

    // Check if room already exists
    const { data: existing } = await supabase
      .from('rooms')
      .select('id')
      .eq('id', roomId)
      .single();
    if (existing) {
      return { error: 'Room ID already exists' };
    }

    // Save to DB
    await supabase.from('rooms').insert([
      {
        id: roomId,
        name: body.name,
        creator_email: body.creatorEmail,
        created_at: new Date().toISOString(),
      },
    ]);
    return { success: true, id: roomId };
  }

  @Get(':id')
  async getRoom(@Param('id') id: string) {
    const { data: room } = await supabase
      .from('rooms')
      .select('id, name, creator_email, created_at')
      .eq('id', id)
      .single();

    if (!room) return { error: 'Room not found' };
    return room;
  }

  @Delete(':id')
  async deleteRoom(@Param('id') id: string, @Body() body: any) {
    // Only allow creator to delete
    const { data: room } = await supabase
      .from('rooms')
      .select('creator_email')
      .eq('id', id)
      .single();

    if (!room) return { error: 'Room not found' };
    if (body.requestor !== room.creator_email) {
      return { error: 'Only the room creator can delete this room.' };
    }

    // Delete room and all associated data (code, chat, etc.)
    await supabase.from('rooms').delete().eq('id', id);
    await supabase.from('room_code').delete().eq('room_id', id);
    await supabase.from('room_chat').delete().eq('room_id', id);

    return { success: true };
  }
}
