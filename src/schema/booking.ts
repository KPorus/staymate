import { BadRequestException } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BookingDoc = HydratedDocument<Booking>;

export enum BookingStatus {
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  CONFIRM = 'CONFIRM',
}

export enum PaymentStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
}

export enum PaymentType {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}
export enum Confirmation {
  FALSE = 'FALSE',
  TRUE = 'TRUE',
}

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Hotels', required: true })
  hotelId: Types.ObjectId;

  @Prop({ required: true })
  check_in_date: Date;

  @Prop({ required: true })
  check_out_date: Date;

  @Prop({ required: true, min: 0 })
  total_price: number;

  @Prop({ required: true, min: 1 })
  booked_rooms: number;

  @Prop({ required: true, enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.UNPAID })
  paymentStatus: PaymentStatus;

  @Prop({ required: true, enum: PaymentType })
  paymentType: PaymentType;

  @Prop({ required: false })
  confirmationToken?: string;

  // @Prop({ type: Types.ObjectId, ref: 'PaymentMethods', required: true })
  // paymentMethodId: Types.ObjectId;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
BookingSchema.index({ userId: 1, status: 1 }, { background: true });
BookingSchema.index({ hotelId: 1 }, { background: true });
BookingSchema.index({ userId: 1 }, { background: true });

// Ensure check_out_date is after check_in_date
BookingSchema.pre('save', function (next) {
  if (this.check_out_date <= this.check_in_date) {
    return next(
      new BadRequestException('Check-out date must be after check-in date'),
    );
  }
  next();
});
