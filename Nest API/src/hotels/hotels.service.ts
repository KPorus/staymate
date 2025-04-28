import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hotels } from 'src/schema/hotels';
import { handleMongoErrors } from 'src/utils/error.handle';
import { UpdateHotelDto } from './dto';

@Injectable()
export class HotelsService {
  constructor(@InjectModel(Hotels.name) private hotelsModel: Model<Hotels>) {}

  async allhotels(): Promise<Hotels[]> {
    const hotels = await this.hotelsModel
      .find()
      .select({ location: 0, amenities: 0 });

    if (hotels.length === 0) {
      throw new NotFoundException('No hotels found');
    }

    return hotels;
  }

  async addHotels(file: Express.Multer.File, hotels: Hotels) {
    try {
      return await new this.hotelsModel(hotels).save();
    } catch (error: unknown) {
      if (error instanceof Error) {
        handleMongoErrors(error);
      }
      throw new BadRequestException();
    }
  }

  async getHotelById(id: string): Promise<Hotels> {
    try {
      const hotel = await this.hotelsModel.findById(id);
      if (!hotel) {
        throw new NotFoundException('Hotel not found');
      }
      return hotel;
    } catch (error: unknown) {
      if (error instanceof Error) {
        handleMongoErrors(error);
      }
      throw new BadRequestException();
    }
  }
  async updateHotelById(id: string, dto: UpdateHotelDto): Promise<Hotels> {
    try {
      const hotel = await this.hotelsModel.findByIdAndUpdate(id, dto, {
        new: true,
        runValidators: true,
      });

      if (!hotel) {
        throw new NotFoundException('Hotel not found');
      }
      return hotel;
    } catch (error: unknown) {
      if (error instanceof Error) {
        handleMongoErrors(error);
      }
      throw new BadRequestException();
    }
  }
  async deleteHotelById(id: string) {
    try {
      const hotel = await this.hotelsModel.deleteOne({ _id: id });

      if (hotel.deletedCount === 0) {
        throw new NotFoundException('Hotel not found');
      }
      return { message: 'Hotel deleted successfully' };
    } catch (error: unknown) {
      if (error instanceof Error) {
        handleMongoErrors(error);
      }
      throw new BadRequestException();
    }
  }
}
