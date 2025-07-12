// apps/api/src/main.ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule }   from './app.module';
import * as cors        from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // parse your ALLOW_ORIGIN env
  const raw = process.env.ALLOW_ORIGIN ?? '';
  const allowedOrigins = raw
    .split(',')
    .map(u => u.trim())
    .filter(u => !!u);

  // always allow local dev
  if (!allowedOrigins.includes('http://localhost:3002')) {
    allowedOrigins.push('http://localhost:3002');
  }

  // register cors middleware
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
    })
  );

  const port = Number(process.env.PORT ?? 3001);
  console.log('🔑 ALLOW_ORIGIN raw:', raw);
  console.log('↘️  whitelist:', allowedOrigins);
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 API listening on http://0.0.0.0:${port}`);
}

bootstrap();
