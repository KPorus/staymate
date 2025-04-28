import torch
import torch.nn as nn
import torch.optim as optim
import pandas as pd
import random,os
import json

# 2. Prepare dataset
base_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(base_dir, '../data/hotels.json')

# Make sure the data folder exists
os.makedirs(os.path.dirname(file_path), exist_ok=True)
with open(file_path, 'r') as f:
    hotels = json.load(f)

def prepare_dataset(hotels):
    data = []
    for hotel in hotels:
        features = [
            hotel["rating"],
            hotel["price_per_night"],
            len(hotel["amenities"]),
            random.choice([0, 1]),  # Simulate hotel_type_match
            random.uniform(0.7, 1.0),  # Simulate budget match
        ]
        label = random.uniform(0, 1)  # Target score
        data.append((features, label))
    return data

dataset = prepare_dataset(hotels)

# 3. Model
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
criterion = nn.MSELoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# 4. Train
for epoch in range(500):
    random.shuffle(dataset)
    total_loss = 0
    for features, label in dataset:
        features_tensor = torch.tensor(features, dtype=torch.float32)
        label_tensor = torch.tensor([label], dtype=torch.float32)

        optimizer.zero_grad()
        outputs = model(features_tensor)
        loss = criterion(outputs, label_tensor)
        loss.backward()
        optimizer.step()

        total_loss += loss.item()
    if epoch % 100 == 0:
        print(f"Epoch {epoch} Loss {total_loss:.4f}")

# 5. Save model
torch.save(model.state_dict(), "model.pt")
print("✅ Model saved as model.pt")
