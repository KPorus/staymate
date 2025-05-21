import { Injectable, OnModuleInit } from '@nestjs/common';
import { HotelsService } from '../hotels/hotels.service';
import { BookingsService } from '../bookings/bookings.service';

// Define interfaces for type safety
interface Hotel {
  name: string;
  hotel_type: string;
  price_per_night: number;
  rating: number;
  amenities: string[];
}

// interface Booking {
//   userId: string | number;
//   hotelId: string | number;
// }

interface Recommendation {
  name: string;
  score: number;
}

interface FlaskBooking {
  preferred_hotel_type: string;
  max_price: number;
  min_rating: number;
  preferred_amenities: string[];
}

@Injectable()
export class RecommendationsService implements OnModuleInit {
  private readonly flaskUrl = 'http://localhost:5001'; // Adjust to your Flask service URL

  constructor(
    private readonly hotelsService: HotelsService,
    private readonly bookingsService: BookingsService,
  ) {}

  async onModuleInit() {
    try {
      // Fetch all hotels
      const hotels: Hotel[] = await this.hotelsService.allhotels();
      const hotelData = hotels.map((h) => ({
        name: h.name,
        hotel_type: h.hotel_type,
        price_per_night: h.price_per_night,
        rating: h.rating,
        amenities: Array.isArray(h.amenities) ? h.amenities : [],
      }));

      // Send hotels to Flask service for initialization
      const response = await fetch(`${this.flaskUrl}/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotels: hotelData }),
      });

      if (!response.ok) {
        throw new Error(`Failed to initialize hotels: ${response.statusText}`);
      }

      const result: { message: string; hotel_count: number } =
        await response.json();
      console.log(
        `Hotel embeddings initialized: ${(result.message, result.hotel_count)}`,
      );
    } catch (error) {
      console.error('Failed to initialize recommendations:', error.message);
      throw new Error('Failed to initialize recommendations');
    }
  }

  async recommendFor(
    userId: string,
    topK: number = 5,
  ): Promise<Recommendation[]> {
    try {
      // Fetch user bookings
      const bookings = await this.bookingsService.getAllBooking();
      const userBookings = bookings.filter(
        (b) => b.userId.toString() === userId,
      );

      // Prepare booking data for Flask
      const bookingData: FlaskBooking[] = [];
      for (const booking of userBookings) {
        const hotel: Hotel = await this.hotelsService.getHotelById(
          booking.hotelId.toString(),
        );
        bookingData.push({
          preferred_hotel_type: hotel.hotel_type,
          max_price: hotel.price_per_night,
          min_rating: hotel.rating,
          preferred_amenities: Array.isArray(hotel.amenities)
            ? hotel.amenities
            : [],
        });
      }
      console.log(
        'Sending bookingData to Flask:',
        JSON.stringify(
          { user_id: userId, bookings: bookingData, top_k: topK },
          null,
          2,
        ),
      );

      // Send request to Flask recommendation endpoint
      const response = await fetch(`${this.flaskUrl}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          bookings: bookingData,
          top_k: topK,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch recommendations: ${response.statusText}`,
        );
      }

      const { recommendations }: { recommendations: [string, number][] } =
        await response.json();

      // Map response to Recommendation type
      return recommendations.map(([name, score]) => ({
        name,
        score,
      }));
    } catch (error) {
      console.error('Recommendation failed:', error.message);
      throw new Error('Failed to generate recommendations');
    }
  }
}
