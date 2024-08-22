import { Test, TestingModule } from '@nestjs/testing';
import { SeedProcessor } from './seed-processor';

describe('SeedProcessor', () => {
  let provider: SeedProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeedProcessor],
    }).compile();

    provider = module.get<SeedProcessor>(SeedProcessor);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
