import { Test, TestingModule } from '@nestjs/testing';
import { BikersController } from './bikers.controller';
import { BikersService } from './bikers.service';

describe('BikersController', () => {
  let controller: BikersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BikersController],
      providers: [BikersService],
    }).compile();

    controller = module.get<BikersController>(BikersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
