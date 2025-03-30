import { Controller, UseGuards, Post, Body, Get, Param } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { BookingsService } from './bookings.service';
import { BookingResponse, CreateBookingDto } from './dto';
import { AdminGuard } from 'src/auth/guard/admin.guard';

@Controller('bookings')
@UseGuards(JwtGuard)
export class BookingsController {
  constructor(private readonly BookingsService: BookingsService) {}

  @Post('/create')
  createBooking(@Body() dto: CreateBookingDto): Promise<BookingResponse> {
    // console.log(dto);
    return this.BookingsService.create(dto);
  }

  @Get('/user/:id')
  getUserBookings(@Param() Param: { id: string; page: number }) {
    return this.BookingsService.getUserBookings(Param.id, Param.page);
  }
  @Get('run-cron')
  @UseGuards(AdminGuard)
  async testCron() {
    await this.BookingsService.cancelUnconfirmedBookings();
    return 'Cron job function executed!';
  }
}
