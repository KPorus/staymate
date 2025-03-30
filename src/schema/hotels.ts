import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type HotelsDoc = HydratedDocument<Hotels>;

@Schema()
export class Hotels {
  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    type: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  })
  location: {
    lat: number;
    lng: number;
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
}

export const HotelsSchema = SchemaFactory.createForClass(Hotels);

HotelsSchema.index({ location: '2dsphere' }, { background: true });
HotelsSchema.index({ _id: 1 }, { background: true });
