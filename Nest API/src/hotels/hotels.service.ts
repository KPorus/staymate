import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hotels } from 'src/schema/hotels';
import { handleMongoErrors } from 'src/utils/error.handle';
import { CreateHotelDto, UpdateHotelDto } from './dto';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class HotelsService {
  constructor(
    @InjectModel(Hotels.name) private hotelsModel: Model<Hotels>,
    private readonly s3: S3Service,
  ) {}

  async allhotels(): Promise<Hotels[]> {
    const hotels = await this.hotelsModel
      .find()
      .select({ location: 0, amenities: 0 });

    if (hotels.length === 0) {
      throw new NotFoundException('No hotels found');
    }

    return hotels;
  }

  async findNearbyHotels(lat: number, lng: number) {
    try {
      const hotels = await this.hotelsModel.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat],
            },
            $maxDistance: 100 * 1000,
          },
        },
      });
      if (hotels.length === 0) {
        throw new NotFoundException('No nearby hotels found');
      }
      return hotels;
    } catch (error: unknown) {
      if (error instanceof Error) {
        handleMongoErrors(error);
      }
      throw new BadRequestException();
    }
  }

  async addHotels(file: Express.Multer.File, hotels: CreateHotelDto) {
    const session = await this.hotelsModel.db.startSession();
    session.startTransaction();
    try {
      const url = await this.s3.uploadImage(file);
      hotels.image_url = url;
      const newHotel = await this.hotelsModel.create([hotels], { session });
      await session.commitTransaction();
      await session.endSession();
      return newHotel;
    } catch (error: unknown) {
      await session.abortTransaction();
      await session.endSession();
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
  // async updateHotelById(id: string, dto: UpdateHotelDto): Promise<Hotels> {
  //   try {
  //     const hotel = await this.hotelsModel.findByIdAndUpdate(id, dto, {
  //       new: true,
  //       runValidators: true,
  //     });

  //     if (!hotel) {
  //       throw new NotFoundException('Hotel not found');
  //     }
  //     return hotel;
  //   } catch (error: unknown) {
  //     if (error instanceof Error) {
  //       handleMongoErrors(error);
  //     }
  //     throw new BadRequestException();
  //   }
  // }

  async updateHotelById(
    id: string,
    dto: UpdateHotelDto,
    managerId: string,
  ): Promise<Hotels> {
    const session = await this.hotelsModel.db.startSession();
    session.startTransaction();

    try {
      const updatedHotel = await this.hotelsModel.findOneAndUpdate(
        { _id: id, userId: managerId },
        dto,
        { new: true, runValidators: true, session },
      );
      if (!updatedHotel) {
        throw new NotFoundException('Hotel not found or not managed by you');
      }

      await session.commitTransaction();
      await session.endSession();
      return updatedHotel;
    } catch (error: unknown) {
      await session.abortTransaction();
      await session.endSession();
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
