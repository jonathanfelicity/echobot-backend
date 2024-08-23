import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CacheModule } from '@nestjs/cache-manager';
import FactoryService from './factory.service';
import { SeederService } from './seeder.service';
import { RequestsModule } from 'src/requests/requests.module';
import { CounterService } from 'src/counter/counter.service';
import { UserSeedProcessor } from './seeders/user-seed-processor';
import { PostSeedProcessor } from './seeders/post-seed-processor';
import { CommentSeedProcessor } from './seeders/comment-seed-processor';
import { BullModule } from '@nestjs/bullmq';
import { UsersModule } from 'src/users/users.module';
import { PostsModule } from 'src/posts/posts.module';
import { CommentsModule } from 'src/comments/comments.module';
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
    BullModule.registerQueue(
      { name: 'user-seed' },
      { name: 'post-seed' },
      { name: 'comment-seed' },
    ),
    RequestsModule,
    forwardRef(() => UsersModule),
    forwardRef(() => PostsModule),
    forwardRef(() => CommentsModule),
  ],
  providers: [
    PrismaService,
    CounterService,
    FactoryService,
    SeederService,
    UserSeedProcessor,
    PostSeedProcessor,
    CommentSeedProcessor,
  ],
  exports: [PrismaService, FactoryService, SeederService],
})
export class DatabaseModule {}
