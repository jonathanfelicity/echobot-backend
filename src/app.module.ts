import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './users/users.module';
import { RequestsService } from './requests/requests.service';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    CacheModule.register({
      ttl: 5,
      max: 100,
    }),
    HttpModule,
    UsersModule,
    PostsModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [
    Logger,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService,
    RequestsService,
  ],
})
export class AppModule {}
