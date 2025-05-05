import { Module } from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { HotelsController } from './hotels.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Hotels, HotelsSchema } from 'src/schema/hotels';
import { S3Service } from 'src/s3/s3.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hotels.name, schema: HotelsSchema }]),
  ],
  controllers: [HotelsController],
  providers: [HotelsService, S3Service],
})
export class HotelsModule {}
