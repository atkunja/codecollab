import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ENABLE CORS SO FRONTEND CAN TALK TO BACKEND
  app.enableCors({
    origin: [
      'https://codecollab-uuoyp6clb-atkunjas-projects.vercel.app', // Vercel app URL
      'http://localhost:3002', // local Next.js dev (optional)
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
