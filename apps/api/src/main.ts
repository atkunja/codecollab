import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule }  from './app.module';
import * as cors      from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    cors({
      origin: '*', // Allow all origins (for debug). Restrict later!
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    }),
  );

  const port = process.env.PORT ? +process.env.PORT : 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 API listening on http://0.0.0.0:${port}`);
}
bootstrap();
