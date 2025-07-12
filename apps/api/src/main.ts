// src/main.ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule }   from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Read and log
  const raw = process.env.ALLOW_ORIGIN;
  console.log('🔑 ALLOW_ORIGIN env:', raw);
  const allowed = raw?.split(',').map(u => u.trim()).filter(Boolean) || [];
  console.log('🛡️  CORS whitelist:', allowed);

  app.enableCors({
    origin: (incomingOrigin, callback) => {
      console.log('↘️  Incoming Origin:', incomingOrigin);
      if (!incomingOrigin || allowed.includes(incomingOrigin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${incomingOrigin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}

bootstrap();
