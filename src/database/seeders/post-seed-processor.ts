import { Injectable, Logger } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import FactoryService from '../factory.service';

@Injectable()
export class PostSeedProcessor {
  private readonly logger = new Logger(PostSeedProcessor.name);

  constructor(private readonly factoryService: FactoryService) {
    this.setupWorker();
  }

  private setupWorker() {
    const worker = new Worker('post-seed', this.processJob.bind(this), {
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
    this.logger.log(`Processing post seeding job with ID ${job.id}`);
    try {
      const { count } = job.data;
      await this.factoryService.generatePosts(count);
      this.logger.log('Post seeding completed successfully.');
    } catch (error) {
      this.logger.error(`Failed to process post seeding job: ${error.message}`);
      throw error;
    }
  }
}
