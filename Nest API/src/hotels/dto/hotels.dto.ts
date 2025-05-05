import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsIn,
  ArrayNotEmpty,
  IsOptional,
  IsObject,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

// export class LocationDto {
//   @IsString()
//   @IsIn(['Point'])
//   type: string;

//   @IsArray()
//   @ArrayMinSize(2)
//   @IsNumber({}, { each: true })
//   coordinates: number[]; // [longitude, latitude]
// }
export class CreateHotelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  // @ValidateNested()
  // @Type(() => LocationDto)
  // location: LocationDto;
  @IsObject()
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  price_per_night: number;

  @IsNumber()
  rating: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  amenities: string[];

  @IsNumber()
  available_rooms: number;

  @IsString()
  @IsIn(['luxury', 'budget', 'boutique', 'resort'])
  hotel_type: string;

  @IsOptional()
  image_url: string;

  @IsString()
  @IsOptional()
  userId: string;
}

export class UpdateHotelDto extends PartialType(CreateHotelDto) {}

export class NearbyHotelsDto {
  latitude: number;
  longitude: number;
}
