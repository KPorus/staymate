import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNumber,
  Min,
} from 'class-validator';
import { Booking, BookingStatus, PaymentType } from '../../schema/booking';

export class CreateBookingDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  hotelId: string;

  @IsDate()
  check_in_date: Date;

  @IsDate()
  check_out_date: Date;

  @IsNumber()
  @Min(0)
  total_price: number;

  @IsNumber()
  @Min(1)
  booked_rooms: number;

  @IsEnum(BookingStatus)
  status: BookingStatus;

  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @IsBoolean()
  confirmation: boolean;
}

export interface BookingResponse {
  data: Booking;
  message: string;
}
