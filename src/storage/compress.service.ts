import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

@Injectable()
export class CompressService {
  async compressImage(
    imageBuffer: Buffer,
    width: number,
    height: number,
  ): Promise<Buffer> {
    return sharp(imageBuffer).resize(width, height).toBuffer();
  }
}
