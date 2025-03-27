import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking } from 'src/schema/booking';
import { BookingResponse, CreateBookingDto } from './dto';
import { EmailService } from 'src/services/email.service';
import { Users } from 'src/schema/users';
import { Hotels } from 'src/schema/hotels';
import * as crypto from 'crypto';
import { handleMongoErrors } from 'src/utils/error.handle';
@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingsModel: Model<Booking>,
    @InjectModel(Users.name) private usersModel: Model<Users>,
    @InjectModel(Hotels.name) private hotelsModel: Model<Hotels>,
    private readonly emailService: EmailService,
  ) {}
  async create(dto: CreateBookingDto): Promise<BookingResponse> {
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    // console.log('confirmationToken: ', confirmationToken);
    const newBooking = new this.bookingsModel({
      ...dto,
      confirmationToken,
    });

    try {
      const user = await this.usersModel
        .findOne({ _id: dto.userId })
        .select('+email');

      const hotel = await this.hotelsModel.findOne({ _id: dto.hotelId });
      if (!user) {
        throw new NotFoundException('User not found.');
      }
      if (!hotel) {
        throw new NotFoundException('Hotel not found.');
      }
      const savedBooking = await newBooking.save();

      // Create Confirmation Link
      const confirmationLink = `http://localhost:3000/bookings/confirm/${confirmationToken}`;

      // Send Email
      const ConfirmationEmail = await this.emailService.sendConfirmationEmail(
        user.email,
        confirmationLink,
      );

      return { data: savedBooking, message: ConfirmationEmail };
    } catch (error: unknown) {
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

    booking.confirmation = true;
    // // Update booking status
    // booking.status = 'PAID';
    // booking.confirmationToken = null; // Remove token after confirmation
    await booking.save();

    return { message: 'Booking confirmed successfully!' };
  }
}
