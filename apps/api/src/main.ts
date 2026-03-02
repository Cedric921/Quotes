import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Enable rawBody for Stripe webhook signature verification
    rawBody: true,
  });

  // Enable CORS
  app.enableCors({
    origin: true, // Allow all origins for mobile development
    credentials: true,
  });

  const port = process.env.PORT ?? 3004;
  await app.listen(port);
  console.log(`🚀 API running on port ${port}`);
}
bootstrap();
