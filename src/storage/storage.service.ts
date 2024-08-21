import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AwsConfigService } from 'src/storage/aws-config.service';
import * as AWS from 'aws-sdk';
import { CompressService } from './compress.service';

@Injectable()
export class StorageService {
  private s3: AWS.S3;
  private bucketName: string;

  /**
   * Constructs the StorageService.
   * @param configService ConfigService instance for accessing application configurations.
   * @param awsConfigService AwsConfigService instance for AWS configurations.
   * @param CompressService ImageCompressor instance for compressing images.
   * @param logger Logger instance for logging.
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly awsConfigService: AwsConfigService,
    private readonly compressService: CompressService,
    private readonly logger: Logger,
  ) {
    this.s3 = new AWS.S3(awsConfigService.getAWS().config);
    this.bucketName = this.configService.getOrThrow<string>('AWS_S3_BUCKET');
  }

  /**
   * Uploads a file to AWS S3 bucket.
   * @param filePath Path to upload the file to.
   * @param fileData Buffer containing file data to upload.
   * @returns URL of the uploaded file.
   */
  async uploadFile(filePath: string, fileData: Buffer): Promise<string> {
    const uploadParams = {
      Bucket: this.bucketName,
      Key: filePath,
      Body: fileData,
    };

    try {
      const uploadResult = await this.s3.upload(uploadParams).promise();
      return uploadResult.Location;
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  /**
   * Uploads a compressed image to AWS S3 bucket.
   * @param filePath Path to upload the image to.
   * @param imageData Buffer containing image data to compress and upload.
   * @param width Desired width of the compressed image.
   * @param height Desired height of the compressed image.
   * @returns URL of the uploaded compressed image.
   */
  async uploadCompressedImage(
    filePath: string,
    imageData: Buffer,
    width: number,
    height: number,
  ): Promise<string> {
    const compressedImage = await this.compressService.compressImage(
      imageData,
      width,
      height,
    );
    return this.uploadFile(filePath, compressedImage);
  }

  /**
   * Downloads a file from AWS S3 bucket.
   * @param fileId ID of the file to download.
   * @returns Buffer containing the downloaded file data.
   */
  async downloadFile(fileId: string): Promise<Buffer> {
    const downloadParams = {
      Bucket: this.bucketName,
      Key: fileId,
    };

    try {
      const downloadResult = await this.s3.getObject(downloadParams).promise();
      return downloadResult.Body as Buffer;
    } catch (error) {
      throw new InternalServerErrorException('Failed to download file');
    }
  }

  /**
   * Deletes a file from AWS S3 bucket.
   * @param fileId ID of the file to delete.
   */
  async deleteFile(fileId: string): Promise<void> {
    const deleteParams = {
      Bucket: this.bucketName,
      Key: fileId,
    };

    try {
      await this.s3.deleteObject(deleteParams).promise();
      this.logger.log(`File deleted successfully: ${fileId}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${fileId}`, error.stack);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }
}
