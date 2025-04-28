import json
import random
import os

# Load hotel data
base_dir = os.path.dirname(os.path.abspath(__file__))
hotel_path = os.path.join(base_dir, '../data/hotels.json')
os.makedirs(os.path.dirname(hotel_path), exist_ok=True)

if not os.path.exists(hotel_path):
    raise FileNotFoundError(f"Hotel data file not found at {hotel_path}")

with open(hotel_path, 'r') as f:  # <-- use hotel_path here
    hotels = json.load(f)

def generate_bookings(num_bookings=500):
    hotel_types = ['luxury', 'budget', 'boutique', 'resort']
    amenities = ['pool', 'gym', 'spa', 'wifi', 'restaurant', 'bar']

    bookings = []
    for i in range(num_bookings):
        booking = {
            "user_id": f"user_{i}",
            "hotel_id": random.choice(hotels)["name"],
            "preferences": {
                "preferred_hotel_type": random.choice(hotel_types),
                "max_price": random.randint(80, 400),
                "min_rating": round(random.uniform(2.5, 5.0), 1),
                "preferred_amenities": random.sample(amenities, random.randint(1, 4))
            }
        }
        bookings.append(booking)
    return bookings

bookings = generate_bookings()

file_path = os.path.join(base_dir, '../data/bookings.json')

# Make sure the data folder exists
os.makedirs(os.path.dirname(file_path), exist_ok=True)

# ⬇️ now save to the correct file_path
with open(file_path, 'w') as f:
    json.dump(bookings, f, indent=2)

print("✅ bookings.json generated!")
print("Number of bookings generated:", len(bookings))
print("Sample booking:", bookings[0])
