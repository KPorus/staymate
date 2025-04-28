import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from 'src/schema/booking';
import { Hotels, HotelsSchema } from 'src/schema/hotels';
import { Users, UserSchema } from 'src/schema/users';
import { EmailService } from 'src/services/email.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Hotels.name, schema: HotelsSchema },
      { name: Users.name, schema: UserSchema },
    ]),
  ],
  providers: [BookingsService, EmailService],
  controllers: [BookingsController],
})
export class BookingsModule {}
