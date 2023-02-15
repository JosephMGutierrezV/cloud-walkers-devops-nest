import { Module } from '@nestjs/common';
import { CloudWalkersController } from './cloud-walkers.controller';
import { CloudWalkersService } from './cloud-walkers.service';

@Module({
  imports: [],
  controllers: [CloudWalkersController],
  providers: [CloudWalkersService],
})
export class CloudWalkersModule {}
