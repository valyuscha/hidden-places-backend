import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import * as process from 'node:process';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000', 'https://hidden-places-45d3.vercel.app', 'https://hidden-places.vercel.app'],
    credentials: true,
  });

  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 3080);
}
bootstrap();
