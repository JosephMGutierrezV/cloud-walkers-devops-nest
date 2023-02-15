import { Test, TestingModule } from '@nestjs/testing';
import { CloudWalkersController } from './cloud-walkers.controller';
import { CloudWalkersService } from './cloud-walkers.service';

describe('AppController', () => {
  let appController: CloudWalkersController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CloudWalkersController],
      providers: [CloudWalkersService],
    }).compile();

    appController = app.get<CloudWalkersController>(CloudWalkersController);
  });

  describe('root', () => {
    it('should return "Hello World from CloudWalkersService!"', () => {
      expect(appController.getHello()).toBe('Hello World from CloudWalkersService!');
    });
  });
});
