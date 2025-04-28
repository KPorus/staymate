import random
import json, os

# 1. Generate synthetic hotel data
def generate_hotel_data(num_hotels=200):
    hotel_types = ['luxury', 'budget', 'boutique', 'resort']
    amenities = ['pool', 'gym', 'spa', 'wifi', 'restaurant', 'bar']

    hotels = []
    for _ in range(num_hotels):
        hotel = {
            "name": f"Hotel_{random.randint(1,10000)}",
            "location": {
                "lat": round(random.uniform(10.0, 50.0), 6),
                "lng": round(random.uniform(10.0, 50.0), 6),
            },
            "hotel_type": random.choice(hotel_types),
            "price_per_night": random.randint(50, 500),
            "rating": round(random.uniform(2.0, 5.0), 1),
            "amenities": random.sample(amenities, random.randint(1, 6)),
        }
        hotels.append(hotel)
    return hotels

# Save hotels.json
hotels = generate_hotel_data()


base_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(base_dir, '../data/hotels.json')

# Make sure the data folder exists
os.makedirs(os.path.dirname(file_path), exist_ok=True)
with open(file_path, 'w') as f:
    json.dump(hotels, f, indent=2)

print("✅ hotels.json generated!")
print("Number of hotels generated:", len(hotels))
print("Sample hotel:", hotels[0])