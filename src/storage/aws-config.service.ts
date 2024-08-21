// aws-config.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class AwsConfigService {
  constructor(private readonly configService: ConfigService) {
    const awsConfig = {
      region: configService.getOrThrow('AWS_REGION'),
      accessKeyId: configService.getOrThrow('AWS_ACCESS_KEY_ID'),
      secretAccessKey: configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
    };
    AWS.config.update(awsConfig);
  }

  getAWS() {
    return AWS;
  }
}
