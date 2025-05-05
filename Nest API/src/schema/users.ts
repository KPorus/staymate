import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export enum UserRole {
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@NestSchema()
export class Users {
  _id: string;
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ type: Types.ObjectId, ref: 'Bookings' })
  bookingId: Types.ObjectId;

  @Prop({ required: true, default: Date.now() })
  created_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(Users);
