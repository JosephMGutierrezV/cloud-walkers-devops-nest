import { Injectable } from '@nestjs/common';

@Injectable()
export class CloudWalkersService {
  public getHello(): string {
    return 'Hello World from CloudWalkersService!';
  }
}
