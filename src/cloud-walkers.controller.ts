import { Controller, Get } from '@nestjs/common';
import { CloudWalkersService } from './cloud-walkers.service';

@Controller()
export class CloudWalkersController {
  constructor(private readonly appService: CloudWalkersService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
