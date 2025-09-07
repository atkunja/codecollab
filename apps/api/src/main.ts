// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  // If you're using Express (default), keep the generic below:
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ✅ Type the middleware params so noImplicitAny is happy
  app.use((req: Request, res: Response, next: NextFunction) => {
    // (keep whatever you had here—logging, headers, etc.)
    next();
  });

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
  // Optional: console.log so you can see it start up locally
  // eslint-disable-next-line no-console
  console.log(`API running on :${port}`);
}

bootstrap();
