import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CacheModule } from '@nestjs/cache-manager';
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
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
