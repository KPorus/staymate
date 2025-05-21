import { Module } from '@nestjs/common';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Hotels, HotelsSchema } from 'src/schema/hotels';
import { Booking, BookingSchema } from 'src/schema/booking';
import { HotelsService } from 'src/hotels/hotels.service';
import { BookingsService } from 'src/bookings/bookings.service';
import { S3Service } from 'src/s3/s3.service';
import { Users, UserSchema } from 'src/schema/users';
import { EmailService } from 'src/services/email.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Hotels.name, schema: HotelsSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Users.name, schema: UserSchema },
    ]),
  ],
  controllers: [RecommendationsController],
  providers: [
    RecommendationsService,
    HotelsService,
    BookingsService,
    EmailService,
    S3Service,
  ],
})
export class RecommendationsModule {}
