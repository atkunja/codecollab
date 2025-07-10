import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ENABLE CORS SO FRONTEND CAN TALK TO BACKEND
  app.enableCors({
    origin: 'http://localhost:3002', // Your Next.js frontend dev port
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
