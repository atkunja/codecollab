import { Controller, Post, Body, Delete, Param, Get } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { supabase } from './supabase';

const LANGUAGE_RUNNERS: Record<string, { language: string; extension: string }> = {
  javascript: { language: 'javascript', extension: 'js' },
  typescript: { language: 'typescript', extension: 'ts' },
  python: { language: 'python', extension: 'py' },
  cpp: { language: 'cpp', extension: 'cpp' },
  java: { language: 'java', extension: 'java' },
};

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

  @Post(':id/execute')
  async executeCode(
    @Param('id') id: string,
    @Body()
    body: { code?: string; language?: string; stdin?: string },
  ) {
    if (!body?.code || !body?.language) {
      return { error: 'Code and language are required.' };
    }

    const runtime = LANGUAGE_RUNNERS[body.language.toLowerCase()];
    if (!runtime) {
      return { error: `Unsupported language: ${body.language}` };
    }

    try {
      const executorFetch = (globalThis as any).fetch;
      if (!executorFetch) {
        return { error: 'Execution service is unavailable.' };
      }

      const response = await executorFetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: runtime.language,
          files: [
            {
              name: `main.${runtime.extension}`,
              content: body.code,
            },
          ],
          stdin: body.stdin ?? '',
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error || result.message === 'error') {
        return { error: result?.message || 'Execution failed.' };
      }

      const stdout = result.run?.stdout ?? result.run?.output ?? '';
      const stderr =
        (result.compile && result.compile.stderr) ||
        result.run?.stderr ||
        '';

      return {
        success: true,
        language: body.language,
        output: stdout,
        stderr,
      };
    } catch (error) {
      console.error('Code execution error', error);
      return { error: 'Execution service is unavailable.' };
    }
  }
}
