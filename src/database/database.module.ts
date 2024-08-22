import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CacheModule } from '@nestjs/cache-manager';
import FactoryService from './factory.service';
import SeedingService from './seeding.service';
import { RequestsModule } from 'src/requests/requests.module';
/**
 * The database module that handles connecting to the database.
 */

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: 'ioredis',
      socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
    }),
    RequestsModule,
  ],
  providers: [PrismaService, FactoryService, SeedingService],
  exports: [PrismaService, FactoryService, SeedingService],
})
export class DatabaseModule {}
