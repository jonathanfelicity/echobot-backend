import { Injectable, Logger } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import FactoryService from '../factory.service';

@Injectable()
export class UserSeedProcessor {
  private readonly logger = new Logger(UserSeedProcessor.name);

  constructor(private readonly factoryService: FactoryService) {
    this.setupWorker();
  }

  private setupWorker() {
    const worker = new Worker('user-seed', this.processJob.bind(this), {
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
    this.logger.log(`Processing user seeding job with ID ${job.id}`);
    try {
      const { count } = job.data;
      await this.factoryService.generateUsers(count);
      this.logger.log('User seeding completed successfully.');
    } catch (error) {
      this.logger.error(`Failed to process user seeding job: ${error.message}`);
      throw error;
    }
  }
}
