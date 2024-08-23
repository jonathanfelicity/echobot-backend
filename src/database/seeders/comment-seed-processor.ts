import { Injectable, Logger } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import FactoryService from '../factory.service';
import { CommentsService } from 'src/comments/comments.service';

@Injectable()
export class CommentSeedProcessor {
  private readonly logger = new Logger(CommentSeedProcessor.name);

  constructor(
    private readonly factoryService: FactoryService,
    private readonly commentsService: CommentsService,
  ) {
    this.setupWorker();
  }

  private setupWorker() {
    const worker = new Worker('comment-seed', this.processJob.bind(this), {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      },
    });

    worker.on('completed', (job: Job) => {
      this.logger.log(`Job ${job.id} completed.`);
    });

    worker.on('failed', (job: Job, err: Error) => {
      this.logger.error(`Job ${job.id} failed: ${err.message}`, err.stack);
    });
  }

  async processJob(job: Job<any>): Promise<void> {
    this.logger.log(`Processing comment seeding job with ID ${job.id}`);
    try {
      const { count, post_id } = job.data;
      const comments = await this.factoryService.generateComments(count);

      // Process comments sequentially
      for (const comment of comments) {
        await this.commentsService.create({ ...comment, post_id });
        this.logger.log(`Created comment for post ID ${post_id}`);
      }

      this.logger.log('Comment seeding completed successfully.');
    } catch (error) {
      this.logger.error(
        `Failed to process comment seeding job: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
