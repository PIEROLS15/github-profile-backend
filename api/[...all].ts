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
  const requestUrl = typeof req?.url === 'string' ? req.url : '';

  if (requestUrl === '/' || requestUrl === '/api' || requestUrl === '/api/') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        status: 'ok',
        endpoint: '/user/:username',
        message: 'Use GET /user/:username to fetch a GitHub profile.',
      }),
    );
    return;
  }

  if (!cachedHandler) {
    cachedHandler = await bootstrapServer();
  }

  return cachedHandler(req, res);
}
