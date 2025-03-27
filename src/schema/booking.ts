import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BookingDoc = HydratedDocument<Booking>;

@Schema()
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Hotels', required: true })
  hotelId: Types.ObjectId;

  @Prop({ required: true })
  check_in_date: Date;

  @Prop({ required: true })
  check_out_date: Date;

  @Prop({ required: true })
  total_price: number;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
