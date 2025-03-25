import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';

export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
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

  @Prop({ required: true, default: Date.now() })
  created_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(Users);
