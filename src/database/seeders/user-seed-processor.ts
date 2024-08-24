import { Injectable, Logger } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import FactoryService from '../factory.service';
import { UsersService } from 'src/users/users.service';
import { SeederService } from '../seeder.service';
import { User } from '@prisma/client';
import { UsersGateway } from 'src/users/users.gateway';

@Injectable()
export class UserSeedProcessor {
  private readonly logger = new Logger(UserSeedProcessor.name);

  constructor(
    private readonly factoryService: FactoryService,
    private readonly userService: UsersService,
    private readonly seederService: SeederService,
    private readonly usersGateway: UsersGateway,
  ) {
    this.setupWorker();
  }

  private setupWorker() {
    const worker = new Worker('user-seed', this.processJob.bind(this), {
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
    this.logger.log(`Processing user seeding job with ID ${job.id}`);
    try {
      const { count } = job.data;
      const users = await this.factoryService.generateUsers(count);

      for (const user of users) {
        const newUser: User = await this.userService.create(user);
        console.log('New Users', newUser);
        this.logger.log(`Created new user: ${newUser.id}`);

        // Seed posts only after user is successfully created
        const total_user = await this.userService.getTotalUsers();
        this.usersGateway.emitToAll('count-update', total_user);
        await this.seederService.seedPosts(10, newUser.id);
      }

      this.logger.log('User seeding completed successfully.');
    } catch (error) {
      this.logger.error(`Failed to process user seeding job: ${error.message}`);
      throw error;
    }
  }
}
