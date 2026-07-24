import { NestFactory } from '@nestjs/core';
import { loadEnvFile } from 'node:process';
import serverless from 'serverless-http';
import { AppModule } from './app.module';

let cachedHandler: ReturnType<typeof serverless> | null = null;

async function createApp() {
  if (!process.env.VERCEL) {
    try {
      loadEnvFile('.env');
    } catch {
    }
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: false,
  });

  return app;
}

async function bootstrapLocal() {
  const app = await createApp();
  await app.listen(process.env.PORT ?? 3000);
}

export default async function handler(req: unknown, res: unknown) {
  if (!cachedHandler) {
    const app = await createApp();
    await app.init();
    cachedHandler = serverless(app.getHttpAdapter().getInstance());
  }

  return cachedHandler(req as never, res as never);
}

if (!process.env.VERCEL) {
  void bootstrapLocal();
}
