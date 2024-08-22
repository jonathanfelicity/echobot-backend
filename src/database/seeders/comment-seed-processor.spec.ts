import { Test, TestingModule } from '@nestjs/testing';
import { CommentSeedProcessor } from './comment-seed-processor';

describe('CommentSeedProcessor', () => {
  let provider: CommentSeedProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentSeedProcessor],
    }).compile();

    provider = module.get<CommentSeedProcessor>(CommentSeedProcessor);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
