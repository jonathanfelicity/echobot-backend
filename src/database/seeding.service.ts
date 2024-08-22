import { Injectable, Logger } from '@nestjs/common';
import FactoryService from './factory.service';

@Injectable()
export default class SeedingService {
  private readonly logger: Logger;

  constructor(private readonly factoryService: FactoryService) {
    this.logger = new Logger(SeedingService.name);
  }

  async seedUsers() {
    this.logger.log('Seeding users...');
    await this.factoryService.generateUsers();
    this.logger.log('Users seeded successfully.');
  }

  async seedPosts() {
    this.logger.log('Seeding posts...');
    await this.factoryService.generatePosts();
    this.logger.log('Posts seeded successfully.');
  }

  async seedComments() {
    this.logger.log('Seeding comments...');
    await this.factoryService.generateComments();
    this.logger.log('Comments seeded successfully.');
  }
}
