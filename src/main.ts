import { NestFactory } from '@nestjs/core';
import { loadEnvFile } from 'node:process';
import { AppModule } from './app.module';

async function bootstrap() {
  loadEnvFile('.env');
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: false,
  });
  if (process.env.VERCEL) {
    app.setGlobalPrefix('api');
  }
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
