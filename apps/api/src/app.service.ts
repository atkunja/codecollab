import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): any {
    return { ok: true, message: 'Backend up!' };
  }
}
