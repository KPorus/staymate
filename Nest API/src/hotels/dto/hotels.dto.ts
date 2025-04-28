import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreateHotelDto {
  @IsString()
  name: string;

  @IsOptional()
  location: {
    lat: number;
    lng: number;
  };

  @IsNumber()
  price_per_night: number;

  @IsNumber()
  rating: number;

  @IsArray()
  amenities: string[];

  @IsNumber()
  available_rooms: number;

  @IsString()
  hotel_type: string;

  @IsString()
  userId: string;
}

export class UpdateHotelDto extends PartialType(CreateHotelDto) {}
