import {
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { MongoError } from 'mongodb';

export const handleMongoErrors = (error: any, customMessage?: string) => {
  if (error instanceof MongoError) {
    if (error.code === 11000) {
      throw new ConflictException(customMessage || 'User Already exists');
    }
  }
  // Handle Mongoose CastError (Invalid ObjectId)
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    throw new BadRequestException(
      customMessage || `Invalid ID format for field "${error.path}"`,
    );
  }
  // Check for Validation Errors
  if (error.name === 'ValidationError') {
    throw new BadRequestException(
      customMessage || 'Validation failed: ' + error.message,
    );
  }

  // Handle other types of MongoDB errors here if needed (e.g., network issues, timeouts)
  if (error.name === 'MongoNetworkError') {
    throw new InternalServerErrorException(
      customMessage || 'Database connection error',
    );
  }

  throw error;
};
