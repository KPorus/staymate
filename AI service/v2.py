import os,json
import torch
import numpy as np
import requests
from sklearn.metrics.pairwise import cosine_similarity
from transformers import AutoTokenizer, AutoModel

# ─── Configuration ──────────────────────────────────────────────────────────────

# If you still want to cache the model locally, set HF_TOKEN, otherwise leave it None
HF_TOKEN = os.getenv("HUGGINGFACE_TOKEN", None)
AUTH_KWARGS = {"use_auth_token": HF_TOKEN} if HF_TOKEN else {}

# ─── Load the tokenizer & model ─────────────────────────────────────────────────

tokenizer = AutoTokenizer.from_pretrained(
    'sentence-transformers/all-MiniLM-L6-v2', **AUTH_KWARGS
)
model = AutoModel.from_pretrained(
    'sentence-transformers/all-MiniLM-L6-v2', **AUTH_KWARGS
)
model.eval()

# ─── Helper: compute embedding by mean-pooling ──────────────────────────────────

def embed_text(text: str) -> np.ndarray:
    """
    Tokenize, run through the model, then mean-pool over the token embeddings
    (excluding padding) to get a fixed-size vector.
    """
    # 1) Tokenize
    encoded = tokenizer(
        text,
        add_special_tokens=True,
        padding='longest',
        truncation=True,
        return_tensors='pt'
    )
    # 2) Forward pass
    with torch.no_grad():
        outputs = model(**encoded)
    token_embeddings = outputs.last_hidden_state  # (1, seq_len, hidden_dim)
    attention_mask = encoded.attention_mask.unsqueeze(-1)  # (1, seq_len, 1)

    # 3) Mean pooling, excluding padding tokens
    summed = (token_embeddings * attention_mask).sum(dim=1)  # (1, hidden_dim)
    counts = attention_mask.sum(dim=1)                     # (1, 1)
    pooled = summed / counts                               # (1, hidden_dim)

    return pooled[0].cpu().numpy()  # shape (hidden_dim,)

# ─── Sample Data ────────────────────────────────────────────────────────────────



# Load Booking data
base_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(base_dir, './data/bookings.json')

os.makedirs(os.path.dirname(file_path), exist_ok=True)
with open(file_path, 'r') as f:
    bookings = json.load(f)


# Load hotel data
base_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(base_dir, './data/hotels.json')


os.makedirs(os.path.dirname(file_path), exist_ok=True)
with open(file_path, 'r') as f:
    hotels = json.load(f)

# ─── Precompute Hotel Embeddings ────────────────────────────────────────────────

def hotel_to_text(h):
    return (
        f"{h['hotel_type']} hotel under {h['price_per_night']} price "
        f"rating {h['rating']} amenities {', '.join(h['amenities'])}"
    )

hotel_texts = [hotel_to_text(h) for h in hotels]
hotel_embeddings = np.stack([embed_text(t) for t in hotel_texts])  # (n_hotels, dim)

# ─── Recommendation Logic with In-Memory User “Memory” ─────────────────────────

user_hist: dict[str, np.ndarray] = {}

def recommend(user_id: str, pref: dict, top_k: int = 5):
    # 1) Embed current pref
    pref_text = (
        f"{pref['preferred_hotel_type']} hotel under {pref['max_price']} price "
        f"with rating ≥ {pref['min_rating']} "
        f"and amenities {', '.join(pref['preferred_amenities'])}"
    )
    curr_emb = embed_text(pref_text)

    # 2) Update user history (average)
    if user_id in user_hist:
        user_hist[user_id] = (user_hist[user_id] + curr_emb) / 2
    else:
        user_hist[user_id] = curr_emb

    # 3) Compute cosine similarities
    sims = cosine_similarity(
        user_hist[user_id].reshape(1, -1),
        hotel_embeddings
    )[0]  # shape (n_hotels,)

    # 4) Return top-k
    idxs = np.argsort(-sims)[:top_k]
    return [(hotels[i]["name"], float(sims[i])) for i in idxs]

# ─── Run Example ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    for booking in bookings:
        uid = booking["user_id"]
        recs = recommend(uid, booking["preferences"], top_k=10)
        print(f"Top for {uid}: {recs}")
