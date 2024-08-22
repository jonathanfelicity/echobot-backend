import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
