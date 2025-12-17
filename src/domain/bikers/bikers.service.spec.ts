import { Test, TestingModule } from '@nestjs/testing';
import { BikersService } from './bikers.service';

describe('BikersService', () => {
  let service: BikersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BikersService],
    }).compile();

    service = module.get<BikersService>(BikersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
