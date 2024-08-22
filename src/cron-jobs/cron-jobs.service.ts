import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SeederService } from 'src/database/seeder.service';

@Injectable()
export class CronJobsService {
  private readonly logger: Logger;

  constructor(private readonly seederService: SeederService) {
    this.logger = new Logger(CronJobsService.name);
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    this.logger.debug('Starting user seeding job...');
    try {
      // Define the number of users to seed
      const userCount = 500;
      await this.seederService.seedUsers(userCount);
      this.logger.debug(
        `User seeding job added to the queue with ${userCount} users.`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to add user seeding job to the queue',
        error.stack,
      );
    }
  }
}
