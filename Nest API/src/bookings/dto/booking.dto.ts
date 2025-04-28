import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import {
  Booking,
  BookingStatus,
  PaymentStatus,
  PaymentType,
} from '../../schema/booking';

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

  @IsOptional()
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus: BookingStatus;

  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @IsBoolean()
  confirmation: boolean;
}

export interface BookingResponse {
  data: Booking;
  message: string;
}
