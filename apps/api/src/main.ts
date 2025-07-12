// main.ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3001; // fallback 3001
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 API listening on http://0.0.0.0:${port}`);
}
bootstrap();
