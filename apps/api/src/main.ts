import 'dotenv/config';
import { NestFactory }    from '@nestjs/core';
import { AppModule }      from './app.module';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ————————————————
  // Parse your ALLOW_ORIGIN env
  // ————————————————
  const raw = process.env.ALLOW_ORIGIN || '';
  console.log('🔑 ALLOW_ORIGIN raw:', raw);
  const allowed = raw
    .split(',')
    .map(u => u.trim())
    .filter(u => u.length > 0);
  console.log('🛡️  Whitelist:', allowed);

  // —————————————————————————————————————
  // Enable CORS with a typed callback
  // —————————————————————————————————————
  const corsOptions: CorsOptions = {
    origin: (
      incomingOrigin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      console.log('↘️  Incoming Origin:', incomingOrigin);
      if (!incomingOrigin || allowed.includes(incomingOrigin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${incomingOrigin} not allowed by CORS`), false);
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  };
  app.enableCors(corsOptions);

  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
