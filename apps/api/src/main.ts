// apps/api/src/main.ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Parse ALLOW_ORIGIN env var (comma-separated list of origins)
  const raw = process.env.ALLOW_ORIGIN ?? '';
  const allowedOrigins = raw
    .split(',')
    .map(o => o.trim())
    .filter(o => o.length > 0);

  // Always allow your local dev origin
  allowedOrigins.push('http://localhost:3002');

  // Register the CORS middleware
  app.use(
    cors({
      origin: (incomingOrigin, callback) => {
        // if no origin (e.g. curl, mobile apps), or in our whitelist, allow
        if (!incomingOrigin || allowedOrigins.includes(incomingOrigin)) {
          callback(null, true);
        } else {
          callback(
            new Error(`CORS: origin ${incomingOrigin} not allowed`),
            false
          );
        }
      },
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`✅  API is listening on port ${port}`);
}

bootstrap();
