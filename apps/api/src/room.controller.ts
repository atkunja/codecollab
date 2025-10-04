import { Controller, Post, Body, Delete, Param, Get } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { supabase } from './supabase';
import { request as httpsRequest } from 'node:https';

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
      const payload = JSON.stringify({
        language: runtime.language,
        files: [
          {
            name: `main.${runtime.extension}`,
            content: body.code,
          },
        ],
        stdin: body.stdin ?? '',
      });

      const result = await new Promise<{ statusCode: number; data: string }>((resolve, reject) => {
        const req = httpsRequest(
          {
            hostname: 'emkc.org',
            path: '/api/v2/piston/execute',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload),
            },
            timeout: 10_000,
          },
          (response) => {
            let body = '';
            response.setEncoding('utf8');
            response.on('data', (chunk) => {
              body += chunk;
            });
            response.on('end', () => {
              resolve({ statusCode: response.statusCode ?? 500, data: body });
            });
          },
        );

        req.on('error', (err) => reject(err));
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Execution timed out'));
        });
        req.write(payload);
        req.end();
      });

      const parsed = JSON.parse(result.data || '{}');

      if (result.statusCode < 200 || result.statusCode >= 300) {
        return { error: parsed?.message || 'Execution failed.' };
      }

      if (parsed.error || parsed.message === 'error') {
        return { error: parsed?.message || 'Execution failed.' };
      }

      const stdout = parsed.run?.stdout ?? parsed.run?.output ?? '';
      const stderr =
        (parsed.compile && parsed.compile.stderr) ||
        parsed.run?.stderr ||
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
