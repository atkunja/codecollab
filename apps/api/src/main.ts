import 'dotenv/config';
import { NestFactory }  from '@nestjs/core';
import { AppModule }    from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  
  const allowed = process.env.ALLOW_ORIGIN
    ? process.env.ALLOW_ORIGIN.split(',')
    : [];

  app.enableCors({
    origin: allowed,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
