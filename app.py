# app.py (updated)
from flask import Flask, render_template, request, jsonify, send_from_directory
from transformers import AutoProcessor, MusicgenForConditionalGeneration, AutoTokenizer, AutoModelForCausalLM
import torch, soundfile as sf, os, datetime, json, uuid, traceback

# audio libs for classification
import tensorflow as tf
import tensorflow_hub as hub
import librosa
import numpy as np

# ---------------------------------------------------------
# App & paths
# ---------------------------------------------------------
app = Flask(__name__, static_folder='static', template_folder='templates')
MODELS_DIR = "models"
MUSICGEN_DIR = os.path.join(MODELS_DIR, "musicgen_small_saved")  # or fallback online
GPT2_DIR = os.path.join(MODELS_DIR, "gpt2_lyrics")
YAMNET_GTZN_H5 = os.path.join(MODELS_DIR, "yamnet_gtzan_final.h5")

MUSIC_FOLDER = os.path.join("static", "music")
os.makedirs(MUSIC_FOLDER, exist_ok=True)
PLAYLIST_FILE = os.path.join("data", "playlist.json")
os.makedirs("data", exist_ok=True)
if not os.path.exists(PLAYLIST_FILE):
    with open(PLAYLIST_FILE, "w") as f:
        json.dump([], f, indent=2)

# ---------------------------------------------------------
# Load generation models (MusicGen + GPT2)
# ---------------------------------------------------------
print("Loading generation models...")
try:
    music_processor = AutoProcessor.from_pretrained(MUSICGEN_DIR, local_files_only=True)
    music_model = MusicgenForConditionalGeneration.from_pretrained(MUSICGEN_DIR, local_files_only=True)
except Exception as e:
    print("Local MusicGen failed, falling back to Hugging Face online:", e)
    music_processor = AutoProcessor.from_pretrained("facebook/musicgen-small")
    music_model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small")

try:
    lyrics_tokenizer = AutoTokenizer.from_pretrained(GPT2_DIR, local_files_only=True)
    lyrics_model = AutoModelForCausalLM.from_pretrained(GPT2_DIR, local_files_only=True)
except Exception as e:
    print("Local GPT-2 failed, falling back to public gpt2:", e)
    lyrics_tokenizer = AutoTokenizer.from_pretrained("gpt2")
    lyrics_model = AutoModelForCausalLM.from_pretrained("gpt2")

device = "cuda" if torch.cuda.is_available() else "cpu"
music_model = music_model.to(device)
lyrics_model = lyrics_model.to(device)
print("Generation models ready on device:", device)

# ---------------------------------------------------------
# Load YAMNet + Genre Classifier
# ---------------------------------------------------------
print("Loading YAMNet + GTZAN classifier (for genre)...")
yamnet_model = hub.load("https://tfhub.dev/google/yamnet/1")  # small, just for embeddings
if not os.path.exists(YAMNET_GTZN_H5):
    print("Warning: genre classifier .h5 not found at", YAMNET_GTZN_H5)
    genre_classifier = None
else:
    genre_classifier = tf.keras.models.load_model(YAMNET_GTZN_H5)

# Replace this list with the same order you used when training the classifier
GENRE_LABELS = ['blues','classical','country','disco','hiphop','jazz','metal','pop','reggae','rock']

SAMPLE_RATE = 16000  # yamnet expects 16k

def classify_genre_from_file(path):
    """
    Load audio file, extract YAMNet embeddings, predict with your classifier.
    Returns (genre, confidence)
    """
    if genre_classifier is None:
        return ("unknown", 0.0)

    try:
        waveform, sr = librosa.load(path, sr=SAMPLE_RATE, mono=True)
        scores, embeddings, spectrogram = yamnet_model(tf.convert_to_tensor(waveform))
        # embeddings shape: (n_frames, 1024) -> average
        emb = np.mean(embeddings.numpy(), axis=0)
        preds = genre_classifier.predict(np.expand_dims(emb, axis=0))
        idx = int(np.argmax(preds, axis=1)[0])
        conf = float(np.max(preds))
        label = GENRE_LABELS[idx] if idx < len(GENRE_LABELS) else "unknown"
        return (label, conf)
    except Exception as e:
        print("Error in classify_genre_from_file:", e)
        traceback.print_exc()
        return ("error", 0.0)

