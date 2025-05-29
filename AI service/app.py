from flask import Flask, request, jsonify
import os
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from transformers import AutoTokenizer, AutoModel
import torch
import logging
import gc

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)

# Configuration
HF_TOKEN = os.getenv("HUGGINGFACE_TOKEN", None)
AUTH_KWARGS = {"use_auth_token": HF_TOKEN} if HF_TOKEN else {}
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
# Load Model and Tokenizer
# tokenizer = AutoTokenizer.from_pretrained(
#     'sentence-transformers/all-MiniLM-L6-v2', **AUTH_KWARGS
# )
# model = AutoModel.from_pretrained(
#     'sentence-transformers/all-MiniLM-L6-v2', **AUTH_KWARGS
# ).to(device)
tokenizer = AutoTokenizer.from_pretrained(
    'sentence-transformers/paraphrase-MiniLM-L3-v2', **AUTH_KWARGS
)
model = AutoModel.from_pretrained(
    'sentence-transformers/paraphrase-MiniLM-L3-v2', **AUTH_KWARGS,torch_dtype=torch.float16
)
model.eval()

# In-Memory Storage
hotel_embeddings = None
hotels = None
user_hist = {}

# Helper Functions
def embed_text(text: str) -> np.ndarray:
    encoded = tokenizer(
        text,
        add_special_tokens=True,
        padding='longest',
        truncation=True,
        return_tensors='pt'
    )
    with torch.no_grad():
        outputs = model(**encoded)
    token_embeddings = outputs.last_hidden_state
    attention_mask = encoded.attention_mask.unsqueeze(-1)
    summed = (token_embeddings * attention_mask).sum(dim=1)
    counts = attention_mask.sum(dim=1)
    pooled = summed / counts
    return pooled[0].cpu().numpy()

def hotel_to_text(h):
    return (
        f"{h['hotel_type']} hotel under {h['price_per_night']} price "
        f"rating {h['rating']} amenities {', '.join(h['amenities'])}"
    )

# Initialize Hotel Embeddings
@app.route('/initialize', methods=['POST'])
def initialize():
    global hotel_embeddings, hotels
    hotels = request.json.get('hotels', [])
    print(hotels)
    if not hotels:
        return jsonify({"error": "No hotels provided"}), 400
    hotel_texts = [hotel_to_text(h) for h in hotels]
    hotel_embeddings = np.stack([embed_text(t) for t in hotel_texts])
    return jsonify({"message": "Hotel embeddings initialized", "hotel_count": len(hotels)}), 200

# Recommendation Endpoint
@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.json
        user_id = data.get('user_id')
        bookings = data.get('bookings', [])
        top_k = data.get('top_k', 5)
        logging.debug(f"Received request: user_id={user_id}, bookings={bookings}")
        # Fixed condition to avoid ValueError
        if not user_id or hotel_embeddings is None or hotels is None:
            return jsonify({"error": "Missing user_id or uninitialized hotels"}), 400

        for booking in bookings:
            pref_text = (
                f"{booking['preferred_hotel_type']} hotel under {booking['max_price']} price "
                f"with rating ≥ {booking['min_rating']} "
                f"and amenities {', '.join(booking['preferred_amenities'])}"
            )
            curr_emb = embed_text(pref_text)
            if user_id in user_hist:
                user_hist[user_id] = (user_hist[user_id] + curr_emb) / 2
            else:
                user_hist[user_id] = curr_emb

        sims = cosine_similarity(user_hist[user_id].reshape(1, -1), hotel_embeddings)[0]
        idxs = np.argsort(-sims)[:top_k]
        # recommendations = [(hotels[i]["name"], float(sims[i])) for i in idxs]
        recommendations = [(hotels[i]["id"], hotels[i]["name"], float(sims[i])) for i in idxs]
        # Clear memory after processing
        gc.collect()
        torch.cuda.empty_cache() if torch.cuda.is_available() else None
        return jsonify({"user_id": user_id, "recommendations": recommendations}), 200
    except Exception as e:
        gc.collect()
        torch.cuda.empty_cache() if torch.cuda.is_available() else None
        return jsonify({"error": str(e)}), 500
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)