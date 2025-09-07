import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ collection: 'users', timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fullName: string;

  @Prop()
  phone: string;

  @Prop({
    required: true,
    enum: ['customer', 'admin', 'staff'],
    default: 'customer',
  })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
