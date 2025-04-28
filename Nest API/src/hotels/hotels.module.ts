import { Module } from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { HotelsController } from './hotels.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Hotels, HotelsSchema } from 'src/schema/hotels';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hotels.name, schema: HotelsSchema }]),
  ],
  controllers: [HotelsController],
  providers: [HotelsService],
})
export class HotelsModule {}
