import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    // Return a JSON object
    return { ok: true, message: 'Backend up!' };
  }
}
