import { Logger, Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { AwsConfigService } from 'src/storage/aws-config.service';
import { CompressService } from './compress.service';

@Module({
  imports: [],
  providers: [StorageService, CompressService, AwsConfigService, Logger],
  exports: [StorageService],
})
export class StorageModule {}
