import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true, // Allow all origins for mobile development
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3004);
}
bootstrap();
