import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SeederService } from 'src/database/seeder.service';

@Injectable()
export class CronJobsService {
  private readonly logger: Logger;

  constructor(private readonly seederService: SeederService) {
    this.logger = new Logger(CronJobsService.name);
  }

  /**
   * Runs a cron job every hour to seed a specified number of users into the database.
   *
   * This method is annotated with the `@Cron` decorator from the `@nestjs/schedule` package,
   * which schedules it to run on the `CronExpression.EVERY_HOUR` schedule (once per hour).
   *
   * When the cron job runs, it logs a debug message, then calls the `seedUsers` method of the
   * `SeederService` to add the specified number of users to the database. It then logs a
   * debug message with the number of users that were added.
   *
   * If an error occurs during the seeding process, an error log message is written instead.
   */
  @Cron(CronExpression.EVERY_WEEK)
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
