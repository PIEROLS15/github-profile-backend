import { NestFactory } from '@nestjs/core';
import { loadEnvFile } from 'node:process';
import { AppModule } from './app.module';

async function bootstrap() {
  if (!process.env.VERCEL) {
    try {
      loadEnvFile('.env');
    } catch {
      // Local development can run without a .env file present.
    }
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: false,
  });

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
