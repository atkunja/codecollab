// apps/api/src/main.ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // build your whitelist from env (comma-separated)
  const raw = process.env.ALLOW_ORIGIN || '';
  const allowedOrigins = raw
    .split(',')
    .map(u => u.trim())
    .filter(u => !!u);

  // always allow local dev
  allowedOrigins.push('http://localhost:3002');

  // register the cors middleware
  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
  }));

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 API is listening on port ${port}`);
}

bootstrap();
