import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { HotelsModule } from './hotels/hotels.module';
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [
    DatabaseModule,
    HotelsModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BookingsModule,
  ],
})
export class AppModule {}
