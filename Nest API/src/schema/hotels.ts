import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type HotelsDoc = HydratedDocument<Hotels>;

@Schema()
export class Hotels {
  _id: Types.ObjectId;
  @Prop({ required: true })
  name: string;

  // @Prop({
  //   required: true,
  //   type: {
  //     lat: { type: Number, required: true },
  //     lng: { type: Number, required: true },
  //   },
  // })
  // location: {
  //   lat: number;
  //   lng: number;
  // };

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  })
  location: {
    type: 'Point';
    coordinates: [number, number];
  };

  @Prop({ required: true })
  description: string;

  //   @Prop({ required: true })
  //   image_url: string;
  @Prop({ required: true })
  price_per_night: number;

  @Prop({ required: true })
  rating: number;

  @Prop({ required: true, type: [String] })
  amenities: string[];

  @Prop({ required: true })
  available_rooms: number;
  @Prop({ required: true })
  hotel_type: string;

  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String })
  image_url?: string;
}

export const HotelsSchema = SchemaFactory.createForClass(Hotels);

HotelsSchema.index({ location: '2dsphere' }, { background: true });
HotelsSchema.index({ _id: 1 }, { background: true });
