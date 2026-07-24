import { NestFactory } from '@nestjs/core';
import serverless from 'serverless-http';
import { AppModule } from '../src/app.module';

let cachedHandler: ReturnType<typeof serverless> | null = null;

async function bootstrapServer() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: false,
  });
  if (process.env.VERCEL) {
    app.setGlobalPrefix('api');
  }
  await app.init();

  return serverless(app.getHttpAdapter().getInstance());
}

export default async function handler(req: any, res: any) {
  if (!cachedHandler) {
    cachedHandler = await bootstrapServer();
  }

  return cachedHandler(req, res);
}