# ---------------------------------------------------------
# Playlist helpers (simple JSON store)
# ---------------------------------------------------------
def load_playlist():
    with open(PLAYLIST_FILE, "r") as f:
        return json.load(f)

def save_playlist(data):
    with open(PLAYLIST_FILE, "w") as f:
        json.dump(data, f, indent=2)

def add_song_entry(entry):
    pl = load_playlist()
    pl.insert(0, entry)   # newest first
    save_playlist(pl)

# ---------------------------------------------------------
# Routes: pages
# ---------------------------------------------------------
# @app.route("/")
# def index():
#     return render_template("index.html")

# @app.route("/login")
# def login():
#     return render_template("login.html")

# @app.route("/dashboard")
# def dashboard():
#     return render_template("dashboard.html")

# @app.route("/playlist")
# def playlist():
#     return render_template("playlist.html")

# @app.route("/library")
# def library():
#     return render_template("library.html")

# ---------------------------------------------------------
# API: generate (text -> music+lyrics) (existing)
# ---------------------------------------------------------
@app.route("/generate", methods=["POST"])
def generate():
    try:
        data = request.get_json()
        prompt = data.get("prompt", "").strip()
        if not prompt:
            return jsonify({"error": "Prompt missing"}), 400

        # Lyrics
        lyric_inputs = lyrics_tokenizer(prompt, return_tensors="pt").to(device)
        lyric_outputs = lyrics_model.generate(
            **lyric_inputs,
            max_new_tokens=120,
            temperature=0.8,
            do_sample=True,
            pad_token_id=lyrics_tokenizer.eos_token_id
        )
        lyrics = lyrics_tokenizer.decode(lyric_outputs[0], skip_special_tokens=True)

        # Music
        music_inputs = music_processor(text=prompt, padding=True, return_tensors="pt").to(device)
        audio_values = music_model.generate(**music_inputs, max_new_tokens=1500)  # ~30s

        # Save
        ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        uid = uuid.uuid4().hex[:8]
        filename = f"generated_{ts}_{uid}.wav"
        outpath = os.path.join(MUSIC_FOLDER, filename)
        sf.write(outpath, audio_values[0, 0].cpu().numpy(), 32000)

        # classify
        genre, conf = classify_genre_from_file(outpath)

        # metadata
        entry = {
            "id": uid,
            "filename": filename,
            "prompt": prompt,
            "lyrics": lyrics,
            "genre": genre,
            "genre_confidence": conf,
            "created_at": ts
        }
        add_song_entry(entry)

        return jsonify({"ok": True, "entry": entry})

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ---------------------------------------------------------
# API: upload file (multipart form)
# Accepts: file field "file", optional "title" and "lyrics"
# ---------------------------------------------------------
@app.route("/upload", methods=["POST"])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
        f = request.files['file']
        if f.filename == "":
            return jsonify({"error": "No selected file"}), 400

        # Save uploaded file into static/music (preserve extension)
        ext = os.path.splitext(f.filename)[1]
        ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        uid = uuid.uuid4().hex[:8]
        filename = f"uploaded_{ts}_{uid}{ext}"
        outpath = os.path.join(MUSIC_FOLDER, filename)
        f.save(outpath)

        # classify genre
        genre, conf = classify_genre_from_file(outpath)

        # optional fields
        title = request.form.get("title") or os.path.splitext(f.filename)[0]
        lyrics = request.form.get("lyrics", "")

        entry = {
            "id": uid,
            "filename": filename,
            "title": title,
            "prompt": "",   # blank for upload
            "lyrics": lyrics,
            "genre": genre,
            "genre_confidence": conf,
            "created_at": ts
        }
        add_song_entry(entry)
        return jsonify({"ok": True, "entry": entry})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ---------------------------------------------------------
# API: return playlist JSON (for UI)
# ---------------------------------------------------------
@app.route("/api/playlist")
def api_playlist():
    try:
        pl = load_playlist()
        return jsonify({"ok": True, "playlist": pl})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------------------------------------
# Serve static music file (Flask static does this automatically,
# but adding explicit endpoint for clarity / download)
# ---------------------------------------------------------
@app.route("/download/<filename>")
def download_file(filename):
    return send_from_directory(MUSIC_FOLDER, filename, as_attachment=True)

# ---------------------------------------------------------
if __name__ == "__main__":
    print("Starting app...")
    app.run(debug=True)
