import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectQueue('user-seed') private readonly userQueue: Queue,
    @InjectQueue('post-seed') private readonly postQueue: Queue,
    @InjectQueue('comment-seed') private readonly commentQueue: Queue,
  ) {}

  /**
   * Adds a user seeding job to the queue, which will seed the database with a specified number of user records.
   *
   * @param count - The number of user records to seed. Defaults to 500 if not provided.
   */
  async seedUsers(count: number = 500) {
    this.logger.log('Adding user seeding job to the queue...');
    await this.userQueue.add('user-seed-job', { count });
  }

  /**
   * Adds a post seeding job to the queue, which will seed the database with a specified number of post records.
   *
   * @param count - The number of post records to seed. Defaults to 500 if not provided.
   */
  async seedPosts(count: number = 500) {
    this.logger.log('Adding post seeding job to the queue...');
    await this.postQueue.add('post-seed-job', { count });
  }

  /**
   * Adds a comment seeding job to the queue, which will seed the database with a specified number of comment records.
   *
   * @param count - The number of comment records to seed. Defaults to 500 if not provided.
   */
  async seedComments(count: number = 500) {
    this.logger.log('Adding comment seeding job to the queue...');
    await this.commentQueue.add('comment-seed-job', { count });
  }
}
