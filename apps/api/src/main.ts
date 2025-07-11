import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'https://codecollab-uuoyp6clb-atkunjas-projects.vercel.app',
      'http://localhost:3002',
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  // Railway/Render/Heroku needs 0.0.0.0 as host!
  await app.listen(process.env.PORT || 3001, '0.0.0.0');
}
bootstrap();

