// main.ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    cors({
      origin: '*', // for now, to debug CORS, allow all
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    }),
  );

  // Railway likes port 3000!
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(` API listening on http://0.0.0.0:${port}`);
}
bootstrap();
