import { Test, TestingModule } from '@nestjs/testing';
import { PostSeedProcessor } from './post-seed-processor';

describe('PostSeedProcessor', () => {
  let provider: PostSeedProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostSeedProcessor],
    }).compile();

    provider = module.get<PostSeedProcessor>(PostSeedProcessor);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
