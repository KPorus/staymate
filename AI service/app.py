from flask import Flask, request, jsonify
import torch
import torch.nn as nn
import json,os

app = Flask(__name__)

# Load hotel data
base_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(base_dir, './data/hotels.json')

os.makedirs(os.path.dirname(file_path), exist_ok=True)
with open(file_path, 'r') as f:
    hotels = json.load(f)

# Define model
class HotelModel(nn.Module):
    def __init__(self):
        super(HotelModel, self).__init__()
        self.fc = nn.Sequential(
            nn.Linear(5, 32),
            nn.ReLU(),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, 1),
            nn.Sigmoid()
        )

    def forward(self, x):
        return self.fc(x)

model = HotelModel()
model.load_state_dict(torch.load('model.pt'))
model.eval()

# Predict score
def predict(features):
    with torch.no_grad():
        tensor = torch.tensor([features], dtype=torch.float32)
        score = model(tensor).item()
    return score

# Matching logic
def calculate_features(hotel, user_preferences):
    hotel_type_match = 1 if hotel['hotel_type'] == user_preferences['preferred_hotel_type'] else 0
    budget_match = max(0, 1 - abs(hotel['price_per_night'] - user_preferences['max_price']) / 500)
    amenity_match = len(set(hotel['amenities']).intersection(user_preferences['preferred_amenities'])) / max(1, len(user_preferences['preferred_amenities']))

    return [
        hotel['rating'],
        hotel['price_per_night'],
        len(hotel['amenities']),
        hotel_type_match,
        budget_match
    ]

@app.route('/predict-hotels', methods=['POST'])
def predict_hotels():
    data = request.json
    user_preferences = data['preferences']

    scored_hotels = []
    for hotel in hotels:
        features = calculate_features(hotel, user_preferences)
        score = predict(features)
        scored_hotels.append((score, hotel))

    scored_hotels.sort(reverse=True, key=lambda x: x[0])

    top_hotels = [hotel for score, hotel in scored_hotels[:5]]

    return jsonify({"recommended_hotels": top_hotels})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
