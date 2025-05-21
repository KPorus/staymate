import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Booking, BookingStatus } from 'src/schema/booking';
import { BookingResponse, CreateBookingDto } from './dto';
import { EmailService } from 'src/services/email.service';
import { Users } from 'src/schema/users';
import { Hotels } from 'src/schema/hotels';
import * as crypto from 'crypto';
import { handleMongoErrors } from 'src/utils/error.handle';
import { Cron, CronExpression } from '@nestjs/schedule';
@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);
  constructor(
    @InjectModel(Booking.name) private bookingsModel: Model<Booking>,
    @InjectModel(Users.name) private usersModel: Model<Users>,
    @InjectModel(Hotels.name) private hotelsModel: Model<Hotels>,
    private readonly emailService: EmailService,
  ) {}
  async create(dto: CreateBookingDto): Promise<BookingResponse> {
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const session: ClientSession = await this.bookingsModel.startSession();
    session.startTransaction();

    try {
      // Execute both user lookup and hotel room update in parallel
      const [user, hotel] = await Promise.all([
        this.usersModel
          .findOne({ _id: dto.userId })
          .select('+email')
          .session(session),
        this.hotelsModel.findOneAndUpdate(
          { _id: dto.hotelId, available_rooms: { $gte: dto.booked_rooms } },
          { $inc: { available_rooms: -dto.booked_rooms } },
          { new: true, returnDocument: 'after', session },
        ),
      ]);

      if (!user) {
        throw new NotFoundException('User not found.');
      }
      if (!hotel) {
        throw new NotFoundException(
          'Hotel not found or insufficient rooms available.',
        );
      }

      const newBooking = new this.bookingsModel({
        ...dto,
        confirmationToken,
      });

      const savedBooking = await newBooking.save({ session });
      const confirmationLink = `http://localhost:3000/bookings/confirm/${confirmationToken}`;

      await this.emailService
        .sendConfirmationEmail(user.email, confirmationLink)
        .catch((error) => {
          throw new BadRequestException(
            'Error sending confirmation email: ' + error,
          );
        });

      await session.commitTransaction();
      await session.endSession();

      return {
        data: savedBooking,
        message: 'Confirmation email sent successfully',
      };
    } catch (error: unknown) {
      await session.abortTransaction();
      await session.endSession();
      if (error instanceof Error) {
        handleMongoErrors(error);
      }
      throw new BadRequestException();
    }
  }

  // Confirm Booking via Token
  async confirmBooking(token: string): Promise<{ message: string }> {
    const booking = await this.bookingsModel.findOne({
      confirmationToken: token,
    });

    if (!booking) {
      throw new NotFoundException('Invalid or expired confirmation token.');
    }

    booking.status = BookingStatus.CONFIRM;
    // booking.confirmationToken = null; // Remove token after confirmation
    await booking.save();

    return { message: 'Booking confirmed successfully!' };
  }

  @Cron(CronExpression.EVERY_HOUR)
  @Cron('*/1 * * * *')
  async cancelUnconfirmedBookings() {
    this.logger.log('Running Cron Job: Checking for expired bookings...');
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 hours ago

    const result = await this.bookingsModel.updateMany(
      { status: BookingStatus.PENDING, createdAt: { $lte: oneDayAgo } },
      { $set: { status: BookingStatus.CANCELLED } },
    );

    if (result.modifiedCount > 0) {
      this.logger.log(
        `${result.modifiedCount} bookings were automatically canceled.`,
      );
    } else {
      this.logger.log('No bookings needed cancellation.');
    }
  }

  async getUserBookings(userId: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const bookings = await this.bookingsModel.aggregate([
        { $match: { userId } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'hotels',
            localField: 'hotelId',
            foreignField: '_id',
            as: 'hotel',
          },
        },
        { $unwind: '$hotel' },
        {
          $project: {
            id: '$_id',
            hotelName: '$hotel.name',
            checkInDate: '$check_in_date',
            checkOutDate: '$check_out_date',
            status: '$status',
            bookedRoom: '$booked_rooms',
            totalPrice: '$total_price',
          },
        },
      ]);

      const totalBookings = await this.bookingsModel.countDocuments({ userId });
      const totalPages = Math.ceil(totalBookings / limit);

      if (!bookings.length) {
        throw new NotFoundException('No bookings found for this user.');
      }

      return {
        data: bookings,
        pagination: {
          page,
          limit,
          totalBookings,
          totalPages,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        handleMongoErrors(error);
      }
      throw new BadRequestException();
    }
  }
  async getAllBooking(): Promise<Booking[]> {
    try {
      const bookings = await this.bookingsModel.find();

      if (!bookings.length) {
        throw new NotFoundException('No bookings found.');
      }

      return bookings;
    } catch (error) {
      if (error instanceof Error) {
        handleMongoErrors(error);
      }
      throw new BadRequestException();
    }
  }
}
