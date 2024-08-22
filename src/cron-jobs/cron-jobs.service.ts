import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import FactoryService from 'src/database/factory.service';

@Injectable()
export class CronJobsService {
  private readonly logger: Logger;

  constructor(private readonly factoryService: FactoryService) {
    this.logger = new Logger(CronJobsService.name);
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  handleCron() {
    this.logger.debug('performed cron job');
  }
}
