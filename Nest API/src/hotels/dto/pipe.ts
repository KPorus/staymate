import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseGeoCoordinatesPipe implements PipeTransform {
  transform(value: any) {
    if (
      !value?.location?.coordinates ||
      !Array.isArray(value.location.coordinates) ||
      value.location.coordinates.length !== 2
    ) {
      throw new BadRequestException('Invalid location coordinates');
    }

    const [lng, lat] = value.location.coordinates.map(Number);
    console.log(lng, lat);
    if (
      isNaN(lng) ||
      isNaN(lat) ||
      lng < -180 ||
      lng > 180 ||
      lat < -90 ||
      lat > 90
    ) {
      throw new BadRequestException(
        'Coordinates must be valid longitude and latitude values',
      );
    }

    value.location.coordinates = [+lng.toFixed(6), +lat.toFixed(6)];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
  }
}
