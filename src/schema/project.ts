import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProjectDocument = Projects & Document;

@NestSchema()
export class Projects {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  details: string;

  //   @Prop({ required: true })
  img: string;

  @Prop({ required: true, type: [String] })
  feature: string[];

  @Prop({ required: true, type: [String] })
  TECHNOLOGY: string[];

  @Prop({ required: true })
  client: string;

  @Prop({ required: true })
  live: string;

  @Prop({ required: true })
  server: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Projects);
