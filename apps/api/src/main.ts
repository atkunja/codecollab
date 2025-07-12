// apps/api/src/main.ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🛠️ For now, allow _any_ origin so we can verify CORS works:
  app.enableCors({
    origin: true,      // <-- allow all domains
    credentials: true, // <-- allow cookies/auth headers
  });

  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
