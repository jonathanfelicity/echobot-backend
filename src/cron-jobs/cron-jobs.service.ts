import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import FactoryService from 'src/database/factory.service';

@Injectable()
export class CronJobsService {
  private readonly logger: Logger;

  constructor(private readonly factoryService: FactoryService) {
    this.logger = new Logger(CronJobsService.name);
  }

  //   EVERY_HOUR
  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    const users = await this.factoryService.generateUsers();
    console.log(users);
    this.logger.debug('performed cron job');
  }
}
