import { Controller, UseGuards, Post, Body } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto';

@Controller('bookings')
@UseGuards(JwtGuard)
export class BookingsController {
  constructor(private readonly BookingsService: BookingsService) {}

  @Post('/create')
  createBooking(@Body() dto: CreateBookingDto) {
    // console.log(dto);
    return this.BookingsService.create(dto);
  }
}
