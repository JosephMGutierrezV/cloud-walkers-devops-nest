import { NestFactory } from '@nestjs/core';
import { CloudWalkersModule } from './cloud-walkers.module';

async function bootstrap() {
  const app = await NestFactory.create(CloudWalkersModule);
  await app.listen(3000);
}
bootstrap();
