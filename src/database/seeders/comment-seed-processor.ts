import { Injectable, Logger } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import FactoryService from '../factory.service';

@Injectable()
export class CommentSeedProcessor {
  private readonly logger = new Logger(CommentSeedProcessor.name);

  constructor(private readonly factoryService: FactoryService) {
    this.setupWorker();
  }

  private setupWorker() {
    const worker = new Worker('comment-seed', this.processJob.bind(this), {
      connection: { host: 'localhost', port: 6379 }, // Redis configuration
    });

    worker.on('completed', (job: Job) => {
      this.logger.log(`Job ${job.id} completed.`);
    });

    worker.on('failed', (job: Job, err: Error) => {
      this.logger.error(`Job ${job.id} failed: ${err.message}`);
    });
  }

  async processJob(job: Job<any>): Promise<void> {
    this.logger.log(`Processing comment seeding job with ID ${job.id}`);
    try {
      const { count } = job.data;
      await this.factoryService.generateComments(count);
      this.logger.log('Comment seeding completed successfully.');
    } catch (error) {
      this.logger.error(
        `Failed to process comment seeding job: ${error.message}`,
      );
      throw error;
    }
  }
}
