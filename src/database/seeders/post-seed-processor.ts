import { Injectable, Logger } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import FactoryService from '../factory.service';
import { PostsService } from 'src/posts/posts.service';
import { SeederService } from '../seeder.service';
import { Post } from '@prisma/client';

@Injectable()
export class PostSeedProcessor {
  private readonly logger = new Logger(PostSeedProcessor.name);

  constructor(
    private readonly factoryService: FactoryService,
    private readonly postsService: PostsService,
    private readonly seederService: SeederService,
  ) {
    this.setupWorker();
  }

  private setupWorker() {
    const worker = new Worker('post-seed', this.processJob.bind(this), {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      },
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
      const { count, user_id } = job.data;
      const posts = await this.factoryService.generatePosts(count);

      // Process posts sequentially
      for (const post of posts) {
        const newPost: Post = await this.postsService.create({
          ...post,
          user_id,
        });
        this.logger.log(`Created new post with ID: ${newPost.id}`);

        // Seed comments only after post is successfully created
        await this.seederService.seedComments(10, newPost.id);
      }

      this.logger.log('Post seeding completed successfully.');
    } catch (error) {
      this.logger.error(
        `Failed to process post seeding job: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
