import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  GetObjectCommandInput,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import * as sharp from 'sharp';
import { Stream } from 'stream';
// import * as Tesseract from 'tesseract.js';

@Injectable()
export class S3Service {
  // private readonly s3 = new S3Client({
  //   region: this.config.get<string>('AWS_REGION'),
  //   credentials: {
  //     accessKeyId: this.config.get('AWS_ACCESS_KEY_ID'),
  //     secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY'),
  //   },
  // });

  // constructor(private config: ConfigService) {}

  private readonly s3: S3Client;

  constructor(private readonly config: ConfigService) {
    this.s3 = new S3Client({
      region: this.config.get<string>('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID') ?? '',
        secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY') ?? '',
      },
    });
  }

  async uploadImage(file: Express.Multer.File) {
    const params: PutObjectCommandInput = {
      Bucket: this.config.get('BUCKET_NAME'),
      Key: `${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL: 'public-read',
    };

    const response = await this.s3.send(new PutObjectCommand(params));
    if (response.$metadata.httpStatusCode === 200) {
      return `https://${params.Bucket}.s3.${this.config.get('AWS_REGION')}.amazonaws.com/${params.Key}`;
    }
    throw new BadRequestException('Image not saved in s3!');
  }
  async downloadImageFromS3(key: string): Promise<Buffer> {
    const params: GetObjectCommandInput = {
      Bucket: this.config.get<string>('BUCKET_NAME'),
      Key: key,
    };
    try {
      const response = await this.s3.send(new GetObjectCommand(params));
      const stream = response.Body as Stream & {
        [Symbol.asyncIterator](): AsyncIterableIterator<Uint8Array>;
      };
      const chunks: Uint8Array[] = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (err) {
      console.error('Error downloading image from S3:', err.message);
      throw new Error('Failed to download image from S3');
    }
  }

  //   async processAndBlurImage(key: string, idToBlur: string) {
  //     try {
  //       const imageBuffer = await this.downloadImageFromS3(key);
  //       const {
  //         data: { words },
  //       } = await Tesseract.recognize(imageBuffer);

  //       let idRegion;
  //       for (const word of words) {
  //         if (word.text === idToBlur) {
  //           idRegion = word.bbox;
  //           break;
  //         }
  //       }

  //       if (!idRegion) {
  //         // throw new Error(`ID "${idToBlur}" not found in the image.`);
  //         return {
  //           status: 400,
  //           message: 'Text not found in the image.',
  //         };
  //       }

  //       const blurredImageBuffer = await sharp(imageBuffer)
  //         .blur(10) // Blur intensity
  //         // .extract({
  //         //   left: idRegion.x0,
  //         //   top: idRegion.y0,
  //         //   width: idRegion.x1 - idRegion.x0,
  //         //   height: idRegion.y1 - idRegion.y0,
  //         // })
  //         .toBuffer();

  //       const blurredImageKey = `${key}`;
  //       const uploadResponse = await this.uploadImage({
  //         buffer: blurredImageBuffer,
  //         originalname: blurredImageKey,
  //         mimetype: 'image/jpeg',
  //       } as Express.Multer.File);

  //       return { URL: `${uploadResponse}`, message: 'Info matched', status: 200 };
  //     } catch (err) {
  //       console.error('Error processing and blurring image:', err.message);
  //       throw new Error('Failed to process and blur the image');
  //     }
  //   }
}
